import { Router } from "express";
import { OptimizerController } from "../controllers/index.ts";

const router = Router();
const controller = new OptimizerController();

// Use an isolated route for getOptimizations because the route parameter could be a generic 'history' keyword
router.get("/history/:strategyId", controller.getHistory.bind(controller));
router.get("/:strategyId", controller.getOptimizations.bind(controller));

router.post("/analyze", controller.analyze.bind(controller));
router.post("/recommend", controller.recommend.bind(controller));

export { router as strategyOptimizerRouter };
