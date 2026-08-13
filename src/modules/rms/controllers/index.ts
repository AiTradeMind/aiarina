import { Response, NextFunction } from "express";
import { RMSService } from "../services/index.ts";
import { AuthenticatedRequest } from "../../../middleware/auth.ts";

const rmsService = new RMSService();

export class RMSController {
  async getDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await rmsService.getDashboard();
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.query.id ? parseInt(req.query.id as string, 10) : undefined;
      const result = await rmsService.getProfile(id);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getExposure(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const profileId = req.query.profileId ? parseInt(req.query.profileId as string, 10) : undefined;
      const result = await rmsService.getExposure(profileId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getMargin(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const profileId = req.query.profileId ? parseInt(req.query.profileId as string, 10) : undefined;
      const result = await rmsService.getMargin(profileId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getLimits(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const profileId = req.query.profileId ? parseInt(req.query.profileId as string, 10) : undefined;
      const result = await rmsService.getLimits(profileId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async validateOrder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await rmsService.validateOrder(req.body);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async killSwitch(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const reason = req.body.reason || "Manual Intervention";
      const result = await rmsService.triggerKillSwitch(reason);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
