import { Router } from "express";
import { monitoringController } from "../controllers/MonitoringController";
import { authenticateToken } from "../../../middleware/auth";

const router = Router();

router.get("/", authenticateToken, monitoringController.getHealth);
router.get("/health", authenticateToken, monitoringController.getHealth);
router.get("/system", authenticateToken, monitoringController.getHealth);
router.get("/services", authenticateToken, monitoringController.getHealth);
router.get("/apis", authenticateToken, monitoringController.getHealth);
router.get("/workers", authenticateToken, monitoringController.getHealth);
router.get("/queues", authenticateToken, monitoringController.getHealth);
router.get("/metrics", authenticateToken, monitoringController.getMetrics);
router.get("/history", authenticateToken, monitoringController.getHealth);
router.get("/status", authenticateToken, monitoringController.getHealth);

export const monitoringRouter = router;
