import { Router } from "express";
import { analyticsController } from "../controllers/index.ts";
import { requireRole } from "../../../middleware/auth.ts";

export const analyticsRouter = Router();

// Backward Compatible Dashboard routes
analyticsRouter.get("/analytics/dashboard", requireRole(["analyst", "admin"]), (req, res, next) => analyticsController.getDashboard(req, res, next));
analyticsRouter.get("/analytics/performance", requireRole(["analyst", "admin"]), (req, res, next) => analyticsController.getPerformance(req, res, next));
analyticsRouter.get("/analytics/strategies", requireRole(["analyst", "admin"]), (req, res, next) => analyticsController.getStrategies(req, res, next));
analyticsRouter.get("/analytics/ai", requireRole(["analyst", "admin"]), (req, res, next) => analyticsController.getAI(req, res, next));
analyticsRouter.get("/analytics/ai/rankings", requireRole(["analyst", "admin"]), (req, res, next) => analyticsController.getAIRankings(req, res, next));
analyticsRouter.get("/analytics/ai/health", requireRole(["analyst", "admin"]), (req, res, next) => analyticsController.getAIHealth(req, res, next));
analyticsRouter.get("/analytics/ai/trends", requireRole(["analyst", "admin"]), (req, res, next) => analyticsController.getAITrends(req, res, next));
analyticsRouter.get("/analytics/ai/forecasts", requireRole(["analyst", "admin"]), (req, res, next) => analyticsController.getAIForecasts(req, res, next));
analyticsRouter.get("/analytics/ai/correlations", requireRole(["analyst", "admin"]), (req, res, next) => analyticsController.getAICorrelations(req, res, next));
analyticsRouter.get("/analytics/ai/anomalies", requireRole(["analyst", "admin"]), (req, res, next) => analyticsController.getAIAnomalies(req, res, next));
analyticsRouter.get("/analytics/ai/heatmaps", requireRole(["analyst", "admin"]), (req, res, next) => analyticsController.getAIHeatmaps(req, res, next));
analyticsRouter.get("/analytics/ai/aggregate", requireRole(["analyst", "admin"]), (req, res, next) => analyticsController.getAIAggregate(req, res, next));
analyticsRouter.get("/analytics/ai/compare", requireRole(["analyst", "admin"]), (req, res, next) => analyticsController.getAICompare(req, res, next));
analyticsRouter.get("/analytics/ai/:id", requireRole(["analyst", "admin"]), (req, res, next) => analyticsController.getAIModelDetail(req, res, next));
analyticsRouter.get("/analytics/risk", requireRole(["analyst", "admin"]), (req, res, next) => analyticsController.getRisk(req, res, next));

// EP-06 API Routes (Part 11)
analyticsRouter.get("/analytics", requireRole(["analyst", "admin"]), (req, res, next) => analyticsController.getOverview(req, res, next));
analyticsRouter.get("/analytics/market", requireRole(["analyst", "admin"]), (req, res, next) => analyticsController.getMarketStats(req, res, next));
analyticsRouter.get("/analytics/symbol/:symbol", requireRole(["analyst", "admin"]), (req, res, next) => analyticsController.getSymbolAnalytics(req, res, next));
analyticsRouter.get("/analytics/sector/:sector", requireRole(["analyst", "admin"]), (req, res, next) => analyticsController.getSectorAnalytics(req, res, next));
analyticsRouter.get("/analytics/trends", requireRole(["analyst", "admin"]), (req, res, next) => analyticsController.getTrends(req, res, next));
analyticsRouter.get("/analytics/volatility", requireRole(["analyst", "admin"]), (req, res, next) => analyticsController.getVolatility(req, res, next));
analyticsRouter.get("/analytics/correlation", requireRole(["analyst", "admin"]), (req, res, next) => analyticsController.getCorrelation(req, res, next));
analyticsRouter.get("/analytics/reports", requireRole(["analyst", "admin"]), (req, res, next) => analyticsController.getReports(req, res, next));
analyticsRouter.get("/analytics/health", requireRole(["analyst", "admin"]), (req, res, next) => analyticsController.getHealth(req, res, next));
analyticsRouter.post("/analytics/recalculate", requireRole(["analyst", "admin"]), (req, res, next) => analyticsController.recalculate(req, res, next));
analyticsRouter.post("/analytics/reset", (req: any, res: any, next: any) => analyticsController.resetAnalytics(req, res, next));

// Stubs (Backward Compatibility)
analyticsRouter.get("/analytics/kpis", requireRole(["analyst", "admin"]), (req, res, next) => analyticsController.getKpis(req, res, next));
analyticsRouter.get("/analytics/exports", requireRole(["analyst", "admin"]), (req, res, next) => analyticsController.getExports(req, res, next));
analyticsRouter.post("/analytics/export", requireRole(["analyst", "admin"]), (req, res, next) => analyticsController.exportReport(req, res, next));
