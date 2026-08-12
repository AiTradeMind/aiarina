import { Request, Response } from "express";
import { LeaderboardService } from "../services";
import { runSafeStartupSeed } from "../../../../db/client";

const leaderboardService = new LeaderboardService();

// Initialize data safely

export class LeaderboardController {
  async getCategories(req: Request, res: Response) {
    try {
      const leaderboards = await leaderboardService.getLeaderboards();
      res.json(leaderboards);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getCategoryDetails(req: Request, res: Response) {
    try {
      const { categoryId } = req.params;
      const data = await leaderboardService.getLeaderboardDetails(categoryId.toUpperCase());
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getModelScorecard(req: Request, res: Response) {
    try {
      const { modelId } = req.params;
      const scorecard = await leaderboardService.getModelScorecard(modelId);
      if (!scorecard) return res.status(404).json({ error: "Scorecard not found" });
      res.json(scorecard);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getModelHistory(req: Request, res: Response) {
    try {
      const { modelId } = req.params;
      const history = await leaderboardService.getModelHistory(modelId);
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async recalculateRankings(req: Request, res: Response) {
    try {
      const { categoryId } = req.body;
      if (!categoryId) return res.status(400).json({ error: "categoryId required" });
      await leaderboardService.recalculateRankings(categoryId, req.body.organizationId);
      res.json({ success: true, message: `Recalculated rankings for ${categoryId}` });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
