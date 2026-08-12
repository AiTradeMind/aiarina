import { Router } from "express";
import { BrainController } from "../controllers/brain.controller.ts";

const router = Router();
const controller = new BrainController();

// Overview & Health
router.get("/", controller.getOverview);
router.get("/health", controller.getHealth);

// Knowledge Repository
router.get("/knowledge", controller.getKnowledge);

// Memory Manager
router.get("/memory", controller.getMemory);
router.post("/memory/store", controller.storeMemory);

// Context Builder
router.get("/context", controller.getContext);
router.post("/context/build", controller.buildContext);

// Integration: Process Research
router.post("/research/process", controller.processResearch);

export { router as brainFoundationRouter };
