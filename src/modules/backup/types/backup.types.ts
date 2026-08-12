export type BackupType = 'FULL' | 'INCREMENTAL' | 'DIFFERENTIAL' | 'SNAPSHOT';
export type BackupFrequency = 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'MANUAL';
export type SnapshotCategory = 'DATABASE' | 'WORKSPACE' | 'CONFIGURATION' | 'POLICY' | 'SECRETS' | 'GATEWAY' | 'METADATA';
export type BackupJobStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SUCCESS' | 'VERIFIED' | 'FAILED';
export type RestoreStatus = 'COMPLETED' | 'IN_PROGRESS' | 'FAILED' | 'SIMULATED';

export interface BackupJobItem {
  id: string;
  jobId?: string;
  jobName: string;
  policyId?: string;
  backupType: BackupType;
  snapshotId?: string;
  status: BackupJobStatus;
  sizeMb: number;
  durationMs: number;
  checksumSha256?: string;
  startedAt: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BackupSnapshotItem {
  id: string;
  snapshotId?: string;
  category: SnapshotCategory;
  sourceModule: string;
  sizeMb: number;
  checksumSha256: string;
  compressionRatio: string;
  encryptionAlgorithm: string;
  status: 'READY' | 'ARCHIVED' | 'CORRUPTED' | 'DELETED';
  createdAt: string;
  expiresAt?: string;
}

export interface BackupHistoryItem {
  id: number;
  jobId?: string;
  snapshotId?: string;
  action: string;
  status: string;
  sizeMb: number;
  operator: string;
  timestamp: string;
}

export interface RestoreHistoryItem {
  id: string;
  restoreId?: string;
  snapshotId: string;
  restoreType: string;
  targetDestination: string;
  status: RestoreStatus;
  initiatedBy: string;
  restoredAt: string;
  validationResult?: string;
}

export interface BackupValidationItem {
  id: number;
  snapshotId: string;
  validationType: string;
  passed: boolean;
  checkDetails?: string;
  validatedAt: string;
}

export interface BackupIntegrityItem {
  id: number;
  snapshotId: string;
  sha256Checksum: string;
  blockCorruptionCount: number;
  integrityStatus: 'INTACT' | 'CORRUPTED' | 'WARNING';
  checkedAt: string;
}

export interface BackupRetentionItem {
  id: string;
  ruleName: string;
  backupType: BackupType;
  retentionDays: number;
  autoArchive: boolean;
  expiryAction: 'PURGE' | 'COLD_STORAGE';
  totalStoredMb: number;
  createdAt: string;
}

export interface BackupRecoveryPlan {
  id: string;
  planName: string;
  failureMode: 'PRIMARY_DC_FAILURE' | 'DATABASE_CORRUPTION' | 'APP_CONTAINER_CRASH' | 'CONFIG_MISMATCH';
  standbyNodeStatus: 'ACTIVE_STANDBY' | 'WARM_STANDBY' | 'FAILOVER_READY';
  rtoMinutes: number;
  rpoMinutes: number;
  lastDrTestAt: string;
  status: 'HEALTHY' | 'TESTING_REQUIRED' | 'DEGRADED';
}

export interface BackupReportItem {
  id: string;
  reportTitle: string;
  reportType: 'DISASTER_RECOVERY_SIMULATION' | 'BACKUP_HEALTH_AUDIT' | 'RETENTION_COMPLIANCE' | 'EXECUTIVE_SUMMARY';
  healthScore: number;
  summary: string;
  generatedBy: string;
  createdAt: string;
}

export interface BackupAuditLogItem {
  id: number;
  backupOrRestoreId?: string;
  eventType: 'BACKUP_CREATED' | 'RESTORE_EXECUTED' | 'VERIFICATION_PASSED' | 'PITR_VALIDATED' | 'RETENTION_CLEANUP' | 'SIMULATION_COMPLETED' | 'EXPORT_EXECUTED';
  operator: string;
  details: string;
  clientIp?: string;
  timestamp: string;
}

export interface BackupStatusOverview {
  totalSnapshots: number;
  totalBackupSizeMb: number;
  successfulJobsCount: number;
  failedJobsCount: number;
  lastBackupTimestamp: string;
  lastRestoreValidationTimestamp: string;
  rtoMinutes: number;
  rpoMinutes: number;
  backupHealthScore: number;
  encryptionStandard: string;
  compressionStandard: string;
}

export interface RecoverySimulationResult {
  simulationId: string;
  planId: string;
  failureMode: string;
  simulatedRtoMinutes: number;
  simulatedRpoMinutes: number;
  status: 'SUCCESS' | 'PASSED' | 'FAILED';
  verificationDetails: string;
  performedAt: string;
}

export interface ExportMetadataResult {
  exportId: string;
  snapshotId: string;
  format: string;
  exportPath: string;
  encryptionMetadata: {
    algorithm: string;
    keyReference: string;
  };
  compressionMetadata: {
    ratio: string;
    uncompressedSizeMb: number;
  };
  checksumSha256: string;
  createdAt: string;
}
