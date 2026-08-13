import { Router } from "express";
import { AIDecisionController } from "../controllers/index.ts";
import {  } from "../../../../middleware/auth.ts";

export const aiDecisionRouter = Router();
const aiCtrl = new AIDecisionController();

aiDecisionRouter.post("/ai/decision", (req, res, next) => aiCtrl.makeDecision(req, res, next));
aiDecisionRouter.post("/ai/consensus", (req, res, next) => aiCtrl.getConsensus(req, res, next));
aiDecisionRouter.post("/ai/analyze", (req, res, next) => aiCtrl.analyze(req, res, next));
aiDecisionRouter.get("/ai/recommendations", (req, res, next) => aiCtrl.getRecommendations(req, res, next));
aiDecisionRouter.get("/ai/history", (req, res, next) => aiCtrl.getHistory(req, res, next));
