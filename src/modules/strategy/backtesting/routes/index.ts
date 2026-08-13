import { Router } from "express";
import { BacktestingController } from "../controllers/index.ts";

const router = Router();
const controller = new BacktestingController();

router.get("/history/:strategyId", controller.getHistory.bind(controller));
router.get("/run/:runId", controller.getRunById.bind(controller));
router.get("/:strategyId", controller.getBacktests.bind(controller));

router.post("/run", controller.runBacktest.bind(controller));
router.post("/report", controller.generateReport.bind(controller));

export { router as strategyBacktestingRouter };
