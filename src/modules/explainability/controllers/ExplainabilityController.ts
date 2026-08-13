import { Request, Response } from "express";
import { explainabilityService } from "../services/ExplainabilityService";
import { AuthenticatedRequest } from "../../../middleware/auth";

export class ExplainabilityController {
  async getExplanation(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { decisionId } = req.query;
    const result = await explainabilityService.getExplanation(decisionId as string || 'default');
    res.json({ status: "success", data: result });
  }
}

export const explainabilityController = new ExplainabilityController();
