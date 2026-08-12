export interface SystemMetricItem {
  metricId: string;
  name: string;
  category: 'CPU' | 'MEMORY' | 'DISK' | 'NETWORK' | 'DATABASE' | 'REDIS' | 'WEBSOCKET' | 'API' | 'WORKER';
  value: number;
  unit: string;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  timestamp: string;
}

export interface TraceSpan {
  spanId: string;
  parentSpanId?: string;
  moduleName: string;
  operation: string;
  durationMs: number;
  status: 'OK' | 'ERROR';
  timestamp: string;
}

export interface DistributedTraceItem {
  traceId: string;
  correlationId: string;
  rootModule: string;
  totalDurationMs: number;
  spansCount: number;
  status: 'COMPLETED' | 'FAILED' | 'IN_PROGRESS';
  timestamp: string;
  spans: TraceSpan[];
}

export interface AggregatedLogItem {
  logId: string;
  traceId?: string;
  sourceModule: string;
  logLevel: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'FATAL';
  category: 'APP' | 'API' | 'WORKER' | 'AUDIT' | 'SECURITY' | 'RUNTIME';
  message: string;
  timestamp: string;
}

export interface PerformanceMetricSummary {
  avgResponseTimeMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  throughputTps: number;
  queueTimeMs: number;
  activeWorkers: number;
}

export interface ErrorAnalyticsItem {
  errorId: string;
  errorType: 'APP_ERROR' | 'API_ERROR' | 'WORKER_ERROR' | 'DB_TIMEOUT' | 'CIRCUIT_BREAKER';
  sourceModule: string;
  message: string;
  count: number;
  failureRatePct: number;
  lastOccurredAt: string;
}

export interface CapacityPlanningForecast {
  resourceType: 'CPU' | 'MEMORY' | 'DATABASE_STORAGE' | 'QUEUE_DEPTH';
  currentUsagePct: number;
  forecast30DaysPct: number;
  forecast90DaysPct: number;
  recommendedAction: string;
  status: 'OPTIMAL' | 'NEAR_CAPACITY' | 'CRITICAL_GROWTH';
}

export interface SloTargetItem {
  serviceId: string;
  serviceName: string;
  targetAvailabilityPct: number;
  currentAvailabilityPct: number;
  latencySloMs: number;
  currentP95Ms: number;
  errorBudgetRemainingPct: number;
  status: 'MEETING_SLO' | 'AT_RISK' | 'BREACHED';
}

export interface TelemetryTrendPoint {
  timestamp: string;
  tps: number;
  avgLatencyMs: number;
  cpuPct: number;
  memoryPct: number;
  errorRatePct: number;
}

export interface ObservabilityAuditItem {
  auditId: string;
  eventType: 'PERFORMANCE_REGRESSION' | 'LATENCY_SPIKE' | 'CAPACITY_WARNING' | 'SLO_BREACH' | 'CONFIG_CHANGE';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  details: string;
  timestamp: string;
}

export interface ObservabilityDashboardOverview {
  overallHealthScore: number;
  avgSystemLatencyMs: number;
  currentTps: number;
  activeTraces: number;
  errorRatePct: number;
  sloBreachesCount: number;
  cpuUtilizationPct: number;
  memoryUtilizationPct: number;
  lastUpdated: string;
}

export interface ObservabilityQaReport {
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
