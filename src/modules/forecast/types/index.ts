export interface ForecastConfig {
  id: string;
  entityId: string;
  entityType: 'AI' | 'STRATEGY' | 'PORTFOLIO' | 'MARKET' | 'RISK';
  params: Record<string, any>;
}

export interface ForecastResult {
  id: string;
  entityId: string;
  prediction: number;
  confidence: number;
  createdAt: Date;
}
