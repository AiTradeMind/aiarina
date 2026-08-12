import { Router } from "express";
import { operationsController } from "../controllers/OperationsController";
import { authenticateToken } from "../../../middleware/auth";

const router = Router();

router.get("/", authenticateToken, operationsController.getDashboard);
router.get("/dashboard", authenticateToken, operationsController.getDashboard);
router.get("/status", authenticateToken, operationsController.getStatus);
router.get("/services", authenticateToken, operationsController.getStatus);
router.get("/widgets", authenticateToken, operationsController.getStatus);
router.get("/layout", authenticateToken, operationsController.getStatus);
router.get("/activity", authenticateToken, operationsController.getStatus);
router.get("/alerts", authenticateToken, operationsController.getStatus);
router.get("/metrics", authenticateToken, operationsController.getStatus);
router.get("/snapshots", authenticateToken, operationsController.getStatus);
router.post("/layout", authenticateToken, operationsController.updateLayout);
router.post("/widgets", authenticateToken, operationsController.updateLayout);

export const operationsConsoleRouter = router;
