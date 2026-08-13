export interface MonitoringMetric {
  id: string;
  name: string;
  value: number;
  createdAt: Date;
}

export interface ServiceHealth {
  id: string;
  serviceName: string;
  status: 'HEALTHY' | 'WARNING' | 'DEGRADED' | 'CRITICAL' | 'OFFLINE';
  createdAt: Date;
}
