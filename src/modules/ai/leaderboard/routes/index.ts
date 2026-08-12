import { Router } from "express";
import { LeaderboardController } from "../controllers";

const router = Router();
const controller = new LeaderboardController();

router.get("/categories", controller.getCategories.bind(controller));
router.get("/categories/:categoryId", controller.getCategoryDetails.bind(controller));
router.get("/models/:modelId", controller.getModelScorecard.bind(controller));
router.get("/models/:modelId/history", controller.getModelHistory.bind(controller));
router.post("/recalculate", controller.recalculateRankings.bind(controller));

// Default to overall category details for simple queries
router.get("/", (req, res) => {
   req.params = Object.assign({}, req.params, { categoryId: "OVERALL" });
   controller.getCategoryDetails(req, res);
});

export { router as leaderboardRouter };
