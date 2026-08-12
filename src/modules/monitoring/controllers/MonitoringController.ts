import { Request, Response } from "express";
import { monitoringService } from "../services/MonitoringService";
import { AuthenticatedRequest } from "../../../middleware/auth";

export class MonitoringController {
  async getHealth(req: AuthenticatedRequest, res: Response): Promise<void> {
    const result = await monitoringService.getHealth();
    res.json({ status: "success", data: result });
  }

  async getMetrics(req: AuthenticatedRequest, res: Response): Promise<void> {
    const result = await monitoringService.getMetrics();
    res.json({ status: "success", data: result });
  }
}

export const monitoringController = new MonitoringController();
