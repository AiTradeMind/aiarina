import { describe, it, expect } from 'vitest';
import { EnterpriseSecretsService } from '../services/secrets.service';
import { EnterpriseSecretsEngine } from '../engines/secrets.engine';
import { EnterpriseSecretsValidator } from '../validators/secrets.validator';
import { EnterpriseSecretsRepository } from '../repository/secrets.repository';

describe('Phase 10D Enterprise Secrets & Key Management Engine', () => {
  it('should return system status as HEALTHY with active secret counts', async () => {
    const status = await EnterpriseSecretsService.getStatus();
    expect(status.status).toBe('HEALTHY');
    expect(status.totalSecrets).toBeGreaterThan(0);
    expect(status.activeSecrets).toBeGreaterThan(0);
  });

  it('should return comprehensive platform overview', async () => {
    const overview = await EnterpriseSecretsService.getOverview();
    expect(overview.encryptionStandard).toContain('AES-256-GCM');
    expect(overview.categories).toBeDefined();
    expect(overview.environmentDistribution).toBeDefined();
  });

  it('should list all pre-populated secrets with masked values only', async () => {
    const secrets = await EnterpriseSecretsService.listSecrets();
    expect(secrets.length).toBeGreaterThan(0);

    const openrouterKey = secrets.find(s => s.category === 'OPENROUTER');
    expect(openrouterKey).toBeDefined();
    expect(openrouterKey?.maskedValue).toContain('*****');
    expect((openrouterKey as any).encryptedValue).toBeUndefined(); // Masked in public listing
  });

  it('should create a new secret and mask raw secret values', async () => {
    const createDto = {
      name: 'Staging Stripe Webhook Secret',
      category: 'WEBHOOK_SECRET' as const,
      rawSecretValue: 'whsec_test_secret_key_1234567890_abcdef',
      environment: 'STAGING' as const,
      autoRotateDays: 60,
      createdBy: 'TEST_RUNNER'
    };

    const newSecret = await EnterpriseSecretsService.createSecret(createDto);
    expect(newSecret.id).toBeDefined();
    expect(newSecret.name).toBe('Staging Stripe Webhook Secret');
    expect(newSecret.category).toBe('WEBHOOK_SECRET');
    expect(newSecret.environment).toBe('STAGING');
    expect(newSecret.maskedValue).toContain('*****');
  });

  it('should rotate a secret and generate a new version entry', async () => {
    const secrets = await EnterpriseSecretsService.listSecrets();
    const target = secrets[0];

    const prevVersion = target.currentVersion;
    const rotated = await EnterpriseSecretsService.rotateSecret({
      secretId: target.id,
      newRawValue: 'sk-or-v1-rotated_new_key_value_9999999999',
      triggeredBy: 'SECURITY_AUDITOR',
      reason: 'PERIODIC_SECURITY_ROTATION'
    });

    expect(rotated.currentVersion).toBe(prevVersion + 1);
    expect(rotated.lastRotatedAt).toBeDefined();

    const versions = await EnterpriseSecretsService.getVersions(target.id);
    expect(versions.length).toBeGreaterThanOrEqual(2);
  });

  it('should verify secret syntax and validity', async () => {
    const verification = await EnterpriseSecretsService.verifySecret({
      category: 'OPENROUTER',
      rawSecretValue: 'sk-or-v1-valid_test_secret_key_for_verification'
    });

    expect(verification.verified).toBe(true);
    expect(verification.checks.length).toBeGreaterThan(0);
  });

  it('should validate creation DTOs correctly', () => {
    const invalidBody = {
      name: '',
      category: 'INVALID_CATEGORY'
    };

    const result = EnterpriseSecretsValidator.validateCreateSecret(invalidBody);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should export secret metadata without revealing raw values', async () => {
    const exportResult = await EnterpriseSecretsService.exportSecrets();
    expect(exportResult.secretsMetadata.length).toBeGreaterThan(0);
    expect(exportResult.encryptionStandard).toBe('AES-256-GCM');
  });
});
