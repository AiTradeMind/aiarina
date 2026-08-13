export * from './ep19.types';

export type Permission = "read" | "write" | "execute" | "admin";

export type RoleType = "admin" | "trader" | "analyst";

export interface Role {
  name: RoleType;
  description: string;
  permissions: Permission[];
}

export interface Organization {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface Membership {
  userId: number;
  organizationId: string;
  role: RoleType;
  permissions: Permission[];
  joinedAt: string;
}

export interface UserSession {
  accessToken: string;
  refreshToken: string;
  userId: number;
  email: string;
  role: RoleType;
  expiresIn: number; // in seconds
}

export interface JWTPayload {
  userId?: number;
  email: string;
  role: RoleType;
  organizationId?: string;
  development?: boolean;
  databaseAvailable?: boolean;
  membershipResolved?: boolean;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface CreateUserRequest {
  email: string;
  password?: string;
  role: RoleType;
  organizationId?: string;
  settings?: Record<string, any>;
}

export interface CreateOrganizationRequest {
  name: string;
  description: string;
}

