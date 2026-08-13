import { Router } from "express";
import { notificationController } from "../controllers/NotificationController";
import { authenticateToken } from "../../../middleware/auth";

const router = Router();

router.get("/", authenticateToken, notificationController.getStatus);
router.get("/history", authenticateToken, notificationController.getStatus);
router.get("/preferences", authenticateToken, notificationController.getStatus);
router.get("/templates", authenticateToken, notificationController.getStatus);
router.get("/metrics", authenticateToken, notificationController.getStatus);
router.get("/queue", authenticateToken, notificationController.getStatus);

router.post("/send", authenticateToken, notificationController.sendNotification);
router.post("/retry", authenticateToken, notificationController.retryNotification);
router.post("/cancel", authenticateToken, notificationController.cancelNotification);
router.post("/preferences", authenticateToken, notificationController.sendNotification);

export const notificationCenterRouter = router;
