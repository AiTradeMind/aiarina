import { Router } from "express";
import { BuilderController } from "../controllers/index.ts";

const router = Router();
const controller = new BuilderController();

// Enterprise REST Strategy Builder API Endpoints
router.get("/", controller.listStrategies);
router.post("/", controller.createStrategy);
router.post("/create", controller.createStrategy);
router.post("/bulk", controller.bulkOperation);
router.get("/:id", controller.getStrategyById);
router.put("/:id", controller.updateStrategy);
router.delete("/:id", controller.deleteStrategy);
router.post("/:id/clone", controller.cloneStrategy);
router.get("/:id/history", controller.getHistoryTimeline);

// Rules Endpoints
router.post("/:id/rules", controller.saveRules);
router.get("/:id/rules", controller.loadRules);

// Visual Graph / Canvas Supporting Endpoints
router.get("/graph/:id", controller.getBuilderById);
router.post("/save/:id", controller.saveBuilderContent);
router.post("/validate/:id", controller.validateBuilder);

export { router as strategyBuilderRouter };
