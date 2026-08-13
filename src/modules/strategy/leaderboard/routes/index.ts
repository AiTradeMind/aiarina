import { Router } from "express";
import { LeaderboardController } from "../controllers/index.ts";

const router = Router();
const controller = new LeaderboardController();

router.get("/", controller.getLeaderboards);
router.get("/rankings", controller.getRankings);
router.get("/categories", controller.getCategories);
router.get("/benchmarks", controller.getBenchmarks);
router.get("/history", controller.getHistory);
router.get("/awards", controller.getAwards);
router.get("/scorecards", controller.getScorecards);
router.get("/seasons", controller.getSeasons);
router.post("/recalculate", controller.recalculateLeaderboard);

export { router as strategyLeaderboardRouter };
