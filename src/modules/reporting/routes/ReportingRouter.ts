import { Router } from "express";
import { reportingController } from "../controllers/ReportingController";
import { authenticateToken } from "../../../middleware/auth";

const router = Router();

router.get("/", authenticateToken, reportingController.getReport);
router.get("/dashboard", authenticateToken, reportingController.getReport);
router.get("/executive", authenticateToken, reportingController.getReport);
router.get("/performance", authenticateToken, reportingController.getReport);
router.get("/portfolio", authenticateToken, reportingController.getReport);
router.get("/risk", authenticateToken, reportingController.getReport);
router.get("/strategy", authenticateToken, reportingController.getReport);
router.get("/market", authenticateToken, reportingController.getReport);
router.get("/export", authenticateToken, reportingController.getReport);
router.get("/history", authenticateToken, reportingController.getReport);
router.get("/cache", authenticateToken, reportingController.getReport);

export const reportingRouter = router;
