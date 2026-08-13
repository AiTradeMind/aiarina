export type SourceModule = 
  | 'EP11_OMS' 
  | 'EP12_PMS' 
  | 'EP13_RMS' 
  | 'EP14_EXECUTION' 
  | 'EP15_TRADE_JOURNAL' 
  | 'EP16_ACCOUNTING' 
  | 'EP17_TREASURY' 
  | 'SYSTEM';

export type EventPriority = 'P0' | 'P1' | 'P2' | 'P3'; // P0: Critical, P1: Warning, P2: Info, P3: Success
export type NotificationLevel = 'SUCCESS' | 'WARNING' | 'ERROR' | 'CRITICAL' | 'INFO';
export type WorkflowType = 'SEQUENTIAL' | 'PARALLEL' | 'CONDITIONAL' | 'RETRY' | 'MANUAL_APPROVAL';
export type WorkflowStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'ESCALATED' | 'REJECTED' | 'CANCELLED';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ESCALATED' | 'CANCELLED' | 'EXPIRED';
export type EscalationTrigger = 'AUTOMATIC' | 'PRIORITY' | 'TIMEOUT' | 'CRITICAL_INCIDENT';
export type DeliveryChannel = 'IN_APP' | 'EMAIL' | 'SMS' | 'PUSH' | 'WEBHOOK';

export interface NotificationEventItem {
  eventId: string;
  sourceModule: SourceModule;
  eventType: string;
  correlationId: string;
  priority: EventPriority;
  payload: Record<string, any>;
  timestamp: string;
}

export interface EnweNotification {
  id: string;
  eventId: string;
  title: string;
  message: string;
  type: NotificationLevel;
  priority: EventPriority;
  category: string;
  sourceModule: SourceModule;
  correlationId: string;
  isRead: boolean;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: string;
  readAt?: string;
  metadata?: Record<string, any>;
}

export interface WorkflowStepItem {
  stepId: string;
  stepName: string;
  stepType: 'ACTION' | 'CONDITION' | 'APPROVAL' | 'NOTIFICATION';
  status: 'PENDING' | 'IN_PROGRESS' | 'PASSED' | 'FAILED' | 'SKIPPED';
  assignedTo?: string;
  executedAt?: string;
  details?: string;
}

export interface WorkflowInstanceItem {
  id: string;
  workflowId: string;
  name: string;
  type: WorkflowType;
  status: WorkflowStatus;
  sourceModule: SourceModule;
  correlationId: string;
  currentStepIndex: number;
  steps: WorkflowStepItem[];
  approvalInfo?: {
    approvalId: string;
    approverRole: string;
    approverName?: string;
    status: ApprovalStatus;
    requestedAt: string;
    respondedAt?: string;
    comments?: string;
  };
  retryCount: number;
  maxRetries: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalRequestItem {
  id: string;
  approvalId: string;
  workflowId: string;
  title: string;
  description: string;
  sourceModule: SourceModule;
  priority: EventPriority;
  status: ApprovalStatus;
  approverRole: string;
  requestedAt: string;
  respondedAt?: string;
  comments?: string;
}

export interface EscalationRuleItem {
  ruleId: string;
  name: string;
  triggerType: EscalationTrigger;
  timeoutMinutes: number;
  targetRole: string;
  isActive: boolean;
  description: string;
}

export interface EscalationLogItem {
  id: string;
  escalationId: string;
  workflowId: string;
  ruleId: string;
  triggerType: EscalationTrigger;
  targetRole: string;
  status: 'ACTIVE' | 'RESOLVED' | 'DISMISSED';
  reason: string;
  createdAt: string;
}

export interface NotificationTemplateItem {
  templateId: string;
  module: 'OMS' | 'PMS' | 'RMS' | 'EXECUTION' | 'ACCOUNTING' | 'TREASURY' | 'SYSTEM';
  eventKey: string;
  titleTemplate: string;
  bodyTemplate: string;
  defaultPriority: EventPriority;
  type: NotificationLevel;
}

export interface DeliveryChannelItem {
  channel: DeliveryChannel;
  name: string;
  enabled: boolean;
  deliveredCount: number;
  failedCount: number;
  v1Status: 'ACTIVE_IN_APP' | 'FUTURE_READY_STUBBED';
  notes: string;
}

export interface WorkflowRuntimeMetric {
  workersActive: number;
  queueDepth: number;
  retriesPending: number;
  deadLetterCount: number;
  status: 'HEALTHY' | 'DEGRADED' | 'PAUSED';
  healthScore: number;
  processedTotal: number;
  recoveredTotal: number;
}

export interface EnweAuditItem {
  id: string;
  auditId: string;
  eventId?: string;
  workflowId?: string;
  action: 'CREATED' | 'DELIVERED' | 'READ' | 'DISMISSED' | 'RETRIED' | 'FAILED' | 'ESCALATED' | 'APPROVED' | 'REJECTED';
  details: string;
  actor: string;
  timestamp: string;
}

export interface EnweQaReport {
  totalModulesTested: number;
  passCount: number;
  failCount: number;
  modules: Array<{
    moduleId: string;
    moduleName: string;
    status: 'PASSED' | 'FAILED';
    details: string;
  }>;
  paperTradingOnly: boolean;
  indianMarketOnly: boolean;
  inAppOnly: boolean;
  buildStatus: string;
}
