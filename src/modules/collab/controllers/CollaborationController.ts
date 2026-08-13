import { Response } from "express";
import { AuthenticatedRequest } from "../../../middleware/auth.ts";
import { collaborationEngine } from "../services/CollaborationEngine.ts";

export class CollaborationController {
  // POST /api/collab/comments
  public async createComment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || 1;
      const { content, resourceId, resourceType, parentId, organizationId, workspaceId } = req.body;
      const orgId = organizationId || (req.headers["x-organization-id"] as string) || req.user?.organizationId || "org_dev_123";
      const wksId = workspaceId || (req.headers["x-workspace-id"] as string) || "wks_dev_123";

      const comment = await collaborationEngine.postComment(
        userId,
        content,
        resourceId,
        resourceType,
        parentId,
        orgId,
        wksId
      );

      res.status(201).json({ success: true, data: comment });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // GET /api/collab/comments/:resourceId
  public async getComments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || 1;
      const { resourceId } = req.params;
      const orgId = (req.query.organizationId as string) || (req.headers["x-organization-id"] as string) || req.user?.organizationId || "org_dev_123";
      const wksId = (req.query.workspaceId as string) || (req.headers["x-workspace-id"] as string) || "wks_dev_123";

      const comments = await collaborationEngine.getComments(userId, resourceId, orgId, wksId);
      res.status(200).json({ success: true, data: comments });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // POST /api/collab/comments/:id/resolve
  public async resolveComment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || 1;
      const commentId = parseInt(req.params.id, 10);
      const orgId = (req.headers["x-organization-id"] as string) || req.user?.organizationId || "org_dev_123";
      const wksId = (req.headers["x-workspace-id"] as string) || "wks_dev_123";

      const comment = await collaborationEngine.resolveComment(commentId, userId, orgId, wksId);
      res.status(200).json({ success: true, data: comment });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // POST /api/collab/comments/:id/pin
  public async pinComment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || 1;
      const commentId = parseInt(req.params.id, 10);
      const orgId = (req.headers["x-organization-id"] as string) || req.user?.organizationId || "org_dev_123";
      const wksId = (req.headers["x-workspace-id"] as string) || "wks_dev_123";

      const comment = await collaborationEngine.togglePinComment(commentId, userId, orgId, wksId);
      res.status(200).json({ success: true, data: comment });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // POST /api/collab/tasks
  public async createTask(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || 1;
      const { 
        title, 
        description, 
        assigneeId, 
        dueDate, 
        priority, 
        status, 
        labels, 
        organizationId, 
        workspaceId, 
        resourceId 
      } = req.body;

      const orgId = organizationId || (req.headers["x-organization-id"] as string) || req.user?.organizationId || "org_dev_123";
      const wksId = workspaceId || (req.headers["x-workspace-id"] as string) || "wks_dev_123";

      const parsedDueDate = dueDate ? new Date(dueDate) : undefined;

      const task = await collaborationEngine.createTask(
        userId,
        title,
        description,
        assigneeId,
        parsedDueDate,
        priority,
        status,
        labels,
        orgId,
        wksId,
        resourceId
      );

      res.status(201).json({ success: true, data: task });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // PATCH /api/collab/tasks/:id
  public async updateTask(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || 1;
      const taskId = parseInt(req.params.id, 10);
      const updates = req.body;
      const orgId = (req.headers["x-organization-id"] as string) || req.user?.organizationId || "org_dev_123";
      const wksId = (req.headers["x-workspace-id"] as string) || "wks_dev_123";

      if (updates.dueDate) {
        updates.dueDate = new Date(updates.dueDate);
      }

      const task = await collaborationEngine.updateTask(taskId, userId, updates, orgId, wksId);
      res.status(200).json({ success: true, data: task });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // GET /api/collab/tasks
  public async listTasks(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || 1;
      const orgId = (req.query.organizationId as string) || (req.headers["x-organization-id"] as string) || req.user?.organizationId || "org_dev_123";
      const wksId = (req.query.workspaceId as string) || (req.headers["x-workspace-id"] as string) || "wks_dev_123";

      const tasks = await collaborationEngine.listTasks(userId, {
        organizationId: orgId,
        workspaceId: wksId,
      });

      res.status(200).json({ success: true, data: tasks });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // POST /api/collab/share
  public async shareResource(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || 1;
      const { resourceId, resourceType, shareType, organizationId, workspaceId, expiresAt } = req.body;

      const orgId = organizationId || (req.headers["x-organization-id"] as string) || req.user?.organizationId || "org_dev_123";
      const wksId = workspaceId || (req.headers["x-workspace-id"] as string) || "wks_dev_123";
      const parsedExpiresAt = expiresAt ? new Date(expiresAt) : null;

      const share = await collaborationEngine.shareResource(
        userId,
        resourceId,
        resourceType,
        shareType,
        orgId,
        wksId,
        parsedExpiresAt
      );

      res.status(201).json({ success: true, data: share });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // GET /api/collab/activity
  public async getActivityFeed(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || 1;
      const orgId = (req.query.organizationId as string) || (req.headers["x-organization-id"] as string) || req.user?.organizationId || "org_dev_123";
      const wksId = (req.query.workspaceId as string) || (req.headers["x-workspace-id"] as string) || "wks_dev_123";
      const type = req.query.type as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

      const activities = await collaborationEngine.getActivityFeed(userId, {
        organizationId: orgId,
        workspaceId: wksId,
        type,
        limit,
      });

      res.status(200).json({ success: true, data: activities });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // GET /api/collab/presence
  public async getPresence(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || 1;
      const orgId = (req.query.organizationId as string) || (req.headers["x-organization-id"] as string) || req.user?.organizationId || "org_dev_123";
      const wksId = (req.query.workspaceId as string) || (req.headers["x-workspace-id"] as string) || "wks_dev_123";

      const presenceList = await collaborationEngine.getPresence(userId, orgId, wksId);
      res.status(200).json({ success: true, data: presenceList });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // POST /api/collab/presence/heartbeat
  public async updatePresence(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || 1;
      const { status, activeWorkspaceId, isTyping, typingResourceId } = req.body;

      const presence = await collaborationEngine.setPresence(
        userId,
        status,
        activeWorkspaceId,
        isTyping,
        typingResourceId
      );

      res.status(200).json({ success: true, data: presence });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
export const collaborationController = new CollaborationController();
