import { Router } from "express";
import { evaluationController } from "../controllers/EvaluationController";
import { authenticateToken } from "../../../middleware/auth";

const router = Router();

router.get("/", authenticateToken, evaluationController.getHistory);
router.post("/run", authenticateToken, evaluationController.runEvaluation);
router.get("/history", authenticateToken, evaluationController.getHistory);

export const evaluationRouter = router;
