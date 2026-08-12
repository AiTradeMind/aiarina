import { Router } from "express";
import { TournamentController } from "../controllers/index.ts";

const router = Router();
const controller = new TournamentController();

router.get("/", controller.getTournaments.bind(controller));
router.get("/seasons", controller.getSeasons.bind(controller));
router.get("/matches", controller.getMatches.bind(controller));
router.get("/results", controller.getResults.bind(controller));
router.get("/scoreboard", controller.getScoreboards.bind(controller));

router.post("/create", controller.createTournament.bind(controller));
router.post("/start", controller.startTournament.bind(controller));
router.post("/simulate", controller.simulateTournament.bind(controller));
router.post("/finish", controller.finishTournament.bind(controller));

export { router as tournamentRouter };
