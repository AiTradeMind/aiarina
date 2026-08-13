import { Router } from "express";
import { schedulerController } from "../controllers/SchedulerController";
import { authenticateToken } from "../../../middleware/auth";

const router = Router();

router.get("/", authenticateToken, schedulerController.getStatus);
router.get("/status", authenticateToken, schedulerController.getStatus);
router.get("/jobs", authenticateToken, schedulerController.getStatus);
router.get("/history", authenticateToken, schedulerController.getStatus);
router.get("/metrics", authenticateToken, schedulerController.getStatus);
router.get("/health", authenticateToken, schedulerController.getStatus);
router.post("/create", authenticateToken, schedulerController.createSchedule);
router.post("/run", authenticateToken, schedulerController.runSchedule);
router.post("/pause", authenticateToken, schedulerController.pauseSchedule);
router.post("/resume", authenticateToken, schedulerController.resumeSchedule);
router.post("/cancel", authenticateToken, schedulerController.cancelSchedule);

export const schedulerRouter = router;
