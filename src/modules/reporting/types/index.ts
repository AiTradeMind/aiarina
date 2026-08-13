export interface Report {
  id: string;
  type: 'EXECUTIVE' | 'PERFORMANCE' | 'PORTFOLIO' | 'RISK' | 'STRATEGY' | 'MARKET';
  data: Record<string, any>;
  createdAt: Date;
}
