import { Router } from "express";
import { RiskController } from "../controllers/index.ts";

export const riskRouter = Router();
const riskCtrl = new RiskController();

// Legacy & Organization Profile Routes
riskRouter.get("/risk/profile", (req, res, next) => riskCtrl.getRiskProfile(req, res, next));
riskRouter.get("/risk/limits", (req, res, next) => riskCtrl.getRiskLimits(req, res, next));
riskRouter.put("/risk/limits", (req, res, next) => riskCtrl.updateRiskLimits(req, res, next));
riskRouter.get("/risk/events", (req, res, next) => riskCtrl.getRiskEvents(req, res, next));
riskRouter.post("/risk/validate", (req, res, next) => riskCtrl.validateOrder(req, res, next));

// Phase 2.9 Risk Engine Foundation API Routes
riskRouter.post("/risk/evaluate", (req, res, next) => riskCtrl.evaluateDecisionRisk(req, res, next));
riskRouter.get("/risk/health", (req, res, next) => riskCtrl.getHealth(req, res, next));

riskRouter.get("/risk/engine/profiles/:profileId", (req, res, next) => riskCtrl.getEngineProfile(req, res, next));
riskRouter.post("/risk/engine/profiles", (req, res, next) => riskCtrl.createEngineProfile(req, res, next));

riskRouter.get("/risk/engine/limits/:profileId", (req, res, next) => riskCtrl.getEngineLimits(req, res, next));
riskRouter.put("/risk/engine/limits/:profileId", (req, res, next) => riskCtrl.updateEngineLimits(req, res, next));

riskRouter.get("/risk/history/:targetId", (req, res, next) => riskCtrl.getTargetHistory(req, res, next));
import { riskController as ep04RiskController } from "../controllers/RiskController.ts";
import { requireRole } from "../../../middleware/auth.ts";

// EP-04 Routes
riskRouter.get("/risk/policies", requireRole(["admin", "analyst"]), ep04RiskController.getPolicies as any);
riskRouter.get("/risk/metrics", requireRole(["admin", "analyst"]), ep04RiskController.getMetrics as any);
riskRouter.get("/risk/snapshots", requireRole(["admin", "analyst"]), ep04RiskController.getSnapshots as any);
