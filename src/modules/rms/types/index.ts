export interface RMSValidationRequest {
  orderId: number;
  portfolioId: number;
  ticker: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price?: number;
  type: 'MARKET' | 'LIMIT' | 'STOP' | 'STOP_LIMIT';
}

export interface RMSValidationResult {
  success: boolean;
  approved: boolean;
  reason?: string;
  certificate?: string;
  signature?: string;
}
