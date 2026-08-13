import { Router } from "express";
import { TradeJournalController } from "../controllers/index.ts";
import { requireRole } from "../../../middleware/auth.ts";

export const tradeJournalRouter = Router();
const ctrl = new TradeJournalController();

tradeJournalRouter.get("/", requireRole(["trader", "admin", "analyst"]), (req, res, next) => ctrl.getTrades(req, res, next));
tradeJournalRouter.get("/journal", requireRole(["trader", "admin", "analyst"]), (req, res, next) => ctrl.getJournal(req, res, next));
tradeJournalRouter.get("/timeline", requireRole(["trader", "admin", "analyst"]), (req, res, next) => ctrl.getTimeline(req, res, next));
tradeJournalRouter.get("/replay", requireRole(["trader", "admin", "analyst"]), (req, res, next) => ctrl.getReplay(req, res, next));
tradeJournalRouter.get("/evidence", requireRole(["trader", "admin", "analyst"]), (req, res, next) => ctrl.getEvidence(req, res, next));
tradeJournalRouter.get("/performance", requireRole(["trader", "admin", "analyst"]), (req, res, next) => ctrl.getPerformance(req, res, next));
tradeJournalRouter.get("/:id", requireRole(["trader", "admin", "analyst"]), (req, res, next) => ctrl.getTrade(req, res, next));
