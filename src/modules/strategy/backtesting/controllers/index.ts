import { Request, Response } from "express";
import { BacktestingService } from "../services/index.ts";

const backtestingService = new BacktestingService();

export class BacktestingController {
  async getBacktests(req: Request, res: Response) {
    try {
      const data = await backtestingService.getBacktests(req.params.strategyId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getRunById(req: Request, res: Response) {
    try {
      const data = await backtestingService.getRunById(req.params.runId);
      if (!data) return res.status(404).json({ error: 'Run not found' });
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getHistory(req: Request, res: Response) {
    try {
      const data = await backtestingService.getHistory(req.params.strategyId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async runBacktest(req: Request, res: Response) {
    try {
      const result = await backtestingService.runBacktest(req.body);
      if (!result.success) return res.status(400).json({ error: result.error });
      res.json(result.data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async generateReport(req: Request, res: Response) {
    try {
      const result = await backtestingService.generateReport(req.body);
      if (!result.success) return res.status(400).json({ error: result.error });
      res.json(result.data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
