import { Response } from "express";
import { AuthenticatedRequest } from "../../../middleware/auth.ts";
import { PermissionService } from "../services/PermissionService.ts";
import { AuthorizationEngine } from "../services/AuthorizationEngine.ts";

export class RBACController {
  private permissionService = new PermissionService();
  private authorizationEngine = new AuthorizationEngine();

  public createRole = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id, name, description, parentRoleId } = req.body;
      if (!id || !name) {
        res.status(400).json({ error: "Role id and name are required." });
        return;
      }
      const role = await this.permissionService.createCustomRole(id, name, description, parentRoleId);
      res.status(201).json(role);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  public getRoles = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const roles = await this.permissionService.listRoles();
      res.status(200).json(roles);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  public updateRole = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const role = await this.permissionService.updateRole(id, updates);
      if (!role) {
        res.status(404).json({ error: "Role not found." });
        return;
      }
      res.status(200).json(role);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  public deleteRole = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const success = await this.permissionService.deleteRole(id);
      if (!success) {
        res.status(404).json({ error: "Role not found." });
        return;
      }
      res.status(200).json({ success: true, message: "Role deleted successfully." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  public createPermission = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id, name, description } = req.body;
      if (!id || !name) {
        res.status(400).json({ error: "Permission id and name are required." });
        return;
      }
      const perm = await this.permissionService.createPermission(id, name, description);
      res.status(201).json(perm);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  public getPermissions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const perms = await this.permissionService.listPermissions();
      res.status(200).json(perms);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  public assignRole = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { userId, roleId, organizationId, workspaceId } = req.body;
      if (!userId || !roleId) {
        res.status(400).json({ error: "userId and roleId are required." });
        return;
      }
      const assignment = await this.permissionService.assignRoleToUser(
        Number(userId),
        roleId,
        organizationId || null,
        workspaceId || null
      );
      res.status(200).json(assignment);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  public checkAccess = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { userId, action, resource, context } = req.body;
      if (!userId || !action || !resource) {
        res.status(400).json({ error: "userId, action, and resource are required." });
        return;
      }
      const decision = await this.authorizationEngine.checkPermission(
        Number(userId),
        action,
        resource,
        context || { userId: Number(userId) }
      );
      res.status(200).json(decision);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  public getLogs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const logs = await this.permissionService.getLogs();
      res.status(200).json(logs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  public getStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const stats = await this.permissionService.getObservabilityStats();
      res.status(200).json(stats);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };
}
export const rbacController = new RBACController();
