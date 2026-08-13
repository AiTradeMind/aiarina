export interface Recommendation {
  id: string;
  entityId: string;
  type: 'STRATEGY' | 'PORTFOLIO' | 'RISK' | 'MARKET' | 'AI';
  content: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  createdAt: Date;
}

export interface Insight {
  id: string;
  entityId: string;
  content: string;
  category: 'MARKET' | 'STRATEGY' | 'RISK';
  createdAt: Date;
}
