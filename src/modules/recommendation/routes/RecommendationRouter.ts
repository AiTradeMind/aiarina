import { Router } from "express";
import { recommendationController } from "../controllers/RecommendationController";
import { authenticateToken } from "../../../middleware/auth";

const router = Router();

router.get("/", authenticateToken, recommendationController.getRecommendations);
router.get("/summary", authenticateToken, recommendationController.getRecommendations);
router.get("/history", authenticateToken, recommendationController.getRecommendations);
router.get("/ai", authenticateToken, recommendationController.getRecommendations);
router.get("/strategy", authenticateToken, recommendationController.getRecommendations);
router.get("/portfolio", authenticateToken, recommendationController.getRecommendations);
router.get("/risk", authenticateToken, recommendationController.getRecommendations);
router.get("/market", authenticateToken, recommendationController.getRecommendations);
router.get("/priority", authenticateToken, recommendationController.getRecommendations);
router.get("/insights", authenticateToken, recommendationController.getInsights);
router.get("/lifecycle", authenticateToken, recommendationController.getRecommendations);

export const recommendationRouter = router;
