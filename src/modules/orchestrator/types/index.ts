export interface ITradingPipeline {
  id: string;
  organizationId: string;
  orderId: string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED' | 'ROLLED_BACK';
  currentStage: string;
  error?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPipelineEvent {
  id: number;
  pipelineId: string;
  stage: string;
  status: 'SUCCESS' | 'FAILED';
  latencyMs: number;
  timestamp: Date;
}

export interface IOrchestratorJob {
  id: string;
  organizationId: string;
  type: 'BATCH_EXECUTION' | 'SYSTEM_MAINTENANCE';
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  createdAt: Date;
  completedAt: Date | null;
}

export interface PipelineExecutionPayload {
  organizationId: string;
  portfolioId: string;
  symbol: string;
  assetClass: string;
  side: 'BUY' | 'SELL';
  quantity: string;
  price: string;
  strategyId?: string;
  aiModelId?: string;
  metadata?: any;
}
