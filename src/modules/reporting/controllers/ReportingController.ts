import { Request, Response } from "express";
import { reportingService } from "../services/ReportingService";
import { AuthenticatedRequest } from "../../../middleware/auth";

export class ReportingController {
  async getReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    const type = req.path.split('/').pop() || 'summary';
    const result = await reportingService.getReport(type);
    res.json({ status: "success", data: result });
  }
}

export const reportingController = new ReportingController();
