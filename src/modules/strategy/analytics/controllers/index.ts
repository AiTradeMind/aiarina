import { Request, Response } from "express";
import { AnalyticsService } from "../services/index.ts";

export class AnalyticsController {
  private service: AnalyticsService;

  constructor() {
    this.service = new AnalyticsService();
  }

  getAnalytics = async (req: Request, res: Response) => {
    try {
      const { strategyId } = req.query;
      const data = await this.service.getPerformance(strategyId as string | undefined);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getDashboard = async (req: Request, res: Response) => {
    try {
      const data = await this.service.getDashboard();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getPerformance = async (req: Request, res: Response) => {
    try {
      const { strategyId } = req.query;
      const data = await this.service.getPerformance(strategyId as string | undefined);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getComparison = async (req: Request, res: Response) => {
    try {
      const { strategyIdA, strategyIdB } = req.query;
      if (!strategyIdA || !strategyIdB) {
        return res.status(400).json({ error: "strategyIdA and strategyIdB are required query parameters" });
      }
      const data = await this.service.getComparison(strategyIdA as string, strategyIdB as string);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getReports = async (req: Request, res: Response) => {
    try {
      const { strategyId } = req.query;
      const data = await this.service.getReports(strategyId as string | undefined);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getHistory = async (req: Request, res: Response) => {
    try {
      const { strategyId, metricName } = req.query;
      if (!strategyId) {
        return res.status(400).json({ error: "strategyId is required" });
      }
      const data = await this.service.getHistory(strategyId as string, metricName as string | undefined);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getAttribution = async (req: Request, res: Response) => {
    try {
      const { strategyId } = req.query;
      if (!strategyId) {
        return res.status(400).json({ error: "strategyId is required" });
      }
      const data = await this.service.getAttribution(strategyId as string);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  generateReport = async (req: Request, res: Response) => {
    try {
      const { strategyId, reportType, name, createdBy } = req.body;
      if (!reportType || !name) {
        return res.status(400).json({ error: "reportType and name are required in the body" });
      }
      const data = await this.service.generateReport(
        strategyId || null,
        reportType,
        name,
        createdBy || "Institutional Analyst"
      );
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
