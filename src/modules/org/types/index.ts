export interface Organization {
  id: string;
  name: string;
  logo: string | null;
  timezone: string;
  locale: string;
  currency: string;
  tradingRegion: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
  branding: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Workspace {
  id: string;
  organizationId: string;
  name: string;
  ownerId: number;
  visibility: 'PRIVATE' | 'PUBLIC' | 'INTERNAL';
  status: 'ACTIVE' | 'DELETED' | 'ARCHIVED';
  preferences: Record<string, any>;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrgMember {
  id: number;
  organizationId: string;
  userId: number;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  joinedAt: Date;
  lastActivity: Date;
  userEmail?: string;
}

export interface OrgSettings {
  organizationId: string;
  aiPreferences: Record<string, any>;
  securitySettings: Record<string, any>;
  workspaceDefaults: Record<string, any>;
  updatedAt: Date;
}

export interface OrgActivity {
  id: number;
  organizationId: string;
  workspaceId: string | null;
  userId: number;
  action: string;
  details: string | null;
  createdAt: Date;
}

export interface OrgMetadata {
  id: number;
  entityType: 'ORGANIZATION' | 'WORKSPACE';
  entityId: string;
  metaKey: string;
  metaValue: string | null;
}

export interface OrganizationStats {
  organizationCount: number;
  workspaceCount: number;
  memberCount: number;
  storageUsageBytes: number;
  activeWorkspacesCount: number;
  healthScore: number;
  recentActivity: OrgActivity[];
}
