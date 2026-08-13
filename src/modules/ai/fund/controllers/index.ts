import { Request, Response } from "express";
import { FundService } from "../services/index.ts";
import { runSafeStartupSeed } from "../../../../db/client";

const fundService = new FundService();

// Initialize dummy data safely behind connection verification
runSafeStartupSeed(() => fundService.seedInitialData());

export class FundController {
  async getFunds(req: Request, res: Response) {
    try {
      const funds = await fundService.getFunds();
      res.json(funds);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAllocations(req: Request, res: Response) {
    try {
      const allocations = await fundService.getAllocations();
      res.json(allocations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getHistory(req: Request, res: Response) {
    try {
      const history = await fundService.getHistory();
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getRecommendations(req: Request, res: Response) {
    try {
      const recs = await fundService.getRecommendations();
      res.json(recs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getRules(req: Request, res: Response) {
    try {
      const rules = await fundService.getRules();
      res.json(rules);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async recalculate(req: Request, res: Response) {
    try {
      const result = await fundService.recalculateAllocations();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateRule(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      await fundService.updateRule(id, updates);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
