import { Router } from "express";
import { PaperTradingController } from "../controllers/index.ts";
import { requireRole } from "../../../middleware/auth.ts";
import { enforceTradingLock } from "../../../middleware/trading-lock.ts";

export const paperTradingRouter = Router();
const paperCtrl = new PaperTradingController();

paperTradingRouter.get("/paper/account", requireRole(["trader", "admin"]), (req, res, next) => paperCtrl.getAccount(req, res, next));
paperTradingRouter.get("/paper/portfolio", requireRole(["trader", "admin"]), (req, res, next) => paperCtrl.getPortfolio(req, res, next));
paperTradingRouter.get("/paper/orders", requireRole(["trader", "admin"]), (req, res, next) => paperCtrl.getOrders(req, res, next));
paperTradingRouter.post("/paper/orders", requireRole(["trader", "admin"]), enforceTradingLock, (req, res, next) => paperCtrl.createOrder(req, res, next));
paperTradingRouter.get("/paper/trades", requireRole(["trader", "admin"]), (req, res, next) => paperCtrl.getTrades(req, res, next));
paperTradingRouter.get("/paper/journal", requireRole(["trader", "admin"]), (req, res, next) => paperCtrl.getJournal(req, res, next));

paperTradingRouter.get("/paper/session", requireRole(["trader", "admin"]), (req, res, next) => paperCtrl.getSessionState(req, res, next));
paperTradingRouter.post("/paper/session/control", requireRole(["trader", "admin"]), (req, res, next) => paperCtrl.controlSession(req, res, next));
paperTradingRouter.post("/paper/session/simulate", requireRole(["trader", "admin"]), (req, res, next) => paperCtrl.startSimulation(req, res, next));
paperTradingRouter.get("/paper/execution/queue", requireRole(["trader", "admin"]), (req, res, next) => paperCtrl.getExecutionQueue(req, res, next));
paperTradingRouter.get("/paper/execution/audit", requireRole(["trader", "admin"]), (req, res, next) => paperCtrl.getExecutionAudit(req, res, next));
paperTradingRouter.get("/paper/orders/:id/lifecycle", requireRole(["trader", "admin"]), (req, res, next) => paperCtrl.getOrderLifecycle(req, res, next));
paperTradingRouter.post("/paper/consensus", requireRole(["trader", "admin"]), (req, res, next) => paperCtrl.triggerAIConsensus(req, res, next));
paperTradingRouter.post("/paper/reset", requireRole(["trader", "admin"]), (req: any, res: any, next: any) => paperCtrl.resetPaperTradingData(req, res, next));
