export type GoNoGoDecisionType = 'GO' | 'GO_WITH_WARNINGS' | 'NO_GO';
export type CertificationModuleStatus = 'PASSED' | 'FAILED' | 'WARNING';

export interface ArchitectureValidationItem {
  moduleId: string;
  moduleName: string;
  scopeIsolation: 'ISOLATED' | 'SHARED';
  dependenciesVerified: boolean;
  architectureStatus: CertificationModuleStatus;
  details: string;
}

export interface CrossModuleIntegrationItem {
  integrationId: string;
  sourceModule: string;
  targetModule: string;
  channelType: 'REST_READ_ONLY' | 'EVENT_BUS' | 'DATABASE_SCHEMA_ISOLATED';
  communicationStatus: CertificationModuleStatus;
  latencyMs: number;
}

export interface DatabaseCertificationItem {
  tableGroup: string;
  epCoverage: string;
  schemaIntegrity: CertificationModuleStatus;
  foreignKeyConstraints: 'ENFORCED' | 'PARTIAL';
  migrationHistoryStatus: 'UP_TO_DATE';
  recordsCount: number;
}

export interface ApiCertificationItem {
  routePrefix: string;
  epCoverage: string;
  contractVerified: boolean;
  authNAuthZEnforced: boolean;
  rateLimitingActive: boolean;
  avgResponseMs: number;
  status: CertificationModuleStatus;
}

export interface SecurityCertificationItem {
  securityCategory: 'RBAC_ACCESS' | 'API_GATEWAY_BURST' | 'SOC_THREAT_SCAN' | 'SECRETS_ROTATION' | 'AML_COMPLIANCE';
  complianceStandard: 'ISO_27001' | 'SOC2_TYPE_II' | 'FINRA_COMPLIANT';
  verificationStatus: CertificationModuleStatus;
  lastAudited: string;
  details: string;
}

export interface PerformanceCertificationItem {
  metricName: string;
  targetSlo: string;
  measuredValue: string;
  status: CertificationModuleStatus;
  evaluationDetails: string;
}

export interface DisasterRecoveryCertificationItem {
  drComponent: 'AUTOMATED_DATABASE_SNAPSHOTS' | 'POINT_IN_TIME_RECOVERY' | 'FAILOVER_DRILL' | 'ENCRYPTED_OFFSITE_BACKUP';
  rtoTargetMinutes: number;
  rpoTargetMinutes: number;
  measuredRtoMinutes: number;
  measuredRpoMinutes: number;
  status: CertificationModuleStatus;
}

export interface ReleaseCertificationItem {
  releaseId: string;
  versionTag: string;
  targetEnvironment: string;
  approvalGatesPassed: number;
  rollbackTargetVerified: boolean;
  status: CertificationModuleStatus;
}

export interface EnterpriseScorecard {
  architectureScore: number;
  securityScore: number;
  performanceScore: number;
  complianceScore: number;
  reliabilityScore: number;
  maintainabilityScore: number;
  productionReadinessScore: number;
  evaluatedAt: string;
}

export interface GoNoGoDecision {
  decision: GoNoGoDecisionType;
  overallScore: number;
  reasons: string[];
  certifiedBy: string;
  timestamp: string;
  certificateId: string;
}

export interface CertificationAuditItem {
  auditId: string;
  eventType: 'CERTIFICATION_RUN_EXECUTED' | 'SCORECARD_GENERATED' | 'GO_DECISION_ISSUED' | 'EVIDENCE_EXPORTED';
  operator: string;
  details: string;
  timestamp: string;
}

export interface CertificationDashboardOverview {
  overallDecision: GoNoGoDecisionType;
  productionScore: number;
  modulesCertifiedCount: number;
  totalModulesCount: number;
  criticalSecurityPassRate: number;
  databaseIntegrityIndex: number;
  apiContractPassRate: number;
  drReadinessIndex: number;
  certificateId: string;
  lastRunAt: string;
}

export interface CertificationQaReport {
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
