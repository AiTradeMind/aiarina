export interface RBACRole {
  id: string; // e.g. 'PLATFORM_ADMIN', 'ORG_OWNER', or custom roles
  name: string;
  description: string | null;
  isCustom: boolean;
  parentRoleId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RBACPermission {
  id: string; // e.g. 'workspace.read', 'workspace.update'
  name: string;
  description: string | null;
  createdAt: Date;
}

export interface RBACRolePermission {
  id: number;
  roleId: string;
  permissionId: string;
  createdAt: Date;
}

export interface RBACUserRole {
  id: number;
  userId: number;
  roleId: string;
  organizationId: string | null;
  workspaceId: string | null;
  createdAt: Date;
}

export interface RBACPolicy {
  id: string;
  name: string;
  effect: 'ALLOW' | 'DENY';
  actions: string[]; // wildcard: ["*"] or list ["workspace.read"]
  resources: string[]; // wildcard: ["*"] or list ["wks-123"]
  conditions: Record<string, any>; // times, IP, user attributes, ownership
  organizationId: string | null;
  workspaceId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RBACPermissionLog {
  id: number;
  userId: number;
  action: string;
  resource: string;
  organizationId: string | null;
  workspaceId: string | null;
  decision: 'GRANTED' | 'DENIED';
  reason: string | null;
  latencyMs: number;
  createdAt: Date;
}

export interface RBACCacheEntry {
  userId: number;
  permissions: string[];
  expiresAt: Date;
}

export interface AuthorizationContext {
  userId: number;
  userRole?: string; // from main profile or token
  organizationId?: string | null;
  workspaceId?: string | null;
  resourceId?: string | null;
  resourceOwnerId?: number | null;
  clientIp?: string;
  currentTime?: Date;
}

export interface AccessDecision {
  granted: boolean;
  reason: string;
  latencyMs: number;
}
