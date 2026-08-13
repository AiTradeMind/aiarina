export type ServiceStatus = 'ONLINE' | 'OFFLINE' | 'DEGRADED' | 'MAINTENANCE';
export type IncidentSeverity = 'P1' | 'P2' | 'P3' | 'P4';
export type IncidentStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED' | 'CLOSED';
export type MaintenanceModeType = 'PLATFORM' | 'MODULE' | 'READ_ONLY';
export type FeatureFlagScope = 'WORKSPACE' | 'MODULE' | 'GLOBAL';

export interface PlatformHealthOverview {
  cpuUsagePercent: number;
  memoryUsagePercent: number;
  memoryUsedGb: number;
  memoryTotalGb: number;
  dbStatus: 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE';
  cacheStatus: 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE';
  queueStatus: 'HEALTHY' | 'WARNING' | 'BACKLOG_HIGH';
  wsStatus: 'ONLINE' | 'DEGRADED';
  workerStatus: 'ALL_ONLINE' | 'DEGRADED';
  healthScore: number;
  totalActiveWorkers: number;
  uptimeSeconds: number;
  timestamp: string;
}

export interface ServiceRegistryItem {
  id: string;
  epCode: 'EP03' | 'EP11' | 'EP12' | 'EP13' | 'EP14' | 'EP15' | 'EP16' | 'EP17' | 'EP18' | 'EP19';
  name: string;
  status: ServiceStatus;
  latencyMs: number;
  errorRatePercent: number;
  availabilityPercent: number;
  version: string;
  lastPing: string;
}

export interface WorkerDetail {
  workerId: string;
  name: string;
  status: 'BUSY' | 'IDLE' | 'PAUSED';
  currentTask: string;
  tasksCompleted: number;
  threadId: number;
}

export interface RuntimeMetrics {
  activeWorkersCount: number;
  activeJobsCount: number;
  backgroundTasksCount: number;
  avgExecutionTimeMs: number;
  totalFailures24h: number;
  totalRetries24h: number;
  threadUtilizationPercent: number;
  workerList: WorkerDetail[];
}

export interface QueueDetail {
  queueName: string;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  deadLetter: number;
  throughputPerSec: number;
}

export interface QueueMetrics {
  pendingJobs: number;
  processingJobs: number;
  completedJobs: number;
  failedJobs: number;
  deadLetterQueueCount: number;
  retryQueueCount: number;
  queuesList: QueueDetail[];
}

export interface IncidentTimelineItem {
  timestamp: string;
  author: string;
  note: string;
}

export interface IncidentItem {
  id: string;
  incidentId: string;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  affectedService: string;
  createdAt: string;
  resolvedAt?: string;
  timeline: IncidentTimelineItem[];
}

export interface MaintenanceItem {
  id: string;
  maintenanceId: string;
  title: string;
  mode: MaintenanceModeType;
  targetModule?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  scheduledStart: string;
  scheduledEnd: string;
  createdAt: string;
}

export interface FeatureFlagItem {
  id: string;
  flagKey: string;
  name: string;
  description: string;
  isEnabled: boolean;
  scope: FeatureFlagScope;
  targetWorkspaceOrModule?: string;
  gradualRolloutPercent: number;
  createdAt: string;
  updatedAt: string;
}

export interface DiagnosticCheck {
  component: 'DATABASE' | 'REDIS_CACHE' | 'API' | 'WORKERS' | 'QUEUES' | 'SCHEDULER' | 'WEBSOCKET' | 'FILESYSTEM';
  status: 'PASS' | 'WARN' | 'FAIL';
  latencyMs: number;
  message: string;
  checkedAt: string;
}

export interface OperationalAuditItem {
  id: string;
  auditId: string;
  actionType: 'SERVICE_RESTART' | 'MAINTENANCE_TOGGLE' | 'INCIDENT_CREATE' | 'FEATURE_FLAG_CHANGE' | 'RUNTIME_FAILURE' | 'OPERATOR_ACTION';
  operator: string;
  details: string;
  timestamp: string;
}

export interface HealthScoreBreakdown {
  overallScore: number;
  availabilityScore: number;
  latencyScore: number;
  errorRateScore: number;
  recoveryScore: number;
  perModuleHealth: Record<string, number>;
}

export interface OperationsQaReport {
  totalModulesTested: number;
  passCount: number;
  failCount: number;
  modules: Array<{
    moduleId: string;
    moduleName: string;
    status: 'PASSED' | 'FAILED';
    details: string;
  }>;
  readOnlyMonitoringOnly: boolean;
  buildStatus: string;
}
