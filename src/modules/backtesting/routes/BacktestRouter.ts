import { Router } from "express";
import { backtestController } from "../controllers/BacktestController";
import { authenticateToken } from "../../../middleware/auth";

const router = Router();

router.post("/run", authenticateToken, backtestController.runBacktest);
router.get("/history", authenticateToken, backtestController.getHistory);

export const backtestRouter = router;
