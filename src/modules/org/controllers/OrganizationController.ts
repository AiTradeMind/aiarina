import { Response } from "express";
import { AuthenticatedRequest } from "../../../middleware/auth.ts";
import { organizationService } from "../services/OrganizationService.ts";

export class OrganizationController {
  async createOrganization(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || 1;
      const { name, logo, timezone, locale, currency, tradingRegion, branding } = req.body;
      const org = await organizationService.createOrganization(name, userId, {
        logo, timezone, locale, currency, tradingRegion, branding
      });
      res.status(201).json({ success: true, data: org });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async getOrganization(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || 1;
      const { id } = req.params;
      const org = await organizationService.getOrganization(id, userId);
      res.status(200).json({ success: true, data: org });
    } catch (err: any) {
      res.status(403).json({ success: false, error: err.message });
    }
  }

  async listMyOrganizations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || 1;
      const orgs = await organizationService.listMyOrganizations(userId);
      res.status(200).json({ success: true, data: orgs });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async updateOrganization(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || 1;
      const { id } = req.params;
      const org = await organizationService.updateOrganization(id, userId, req.body);
      res.status(200).json({ success: true, data: org });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async archiveOrganization(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || 1;
      const { id } = req.params;
      const org = await organizationService.archiveOrganization(id, userId);
      res.status(200).json({ success: true, data: org });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async restoreOrganization(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || 1;
      const { id } = req.params;
      const org = await organizationService.restoreOrganization(id, userId);
      res.status(200).json({ success: true, data: org });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async getSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || 1;
      const { id } = req.params;
      const settings = await organizationService.getSettings(id, userId);
      res.status(200).json({ success: true, data: settings });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async updateSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || 1;
      const { id } = req.params;
      const settings = await organizationService.updateSettings(id, userId, req.body);
      res.status(200).json({ success: true, data: settings });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  // --- Member Management ---
  async listMembers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || 1;
      const { id } = req.params;
      const members = await organizationService.listMembers(id, userId);
      res.status(200).json({ success: true, data: members });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async inviteMember(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || 1;
      const { id } = req.params;
      const { targetUserId, role } = req.body;
      const member = await organizationService.inviteMember(id, userId, parseInt(targetUserId, 10), role);
      res.status(201).json({ success: true, data: member });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async removeMember(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || 1;
      const { id, memberId } = req.params;
      const success = await organizationService.removeMember(id, userId, parseInt(memberId, 10));
      res.status(200).json({ success });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async suspendMember(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || 1;
      const { id, memberId } = req.params;
      const member = await organizationService.suspendMember(id, userId, parseInt(memberId, 10));
      res.status(200).json({ success: true, data: member });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async restoreMember(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || 1;
      const { id, memberId } = req.params;
      const member = await organizationService.restoreMember(id, userId, parseInt(memberId, 10));
      res.status(200).json({ success: true, data: member });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async transferOwnership(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || 1;
      const { id } = req.params;
      const { targetUserId } = req.body;
      const success = await organizationService.transferOwnership(id, userId, parseInt(targetUserId, 10));
      res.status(200).json({ success });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async getObservabilityStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || 1;
      const { id } = req.query;
      const stats = await organizationService.getObservabilityStats(userId, id as string);
      res.status(200).json({ success: true, data: stats });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
}
export const organizationController = new OrganizationController();
