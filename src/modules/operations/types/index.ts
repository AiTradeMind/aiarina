export interface OperationsDashboard {
  id: string;
  status: 'HEALTHY' | 'WARNING' | 'DEGRADED' | 'CRITICAL' | 'MAINTENANCE' | 'OFFLINE';
  timestamp: Date;
}
