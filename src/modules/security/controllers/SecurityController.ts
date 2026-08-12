import { Request, Response } from "express";
import { securityService } from "../services/SecurityService";
import { AuthenticatedRequest } from "../../../middleware/auth";

export class SecurityController {
  async getStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    const result = await securityService.getStatus();
    res.json({ success: true, data: result });
  }

  async getEvents(req: AuthenticatedRequest, res: Response): Promise<void> {
    const result = await securityService.getEvents();
    res.json({ success: true, data: result });
  }

  async getThreats(req: AuthenticatedRequest, res: Response): Promise<void> {
    const result = await securityService.getThreats();
    res.json({ success: true, data: result });
  }

  async getAlerts(req: AuthenticatedRequest, res: Response): Promise<void> {
    const result = await securityService.getAlerts();
    res.json({ success: true, data: result });
  }

  async getSessions(req: AuthenticatedRequest, res: Response): Promise<void> {
    const result = await securityService.getSessions();
    res.json({ success: true, data: result });
  }

  async getDevices(req: AuthenticatedRequest, res: Response): Promise<void> {
    const result = await securityService.getDevices();
    res.json({ success: true, data: result });
  }

  async getMetrics(req: AuthenticatedRequest, res: Response): Promise<void> {
    const result = await securityService.getMetrics();
    res.json({ success: true, data: result });
  }

  async getPolicies(req: AuthenticatedRequest, res: Response): Promise<void> {
    const result = await securityService.getPolicies();
    res.json({ success: true, data: result });
  }

  async verifyAccess(req: AuthenticatedRequest, res: Response): Promise<void> {
    const result = await securityService.verifyAccess(req.body);
    res.json({ success: true, data: result });
  }
}

export const securityController = new SecurityController();
