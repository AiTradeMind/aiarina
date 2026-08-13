import { Router } from "express";
import { CollaborationController } from "../controllers/index.ts";

const router = Router();
const controller = new CollaborationController();

router.get("/", controller.getCollaborations.bind(controller));
router.get("/sessions", controller.getSessions.bind(controller));
router.get("/sessions/:sessionId/members", controller.getMembers.bind(controller));
router.get("/sessions/:sessionId/tasks", controller.getTasks.bind(controller));
router.get("/sessions/:sessionId/results", controller.getResults.bind(controller));
router.get("/sessions/:sessionId/consensus", controller.getConsensus.bind(controller));
router.get("/sessions/:sessionId/history", controller.getHistory.bind(controller));

router.post("/create", controller.createCollaboration.bind(controller));
router.post("/start", controller.startSession.bind(controller));
router.post("/finalize", controller.finalizeSession.bind(controller));
router.post("/archive", controller.archiveSession.bind(controller));

export { router as collaborationRouter };
