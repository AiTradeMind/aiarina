import { Router } from "express";
import { AnalyticsController } from "../controllers/index.ts";

const router = Router();
const controller = new AnalyticsController();

router.get("/", controller.getAnalytics);
router.get("/dashboard", controller.getDashboard);
router.get("/performance", controller.getPerformance);
router.get("/comparison", controller.getComparison);
router.get("/reports", controller.getReports);
router.get("/history", controller.getHistory);
router.get("/attribution", controller.getAttribution);
router.post("/generate-report", controller.generateReport);

export { router as strategyAnalyticsRouter };
