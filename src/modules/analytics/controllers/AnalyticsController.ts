import { Request, Response } from "express";
import { analyticsService } from "../services/AnalyticsService";
import { AuthenticatedRequest } from "../../../middleware/auth";

export class AnalyticsController {
  async getAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { entityId } = req.query;
    const result = await analyticsService.runAnalytics(entityId as string || 'default');
    res.json({ status: "success", data: result });
  }

  async getAiAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
    const list = await analyticsService.getAiAnalytics();
    res.json({ status: "success", data: list });
  }

  async getAiAnalyticsById(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const data = await analyticsService.getAiAnalyticsById(id);
    if (!data) {
      res.status(404).json({ status: "error", message: "AI model analytics not found" });
      return;
    }
    res.json({ status: "success", data });
  }

  async getAiRankings(req: AuthenticatedRequest, res: Response): Promise<void> {
    const rankings = await analyticsService.getAiRankings();
    res.json({ status: "success", data: rankings });
  }

  async getAiHealth(req: AuthenticatedRequest, res: Response): Promise<void> {
    const health = await analyticsService.getAiHealth();
    res.json({ status: "success", data: health });
  }

  async getAiTrends(req: AuthenticatedRequest, res: Response): Promise<void> {
    const trends = await analyticsService.getAiTrends();
    res.json({ status: "success", data: trends });
  }

  async getAiHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const history = await analyticsService.getAiHistory(id);
    res.json({ status: "success", data: history });
  }

  async getAiCompare(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { ids } = req.query;
    const aiIds = ids ? (ids as string).split(',') : [];
    const compared = await analyticsService.getAiCompare(aiIds);
    res.json({ status: "success", data: compared });
  }

  async getForecasts(req: AuthenticatedRequest, res: Response): Promise<void> {
    const data = await analyticsService.getForecasts();
    res.json({ status: "success", data });
  }

  async getCorrelations(req: AuthenticatedRequest, res: Response): Promise<void> {
    const data = await analyticsService.getCorrelations();
    res.json({ status: "success", data });
  }

  async getAnomalies(req: AuthenticatedRequest, res: Response): Promise<void> {
    const data = await analyticsService.getAnomalies();
    res.json({ status: "success", data });
  }

  async getHeatmaps(req: AuthenticatedRequest, res: Response): Promise<void> {
    const data = await analyticsService.getHeatmaps();
    res.json({ status: "success", data });
  }

  async getCrossModuleAggregation(req: AuthenticatedRequest, res: Response): Promise<void> {
    const data = await analyticsService.getCrossModuleAggregation();
    res.json({ status: "success", data });
  }

  async resetAnalyticsData(req: Request, res: Response): Promise<void> {
    try {
      const { confirm, resetState } = req.body || {};
      const result = await analyticsService.resetAnalyticsTestData({
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
        error: error.message || "Analytics reset operation failed"
      });
    }
  }
}

export const analyticsController = new AnalyticsController();
