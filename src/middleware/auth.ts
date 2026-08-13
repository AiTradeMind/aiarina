import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserRepository, RoleRepository, MembershipRepository } from "../modules/identity/repositories/index.ts";
import { RoleType, Permission, JWTPayload } from "../modules/identity/types/index.ts";
import { config, isDevAuth } from "../infrastructure/config/env.ts";
import logger from "../lib/logger.ts";
import { SecuritySettingsService } from "../modules/security/services/SecuritySettingsService.ts";

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
  isInternalWorker?: boolean;
}

// Authentication Middleware: verifies bearer JWT token or Internal Worker token
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  // 1. Enforce IP Whitelist if active
  const clientIp = (req.headers["x-forwarded-for"] as string) || req.ip || req.socket.remoteAddress || "127.0.0.1";
  if (!SecuritySettingsService.isIpAllowed(clientIp)) {
    logger.warn({ type: "SECURITY_VIOLATION", clientIp }, "Access denied: Client IP not permitted by Whitelist Enforcer");
    res.status(403).json({ error: "Access denied: IP address not permitted by Security Whitelist" });
    return;
  }

  // 2. Enforce Session Inactivity Timeout if session token or header is present
  const sessionId = (req.headers["x-session-id"] as string) || (req.query?.sessionId as string);
  if (sessionId) {
    const sessionCheck = SecuritySettingsService.validateAndTouchSession(sessionId);
    if (!sessionCheck.valid) {
      logger.warn({ type: "SESSION_EXPIRED", sessionId, reason: sessionCheck.reason }, "Access denied: Session expired or invalidated");
      res.status(401).json({ error: "Session expired or invalidated due to inactivity timeout" });
      return;
    }
  }

  // Check for internal worker token
  const internalToken = req.headers["x-internal-worker-token"];
  if (internalToken && internalToken === (process.env.INTERNAL_WORKER_SECRET || 'dev-internal-secret')) {
    req.isInternalWorker = true;
    req.user = { 
       userId: 0, 
       email: "worker@aiarena.internal", 
       role: "admin", 
       organizationId: "system",
       permissions: ["admin"]
    } as any;
    return next();
  }

  if (isDevAuth()) {
    req.user = { 
       userId: 1, 
       email: "developer@aiarena.local", 
       role: "admin", 
       organizationId: "org_dev_123",
      permissions: ["admin"]
    } as any;
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    logger.warn({ type: "AUTH_FAILURE", reason: "MISSING_TOKEN" }, "Authentication attempt without token");
    res.status(401).json({ error: "Access token required" });
    return;
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    logger.warn({ type: "AUTH_FAILURE", reason: "MALFORMED_HEADER" }, "Authentication attempt with malformed header");
    res.status(401).json({ error: "Malformed authorization header format" });
    return;
  }

  const token = parts[1];
  try {
    const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET) as JWTPayload;
    req.user = decoded;
    next();
  } catch (err: any) {
    logger.warn({ type: "AUTH_FAILURE", reason: "INVALID_TOKEN", error: err.message }, "Authentication attempt with invalid/expired token");
    res.status(403).json({ error: "Invalid or expired access token" });
  }
}

// Authorization Middleware: checks role requirements (Dynamic Resolution)
export function requireRole(allowedRoles: RoleType[]) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (req.isInternalWorker) return next();
    
    if (!req.user) {
      res.status(401).json({ error: "User authentication required" });
      return;
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      logger.warn({ 
         type: "AUTHZ_FAILURE", 
         userId: req.user.userId, 
         role: req.user.role, 
         requiredRoles: allowedRoles 
       }, "Access denied: insufficient role privileges");
      res.status(403).json({ error: "Access denied: insufficient role privileges" });
      return;
    }
    
    next();
  };
}

// Permission Guard Middleware: checks permission resolution (Database Backed)
export function requirePermission(requiredPermission: Permission) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (req.isInternalWorker) return next();

    if (!req.user) {
      res.status(401).json({ error: "User authentication required" });
      return;
    }

    try {
      const roleRepo = new RoleRepository();
      const roleDef = await roleRepo.findByName(req.user.role);
      
      if (!roleDef) {
        res.status(403).json({ error: "Access denied: role signature unrecognized in database" });
        return;
      }

      const hasPermission = roleDef.permissions.includes(requiredPermission) || roleDef.permissions.includes("admin");
      
      if (!hasPermission) {
        res.status(403).json({ error: `Access denied: missing required permission [${requiredPermission}]` });
        return;
      }
      
      next();
    } catch (error: any) {
      res.status(500).json({ error: "Permission resolution failed" });
    }
  };
}

// Organization Context Guard: ensures user is member of specified organization
export function requireOrganizationMembership() {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (req.isInternalWorker) return next();

    if (!req.user) {
      res.status(401).json({ error: "User authentication required" });
      return;
    }

    const orgId = req.headers["x-organization-id"] || req.params.orgId || req.body.organizationId;
    if (!orgId) {
      next(); // If no org specified, proceed (might be a global action)
      return;
    }

    try {
      const membershipRepo = new MembershipRepository();
      const memberships = await membershipRepo.getMembershipsForUser(req.user.userId);
      const isMember = memberships.some(m => m.organizationId === orgId);
      
      if (!isMember) {
        res.status(403).json({ error: "Access denied: user is not a member of this organization" });
        return;
      }
      next();
    } catch (error: any) {
      res.status(500).json({ error: "Organization validation failed" });
    }
  };
}
