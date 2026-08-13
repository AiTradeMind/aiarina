import { Router } from "express";
import { intelligenceController } from "../controllers/IntelligenceController";
import { authenticateToken } from "../../../middleware/auth";

const router = Router();

router.get("/", authenticateToken, intelligenceController.getIntelligence);
router.post("/intelligence/reset", (req, res) => intelligenceController.resetIntelligence(req, res));
router.get("/memory", authenticateToken, intelligenceController.getIntelligence); // Placeholder for memory
router.get("/history", authenticateToken, intelligenceController.getIntelligence); // Placeholder for history
router.get("/knowledge", authenticateToken, intelligenceController.getIntelligence); // Placeholder for knowledge
router.get("/search", authenticateToken, intelligenceController.getIntelligence); // Placeholder for search
router.get("/patterns", authenticateToken, intelligenceController.getIntelligence); // Placeholder for patterns
router.get("/profiles", authenticateToken, intelligenceController.getIntelligence); // Placeholder for profiles
router.get("/experience", authenticateToken, intelligenceController.getIntelligence); // Placeholder for experience
router.get("/context", authenticateToken, intelligenceController.getIntelligence); // Placeholder for context
router.get("/graph", authenticateToken, intelligenceController.getIntelligence); // Placeholder for graph

export const intelligenceRouter = router;
