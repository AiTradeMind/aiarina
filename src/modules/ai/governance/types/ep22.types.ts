export type ModelLifecycleStatus =
  | 'REGISTERED'
  | 'TESTING'
  | 'VALIDATED'
  | 'APPROVED'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'DEPRECATED'
  | 'RETIRED';

export type ApprovalStage =
  | 'Draft'
  | 'Review'
  | 'Validation'
  | 'Approved'
  | 'Rejected'
  | 'Retired';

export interface AIModelItem {
  modelId: string;
  name: string;
  provider: string;
  family: string;
  version: string;
  owner: string;
  capabilities: string[];
  license: string;
  status: ModelLifecycleStatus;
  approvalStage: ApprovalStage;
  releaseDate: string;
  workspace: string;
}

export interface ModelVersion {
  versionId: string;
  modelId: string;
  versionNumber: string;
  status: ModelLifecycleStatus;
  releaseNotes: string;
  compatibilityMatrix: Record<string, boolean>;
  createdAt: string;
}

export interface ModelBenchmarkEvaluation {
  evaluationId: string;
  modelId: string;
  accuracyPercent: number;
  latencyMs: number;
  reliabilityPercent: number;
  costPer1kTokensUSD: number;
  tokenUsage24h: number;
  successRatePercent: number;
  failureRatePercent: number;
  hallucinationRatePercent: number;
  responseQualityScore: number;
  evaluatedAt: string;
}

export interface AiLeaderboardItem {
  rank: number;
  modelId: string;
  name: string;
  provider: string;
  accuracy: number;
  latencyMs: number;
  costScore: number;
  reliability: number;
  successRate: number;
  workspacePerformanceScore: number;
}

export interface AiPolicyItem {
  policyId: string;
  name: string;
  policyType: 'ALLOWED_MODELS' | 'BLOCKED_MODELS' | 'WORKSPACE' | 'PROVIDER' | 'USAGE_LIMIT' | 'RATE_LIMIT' | 'FALLBACK';
  scope: string;
  rules: Record<string, any>;
  isEnabled: boolean;
  createdAt: string;
}

export interface AiProviderItem {
  providerId: string;
  name: string;
  apiStatus: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
  supportedModelsCount: number;
  avgLatencyMs: number;
  rateLimitRpm: number;
  activeKeyConfigured: boolean;
}

export interface AiDeploymentItem {
  deploymentId: string;
  modelId: string;
  environment: 'PRODUCTION' | 'STAGING' | 'SANDBOX';
  status: 'DEPLOYED' | 'PROMOTED' | 'SUSPENDED' | 'ROLLED_BACK' | 'RETIRED';
  healthStatus: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  deployedAt: string;
  activeWorkerCount: number;
}

export interface AiGovernanceAuditItem {
  auditId: string;
  actionType: string;
  modelId?: string;
  operator: string;
  details: string;
  timestamp: string;
}

export interface AiGovernanceQaReport {
  totalModulesTested: number;
  passCount: number;
  failCount: number;
  modules: Array<{
    moduleId: string;
    moduleName: string;
    status: 'PASSED' | 'FAILED';
    details: string;
  }>;
  readOnlyTelemetryConfirmed: boolean;
  noReasoningOrTradingConfirmed: boolean;
  buildStatus: string;
}
