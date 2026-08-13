import { Router } from "express";
import { RuntimeGovernanceController } from "../controllers/runtime-governance.controller.ts";

const router = Router();
const controller = RuntimeGovernanceController.getInstance();

router.get("/health", controller.getHealth);
router.post("/evaluate", controller.evaluateAction);
router.get("/policies", controller.getPolicies);
router.post("/policies", controller.createPolicy);
router.get("/circuit-breakers", controller.getCircuitBreakers);
router.post("/circuit-breakers/reset", controller.resetCircuitBreaker);
router.get("/kill-switch", controller.getKillSwitch);
router.post("/kill-switch/activate", controller.activateKillSwitch);
router.post("/kill-switch/deactivate", controller.deactivateKillSwitch);
router.get("/audit-logs", controller.getAuditLogs);

export { router as runtimeGovernanceRouter };
