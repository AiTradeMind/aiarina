import { Request, Response } from "express";
import { StrategyFoundationService } from "../services/strategy-foundation.service.ts";

export class StrategyFoundationController {
  private static instance: StrategyFoundationController;
  private service: StrategyFoundationService;

  private constructor() {
    this.service = StrategyFoundationService.getInstance();
  }

  public static getInstance(): StrategyFoundationController {
    if (!StrategyFoundationController.instance) {
      StrategyFoundationController.instance = new StrategyFoundationController();
    }
    return StrategyFoundationController.instance;
  }

  public async getStrategies(req: Request, res: Response): Promise<void> {
    try {
      const { status, type, limit } = req.query;
      const strategies = await this.service.queryStrategies({
        status: status as string,
        strategyType: type as string,
        limit: limit ? parseInt(limit as string, 10) : 100,
      });

      const summary = await this.service.getSummaryAnalytics();

      res.status(200).json({
        summary,
        count: strategies.length,
        strategies,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  public async getStrategyById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const strategy = await this.service.getStrategyById(id);
      res.status(200).json(strategy);
    } catch (err: any) {
      if (err.message.includes("not found")) {
        res.status(404).json({ error: err.message });
      } else {
        res.status(500).json({ error: err.message });
      }
    }
  }

  public async getSignals(req: Request, res: Response): Promise<void> {
    try {
      const { strategyId, symbol, signalType, limit } = req.query;
      const signals = await this.service.querySignals({
        strategyId: strategyId as string,
        symbol: symbol as string,
        signalType: signalType as string,
        limit: limit ? parseInt(limit as string, 10) : 100,
      });

      res.status(200).json({
        count: signals.length,
        signals,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  public async getHealth(req: Request, res: Response): Promise<void> {
    try {
      const health = await this.service.getHealthStatus();
      res.status(200).json(health);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  public async evaluateStrategy(req: Request, res: Response): Promise<void> {
    try {
      const dto = req.body || {};
      const result = await this.service.evaluateStrategy(dto);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  public async createStrategy(req: Request, res: Response): Promise<void> {
    try {
      const dto = req.body || {};
      const created = await this.service.createStrategy(dto);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  public async activateStrategy(req: Request, res: Response): Promise<void> {
    try {
      const strategyId = req.params.id || req.body?.strategyId;
      const operator = req.body?.operator || "SYSTEM";

      if (!strategyId) {
        res.status(400).json({ error: "Missing required parameter: strategyId" });
        return;
      }

      const updated = await this.service.activateStrategy(strategyId, operator);
      res.status(200).json(updated);
    } catch (err: any) {
      if (err.message.includes("not found")) {
        res.status(404).json({ error: err.message });
      } else {
        res.status(400).json({ error: err.message });
      }
    }
  }

  public async pauseStrategy(req: Request, res: Response): Promise<void> {
    try {
      const strategyId = req.params.id || req.body?.strategyId;
      const operator = req.body?.operator || "SYSTEM";

      if (!strategyId) {
        res.status(400).json({ error: "Missing required parameter: strategyId" });
        return;
      }

      const updated = await this.service.pauseStrategy(strategyId, operator);
      res.status(200).json(updated);
    } catch (err: any) {
      if (err.message.includes("not found")) {
        res.status(404).json({ error: err.message });
      } else {
        res.status(400).json({ error: err.message });
      }
    }
  }

  public async disableStrategy(req: Request, res: Response): Promise<void> {
    try {
      const strategyId = req.params.id || req.body?.strategyId;
      const operator = req.body?.operator || "SYSTEM";

      if (!strategyId) {
        res.status(400).json({ error: "Missing required parameter: strategyId" });
        return;
      }

      const updated = await this.service.disableStrategy(strategyId, operator);
      res.status(200).json(updated);
    } catch (err: any) {
      if (err.message.includes("not found")) {
        res.status(404).json({ error: err.message });
      } else {
        res.status(400).json({ error: err.message });
      }
    }
  }

  public async getHistory(req: Request, res: Response): Promise<void> {
    try {
      const { strategyId } = req.query;
      const history = await this.service.getHistory(strategyId as string);
      res.status(200).json({
        count: history.length,
        history,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
