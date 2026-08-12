import { Router } from "express";
import { explainabilityController } from "../controllers/ExplainabilityController";
import { authenticateToken } from "../../../middleware/auth";

const router = Router();

router.get("/", authenticateToken, explainabilityController.getExplanation);
router.get("/decision", authenticateToken, explainabilityController.getExplanation);
router.get("/evidence", authenticateToken, explainabilityController.getExplanation);
router.get("/reasoning", authenticateToken, explainabilityController.getExplanation);
router.get("/confidence", authenticateToken, explainabilityController.getExplanation);
router.get("/risk", authenticateToken, explainabilityController.getExplanation);
router.get("/timeline", authenticateToken, explainabilityController.getExplanation);
router.get("/alternatives", authenticateToken, explainabilityController.getExplanation);

export const explainabilityRouter = router;
