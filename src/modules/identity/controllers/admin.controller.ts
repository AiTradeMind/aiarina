import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';

export class AdminController {
  public getUsers(req: Request, res: Response, next: NextFunction): void {
    try {
      const users = AdminService.getUsers();
      res.json({ success: true, count: users.length, data: users });
    } catch (error) {
      next(error);
    }
  }

  public getOrganizations(req: Request, res: Response, next: NextFunction): void {
    try {
      const orgs = AdminService.getOrganizations();
      res.json({ success: true, count: orgs.length, data: orgs });
    } catch (error) {
      next(error);
    }
  }

  public getTeams(req: Request, res: Response, next: NextFunction): void {
    try {
      const teams = AdminService.getTeams();
      res.json({ success: true, count: teams.length, data: teams });
    } catch (error) {
      next(error);
    }
  }

  public getRoles(req: Request, res: Response, next: NextFunction): void {
    try {
      const roles = AdminService.getRoles();
      res.json({ success: true, count: roles.length, data: roles });
    } catch (error) {
      next(error);
    }
  }

  public getPermissions(req: Request, res: Response, next: NextFunction): void {
    try {
      const perms = AdminService.getPermissions();
      res.json({ success: true, count: perms.length, data: perms });
    } catch (error) {
      next(error);
    }
  }

  public getSessions(req: Request, res: Response, next: NextFunction): void {
    try {
      const sessions = AdminService.getSessions();
      res.json({ success: true, count: sessions.length, data: sessions });
    } catch (error) {
      next(error);
    }
  }

  public getApiKeys(req: Request, res: Response, next: NextFunction): void {
    try {
      const keys = AdminService.getApiKeys();
      res.json({ success: true, count: keys.length, data: keys });
    } catch (error) {
      next(error);
    }
  }

  public getSecurityPolicies(req: Request, res: Response, next: NextFunction): void {
    try {
      const policies = AdminService.getSecurityPolicies();
      res.json({ success: true, count: policies.length, data: policies });
    } catch (error) {
      next(error);
    }
  }

  public getAuditLogs(req: Request, res: Response, next: NextFunction): void {
    try {
      const logs = AdminService.getAuditLogs();
      res.json({ success: true, count: logs.length, data: logs });
    } catch (error) {
      next(error);
    }
  }

  public getRuntimeMetric(req: Request, res: Response, next: NextFunction): void {
    try {
      const runtime = AdminService.getRuntimeMetric();
      res.json({ success: true, data: runtime });
    } catch (error) {
      next(error);
    }
  }

  public getQaReport(req: Request, res: Response, next: NextFunction): void {
    try {
      const qa = AdminService.runEp19QaSuite();
      res.json({ success: true, data: qa });
    } catch (error) {
      next(error);
    }
  }

  public createUser(req: Request, res: Response, next: NextFunction): void {
    try {
      const { name, email, organizationId, teamId, roles } = req.body;
      if (!name || !email || !organizationId) {
        res.status(400).json({ success: false, message: 'name, email, and organizationId are required' });
        return;
      }
      const newUser = AdminService.createUser({
        name,
        email,
        organizationId,
        teamId,
        roles: Array.isArray(roles) ? roles : ['ANALYST']
      });
      res.status(201).json({ success: true, data: newUser });
    } catch (error) {
      next(error);
    }
  }

  public createRole(req: Request, res: Response, next: NextFunction): void {
    try {
      const { name, type, description, permissions } = req.body;
      if (!name || !description) {
        res.status(400).json({ success: false, message: 'name and description are required' });
        return;
      }
      const newRole = AdminService.createRole({
        name,
        type: type || 'CUSTOM_ROLE',
        description,
        permissions: Array.isArray(permissions) ? permissions : []
      });
      res.status(201).json({ success: true, data: newRole });
    } catch (error) {
      next(error);
    }
  }

  public createApiKey(req: Request, res: Response, next: NextFunction): void {
    try {
      const { name, ownerUserId, scopes, expiresDays } = req.body;
      if (!name || !ownerUserId) {
        res.status(400).json({ success: false, message: 'name and ownerUserId are required' });
        return;
      }
      const newKey = AdminService.createApiKey({
        name,
        ownerUserId,
        scopes: Array.isArray(scopes) ? scopes : ['read:all'],
        expiresDays: Number(expiresDays) || 180
      });
      res.status(201).json({ success: true, data: newKey });
    } catch (error) {
      next(error);
    }
  }

  public revokeSession(req: Request, res: Response, next: NextFunction): void {
    try {
      const { sessionId } = req.body;
      if (!sessionId) {
        res.status(400).json({ success: false, message: 'sessionId is required' });
        return;
      }
      const result = AdminService.revokeSession(sessionId);
      res.json({ success: result.success });
    } catch (error) {
      next(error);
    }
  }

  public toggleSecurityPolicy(req: Request, res: Response, next: NextFunction): void {
    try {
      const { policyId } = req.body;
      if (!policyId) {
        res.status(400).json({ success: false, message: 'policyId is required' });
        return;
      }
      const result = AdminService.toggleSecurityPolicy(policyId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  public checkWorkspaceAccess(req: Request, res: Response, next: NextFunction): void {
    try {
      const { email, workspace } = req.body;
      if (!email || !workspace) {
        res.status(400).json({ success: false, message: 'email and workspace are required' });
        return;
      }
      const check = AdminService.checkWorkspaceAccess(email, workspace);
      res.json({ success: true, data: check });
    } catch (error) {
      next(error);
    }
  }
}
