import { Router } from "express";
import { PortfolioController } from "../controllers/portfolio.controller.ts";
import { requireRole } from "../../../middleware/auth.ts";

export const portfolioRouter = Router();
const portfolioCtrl = new PortfolioController();

// Phase 2.11 Portfolio Foundation APIs
portfolioRouter.get("/portfolio", requireRole(["trader", "admin", "analyst"]), (req, res, next) => portfolioCtrl.getPortfolios(req, res, next));
portfolioRouter.get("/portfolio/positions", requireRole(["trader", "admin", "analyst"]), (req, res, next) => portfolioCtrl.getPositions(req, res, next));
portfolioRouter.get("/portfolio/holdings", requireRole(["trader", "admin", "analyst"]), (req, res, next) => portfolioCtrl.getHoldings(req, res, next));
portfolioRouter.get("/portfolio/pnl", requireRole(["trader", "admin", "analyst"]), (req, res, next) => portfolioCtrl.getPnL(req, res, next));
portfolioRouter.get("/portfolio/exposure", requireRole(["trader", "admin", "analyst"]), (req, res, next) => portfolioCtrl.getExposure(req, res, next));
portfolioRouter.get("/portfolio/snapshots", requireRole(["trader", "admin", "analyst"]), (req, res, next) => portfolioCtrl.getSnapshots(req, res, next));
portfolioRouter.get("/portfolio/history", requireRole(["trader", "admin", "analyst"]), (req, res, next) => portfolioCtrl.getHistory(req, res, next));
portfolioRouter.get("/portfolio/health", requireRole(["trader", "admin", "analyst"]), (req, res, next) => portfolioCtrl.getHealth(req, res, next));
portfolioRouter.get("/portfolio/:id", requireRole(["trader", "admin", "analyst"]), (req, res, next) => portfolioCtrl.getPortfolio(req, res, next));

// Ingestion from OMS execution
portfolioRouter.post("/portfolio/oms-update", requireRole(["trader", "admin"]), (req, res, next) => portfolioCtrl.receiveOMSExecution(req, res, next));

// Governance protection: Reject direct execution / trade requests on portfolio
portfolioRouter.post("/portfolio/trade", requireRole(["trader", "admin"]), (req, res, next) => portfolioCtrl.rejectDirectTrade(req, res, next));
portfolioRouter.post("/portfolio/execute", requireRole(["trader", "admin"]), (req, res, next) => portfolioCtrl.rejectDirectTrade(req, res, next));
