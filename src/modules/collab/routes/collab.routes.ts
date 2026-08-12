import { Router } from "express";
import { collaborationController } from "../controllers/CollaborationController.ts";
import { authenticateToken } from "../../../middleware/auth.ts";

const router = Router();

// Secure all collaboration routes under JWT Authenticated context
router.use(authenticateToken as any);

// Comments
router.post("/comments", (req, res) => collaborationController.createComment(req, res));
router.get("/comments/:resourceId", (req, res) => collaborationController.getComments(req, res));
router.post("/comments/:id/resolve", (req, res) => collaborationController.resolveComment(req, res));
router.post("/comments/:id/pin", (req, res) => collaborationController.pinComment(req, res));

// Tasks
router.post("/tasks", (req, res) => collaborationController.createTask(req, res));
router.patch("/tasks/:id", (req, res) => collaborationController.updateTask(req, res));
router.get("/tasks", (req, res) => collaborationController.listTasks(req, res));

// Shares
router.post("/share", (req, res) => collaborationController.shareResource(req, res));

// Feeds
router.get("/activity", (req, res) => collaborationController.getActivityFeed(req, res));

// Presence
router.get("/presence", (req, res) => collaborationController.getPresence(req, res));
router.post("/presence/heartbeat", (req, res) => collaborationController.updatePresence(req, res));

export const collabRouter = router;
