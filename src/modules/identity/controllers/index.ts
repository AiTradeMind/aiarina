import { Request, Response, NextFunction } from "express";
import { AuthService, UserService, OrganizationService, RoleService } from "../services/index.ts";
import { RoleType } from "../types/index.ts";
import { EventBusService } from "../../events/services/index.ts";
import { UserRepository, MembershipRepository } from "../repositories/index.ts";
import { isDevAuth } from "../../../infrastructure/config/env.ts";
import { auditService } from "../../events/services/audit.service.ts";
import { PerformanceTracker } from "../../../lib/performance.ts";

const authService = new AuthService();
const userService = new UserService();
const orgService = new OrganizationService();
const roleService = new RoleService();
const eventBus = EventBusService.getInstance();

// Helper to extract the session token from headers
function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;
  return parts[1];
}

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    const tracker = new PerformanceTracker("AUTH_LOGIN");
    try {
      const { email, password } = req.body;
      if (!email || typeof email !== "string") {
        res.status(400).json({ error: "Email is required and must be a string" });
        return;
      }

      const session = await authService.login(email, password);

      // Publish Login Event
      await eventBus.publish({
        eventType: 'AUTH_LOGIN',
        source: 'IDENTITY',
        userId: session.userId,
        payload: { email },
        audit: {
          action: 'LOGIN',
          status: 'SUCCESS',
          details: `User ${email} logged in`,
        }
      });

      res.status(200).json({
        message: "Login successful",
        session,
      });
    } catch (error: any) {
      // Audit failure
      await auditService.logAuditEvent({
        action: 'LOGIN',
        status: 'FAILURE',
        details: `Login failed for ${req.body.email}: ${error.message}`,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"]
      });
      res.status(401).json({ error: error.message || "Authentication failed" });
    } finally {
      tracker.finish();
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = extractToken(req);
      if (!token) {
        res.status(400).json({ error: "Authorization token is required" });
        return;
      }

      const verified = await authService.verifySession(token);
      const success = await authService.logout(token);

      // Publish Logout Event
      await eventBus.publish({
        eventType: 'AUTH_LOGOUT',
        source: 'IDENTITY',
        userId: verified.session.userId,
        audit: {
          action: 'LOGOUT',
          status: 'SUCCESS',
          details: `User ${verified.session.userId} logged out`,
        }
      });

      res.status(200).json({ success, message: "Logged out successfully" });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Logout failed" });
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken || typeof refreshToken !== "string") {
        res.status(400).json({ error: "Valid refreshToken string is required in the body" });
        return;
      }

      const session = await authService.refresh(refreshToken);
      res.status(200).json({
        message: "Token refreshed successfully",
        session,
      });
    } catch (error: any) {
      res.status(401).json({ error: error.message || "Invalid or expired refresh token" });
    }
  }

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (isDevAuth()) {
        const userRepo = new UserRepository();
        const membershipRepo = new MembershipRepository();
        
        let dbUser = null;
        let dbError = false;
        try {
          dbUser = await userRepo.findByEmail("admin@aiarina.com");
          if (!dbUser) {
            const all = await userRepo.findAll();
            if (all.length > 0) {
              dbUser = all[0];
            }
          }
          
          if (!dbUser) {
            dbUser = await userRepo.create("developer@aiarina.local", "admin");
            await membershipRepo.addMembership(dbUser.id, "org-1", "admin");
          }
        } catch (e) {
          dbError = true;
        }

        if (dbError || !dbUser) {
          res.status(200).json({
            development: true,
            databaseAvailable: false,
            membershipResolved: false,
            session: null,
            user: null,
            memberships: [],
            authenticated: true,
            role: "admin",
            organization: "Development Mode (Database Offline)",
            permissions: "Full Development Access"
          });
          return;
        }
        
        let userMemberships: any[] = [];
        let membershipResolved = false;
        try {
          userMemberships = await membershipRepo.getMembershipsForUser(dbUser.id);
          if (userMemberships.length > 0) {
            membershipResolved = true;
          }
        } catch (e) {
          // ignore
        }
        
        res.status(200).json({
          development: true,
          databaseAvailable: true,
          membershipResolved,
          session: {
            userId: dbUser.id,
            email: dbUser.email,
            role: dbUser.role
          },
          user: {
            id: dbUser.id,
            email: dbUser.email,
            role: dbUser.role,
            settings: dbUser.settings || {}
          },
          memberships: userMemberships,
          authenticated: true,
          role: dbUser.role === "admin" ? "Administrator" : dbUser.role,
          organization: userMemberships[0]?.organizationId || "Default Development Organization",
          permissions: "Full Development Access"
        });
        return;
      }

      const token = extractToken(req);
      if (!token) {
        res.status(401).json({ error: "Authorization token is missing or invalid" });
        return;
      }

      const verified = await authService.verifySession(token);
      res.status(200).json(verified);
    } catch (error: any) {
      res.status(401).json({ error: error.message || "Unauthorized" });
    }
  }
}

export class UserController {
  async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await userService.getAllUsers();
      res.status(200).json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch users" });
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid user ID" });
        return;
      }

      const user = await userService.getUserById(id);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.status(200).json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch user" });
    }
  }

  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    const tracker = new PerformanceTracker("CREATE_USER");
    try {
      const { email, role, organizationId, settings, password } = req.body;
      if (!email || typeof email !== "string") {
        res.status(400).json({ error: "Valid email is required" });
        return;
      }
      if (!role || !["admin", "trader", "analyst"].includes(role)) {
        res.status(400).json({ error: "Role must be 'admin', 'trader', or 'analyst'" });
        return;
      }
      if (!password || typeof password !== "string" || password.length < 8) {
        res.status(400).json({ error: "Password must be at least 8 characters long" });
        return;
      }

      const newUser = await userService.createUser(email, role as RoleType, organizationId, settings, password);

      // Audit User Creation
      await auditService.logAuditEvent({
        organizationId: organizationId,
        action: "USER_CREATED",
        status: "SUCCESS",
        details: `User ${email} created with role ${role}`,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"]
      });

      res.status(210).json({
        message: "User created successfully",
        user: newUser,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create user" });
    } finally {
      tracker.finish();
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    const tracker = new PerformanceTracker("UPDATE_USER");
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid user ID" });
        return;
      }

      const { email, role, settings, password } = req.body;
      if (role && !["admin", "trader", "analyst"].includes(role)) {
        res.status(400).json({ error: "Role must be 'admin', 'trader', or 'analyst'" });
        return;
      }

      const updatedUser = await userService.updateUser(id, email, role as RoleType, settings, password);

      // Audit User Update
      await auditService.logAuditEvent({
        userId: id,
        action: "USER_UPDATED",
        status: "SUCCESS",
        details: `User ${id} updated: ${email || 'no email change'}, role: ${role || 'no role change'}`,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"]
      });

      res.status(200).json({
        message: "User updated successfully",
        user: updatedUser,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update user" });
    } finally {
      tracker.finish();
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    const tracker = new PerformanceTracker("DELETE_USER");
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid user ID" });
        return;
      }

      const deletedUser = await userService.deleteUser(id);

      // Audit User Deletion
      await auditService.logAuditEvent({
        userId: id,
        action: "USER_DELETED",
        status: "SUCCESS",
        details: `User ${id} (${deletedUser.email}) deleted`,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"]
      });

      res.status(200).json({
        message: "User deleted successfully",
        user: deletedUser,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to delete user" });
    } finally {
      tracker.finish();
    }
  }
}

export class OrganizationController {
  async getAllOrganizations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const organizations = await orgService.getAllOrganizations();
      res.status(200).json(organizations);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch organizations" });
    }
  }

  async getOrganizationById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const organization = await orgService.getOrganizationById(id);
      res.status(200).json(organization);
    } catch (error: any) {
      res.status(404).json({ error: error.message || "Organization not found" });
    }
  }

  async createOrganization(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, description } = req.body;
      if (!name || typeof name !== "string") {
        res.status(400).json({ error: "Organization name is required and must be a string" });
        return;
      }

      const newOrg = await orgService.createOrganization(name, description || "");
      res.status(210).json({
        message: "Organization created successfully",
        organization: newOrg,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create organization" });
    }
  }
}

export class RoleController {
  async getAllRoles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const roles = await roleService.getAllRoles();
      res.status(200).json(roles);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch roles" });
    }
  }

  async getRoleByName(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name } = req.params;
      const role = await roleService.getRoleByName(name as RoleType);
      res.status(200).json(role);
    } catch (error: any) {
      res.status(404).json({ error: error.message || "Role not found" });
    }
  }
}

