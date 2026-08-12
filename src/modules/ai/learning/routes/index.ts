import { Router } from "express";
import { LearningController } from "../controllers/index.ts";
import {  } from "../../../../middleware/auth.ts";

export const aiLearningRouter = Router();
const learningCtrl = new LearningController();

aiLearningRouter.get("/ai/learning", (req, res, next) => learningCtrl.getLearning(req, res, next));
aiLearningRouter.post("/ai/learning/train", (req, res, next) => learningCtrl.train(req, res, next));
aiLearningRouter.get("/ai/learning/models", (req, res, next) => learningCtrl.getModels(req, res, next));
aiLearningRouter.get("/ai/learning/strategies", (req, res, next) => learningCtrl.getStrategies(req, res, next));
