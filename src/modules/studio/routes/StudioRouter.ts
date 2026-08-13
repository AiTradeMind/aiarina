import { Router } from "express";
import { studioController } from "../controllers/StudioController";
import { authenticateToken } from "../../../middleware/auth";

const router = Router();

router.get("/", authenticateToken, studioController.getStudioData);
router.get("/dashboard", authenticateToken, studioController.getStudioData);
router.get("/executive", authenticateToken, studioController.getStudioData);
router.get("/operations", authenticateToken, studioController.getStudioData);
router.get("/health", authenticateToken, studioController.getStudioData);
router.get("/activity", authenticateToken, studioController.getStudioData);
router.get("/alerts", authenticateToken, studioController.getStudioData);
router.get("/widgets", authenticateToken, studioController.getStudioData);
router.get("/system", authenticateToken, studioController.getStudioData);
router.get("/status", authenticateToken, studioController.getStudioData);
router.get("/widgets/config", authenticateToken, studioController.getStudioData);

export const studioRouter = router;
