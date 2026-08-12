import {
  EnterpriseSecretItem,
  SecretCategory,
  SecretEnvironment,
  CreateSecretDTO,
  RotateSecretDTO,
  VerifySecretDTO,
  ImportSecretsDTO,
  SecretManagerOverview
} from '../types/secrets.types';
import { EnterpriseSecretsRepository } from '../repository/secrets.repository';

export class EnterpriseSecretsEngine {
  public static async getOverview(): Promise<SecretManagerOverview> {
    const secrets = await EnterpriseSecretsRepository.findAll();
    const categories: Record<string, number> = {};
    const environmentDistribution: Record<string, number> = {};

    let activeSecrets = 0;
    let expiredSecrets = 0;

    const now = new Date();

    for (const sec of secrets) {
      categories[sec.category] = (categories[sec.category] || 0) + 1;
      environmentDistribution[sec.environment] = (environmentDistribution[sec.environment] || 0) + 1;

      if (sec.status === 'ACTIVE') activeSecrets++;
      if (sec.expiresAt && new Date(sec.expiresAt) < now) expiredSecrets++;
    }

    return {
      totalSecrets: secrets.length,
      activeSecrets,
      expiredSecrets,
      categories,
      environmentDistribution,
      encryptionStandard: 'AES-256-GCM (SHA256 HMAC)',
      lastAuditTimestamp: new Date().toISOString(),
      systemHealth: 'HEALTHY'
    };
  }

  public static async verifySecret(dto: VerifySecretDTO): Promise<{
    verified: boolean;
    secretId?: string;
    category?: string;
    maskedValue?: string;
    environment?: string;
    checks: Array<{ checkName: string; passed: boolean; message: string }>;
  }> {
    const checks: Array<{ checkName: string; passed: boolean; message: string }> = [];

    let targetSecret: EnterpriseSecretItem | null = null;
    if (dto.secretId) {
      targetSecret = await EnterpriseSecretsRepository.findById(dto.secretId);
      if (!targetSecret) {
        checks.push({ checkName: 'Secret Lookup', passed: false, message: `Secret ID ${dto.secretId} not found` });
        return { verified: false, checks };
      }
      checks.push({ checkName: 'Secret Lookup', passed: true, message: `Secret found: ${targetSecret.name}` });
    }

    const rawVal = dto.rawSecretValue || (targetSecret ? targetSecret.encryptedValue : '');
    const cat = dto.category || (targetSecret ? targetSecret.category : 'API_KEY');

    // Syntax validation
    const syntaxOk = rawVal ? rawVal.length >= 8 : false;
    checks.push({
      checkName: 'Syntax & Length Constraint',
      passed: syntaxOk,
      message: syntaxOk ? 'Value satisfies minimum length and key format guidelines' : 'Key length is below enterprise security standard'
    });

    // Category prefix matching check
    let categoryPrefixOk = true;
    let prefixMsg = 'Format aligns with provider standard';
    if (cat === 'OPENROUTER' && rawVal && !rawVal.startsWith('sk-or-')) {
      categoryPrefixOk = false;
      prefixMsg = 'OpenRouter keys must start with sk-or-';
    } else if (cat === 'LLM_PROVIDER' && rawVal && !rawVal.startsWith('AIza')) {
      categoryPrefixOk = false;
      prefixMsg = 'Gemini LLM keys typically start with AIza';
    } else if (cat === 'DATABASE_CREDENTIAL' && rawVal && !rawVal.startsWith('postgres') && !rawVal.startsWith('mysql')) {
      categoryPrefixOk = false;
      prefixMsg = 'Database URI should begin with standard protocol prefix';
    }
    checks.push({ checkName: 'Provider Format Check', passed: categoryPrefixOk, message: prefixMsg });

    // Expiration check if secret exists
    if (targetSecret && targetSecret.expiresAt) {
      const expired = new Date(targetSecret.expiresAt) < new Date();
      checks.push({
        checkName: 'Expiration Status Check',
        passed: !expired,
        message: expired ? 'Secret has expired' : 'Secret is within active validity window'
      });
    }

    const allPassed = checks.every(c => c.passed);

    return {
      verified: allPassed,
      secretId: targetSecret?.id,
      category: cat,
      maskedValue: targetSecret ? targetSecret.maskedValue : EnterpriseSecretsRepository.maskSecretValue(rawVal || ''),
      environment: targetSecret ? targetSecret.environment : dto.environment || 'PRODUCTION',
      checks
    };
  }

  public static async exportSecretMetadata(): Promise<{
    exportedAt: string;
    encryptionStandard: string;
    totalSecretsCount: number;
    secretsMetadata: Array<{
      id: string;
      name: string;
      category: SecretCategory;
      maskedValue: string;
      environment: SecretEnvironment;
      currentVersion: number;
      status: string;
      expiresAt: string | null;
      lastRotatedAt: string | null;
    }>;
  }> {
    const secrets = await EnterpriseSecretsRepository.findAll();
    const metadataList = secrets.map(s => ({
      id: s.id,
      name: s.name,
      category: s.category,
      maskedValue: s.maskedValue,
      environment: s.environment,
      currentVersion: s.currentVersion,
      status: s.status,
      expiresAt: s.expiresAt,
      lastRotatedAt: s.lastRotatedAt
    }));

    return {
      exportedAt: new Date().toISOString(),
      encryptionStandard: 'AES-256-GCM',
      totalSecretsCount: metadataList.length,
      secretsMetadata: metadataList
    };
  }

  public static async importSecrets(dto: ImportSecretsDTO): Promise<{
    importedCount: number;
    importedSecrets: EnterpriseSecretItem[];
  }> {
    const importedSecrets: EnterpriseSecretItem[] = [];

    for (const item of dto.secrets) {
      const created = await EnterpriseSecretsRepository.create({
        name: item.name,
        category: item.category,
        rawSecretValue: item.rawSecretValue,
        environment: item.environment || 'PRODUCTION',
        autoRotateDays: item.autoRotateDays || 90,
        createdBy: dto.importedBy || 'IMPORT_BATCH_JOB'
      });
      importedSecrets.push(created);
    }

    return {
      importedCount: importedSecrets.length,
      importedSecrets
    };
  }
}
