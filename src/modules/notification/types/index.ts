export interface Notification {
  id: string;
  userId: string;
  message: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  status: 'PENDING' | 'QUEUED' | 'SENDING' | 'DELIVERED' | 'FAILED' | 'RETRYING' | 'CANCELLED';
  createdAt: Date;
}
