export interface SecurityEvent {
  id: string;
  type: string;
  details: any;
  createdAt: Date;
}

export interface SecuritySession {
  id: string;
  userId: string;
  status: 'ACTIVE' | 'EXPIRED' | 'LOCKED';
  createdAt: Date;
}
