import { Router } from "express";
import { portfolioController } from "../controllers/PortfolioController.ts";

const router = Router();

// Portfolio routes
router.get("/", portfolioController.getPortfolios as any);
router.get("/summary", portfolioController.getPortfolioSummary as any);
router.get("/history", portfolioController.getPortfolioHistory as any);

export const enterprisePortfolioRouter = router;
