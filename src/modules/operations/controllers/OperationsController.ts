import { Request, Response } from "express";
import { operationsService } from "../services/OperationsService";
import { AuthenticatedRequest } from "../../../middleware/auth";

export class OperationsController {
  async getDashboard(req: AuthenticatedRequest, res: Response): Promise<void> {
    const result = await operationsService.getDashboard();
    res.json({ status: "success", data: result });
  }

  async getStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    const result = await operationsService.getStatus();
    res.json({ status: "success", data: result });
  }

  async updateLayout(req: AuthenticatedRequest, res: Response): Promise<void> {
    const result = await operationsService.updateLayout(req.body);
    res.json({ status: "success", data: result });
  }
}

export const operationsController = new OperationsController();
