import {
  EnterpriseSecretItem,
  SecretVersion,
  SecretRotationLog,
  SecretAccessLog,
  SecretUsageRecord,
  SecretValidationResult,
  SecretAuditRecord,
  SecretPermission,
  SecretProfile,
  SecretHistoryRecord,
  CreateSecretDTO,
  RotateSecretDTO,
  VerifySecretDTO,
  ImportSecretsDTO,
  SecretManagerOverview
} from '../types/secrets.types';
import { EnterpriseSecretsRepository } from '../repository/secrets.repository';
import { EnterpriseSecretsEngine } from '../engines/secrets.engine';

export class EnterpriseSecretsService {
  public static async getStatus(): Promise<{ status: string; totalSecrets: number; activeSecrets: number; timestamp: string }> {
    const overview = await EnterpriseSecretsEngine.getOverview();
    return {
      status: overview.systemHealth,
      totalSecrets: overview.totalSecrets,
      activeSecrets: overview.activeSecrets,
      timestamp: new Date().toISOString()
    };
  }

  public static async getOverview(): Promise<SecretManagerOverview> {
    return EnterpriseSecretsEngine.getOverview();
  }

  public static async listSecrets(category?: string, environment?: string): Promise<EnterpriseSecretItem[]> {
    let secrets = await EnterpriseSecretsRepository.findAll();
    if (category) {
      secrets = secrets.filter(s => s.category.toUpperCase() === category.toUpperCase());
    }
    if (environment) {
      secrets = secrets.filter(s => s.environment.toUpperCase() === environment.toUpperCase());
    }
    // Return masked secrets only for security
    return secrets.map(s => {
      const copy = { ...s };
      delete copy.encryptedValue;
      return copy;
    });
  }

  public static async getSecretById(id: string): Promise<EnterpriseSecretItem | null> {
    const secret = await EnterpriseSecretsRepository.findById(id);
    if (!secret) return null;
    const copy = { ...secret };
    delete copy.encryptedValue;
    return copy;
  }

  public static async createSecret(dto: CreateSecretDTO): Promise<EnterpriseSecretItem> {
    return EnterpriseSecretsRepository.create(dto);
  }

  public static async rotateSecret(dto: RotateSecretDTO): Promise<EnterpriseSecretItem> {
    return EnterpriseSecretsRepository.rotate(dto);
  }

  public static async verifySecret(dto: VerifySecretDTO): Promise<any> {
    return EnterpriseSecretsEngine.verifySecret(dto);
  }

  public static async getVersions(secretId?: string): Promise<SecretVersion[]> {
    const versions = await EnterpriseSecretsRepository.getVersions(secretId);
    return versions.map(v => {
      const copy = { ...v };
      // Always keep encryptedValue concealed in public version endpoints
      copy.encryptedValue = '[ENCRYPTED_VAULT_BLOB]';
      return copy;
    });
  }

  public static async getHistory(secretId?: string): Promise<SecretHistoryRecord[]> {
    return EnterpriseSecretsRepository.getHistory(secretId);
  }

  public static async getUsage(secretId?: string): Promise<SecretUsageRecord[]> {
    return EnterpriseSecretsRepository.getUsageRecords(secretId);
  }

  public static async getRotation(secretId?: string): Promise<SecretRotationLog[]> {
    return EnterpriseSecretsRepository.getRotationLogs(secretId);
  }

  public static async getValidation(secretId?: string): Promise<SecretValidationResult[]> {
    return EnterpriseSecretsRepository.getValidationResults(secretId);
  }

  public static async getPermissions(secretId?: string): Promise<SecretPermission[]> {
    return EnterpriseSecretsRepository.getPermissions(secretId);
  }

  public static async getPreview(secretId: string): Promise<{
    secretId: string;
    name: string;
    category: string;
    environment: string;
    maskedValue: string;
    decryptedPreview: string;
  }> {
    const secret = await EnterpriseSecretsRepository.findById(secretId);
    if (!secret) {
      throw new Error(`Secret with ID ${secretId} not found`);
    }

    const raw = secret.encryptedValue || '';
    let decryptedPreview = secret.maskedValue;
    if (raw.length > 8) {
      decryptedPreview = raw.slice(0, 4) + '...' + raw.slice(-4);
    }

    return {
      secretId: secret.id,
      name: secret.name,
      category: secret.category,
      environment: secret.environment,
      maskedValue: secret.maskedValue,
      decryptedPreview
    };
  }

  public static async importSecrets(dto: ImportSecretsDTO): Promise<any> {
    return EnterpriseSecretsEngine.importSecrets(dto);
  }

  public static async exportSecrets(): Promise<any> {
    return EnterpriseSecretsEngine.exportSecretMetadata();
  }
}
