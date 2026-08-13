import { Router } from "express";
import { portfolioController } from "../controllers/PortfolioController.ts";

const router = Router();

// Position routes
router.get("/", portfolioController.getPositions as any);
router.get("/open", portfolioController.getOpenPositions as any);
router.get("/closed", portfolioController.getClosedPositions as any);
router.get("/:id", portfolioController.getPositionById as any);

export const enterprisePositionRouter = router;
