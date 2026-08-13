export interface QADomainVerification {
  domainNumber: number;
  domainName: string;
  category: 'ARCHITECTURE' | 'LIFECYCLE' | 'ISOLATION' | 'SECURITY' | 'PERFORMANCE' | 'RELIABILITY' | 'DATABASE' | 'API' | 'EVENT_BUS' | 'UI' | 'PRODUCTION';
  status: 'PASSED' | 'FAILED' | 'WARNING';
  scorePercent: number;
  rulesVerifiedCount: number;
  totalRulesCount: number;
  details: string;
  testCases: {
    ruleId: string;
    description: string;
    status: 'PASSED' | 'FAILED';
    executionTimeMs: number;
    details?: string;
  }[];
}

export interface QACertificationReport {
  id: string;
  tenantId: string;
  workspaceId: string;
  aiModelId: string;
  reportTitle: string;
  overallStatus: 'PASSED_CERTIFIED' | 'FAILED' | 'CONDITIONALLY_PASSED';
  overallScorePercent: number;
  domainsVerifiedCount: number;
  totalDomainsCount: number;
  stagesVerifiedCount: number;
  totalStagesCount: number;
  totalTestsRun: number;
  totalTestsPassed: number;
  totalTestsFailed: number;
  executionTimeMs: number;
  certificationTimestamp: string;
  domains: QADomainVerification[];
  architectureReport: {
    oneWorkspaceOneResponsibility: boolean;
    noDuplicatedLogic: boolean;
    correctWorkspaceOwnership: boolean;
    correctModuleBoundaries: boolean;
    dependencyDirectionValid: boolean;
    eventDrivenArchitectureValid: boolean;
  };
  lifecycleReport: {
    stagesVerified: number;
    invalidTransitionsPrevented: boolean;
    rollbackSafetyVerified: boolean;
    recoveryAndRetryVerified: boolean;
    auditChainIntegrityVerified: boolean;
  };
  modelIsolationReport: {
    totalModelsVerified: number;
    zeroDataLeakageVerified: boolean;
    independentWalletsPortfolios: boolean;
  };
  paperLiveIsolationReport: {
    paperCapitalIsolated: boolean;
    liveCapitalIsolated: boolean;
    zeroSharedStateVerified: boolean;
  };
  productionReadinessReport: {
    environmentVariablesValid: boolean;
    secretsSecured: boolean;
    typeSafetyConfirmed: boolean;
    databaseMigrationsVerified: boolean;
  };
}

export interface QABenchmarkMetric {
  id: string;
  metricName: string;
  category: string;
  measuredValue: string;
  targetThreshold: string;
  status: 'PASSED' | 'FAILED';
}
