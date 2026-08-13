export interface StudioSnapshot {
  id: string;
  type: string;
  data: Record<string, any>;
  createdAt: Date;
}

export interface Alert {
  id: string;
  level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  createdAt: Date;
}
