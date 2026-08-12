import { Router } from "express";
import { PortfolioController, TradingController } from "../controllers/index.ts";
import { requireRole } from "../../../middleware/auth.ts";
import { enforceTradingLock } from "../../../middleware/trading-lock.ts";

export const tradingRouter = Router();

const portfolioCtrl = new PortfolioController();
const tradingCtrl = new TradingController();

// Portfolio Endpoints
tradingRouter.get("/portfolio", requireRole(["trader", "admin"]), (req, res, next) => portfolioCtrl.getPortfolio(req, res, next));
tradingRouter.get("/portfolio/balance", requireRole(["trader", "admin"]), (req, res, next) => portfolioCtrl.getBalance(req, res, next));

// Position Endpoints
tradingRouter.get("/positions", requireRole(["trader", "admin"]), (req, res, next) => tradingCtrl.getPositions(req, res, next));

// Order Endpoints
tradingRouter.get("/orders", requireRole(["trader", "admin"]), (req, res, next) => tradingCtrl.getOrders(req, res, next));
tradingRouter.post("/orders", requireRole(["trader", "admin"]), enforceTradingLock, (req, res, next) => tradingCtrl.createOrder(req, res, next));
tradingRouter.put("/orders/:id", requireRole(["trader", "admin"]), enforceTradingLock, (req, res, next) => tradingCtrl.updateOrder(req, res, next));
tradingRouter.delete("/orders/:id", requireRole(["trader", "admin"]), enforceTradingLock, (req, res, next) => tradingCtrl.cancelOrder(req, res, next));

// Trade Endpoints
tradingRouter.get("/trades", requireRole(["trader", "admin"]), (req, res, next) => tradingCtrl.getTrades(req, res, next));
tradingRouter.get("/executions", requireRole(["trader", "admin"]), (req, res, next) => tradingCtrl.getExecutions(req, res, next));
