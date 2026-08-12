export type JobPriority = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW' | 'BACKGROUND';
export type JobStatus = 'PENDING' | 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type ScheduleType = 'CRON' | 'ONE_TIME' | 'RECURRING' | 'DELAYED' | 'MANUAL';
export type AutomationTriggerType = 'TIME_BASED' | 'EVENT_BASED' | 'CONDITIONAL' | 'MANUAL' | 'POLICY_BASED';

export interface SchedulerJobItem {
  jobId: string;
  name: string;
  category: 'NOTIFICATIONS' | 'OPERATIONS' | 'REPORTING' | 'COMPLIANCE' | 'OBSERVABILITY' | 'BACKUP' | 'MAINTENANCE';
  ownerModule: string;
  priority: JobPriority;
  status: JobStatus;
  scheduleType: ScheduleType;
  cronExpression?: string;
  nextRunAt: string;
  lastRunAt?: string;
  dependencies: string[]; // Job IDs
  retryCount: number;
  maxRetries: number;
  timeoutMs: number;
  createdAt: string;
}

export interface ScheduleDefinition {
  scheduleId: string;
  jobId: string;
  jobName: string;
  scheduleType: ScheduleType;
  expressionOrDelay: string;
  timezone: string;
  isEnabled: boolean;
  nextRunAt: string;
}

export interface DependencyGraphNode {
  nodeId: string;
  jobId: string;
  jobName: string;
  dependsOnJobIds: string[];
  executionOrder: number;
  isBlocked: boolean;
  status: JobStatus;
}

export interface AutomationRuleItem {
  ruleId: string;
  ruleName: string;
  triggerType: AutomationTriggerType;
  condition: string;
  targetJobId: string;
  isEnabled: boolean;
  lastTriggeredAt?: string;
}

export interface JobQueueEntry {
  queueId: string;
  jobId: string;
  jobName: string;
  priority: JobPriority;
  status: JobStatus;
  workerNode: string;
  retryAttempt: number;
  queuedAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface RetryQueueEntry {
  retryId: string;
  jobId: string;
  jobName: string;
  failedAttempt: number;
  lastError: string;
  nextRetryAt: string;
  exponentialBackoffSec: number;
  inDeadLetterQueue: boolean;
}

export interface CalendarEventItem {
  eventId: string;
  jobId: string;
  jobName: string;
  scheduledTime: string;
  recurrence: string;
  status: 'UPCOMING' | 'COMPLETED' | 'CANCELLED';
}

export interface SchedulerAuditItem {
  auditId: string;
  eventType: 'JOB_CREATED' | 'JOB_TRIGGERED' | 'JOB_COMPLETED' | 'JOB_FAILED' | 'RETRY_INITIATED' | 'JOB_CANCELLED' | 'RULE_TRIGGERED';
  operator: string;
  details: string;
  timestamp: string;
}

export interface SchedulerRuntimeWorker {
  workerId: string;
  workerType: 'SCHEDULER_WORKER' | 'QUEUE_WORKER' | 'RETRY_WORKER' | 'DEPENDENCY_WORKER' | 'MONITORING_WORKER';
  status: 'ONLINE' | 'IDLE' | 'PROCESSING' | 'MAINTENANCE';
  currentJobId?: string;
  processedCount: number;
  uptimeSeconds: number;
}

export interface SchedulerDashboardOverview {
  totalRegisteredJobs: number;
  activeSchedulesCount: number;
  runningQueueCount: number;
  failedRetriesCount: number;
  deadLetterQueueCount: number;
  activeAutomationRules: number;
  schedulerHealthScore: number;
  nextScheduledJobRun: string;
}

export interface SchedulerQaReport {
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
