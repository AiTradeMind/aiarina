export interface IEvent {
  id: number;
  eventId: string;
  type: string;
  category: 'RESEARCH' | 'AI_MODELS' | 'CONSENSUS' | 'LEARNING' | 'GOVERNANCE' | 'ORGANIZATIONS' | 'WORKSPACES' | 'RBAC' | 'COLLAB' | 'AUDIT';
  actorId: number | null;
  workspaceId: string | null;
  organizationId: string | null;
  data: Record<string, any>;
  createdAt: Date;
}

export interface IEventSubscription {
  id: number;
  userId: number;
  roleId: string | null;
  workspaceId: string | null;
  organizationId: string | null;
  category: string | null;
  minPriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isMuted: boolean;
  createdAt: Date;
}

export interface IEnterpriseNotification {
  id: number;
  eventId: number | null;
  userId: number;
  title: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isRead: boolean;
  isArchived: boolean;
  expiresAt: Date | null;
  createdAt: Date;
}

export interface INotificationPreference {
  userId: number;
  emailEnabled: boolean;
  inAppEnabled: boolean;
  digestFrequency: 'IMMEDIATE' | 'DAILY' | 'WEEKLY';
  muteCategories: string[];
  updatedAt: Date;
}

export interface INotificationDelivery {
  id: number;
  notificationId: number;
  status: 'PENDING' | 'SENT' | 'FAILED' | 'RETRY';
  retryCount: number;
  errorDetails: string | null;
  deliveredAt: Date | null;
  createdAt: Date;
}

export interface INotificationMetrics {
  id: number;
  date: Date;
  publishedEvents: number;
  deliveredNotifications: number;
  failedDeliveries: number;
  avgLatencyMs: number;
  createdAt: Date;
}

export interface PublishEventPayload {
  eventId?: string; // If not provided, should be auto-generated
  type: string;
  category: IEvent['category'];
  actorId?: number;
  workspaceId?: string;
  organizationId?: string;
  data?: Record<string, any>;
}

export interface UpdatePreferencesPayload {
  emailEnabled?: boolean;
  inAppEnabled?: boolean;
  digestFrequency?: 'IMMEDIATE' | 'DAILY' | 'WEEKLY';
  muteCategories?: string[];
}
