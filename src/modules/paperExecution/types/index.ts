export interface PaperExecutionRequest {
  orderId: number;
  correlationId?: string;
  ticker: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price?: number;
  type: 'MARKET' | 'LIMIT' | 'STOP' | 'STOP_LIMIT';
}

export interface PaperExecutionResult {
  success: boolean;
  executionId?: number;
  correlationId?: string;
  status: string;
  filledQuantity?: number;
  averageFillPrice?: number;
  message?: string;
  certificate?: string;
}
