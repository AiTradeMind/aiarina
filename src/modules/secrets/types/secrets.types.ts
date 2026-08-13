export type SecretCategory =
  | 'API_KEY'
  | 'OPENROUTER'
  | 'LLM_PROVIDER'
  | 'DATABASE_CREDENTIAL'
  | 'REDIS_CREDENTIAL'
  | 'JWT_SECRET'
  | 'ENCRYPTION_KEY'
  | 'WEBHOOK_SECRET'
  | 'SMTP_CREDENTIAL'
  | 'OAUTH_CREDENTIAL';

export type SecretEnvironment = 'PRODUCTION' | 'STAGING' | 'DEVELOPMENT';
export type SecretStatus = 'ACTIVE' | 'ROTATING' | 'DEPRECATED' | 'EXPIRED' | 'REVOKED';

export interface EnterpriseSecretItem {
  id: string;
  organizationId: string | null;
  tenantId: string;
  name: string;
  category: SecretCategory;
  maskedValue: string;
  encryptedValue?: string; // Only returned if explicitly permitted
  environment: SecretEnvironment;
  currentVersion: number;
  status: SecretStatus;
  autoRotateDays: number;
  expiresAt: string | null;
  lastRotatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SecretVersion {
  id: number;
  secretId: string;
  version: number;
  maskedValue: string;
  encryptedValue: string;
  createdReason: string;
  createdBy: string;
  createdAt: string;
}

export interface SecretRotationLog {
  id: string;
  secretId: string;
  rotationPolicy: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  previousVersion: number;
  newVersion: number;
  triggeredBy: string;
  scheduledAt: string;
  executedAt: string;
}

export interface SecretAccessLog {
  id: number;
  secretId: string;
  accessorId: string;
  accessorRole: string;
  accessType: 'READ_METADATA' | 'DECRYPT_VALUE' | 'ROTATE' | 'UPDATE' | 'DELETE';
  granted: boolean;
  clientIp: string | null;
  accessedAt: string;
}

export interface SecretUsageRecord {
  id: number;
  secretId: string;
  moduleName: string;
  dailyAccessCount: number;
  lastCallLatencyMs: number;
  usageDate: string;
}

export interface SecretValidationResult {
  id: number;
  secretId: string;
  validationType: string;
  isValid: boolean;
  checkDetails: string;
  checkedAt: string;
}

export interface SecretAuditRecord {
  id: number;
  secretId: string | null;
  action: string;
  performedBy: string;
  organizationId: string | null;
  ipAddress: string | null;
  details: string;
  timestamp: string;
}

export interface SecretPermission {
  id: string;
  secretId: string;
  role: string;
  canReadMetadata: boolean;
  canDecryptValue: boolean;
  canRotate: boolean;
  canDelete: boolean;
  createdAt: string;
}

export interface SecretProfile {
  id: string;
  profileName: string;
  environment: SecretEnvironment;
  managedSecretsCount: number;
  encryptionAlgorithm: string;
  status: 'ACTIVE' | 'DEPRECATED';
  createdAt: string;
}

export interface SecretHistoryRecord {
  id: number;
  secretId: string | null;
  secretName: string;
  event: string;
  previousState: Record<string, any>;
  newState: Record<string, any>;
  changedBy: string;
  timestamp: string;
}

export interface CreateSecretDTO {
  organizationId?: string;
  tenantId?: string;
  name: string;
  category: SecretCategory;
  rawSecretValue: string;
  environment?: SecretEnvironment;
  autoRotateDays?: number;
  expiresInDays?: number;
  createdBy?: string;
}

export interface RotateSecretDTO {
  secretId: string;
  newRawValue?: string;
  triggeredBy?: string;
  reason?: string;
}

export interface VerifySecretDTO {
  secretId?: string;
  category?: SecretCategory;
  rawSecretValue?: string;
  environment?: SecretEnvironment;
}

export interface ImportSecretsDTO {
  secrets: Array<{
    name: string;
    category: SecretCategory;
    rawSecretValue: string;
    environment?: SecretEnvironment;
    autoRotateDays?: number;
  }>;
  importedBy?: string;
}

export interface SecretManagerOverview {
  totalSecrets: number;
  activeSecrets: number;
  expiredSecrets: number;
  categories: Record<string, number>;
  environmentDistribution: Record<string, number>;
  encryptionStandard: string;
  lastAuditTimestamp: string;
  systemHealth: string;
}
