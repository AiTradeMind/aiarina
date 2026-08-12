export type ExecutionStatus = 'PENDING' | 'MATCHING' | 'PARTIALLY_FILLED' | 'FILLED' | 'REJECTED' | 'EXPIRED' | 'FAILED';

export interface IExecution {
  id: string;
  orderId: string;
  organizationId: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  executionType: string;
  quantity: string;
  price: string;
  status: ExecutionStatus;
  reason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IExecutionHistory {
  id: number;
  executionId: string;
  status: ExecutionStatus;
  timestamp: Date;
  notes: string | null;
}

export interface IExecutionMetrics {
  id: number;
  organizationId: string;
  date: string;
  totalExecutions: number;
  totalVolume: string;
  fillRate: string;
  rejectRate: string;
  avgLatencyMs: number;
  updatedAt: Date;
}

export interface RunExecutionPayload {
  orderId: string;
  organizationId: string;
}
