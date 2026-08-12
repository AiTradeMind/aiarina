import {
  BackupJobItem,
  BackupSnapshotItem,
  BackupHistoryItem,
  RestoreHistoryItem,
  BackupValidationItem,
  BackupIntegrityItem,
  BackupRetentionItem,
  BackupRecoveryPlan,
  BackupReportItem,
  BackupAuditLogItem,
  BackupStatusOverview
} from '../types/backup.types';

export class EnterpriseBackupRepository {
  private static jobs: BackupJobItem[] = [];
  private static snapshots: BackupSnapshotItem[] = [];
  private static history: BackupHistoryItem[] = [];
  private static restores: RestoreHistoryItem[] = [];
  private static validations: BackupValidationItem[] = [];
  private static integrityRecords: BackupIntegrityItem[] = [];
  private static retentions: BackupRetentionItem[] = [];
  private static recoveryPlans: BackupRecoveryPlan[] = [];
  private static reports: BackupReportItem[] = [];
  private static auditLogs: BackupAuditLogItem[] = [];
  private static initialized = false;

  public static initialize(): void {
    if (this.initialized) return;
    this.initialized = true;

    const now = new Date().toISOString();

    // 01. Initial Jobs
    this.jobs = [
      {
        id: 'JOB-901',
        jobId: 'JOB-901',
        jobName: 'Daily Full Platform Backup',
        policyId: 'POL-FULL-01',
        backupType: 'FULL',
        snapshotId: 'SNP-20260728-001',
        status: 'VERIFIED',
        sizeMb: 4120,
        durationMs: 14200,
        checksumSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        startedAt: new Date(Date.now() - 3600000).toISOString(),
        completedAt: new Date(Date.now() - 3585800).toISOString(),
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 3585800).toISOString()
      },
      {
        id: 'JOB-902',
        jobId: 'JOB-902',
        jobName: 'Hourly Secrets & Gateway Differential Backup',
        policyId: 'POL-INC-02',
        backupType: 'INCREMENTAL',
        snapshotId: 'SNP-20260728-002',
        status: 'SUCCESS',
        sizeMb: 43,
        durationMs: 1200,
        checksumSha256: '8f4e21a1b2c3d4e5f60718293041526374859607182930415263748596071829',
        startedAt: new Date(Date.now() - 7200000).toISOString(),
        completedAt: new Date(Date.now() - 7198800).toISOString(),
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        updatedAt: new Date(Date.now() - 7198800).toISOString()
      }
    ];

    // 02. Initial Snapshots
    this.snapshots = [
      {
        id: 'SNP-20260728-001',
        snapshotId: 'SNP-20260728-001',
        category: 'DATABASE',
        sourceModule: 'PRIMARY_PGSQL_CLUSTER',
        sizeMb: 4120,
        checksumSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        compressionRatio: '3.2:1',
        encryptionAlgorithm: 'AES-256-GCM',
        status: 'READY',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 90).toISOString()
      },
      {
        id: 'SNP-20260728-002',
        snapshotId: 'SNP-20260728-002',
        category: 'SECRETS',
        sourceModule: 'ENTERPRISE_VAULT_ESKM',
        sizeMb: 43,
        checksumSha256: '8f4e21a1b2c3d4e5f60718293041526374859607182930415263748596071829',
        compressionRatio: '2.1:1',
        encryptionAlgorithm: 'AES-256-GCM',
        status: 'READY',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 30).toISOString()
      },
      {
        id: 'SNP-20260728-003',
        snapshotId: 'SNP-20260728-003',
        category: 'CONFIGURATION',
        sourceModule: 'PLATFORM_SETTINGS_EACC',
        sizeMb: 12,
        checksumSha256: '7a1b2c3d4e5f6071829304152637485960718293041526374859607182930415',
        compressionRatio: '4.0:1',
        encryptionAlgorithm: 'AES-256-GCM',
        status: 'READY',
        createdAt: new Date(Date.now() - 14400000).toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 365).toISOString()
      }
    ];

    // 03. History
    this.history = [
      {
        id: 1,
        jobId: 'JOB-901',
        snapshotId: 'SNP-20260728-001',
        action: 'CREATE_FULL_BACKUP',
        status: 'SUCCESS',
        sizeMb: 4120,
        operator: 'SCHEDULER_WORKER',
        timestamp: new Date(Date.now() - 3600000).toISOString()
      }
    ];

    // 04. Restores
    this.restores = [
      {
        id: 'RST-801',
        restoreId: 'RST-801',
        snapshotId: 'SNP-20260728-002',
        restoreType: 'SECRETS',
        targetDestination: 'ISOLATED_SANDBOX_ENV',
        status: 'COMPLETED',
        initiatedBy: 'SYSTEM_DR_VERIFIER',
        restoredAt: new Date(Date.now() - 1800000).toISOString(),
        validationResult: '100% Config & Secrets Match Verified.'
      }
    ];

    // 05. Validations
    this.validations = [
      {
        id: 1,
        snapshotId: 'SNP-20260728-001',
        validationType: 'CHECKSUM_INTEGRITY',
        passed: true,
        checkDetails: 'SHA256 hash verified successfully.',
        validatedAt: new Date(Date.now() - 3500000).toISOString()
      }
    ];

    // 06. Integrity
    this.integrityRecords = [
      {
        id: 1,
        snapshotId: 'SNP-20260728-001',
        sha256Checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        blockCorruptionCount: 0,
        integrityStatus: 'INTACT',
        checkedAt: new Date(Date.now() - 3500000).toISOString()
      }
    ];

    // 07. Retentions
    this.retentions = [
      {
        id: 'RET-01',
        ruleName: 'Enterprise Full Backup Retention',
        backupType: 'FULL',
        retentionDays: 90,
        autoArchive: true,
        expiryAction: 'COLD_STORAGE',
        totalStoredMb: 124500,
        createdAt: now
      },
      {
        id: 'RET-02',
        ruleName: 'Hourly Incremental Retention',
        backupType: 'INCREMENTAL',
        retentionDays: 30,
        autoArchive: false,
        expiryAction: 'PURGE',
        totalStoredMb: 14200,
        createdAt: now
      }
    ];

    // 08. Recovery Plans
    this.recoveryPlans = [
      {
        id: 'DRP-01',
        planName: 'Primary Datacenter Failover',
        failureMode: 'PRIMARY_DC_FAILURE',
        standbyNodeStatus: 'ACTIVE_STANDBY',
        rtoMinutes: 2,
        rpoMinutes: 0,
        lastDrTestAt: new Date(Date.now() - 86400000).toISOString(),
        status: 'HEALTHY'
      },
      {
        id: 'DRP-02',
        planName: 'Database Corruption Point-In-Time Rollback',
        failureMode: 'DATABASE_CORRUPTION',
        standbyNodeStatus: 'WARM_STANDBY',
        rtoMinutes: 5,
        rpoMinutes: 1,
        lastDrTestAt: new Date(Date.now() - 172800000).toISOString(),
        status: 'HEALTHY'
      }
    ];

    // 09. Reports
    this.reports = [
      {
        id: 'REP-101',
        reportTitle: 'Disaster Recovery Simulation Quarterly Audit',
        reportType: 'DISASTER_RECOVERY_SIMULATION',
        healthScore: 100,
        summary: 'All failover simulation scenarios passed RTO (<5 min) and RPO (=0 min) thresholds.',
        generatedBy: 'CHIEF_DR_OFFICER',
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ];

    // 10. Audit Logs
    this.auditLogs = [
      {
        id: 1,
        backupOrRestoreId: 'JOB-901',
        eventType: 'BACKUP_CREATED',
        operator: 'EBDR_SCHEDULER_WORKER',
        details: 'Full system backup SNP-20260728-001 completed and verified successfully.',
        clientIp: '127.0.0.1',
        timestamp: new Date(Date.now() - 3585800).toISOString()
      }
    ];
  }

  // Getters
  public static getJobs(): BackupJobItem[] {
    this.initialize();
    return [...this.jobs];
  }

  public static getSnapshots(): BackupSnapshotItem[] {
    this.initialize();
    return [...this.snapshots];
  }

  public static getHistory(): BackupHistoryItem[] {
    this.initialize();
    return [...this.history];
  }

  public static getRestores(): RestoreHistoryItem[] {
    this.initialize();
    return [...this.restores];
  }

  public static getValidations(): BackupValidationItem[] {
    this.initialize();
    return [...this.validations];
  }

  public static getIntegrityRecords(): BackupIntegrityItem[] {
    this.initialize();
    return [...this.integrityRecords];
  }

  public static getRetentions(): BackupRetentionItem[] {
    this.initialize();
    return [...this.retentions];
  }

  public static getRecoveryPlans(): BackupRecoveryPlan[] {
    this.initialize();
    return [...this.recoveryPlans];
  }

  public static getReports(): BackupReportItem[] {
    this.initialize();
    return [...this.reports];
  }

  public static getAuditLogs(): BackupAuditLogItem[] {
    this.initialize();
    return [...this.auditLogs];
  }

  public static getStatusOverview(): BackupStatusOverview {
    this.initialize();
    const successfulJobs = this.jobs.filter(j => j.status === 'VERIFIED' || j.status === 'SUCCESS' || j.status === 'COMPLETED').length;
    const failedJobs = this.jobs.filter(j => j.status === 'FAILED').length;
    const totalSize = this.snapshots.reduce((acc, s) => acc + s.sizeMb, 0);

    return {
      totalSnapshots: this.snapshots.length,
      totalBackupSizeMb: totalSize,
      successfulJobsCount: successfulJobs,
      failedJobsCount: failedJobs,
      lastBackupTimestamp: this.jobs[0]?.startedAt || new Date().toISOString(),
      lastRestoreValidationTimestamp: this.restores[0]?.restoredAt || new Date().toISOString(),
      rtoMinutes: 2,
      rpoMinutes: 0,
      backupHealthScore: 100,
      encryptionStandard: 'AES-256-GCM',
      compressionStandard: 'LZ4 / ZSTD'
    };
  }

  // Mutations
  public static addJob(job: BackupJobItem): BackupJobItem {
    this.initialize();
    this.jobs.unshift(job);
    return job;
  }

  public static addSnapshot(snapshot: BackupSnapshotItem): BackupSnapshotItem {
    this.initialize();
    this.snapshots.unshift(snapshot);
    return snapshot;
  }

  public static addRestore(restore: RestoreHistoryItem): RestoreHistoryItem {
    this.initialize();
    this.restores.unshift(restore);
    return restore;
  }

  public static addValidation(val: BackupValidationItem): BackupValidationItem {
    this.initialize();
    this.validations.unshift(val);
    return val;
  }

  public static addIntegrity(rec: BackupIntegrityItem): BackupIntegrityItem {
    this.initialize();
    this.integrityRecords.unshift(rec);
    return rec;
  }

  public static addReport(report: BackupReportItem): BackupReportItem {
    this.initialize();
    this.reports.unshift(report);
    return report;
  }

  public static addAudit(audit: Omit<BackupAuditLogItem, 'id'>): BackupAuditLogItem {
    this.initialize();
    const newLog: BackupAuditLogItem = {
      id: this.auditLogs.length + 1,
      ...audit
    };
    this.auditLogs.unshift(newLog);
    return newLog;
  }
}
