import { Router } from "express";
import { analyticsController } from "../controllers/AnalyticsController";
import { authenticateToken } from "../../../middleware/auth";

const router = Router();

// Specific AI Analytics endpoints FIRST to avoid param conflicts
router.get("/ai/rankings", authenticateToken, analyticsController.getAiRankings);
router.get("/ai/health", authenticateToken, analyticsController.getAiHealth);
router.get("/ai/trends", authenticateToken, analyticsController.getAiTrends);
router.get("/ai/compare", authenticateToken, analyticsController.getAiCompare);
router.get("/ai/forecasts", authenticateToken, analyticsController.getForecasts);
router.get("/ai/correlations", authenticateToken, analyticsController.getCorrelations);
router.get("/ai/anomalies", authenticateToken, analyticsController.getAnomalies);
router.get("/ai/heatmaps", authenticateToken, analyticsController.getHeatmaps);
router.get("/ai/aggregate", authenticateToken, analyticsController.getCrossModuleAggregation);
router.get("/ai/history/:id", authenticateToken, analyticsController.getAiHistory);
router.get("/ai/:id", authenticateToken, analyticsController.getAiAnalyticsById);
router.get("/ai", authenticateToken, analyticsController.getAiAnalytics);

// General Analytics endpoints
router.get("/", authenticateToken, analyticsController.getAnalytics);
router.get("/summary", authenticateToken, analyticsController.getAnalytics);
router.get("/history", authenticateToken, analyticsController.getAnalytics);
router.get("/trends", authenticateToken, analyticsController.getAnalytics);
router.get("/strategy", authenticateToken, analyticsController.getAnalytics);
router.get("/portfolio", authenticateToken, analyticsController.getAnalytics);
router.get("/market", authenticateToken, analyticsController.getAnalytics);
router.get("/risk", authenticateToken, analyticsController.getAnalytics);
router.get("/intelligence", authenticateToken, analyticsController.getAnalytics);
router.get("/learning", authenticateToken, analyticsController.getAnalytics);

router.post("/reset", (req, res) => analyticsController.resetAnalyticsData(req, res));

export const analyticsRouter = router;
