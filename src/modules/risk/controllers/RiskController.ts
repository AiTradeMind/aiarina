import { Request, Response } from "express";
import { riskService } from "../services/RiskService.ts";
import { AuthenticatedRequest } from "../../../middleware/auth.ts";

export class RiskController {
  public async getPolicies(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { entityType, entityId } = req.query;
      const data = await riskService.getPolicies(entityType as string, entityId as string);
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  public async getMetrics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { entityType, entityId } = req.query;
      const data = await riskService.getMetrics(entityType as string, entityId as string);
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  public async getSnapshots(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { entityType, entityId } = req.query;
      const data = await riskService.getSnapshots(entityType as string, entityId as string);
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}

export const riskController = new RiskController();
