import { Request, Response } from "express";
import { intelligenceService } from "../services/IntelligenceService";
import { AuthenticatedRequest } from "../../../middleware/auth";

export class IntelligenceController {
  async getIntelligence(req: AuthenticatedRequest, res: Response): Promise<void> {
    const result = await intelligenceService.runIntelligence(req.body);
    res.json({ status: "success", data: result });
  }

  async resetIntelligence(req: Request, res: Response): Promise<void> {
    try {
      const { confirm, resetState } = req.body || {};
      const result = await intelligenceService.resetIntelligenceData({
        confirm: Boolean(confirm),
        resetState: resetState || "OFF"
      });
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || "AI Intelligence reset failed"
      });
    }
  }
}

export const intelligenceController = new IntelligenceController();
