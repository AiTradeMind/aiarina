import { Router } from "express";
import { ep05TradeJournalController } from "../controllers/ep05.controller.ts";
import { requireRole } from "../../../middleware/auth.ts";

export const ep05TradesRouter = Router();

ep05TradesRouter.get("/", requireRole(["trader", "admin", "analyst"]), ep05TradeJournalController.getTrades as any);
ep05TradesRouter.get("/open", requireRole(["trader", "admin", "analyst"]), ep05TradeJournalController.getOpenTrades as any);
ep05TradesRouter.get("/closed", requireRole(["trader", "admin", "analyst"]), ep05TradeJournalController.getClosedTrades as any);
ep05TradesRouter.get("/:id", requireRole(["trader", "admin", "analyst"]), ep05TradeJournalController.getTradeById as any);

export const ep05PnlRouter = Router();
ep05PnlRouter.get("/history", requireRole(["trader", "admin", "analyst"]), ep05TradeJournalController.getPnlHistory as any);
ep05PnlRouter.get("/statistics", requireRole(["trader", "admin", "analyst"]), ep05TradeJournalController.getPnlStatistics as any);
