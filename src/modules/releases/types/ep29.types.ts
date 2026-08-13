export type EnvironmentType = 'DEVELOPMENT' | 'TESTING' | 'QA' | 'STAGING' | 'PRODUCTION' | 'SANDBOX';
export type EnvironmentStatus = 'HEALTHY' | 'DEGRADED' | 'MAINTENANCE' | 'DEPLOYING';
export type ReleaseApprovalStatus = 'DRAFT' | 'REVIEW' | 'QA_APPROVED' | 'SECURITY_APPROVED' | 'PRODUCTION_APPROVED' | 'REJECTED';
export type DeploymentStatus = 'QUEUED' | 'BUILDING' | 'PACKAGING' | 'DEPLOYING' | 'VALIDATING' | 'SUCCESS' | 'FAILED' | 'ROLLED_BACK';

export interface ReleaseEnvironmentItem {
  envId: string;
  envName: EnvironmentType;
  displayName: string;
  status: EnvironmentStatus;
  activeVersion: string;
  activeDeploymentId: string;
  hostUrl: string;
  lastDeployedAt: string;
}

export interface ReleaseRegistryItem {
  releaseId: string;
  version: string;
  releaseName: string;
  owner: string;
  releaseNotes: string;
  approvalStatus: ReleaseApprovalStatus;
  targetEnvironment: EnvironmentType;
  createdAt: string;
}

export interface ReleaseVersionItem {
  versionId: string;
  semver: string;
  releaseTag: string;
  commitHash: string;
  isRollbackTarget: boolean;
  compatibilityStatus: 'COMPATIBLE' | 'BREAKING_CHANGES';
  createdAt: string;
}

export interface ReleaseDeploymentItem {
  deploymentId: string;
  releaseId: string;
  version: string;
  environment: EnvironmentType;
  status: DeploymentStatus;
  pipelineStep: 'BUILD' | 'PACKAGE' | 'DEPLOY' | 'VALIDATE' | 'PROMOTE' | 'COMPLETED';
  triggeredBy: string;
  durationSeconds: number;
  deployedAt: string;
}

export interface ReleaseConfigProfileItem {
  configId: string;
  environment: EnvironmentType;
  profileName: string;
  secretsReferenceCount: number;
  lastUpdatedBy: string;
  updatedAt: string;
}

export interface ReleaseApprovalItem {
  approvalId: string;
  releaseId: string;
  version: string;
  approverRole: 'QA_LEAD' | 'SECURITY_LEAD' | 'RELEASE_MANAGER';
  approverName: string;
  decision: 'APPROVED' | 'REJECTED';
  comments: string;
  timestamp: string;
}

export interface ReleaseRollbackItem {
  rollbackId: string;
  deploymentId: string;
  environment: EnvironmentType;
  fromVersion: string;
  toVersion: string;
  rollbackType: 'APPLICATION' | 'CONFIGURATION' | 'ENVIRONMENT' | 'VERSION';
  executedBy: string;
  status: 'SUCCESS' | 'FAILED';
  timestamp: string;
}

export interface ReleaseAuditItem {
  auditId: string;
  eventType: 'DEPLOYMENT_TRIGGERED' | 'ROLLBACK_EXECUTED' | 'APPROVAL_GRANTED' | 'CONFIG_CHANGED' | 'ENV_STATUS_CHANGE';
  operator: string;
  details: string;
  timestamp: string;
}

export interface ReleaseRuntimeWorker {
  workerId: string;
  workerType: 'DEPLOYMENT_QUEUE' | 'VALIDATION_QUEUE' | 'APPROVAL_QUEUE' | 'ROLLBACK_QUEUE' | 'HEALTH_MONITOR';
  status: 'ONLINE' | 'PROCESSING' | 'IDLE';
  processedJobs: number;
  uptimeSeconds: number;
}

export interface ReleaseDashboardOverview {
  totalEnvironmentsCount: number;
  healthyEnvironmentsCount: number;
  totalReleasesCount: number;
  pendingApprovalsCount: number;
  totalDeploymentsToday: number;
  successfulDeploymentsCount: number;
  rollbacksExecutedCount: number;
  releaseHealthIndex: number;
}

export interface ReleaseQaReport {
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
