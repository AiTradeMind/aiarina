export type EventSource = 'IDENTITY' | 'TRADING' | 'MARKET' | 'RISK' | 'PAPER_TRADING' | 'AI' | 'AI_DECISION_ENGINE' | 'STRATEGY_ENGINE' | 'RESEARCH_ENGINE' | 'ANALYTICS' | 'ANALYTICS_ENGINE' | 'AI_MEMORY_ENGINE' | 'AI_LEARNING_ENGINE' | 'AI_ROUTER' | 'SYSTEM' | 'SESSION_KERNEL' | 'SIMULATION_ENGINE' | 'LIFECYCLE_MANAGER' | 'EXECUTION_COORDINATOR' | 'MULTI_AI_EXECUTOR';

export type EventType = 
  | 'AUTH_LOGIN' | 'AUTH_LOGOUT'
  | 'ORDER_CREATED' | 'ORDER_EXECUTED' | 'ORDER_REJECTED' | 'ORDER_CANCELLED'
  | 'TRADE_EXECUTED'
  | 'RISK_VALIDATION_PASS' | 'RISK_VALIDATION_FAIL' | 'RISK_LIMIT_UPDATED'
  | 'PAPER_ACCOUNT_CREATED' | 'PAPER_ORDER_CREATED' | 'PAPER_TRADE_EXECUTED'
  | 'AI_DECISION' | 'AI_WARNING' | 'AI_RECOMMENDATION' | 'AI_ERROR' | 'AI_RESPONSE_GENERATED'
  | 'STRATEGY_APPROVED' | 'STRATEGY_REJECTED' | 'STRATEGY_WARNING'
  | 'RESEARCH_COMPLETED' | 'RESEARCH_UPDATED' | 'RESEARCH_FAILED'
  | 'ANALYTICS_UPDATED' | 'ANALYTICS_SNAPSHOT'
  | 'MEMORY_STORED' | 'PATTERN_DETECTED'
  | 'LEARNING_UPDATED' | 'MODEL_IMPROVED' | 'STRATEGY_IMPROVED'
  | 'SYSTEM_ERROR' | 'SYSTEM_INFO' | 'SYSTEM_WARN'
  | 'SETTINGS_UPDATED'
  | 'MARKET_STATUS_CHANGED' | 'ORDER_LIFECYCLE_TRANSITIONED' | 'EXECUTION_COMPLETED' | 'EXECUTION_RETRY' | 'AI_CONSENSUS_COMPLETED' | 'SIMULATION_PAUSED' | 'SIMULATION_RESUMED' | 'SIMULATION_SPEED_CHANGED' | 'SIMULATION_STEPPED' | 'SIMULATION_SESSION_STARTED';

export interface EventLogEntry {
  id: number;
  eventType: EventType;
  source: EventSource;
  organizationId: string | null;
  userId: number | null;
  entityId: string | null;
  payload: any;
  createdAt: string;
}

export interface Notification {
  id: number;
  organizationId: string | null;
  userId: number | null;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  isRead: boolean;
  createdAt: string;
}

export interface AuditEvent {
  id: number;
  organizationId: string | null;
  userId: number | null;
  action: string;
  status: 'SUCCESS' | 'FAILURE';
  details: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  timestamp: string;
}

export interface SystemEvent {
  id: number;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
  component: string;
  message: string;
  stackTrace: string | null;
  timestamp: string;
}

export interface PublishEventRequest {
  eventType: EventType;
  source: EventSource;
  organizationId?: string;
  userId?: number;
  entityId?: string;
  payload?: any;
  notify?: {
    title: string;
    message: string;
    type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  };
  audit?: {
    action: string;
    status: 'SUCCESS' | 'FAILURE';
    details?: string;
  };
}
