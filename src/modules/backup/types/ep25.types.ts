export type BackupType = 'FULL' | 'INCREMENTAL' | 'DIFFERENTIAL' | 'SNAPSHOT';
export type BackupFrequency = 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'MANUAL';
export type SnapshotCategory = 'DATABASE' | 'WORKSPACE' | 'CONFIGURATION' | 'POLICY' | 'METADATA';

export interface BackupPolicyItem {
  policyId: string;
  name: string;
  backupType: BackupType;
  frequency: BackupFrequency;
  targetScope: string;
  retentionDays: number;
  isEnabled: boolean;
  createdAt: string;
}

export interface BackupSnapshotItem {
  snapshotId: string;
  category: SnapshotCategory;
  sourceModule: string;
  sizeMb: number;
  checksumSha256: string;
  createdAt: string;
  status: 'READY' | 'ARCHIVED' | 'CORRUPTED';
}

export interface BackupJobItem {
  jobId: string;
  policyId: string;
  backupType: BackupType;
  snapshotId: string;
  status: 'SUCCESS' | 'IN_PROGRESS' | 'FAILED' | 'VERIFIED';
  sizeMb: number;
  durationMs: number;
  checksumSha256: string;
  startedAt: string;
  completedAt?: string;
}

export interface BackupRestoreJob {
  restoreId: string;
  snapshotId: string;
  restoreType: 'FULL' | 'PARTIAL' | 'WORKSPACE' | 'DATABASE' | 'CONFIGURATION';
  targetDestination: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'FAILED';
  initiatedBy: string;
  restoredAt: string;
  validationResult: string;
}

export interface PointInTimeRecoveryPoint {
  recoveryPointId: string;
  timestamp: string;
  version: string;
  windowMinutes: number;
  status: 'VALIDATED' | 'READY';
  checksumSha256: string;
}

export interface DisasterRecoveryPlan {
  planId: string;
  failureMode: 'PRIMARY_DC_FAILURE' | 'DATABASE_CORRUPTION' | 'APP_CONTAINER_CRASH' | 'CONFIG_MISMATCH';
  standbyNodeStatus: 'ACTIVE_STANDBY' | 'WARM_STANDBY' | 'FAILOVER_READY';
  rtoMinutes: number;
  rpoMinutes: number;
  lastDrTestAt: string;
  status: 'HEALTHY' | 'TESTING_REQUIRED';
}

export interface BackupRetentionPolicy {
  ruleId: string;
  backupType: BackupType;
  retentionDays: number;
  autoArchive: boolean;
  expiryAction: 'PURGE' | 'COLD_STORAGE';
  totalStoredMb: number;
}

export interface BackupCertificateItem {
  certificateId: string;
  certificateType: 'SHA256_BACKUP_CERTIFICATE' | 'RESTORE_CERTIFICATE' | 'RECOVERY_VALIDATION_CERTIFICATE';
  snapshotOrJobId: string;
  issuedAt: string;
  sha256Hash: string;
  status: 'VALID' | 'REVOKED';
}

export interface BackupAuditItem {
  auditId: string;
  eventType: 'BACKUP_CREATED' | 'RESTORE_EXECUTED' | 'VERIFICATION_PASSED' | 'PITR_VALIDATED' | 'RETENTION_CLEANUP';
  operator: string;
  details: string;
  timestamp: string;
}

export interface BackupDashboardOverview {
  totalSnapshots: number;
  totalBackupSizeMb: number;
  successfulJobsCount: number;
  lastBackupTimestamp: string;
  lastRestoreValidationTimestamp: string;
  rtoMinutes: number;
  rpoMinutes: number;
  backupHealthScore: number;
}

export interface BackupQaReport {
  totalModulesTested: number;
  passCount: number;
  failCount: number;
  modules: Array<{
    moduleId: string;
    moduleName: string;
    status: 'PASSED' | 'FAILED';
    details: string;
  }>;
  readOnlyIntegrationConfirmed: boolean;
  nonExecutionConfirmed: boolean;
  buildStatus: string;
}
