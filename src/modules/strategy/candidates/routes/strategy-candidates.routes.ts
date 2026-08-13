import { Router } from "express";
import { StrategyCandidatesController } from "../controllers/strategy-candidates.controller.ts";

export const strategyCandidatesRouter = Router();

strategyCandidatesRouter.get("/", StrategyCandidatesController.getOverview);
strategyCandidatesRouter.post("/", StrategyCandidatesController.submitCandidate);
strategyCandidatesRouter.post("/:candidateId/status", StrategyCandidatesController.updateStatus);
strategyCandidatesRouter.post("/:candidateId/vote", StrategyCandidatesController.vote);
strategyCandidatesRouter.post("/bulk", StrategyCandidatesController.bulkAction);
