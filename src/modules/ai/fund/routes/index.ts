import { Router } from "express";
import { FundController } from "../controllers/index.ts";

const router = Router();
const controller = new FundController();

router.get("/", controller.getFunds.bind(controller));
router.get("/allocations", controller.getAllocations.bind(controller));
router.get("/history", controller.getHistory.bind(controller));
router.get("/recommendations", controller.getRecommendations.bind(controller));
router.get("/rules", controller.getRules.bind(controller));

router.post("/recalculate", controller.recalculate.bind(controller));
router.put("/rules/:id", controller.updateRule.bind(controller));

export { router as fundRouter };
