export type ReportCategory = 'EXECUTIVE' | 'TRADING' | 'FINANCIAL' | 'OPERATIONAL' | 'COMPLIANCE' | 'CUSTOM';
export type ExportFormat = 'PDF' | 'CSV' | 'XLSX' | 'JSON';
export type ScheduleFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';

export interface EnterpriseKpiItem {
  kpiId: string;
  name: string;
  category: ReportCategory;
  currentValue: number | string;
  previousValue: number | string;
  targetValue: number | string;
  unit: string;
  trendPercent: number;
  isPositive: boolean;
  status: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
  lastUpdated: string;
}

export interface ExecutiveDashboardOverview {
  aumFormatted: string;
  netPnlFormatted: string;
  sharpeRatio: number;
  winRatePercent: number;
  dailyVolumeFormatted: string;
  var99Percent: number;
  systemUptimePercent: number;
  activeStrategiesCount: number;
  kpis: EnterpriseKpiItem[];
  generatedAt: string;
}

export interface TradingIntelligenceMetrics {
  totalOrdersProcessed: number;
  filledOrdersCount: number;
  cancelledOrdersCount: number;
  fillRatePercent: number;
  avgSlippageBps: number;
  avgExecutionLatencyMs: number;
  topPerformingStrategy: string;
  winLossRatio: number;
  profitFactor: number;
  recentTradesSummary: Array<{
    tradeId: string;
    symbol: string;
    side: 'BUY' | 'SELL';
    qty: number;
    price: number;
    realizedPnl: number;
    executedAt: string;
  }>;
}

export interface FinancialReportMetrics {
  totalAssets: string;
  totalLiabilities: string;
  netEquity: string;
  unrealizedPnl: string;
  realizedPnl24h: string;
  treasuryCashYield: string;
  ledgerBalanceCheck: 'BALANCED' | 'DISCREPANCY';
  accountingEntries24h: number;
  balanceSheetBreakdown: Array<{
    accountName: string;
    category: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE';
    balanceFormatted: string;
  }>;
}

export interface OperationalReportMetrics {
  platformUptimePercent: number;
  avgWorkerUtilization: number;
  activeIncidentsCount: number;
  resolvedIncidents24h: number;
  avgIncidentMttrMins: number;
  notificationsDispatched24h: number;
  featureFlagsActive: number;
  servicesHealthOverview: Array<{
    epCode: string;
    serviceName: string;
    status: 'ONLINE' | 'DEGRADED' | 'MAINTENANCE';
    uptimePercent: number;
  }>;
}

export interface ComplianceReportMetrics {
  regulatoryAuditStatus: 'COMPLIANT' | 'WARNING';
  bestExecutionPassRate: number;
  positionLimitBreaches: number;
  unauthorizedAccessAttempts: number;
  auditTrailCount24h: number;
  complianceChecks: Array<{
    checkName: string;
    category: string;
    status: 'PASSED' | 'FAILED' | 'FLAGGED';
    details: string;
  }>;
}

export interface BiQueryRequest {
  dimension: string;
  metric: string;
  timeframe: string;
  filterModule?: string;
}

export interface BiQueryResult {
  dimension: string;
  metric: string;
  rows: Array<{
    label: string;
    value: number;
    percentage: number;
  }>;
  total: number;
  computedInMs: number;
}

export interface ReportItem {
  id: string;
  reportId: string;
  title: string;
  category: ReportCategory;
  generatedBy: string;
  format: ExportFormat;
  downloadUrl: string;
  createdAt: string;
}

export interface ScheduledReport {
  id: string;
  scheduleId: string;
  title: string;
  category: ReportCategory;
  frequency: ScheduleFrequency;
  recipientEmails: string[];
  nextRun: string;
  isActive: boolean;
  format: ExportFormat;
}

export interface ReportingQaReport {
  totalModulesTested: number;
  passCount: number;
  failCount: number;
  modules: Array<{
    moduleId: string;
    moduleName: string;
    status: 'PASSED' | 'FAILED';
    details: string;
  }>;
  repositories: Array<{
    repositoryName: string;
    status: 'PASSED' | 'FAILED';
    methodsCount: number;
    coveragePercent: number;
    duplicateCheck: 'NONE' | 'FOUND';
    health: 'OPTIMAL' | 'DEGRADED';
  }>;
  controllers: Array<{
    controllerName: string;
    routesCount: number;
    health: 'OPTIMAL' | 'DEGRADED';
    avgResponseMs: number;
    coveragePercent: number;
  }>;
  services: Array<{
    serviceName: string;
    dependencies: string[];
    status: 'PASSED' | 'FAILED';
    errorCount: number;
    healthScore: number;
  }>;
  routes: Array<{
    routePath: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    authRequired: boolean;
    latencyMs: number;
    status: 'ACTIVE' | 'INACTIVE';
  }>;
  crossWorkspaceLinks: Array<{
    sourceModule: string;
    targetModule: string;
    status: 'CONNECTED' | 'DISCONNECTED';
  }>;
  performanceMetrics: {
    renderTimeMs: number;
    memoryUsageMb: number;
    cpuUtilizationPercent: number;
    jsHeapMb: number;
    networkBandwidthKbps: number;
    avgApiLatencyMs: number;
  };
  securityChecks: Array<{
    checkName: string;
    status: 'SECURED' | 'VULNERABLE';
    details: string;
  }>;
  readOnlyIsolationConfirmed: boolean;
  buildStatus: string;
  evidencePack: {
    sha256Checksum: string;
    generatedTime: string;
    version: string;
    buildNumber: string;
    gitCommit: string;
    enterpriseSignature: string;
  };
}
