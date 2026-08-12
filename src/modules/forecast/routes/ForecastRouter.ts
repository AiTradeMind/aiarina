import { Router } from "express";
import { forecastController } from "../controllers/ForecastController";
import { authenticateToken } from "../../../middleware/auth";

const router = Router();

router.post("/", authenticateToken, forecastController.getForecast);
router.get("/history", authenticateToken, forecastController.getHistory);
router.get("/accuracy", authenticateToken, forecastController.getHistory);

export const forecastRouter = router;
