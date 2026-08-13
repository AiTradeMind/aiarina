import { Router } from "express";
import { notificationController } from "../controllers/NotificationController.ts";
import { authenticateToken } from "../../../middleware/auth.ts";

const router = Router();

router.use(authenticateToken as any);

// Events API
router.post("/events/publish", (req, res) => notificationController.publishEvent(req, res));
router.get("/events", (req, res) => notificationController.listEvents(req, res));
router.get("/events/:id", (req, res) => notificationController.getEvent(req, res));
router.post("/events/replay", (req, res) => notificationController.replayEvents(req, res));
router.post("/events/subscribe", (req, res) => notificationController.subscribe(req, res));

// Notifications API
router.get("/notifications", (req, res) => notificationController.listNotifications(req, res));
router.patch("/notifications/:id/read", (req, res) => notificationController.markAsRead(req, res));
router.patch("/notifications/:id/archive", (req, res) => notificationController.archive(req, res));
router.get("/notifications/preferences", (req, res) => notificationController.getPreferences(req, res));
router.patch("/notifications/preferences", (req, res) => notificationController.updatePreferences(req, res));

export const notificationRouter = router;
export default router;
