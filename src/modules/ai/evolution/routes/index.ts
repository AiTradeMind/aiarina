import { Router } from "express";
import { EvolutionController } from "../controllers/index.ts";

const router = Router();
const controller = new EvolutionController();

router.get("/", controller.getProfiles.bind(controller));
router.get("/models", controller.getProfiles.bind(controller)); // alias for models
router.get("/patterns", controller.getPatterns.bind(controller));
router.get("/history", controller.getHistory.bind(controller));
router.get("/snapshots", controller.getSnapshots.bind(controller));

router.post("/learn", controller.learn.bind(controller));
router.post("/analyze", controller.analyze.bind(controller));
router.post("/snapshot", controller.snapshot.bind(controller));

export { router as evolutionRouter };
