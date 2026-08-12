import { Router } from "express";
import { auditController } from "../controllers/AuditController";
import { authenticateToken } from "../../../middleware/auth";

const router = Router();

router.get("/", authenticateToken, auditController.getStatus);
router.get("/history", authenticateToken, auditController.getStatus);
router.get("/events", authenticateToken, auditController.getStatus);
router.get("/compliance", authenticateToken, auditController.getStatus);
router.get("/policies", authenticateToken, auditController.getStatus);
router.get("/evidence", authenticateToken, auditController.getStatus);
router.get("/metrics", authenticateToken, auditController.getStatus);
router.get("/governance", authenticateToken, auditController.getStatus);
router.get("/status", authenticateToken, auditController.getStatus);
router.post("/verify", authenticateToken, auditController.verifyEvent);

export const auditRouter = router;
