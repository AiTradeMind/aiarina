import { Request, Response } from "express";
import { recommendationService } from "../services/RecommendationService";
import { AuthenticatedRequest } from "../../../middleware/auth";

export class RecommendationController {
  async getRecommendations(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { entityId, type } = req.query;
    const result = await recommendationService.getRecommendations(entityId as string || 'default', type);
    res.json({ status: "success", data: result });
  }

  async getInsights(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { entityId } = req.query;
    const result = await recommendationService.getInsights(entityId as string || 'default');
    res.json({ status: "success", data: result });
  }
}
export const recommendationController = new RecommendationController();
