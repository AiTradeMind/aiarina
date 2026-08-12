import { Request, Response } from "express";
import { auditService } from "../services/AuditService";
import { AuthenticatedRequest } from "../../../middleware/auth";

export class AuditController {
  async getStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    const result = await auditService.getStatus();
    res.json({ status: "success", data: result });
  }

  async logEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
    const result = await auditService.logEvent(req.body);
    res.json({ status: "success", data: result });
  }

  async verifyEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.body;
    const result = await auditService.verifyEvent(id);
    res.json({ status: "success", data: result });
  }
}

export const auditController = new AuditController();
