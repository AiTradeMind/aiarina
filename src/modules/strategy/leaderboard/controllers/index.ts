import { Request, Response } from "express";
import { LeaderboardService } from "../services/index.ts";

export class LeaderboardController {
  private service: LeaderboardService;

  constructor() {
    this.service = new LeaderboardService();
  }

  getLeaderboards = async (req: Request, res: Response) => {
    try {
      const data = await this.service.getLeaderboards();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getRankings = async (req: Request, res: Response) => {
    try {
      const { leaderboardId } = req.query;
      const data = await this.service.getRankings(leaderboardId as string | undefined);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getCategories = async (req: Request, res: Response) => {
    try {
      const data = await this.service.getCategories();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getBenchmarks = async (req: Request, res: Response) => {
    try {
      const { strategyId } = req.query;
      const data = await this.service.getBenchmarks(strategyId as string | undefined);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getHistory = async (req: Request, res: Response) => {
    try {
      const { strategyId } = req.query;
      if (!strategyId) {
        return res.status(400).json({ error: 'strategyId is required' });
      }
      const data = await this.service.getHistory(strategyId as string);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getAwards = async (req: Request, res: Response) => {
    try {
      const { strategyId } = req.query;
      const data = await this.service.getAwards(strategyId as string | undefined);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  recalculateLeaderboard = async (req: Request, res: Response) => {
    try {
      const data = await this.service.recalculateLeaderboard();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
  
  getScorecards = async (req: Request, res: Response) => {
    try {
      const { strategyId } = req.query;
      const data = await this.service.getScorecards(strategyId as string | undefined);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getSeasons = async (req: Request, res: Response) => {
    try {
      const data = await this.service.getSeasons();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
