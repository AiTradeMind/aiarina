import { Request, Response } from "express";
import { OptimizerService } from "../services/index.ts";

const optimizerService = new OptimizerService();

export class OptimizerController {
  async getOptimizations(req: Request, res: Response) {
    try {
      const data = await optimizerService.getOptimizations(req.params.strategyId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getHistory(req: Request, res: Response) {
    try {
      const data = await optimizerService.getHistory(req.params.strategyId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async analyze(req: Request, res: Response) {
    try {
      const result = await optimizerService.analyze(req.body);
      if (!result.success) return res.status(400).json({ error: result.error });
      res.json(result.data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async recommend(req: Request, res: Response) {
    try {
      const result = await optimizerService.recommend(req.body);
      if (!result.success) return res.status(400).json({ error: result.error });
      res.json(result.data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
