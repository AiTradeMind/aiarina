import { Router } from "express";
import { GovernanceController } from "../controllers/index.ts";

const router = Router();
const controller = new GovernanceController();

router.get("/", controller.getGovernanceList);
router.get("/policies", controller.getPolicies);
router.get("/approvals", controller.getApprovals);
router.get("/history", controller.getHistory);
router.get("/compliance", controller.getCompliance);
router.get("/permissions", controller.getPermissions);

router.post("/submit", controller.submitForReview);
router.post("/approve", controller.approveStrategy);
router.post("/reject", controller.rejectStrategy);
router.post("/publish", controller.publishStrategy);
router.post("/archive", controller.archiveStrategy);

// Additional helpful governance endpoints
router.post("/compliance/check", controller.runComplianceCheck);
router.post("/permissions", controller.savePermission);

export { router as strategyGovernanceRouter };
