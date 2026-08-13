export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED' | 'MFA_PENDING';

export type RoleType = 
  | 'SUPER_ADMIN' 
  | 'PLATFORM_ADMIN' 
  | 'ORGANIZATION_ADMIN' 
  | 'TREASURY_OFFICER' 
  | 'RISK_OFFICER' 
  | 'COMPLIANCE_OFFICER' 
  | 'TRADER' 
  | 'ANALYST' 
  | 'VIEWER' 
  | 'CUSTOM_ROLE';

export type WorkspaceId = 
  | 'DASHBOARD'
  | 'RESEARCH'
  | 'AI'
  | 'STRATEGY'
  | 'COMMITTEE'
  | 'OMS'
  | 'PORTFOLIO'
  | 'RISK'
  | 'EXECUTION'
  | 'ACCOUNTING'
  | 'TREASURY'
  | 'NOTIFICATIONS'
  | 'ADMINISTRATION';

export type PermissionAction = 
  | 'CREATE' 
  | 'READ' 
  | 'UPDATE' 
  | 'DELETE' 
  | 'APPROVE' 
  | 'EXECUTE' 
  | 'EXPORT' 
  | 'CONFIGURE';

export interface AdminUserItem {
  id: string;
  userId: string;
  name: string;
  email: string;
  organizationId: string;
  organizationName: string;
  teamId: string;
  teamName: string;
  roles: RoleType[];
  status: UserStatus;
  mfaEnabled: boolean;
  lastLoginAt?: string;
  lastLoginIp?: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface OrganizationItem {
  id: string;
  orgId: string;
  name: string;
  code: string;
  businessUnit: string;
  department: string;
  parentOrgId?: string;
  status: 'ACTIVE' | 'SUSPENDED';
  userCount: number;
  teamsCount: number;
  createdAt: string;
}

export interface TeamItem {
  id: string;
  teamId: string;
  organizationId: string;
  orgName: string;
  name: string;
  leadUserId: string;
  memberCount: number;
  description: string;
  createdAt: string;
}

export interface PermissionItem {
  id: string;
  permId: string;
  workspace: WorkspaceId;
  module: string;
  action: PermissionAction;
  code: string;
  description: string;
}

export interface RoleItem {
  id: string;
  roleId: string;
  name: string;
  type: RoleType;
  description: string;
  isSystem: boolean;
  permissions: string[]; // permId list or codes
  userCount: number;
  createdAt: string;
}

export interface SessionItem {
  id: string;
  sessionId: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: RoleType;
  ipAddress: string;
  userAgent: string;
  deviceType: 'DESKTOP' | 'MOBILE' | 'API_CLIENT';
  location: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  loginAt: string;
  expiresAt: string;
  lastActivityAt: string;
}

export interface ApiKeyItem {
  id: string;
  keyId: string;
  name: string;
  keyMasked: string;
  ownerUserId: string;
  ownerEmail: string;
  organizationId: string;
  scopes: string[];
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  lastUsedAt?: string;
  expiresAt: string;
  createdAt: string;
}

export interface SecurityPolicyItem {
  id: string;
  policyId: string;
  name: string;
  category: 'PASSWORD' | 'MFA' | 'IP_RESTRICTION' | 'SESSION' | 'WORKSPACE' | 'SSO';
  isEnabled: boolean;
  configuration: Record<string, any>;
  lastUpdatedBy: string;
  updatedAt: string;
}

export interface AdminAuditItem {
  id: string;
  auditId: string;
  actorUserId: string;
  actorEmail: string;
  action: 'USER_CREATE' | 'ROLE_CHANGE' | 'PERM_CHANGE' | 'LOGIN' | 'LOGOUT' | 'SESSION_FORCE_LOGOUT' | 'API_KEY_ROTATE' | 'POLICY_UPDATE';
  targetResource: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface AdminRuntimeMetric {
  activeWorkers: number;
  sessionMonitorStatus: 'HEALTHY' | 'DEGRADED';
  cachedPermissionsCount: number;
  policyValidatorStatus: 'ACTIVE' | 'PAUSED';
  activeSessionsTotal: number;
  securityIncidents24h: number;
  healthScore: number;
}

export interface AdminQaReport {
  totalModulesTested: number;
  passCount: number;
  failCount: number;
  modules: Array<{
    moduleId: string;
    moduleName: string;
    status: 'PASSED' | 'FAILED';
    details: string;
  }>;
  authorizationOnly: boolean;
  rbacMatrixEnforced: boolean;
  buildStatus: string;
}
