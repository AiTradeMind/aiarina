import { Router } from "express";
import { LifecycleController } from "../controllers/index.ts";

const router = Router();
const controller = new LifecycleController();

router.get("/", controller.getLifecycles.bind(controller));
router.get("/:id", controller.getLifecycleById.bind(controller));
router.get("/history/:id", controller.getHistory.bind(controller));
router.post("/register", controller.registerLifecycle.bind(controller));
router.post("/transition", controller.transitionState.bind(controller));
router.post("/activate", controller.activateStrategy.bind(controller));
router.post("/pause", controller.pauseStrategy.bind(controller));
router.post("/retire", controller.retireStrategy.bind(controller));

// Stage 16 Learning Trigger API Endpoints
router.post("/learning-trigger/create", controller.createLearningTrigger.bind(controller));
router.post("/learning-trigger/retry", controller.retryLearningTrigger.bind(controller));
router.post("/learning-trigger/recover", controller.recoverLearningTrigger.bind(controller));
router.get("/learning-trigger/status", controller.getLearningTriggerStatus.bind(controller));
router.get("/learning-trigger/:id", controller.getLearningTriggerById.bind(controller));

// Stage 17 Evolution Trigger API Endpoints
router.post("/evolution-trigger/create", controller.createEvolutionTrigger.bind(controller));
router.post("/evolution-trigger/retry", controller.retryEvolutionTrigger.bind(controller));
router.post("/evolution-trigger/recover", controller.recoverEvolutionTrigger.bind(controller));
router.get("/evolution-trigger/status", controller.getEvolutionTriggerStatus.bind(controller));
router.get("/evolution-trigger/:id", controller.getEvolutionTriggerById.bind(controller));

export { router as strategyLifecycleRouter };
