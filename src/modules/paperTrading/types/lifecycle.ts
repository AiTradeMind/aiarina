import { OrderType, TransactionSide } from "../../trading/types/index.ts";

export type OrderLifecycleState =
  | 'CREATED'
  | 'VALIDATED'
  | 'RISK_APPROVED'
  | 'QUEUED'
  | 'SUBMITTED'
  | 'ACCEPTED'
  | 'PARTIALLY_FILLED'
  | 'FILLED'
  | 'CANCELLED'
  | 'REJECTED'
  | 'CLOSED'
  | 'ARCHIVED';

export interface OrderLifecycleEvent {
  id: string;
  orderId: number;
  fromState: OrderLifecycleState | null;
  toState: OrderLifecycleState;
  timestamp: string;
  triggerType: 'USER' | 'SYSTEM' | 'RISK_ENGINE' | 'AI_ENGINE' | 'SIMULATION_ENGINE';
  reason: string;
  operatorId?: string; // user or system component
}

export interface ExecutionQueueItem {
  id: string; // Idempotency key / Queue ID
  orderId: number;
  organizationId: string;
  userId: number;
  ticker: string;
  side: TransactionSide;
  quantity: string;
  price: string | null;
  type: OrderType;
  retryCount: number;
  maxRetries: number;
  queuedAt: string;
  lastAttemptAt?: string;
  error?: string;
}

export interface ExecutionAuditLog {
  id: string;
  queueItemId?: string;
  orderId: number;
  organizationId: string;
  action: string;
  status: 'SUCCESS' | 'FAILED' | 'RETRYING' | 'TIMEOUT';
  details: string;
  timestamp: string;
}
