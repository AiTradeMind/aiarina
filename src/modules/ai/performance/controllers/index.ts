import { Request, Response } from "express";
import { PerformanceService } from "../services";
import { TradingPerformanceService } from "../services/trading-performance.ts";
import { PortfolioPerformanceService } from "../services/portfolio-performance.ts";
import { RiskPerformanceService } from "../services/risk-performance.ts";
import { runSafeStartupSeed } from "../../../../db/client";

const performanceService = new PerformanceService();
const tradingPerformanceService = new TradingPerformanceService();
const portfolioPerformanceService = new PortfolioPerformanceService();
const riskPerformanceService = new RiskPerformanceService();

// Initialize dummy data safely behind connection verification
runSafeStartupSeed(() => performanceService.seedInitialData());

export class PerformanceController {
  async getStrategyPerformance(req: Request, res: Response) {
    try {
      const { organizationId } = req.query;
      if (!organizationId) {
        return res.status(400).json({ error: "organizationId required" });
      }
      const perf = await tradingPerformanceService.getStrategyPerformance(organizationId as string);
      res.json(perf);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getPortfolioPerformance(req: Request, res: Response) {
    try {
      const { organizationId } = req.query;
      if (!organizationId) {
        return res.status(400).json({ error: "organizationId required" });
      }
      const perf = await portfolioPerformanceService.getPortfolioPerformance(organizationId as string);
      res.json(perf);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getRiskPerformance(req: Request, res: Response) {
    try {
      const { organizationId } = req.query;
      if (!organizationId) {
        return res.status(400).json({ error: "organizationId required" });
      }
      const perf = await riskPerformanceService.getRiskPerformance(organizationId as string);
      res.json(perf);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getEvaluations(req: Request, res: Response) {
    try {
      const { runId } = req.query;
      if (runId) {
        const evals = await performanceService.getEvaluations(runId as string);
        res.json(evals);
      } else {
        res.json([]);
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getReports(req: Request, res: Response) {
    try {
      const reports = await performanceService.getReports();
      res.json(reports);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getTestSuites(req: Request, res: Response) {
    try {
      const suites = await performanceService.getTestSuites();
      res.json(suites);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getBenchmarks(req: Request, res: Response) {
    try {
      const runs = await performanceService.getBenchmarkRuns();
      res.json(runs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async runBenchmark(req: Request, res: Response) {
    try {
      const { suiteId, modelIds } = req.body;
      if (!suiteId || !Array.isArray(modelIds)) {
        return res.status(400).json({ error: "suiteId and modelIds required" });
      }
      const run = await performanceService.runBenchmark(suiteId, modelIds);
      res.json({ success: true, run });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async generateReport(req: Request, res: Response) {
    try {
      const { modelId } = req.body;
      if (!modelId) {
        return res.status(400).json({ error: "modelId required" });
      }
      const report = await performanceService.generateReport(modelId);
      res.json({ success: true, report });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
