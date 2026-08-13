import { Router } from "express";
import { DecisionController } from "../controllers/decision.controller.ts";

const router = Router();
const controller = new DecisionController();

// Health & Status
router.get("/health", controller.getHealth);
router.get("/status", controller.getStatus);
router.get("/history", controller.getHistory);

// Decision Query & Evaluation
router.get("/", controller.getDecisions);
router.post("/evaluate", controller.evaluateDecision);

// Individual Decision Operations
router.get("/:id", controller.getDecisionById);
router.post("/:id/approve", controller.approveDecision);
router.post("/:id/reject", controller.rejectDecision);

export { router as decisionFoundationRouter };
