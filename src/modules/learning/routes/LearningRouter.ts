import { Router } from "express";
import { learningController } from "../controllers/LearningController";
import { requireRole } from "../../../middleware/auth";

export const ep07bLearningRouter = Router();

ep07bLearningRouter.get("/", requireRole(["admin", "analyst"]), learningController.getLearning as any);
ep07bLearningRouter.get("/history", requireRole(["admin", "analyst"]), learningController.getHistory as any);
ep07bLearningRouter.get("/feedback", requireRole(["admin", "analyst"]), learningController.getFeedback as any);
ep07bLearningRouter.get("/patterns", requireRole(["admin", "analyst"]), learningController.getPatterns as any);
ep07bLearningRouter.get("/snapshots", requireRole(["admin", "analyst"]), learningController.getSnapshots as any);
ep07bLearningRouter.get("/knowledge", requireRole(["admin", "analyst"]), learningController.getKnowledge as any);
