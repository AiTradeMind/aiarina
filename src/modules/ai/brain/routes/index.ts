import { Router } from "express";
import { BrainController } from "../controllers";

const router = Router();
const controller = new BrainController();

router.get("/status", controller.getStatus.bind(controller));
router.get("/tasks", controller.getTasks.bind(controller));
router.get("/history", controller.getHistory.bind(controller));
router.post("/analyze", controller.analyzeRequest.bind(controller));
router.post("/plan", controller.planConsensus.bind(controller));
router.post("/assign", controller.assignTask.bind(controller));

// Root route for convenience
router.get("/", controller.getStatus.bind(controller));

export { router as brainRouter };
