import { Router } from "express";
import { PMSController } from "../controllers/index.ts";
import { requireRole } from "../../../middleware/auth.ts";

export const pmsRouter = Router();
const pmsCtrl = new PMSController();

pmsRouter.get("/portfolio", requireRole(["trader", "admin", "analyst", "admin"]), (req, res, next) => pmsCtrl.getPortfolios(req, res, next));
pmsRouter.get("/portfolio/:id", requireRole(["trader", "admin", "analyst", "admin"]), (req, res, next) => pmsCtrl.getPortfolio(req, res, next));
pmsRouter.get("/positions", requireRole(["trader", "admin", "analyst", "admin"]), (req, res, next) => pmsCtrl.getPositions(req, res, next));
pmsRouter.get("/holdings", requireRole(["trader", "admin", "analyst", "admin"]), (req, res, next) => pmsCtrl.getHoldings(req, res, next));
pmsRouter.get("/exposure", requireRole(["trader", "admin", "analyst", "admin"]), (req, res, next) => pmsCtrl.getExposure(req, res, next));
pmsRouter.get("/performance", requireRole(["trader", "admin", "analyst", "admin"]), (req, res, next) => pmsCtrl.getPerformance(req, res, next));
pmsRouter.get("/pnl", requireRole(["trader", "admin", "analyst", "admin"]), (req, res, next) => pmsCtrl.getPnL(req, res, next));
