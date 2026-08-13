import { Response } from "express";
import { AuthenticatedRequest } from "../../../middleware/auth.ts";
import { workspaceService } from "../services/WorkspaceService.ts";

export class WorkspaceController {
  async createWorkspace(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || 1;
      const { organizationId, name, visibility, preferences, metadata } = req.body;
      const workspace = await workspaceService.createWorkspace(organizationId, userId, name, {
        visibility, preferences, metadata
      });
      res.status(201).json({ success: true, data: workspace });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async getWorkspace(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || 1;
      const { id } = req.params;
      const workspace = await workspaceService.getWorkspace(id, userId);
      res.status(200).json({ success: true, data: workspace });
    } catch (err: any) {
      res.status(403).json({ success: false, error: err.message });
    }
  }

  async listWorkspaces(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || 1;
      const { orgId } = req.query;
      if (!orgId || typeof orgId !== "string") {
        res.status(400).json({ success: false, error: "orgId query parameter is required" });
        return;
      }
      const workspaces = await workspaceService.listWorkspaces(orgId, userId);
      res.status(200).json({ success: true, data: workspaces });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async updateWorkspace(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || 1;
      const { id } = req.params;
      const workspace = await workspaceService.updateWorkspace(id, userId, req.body);
      res.status(200).json({ success: true, data: workspace });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async archiveWorkspace(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || 1;
      const { id } = req.params;
      const workspace = await workspaceService.archiveWorkspace(id, userId);
      res.status(200).json({ success: true, data: workspace });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async restoreWorkspace(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || 1;
      const { id } = req.params;
      const workspace = await workspaceService.restoreWorkspace(id, userId);
      res.status(200).json({ success: true, data: workspace });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async transferOwnership(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || 1;
      const { id } = req.params;
      const { newOwnerId } = req.body;
      const workspace = await workspaceService.transferOwnership(id, userId, parseInt(newOwnerId, 10));
      res.status(200).json({ success: true, data: workspace });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
}
export const workspaceController = new WorkspaceController();
