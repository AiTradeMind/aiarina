import { Router } from "express";
import { PerformanceController } from "../controllers";

const router = Router();
const controller = new PerformanceController();

// GET routes
router.get("/strategy", controller.getStrategyPerformance.bind(controller));
router.get("/portfolio", controller.getPortfolioPerformance.bind(controller));
router.get("/risk", controller.getRiskPerformance.bind(controller));
router.get("/reports", controller.getReports.bind(controller));
router.get("/evaluations", controller.getEvaluations.bind(controller));
router.get("/tests", controller.getTestSuites.bind(controller));
router.get("/benchmarks", controller.getBenchmarks.bind(controller));

// Root get for tests
router.get("/", controller.getTestSuites.bind(controller));

// POST routes
router.post("/run", controller.runBenchmark.bind(controller));
router.post("/report", controller.generateReport.bind(controller));

export { router as performanceRouter };
