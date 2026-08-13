import { Request, Response } from "express";
import { performanceService } from "../services/PerformanceService.ts";
import { performanceValidator } from "../validators/PerformanceValidator.ts";
import { AuthenticatedRequest } from "../../../middleware/auth.ts";

export class PerformanceController {
  public async getPerformance(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const organizationId = req.user?.organizationId || "org_dev_123";
      const { entityType, entityId } = req.query;
      
      performanceValidator.validateQuery(organizationId, entityType as string);
      
      const data = await performanceService.getMetrics(
        organizationId, 
        (entityType as string) || 'ORGANIZATION', 
        entityId as string
      );
      
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  public async getHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const organizationId = req.user?.organizationId || "org_dev_123";
      const { entityType, entityId } = req.query;
      
      if (!entityType || !entityId) {
         throw new Error("Entity Type and Entity ID are required for history.");
      }
      
      performanceValidator.validateQuery(organizationId, entityType as string);
      const data = await performanceService.getHistory(organizationId, entityType as string, entityId as string);
      
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}

export const performanceController = new PerformanceController();
