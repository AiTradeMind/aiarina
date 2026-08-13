import { Router } from "express";
import { RMSController } from "../controllers/index.ts";
import { requireRole } from "../../../middleware/auth.ts";

export const rmsRouter = Router();
const rmsCtrl = new RMSController();

rmsRouter.get("/dashboard", requireRole(["trader", "admin", "analyst", "admin"]), (req, res, next) => rmsCtrl.getDashboard(req, res, next));
rmsRouter.get("/profile", requireRole(["trader", "admin", "analyst", "admin"]), (req, res, next) => rmsCtrl.getProfile(req, res, next));
rmsRouter.get("/exposure", requireRole(["trader", "admin", "analyst", "admin"]), (req, res, next) => rmsCtrl.getExposure(req, res, next));
rmsRouter.get("/margin", requireRole(["trader", "admin", "analyst", "admin"]), (req, res, next) => rmsCtrl.getMargin(req, res, next));
rmsRouter.get("/limits", requireRole(["trader", "admin", "analyst", "admin"]), (req, res, next) => rmsCtrl.getLimits(req, res, next));
rmsRouter.post("/validate", requireRole(["trader", "admin", "admin"]), (req, res, next) => rmsCtrl.validateOrder(req, res, next));
rmsRouter.post("/kill-switch", requireRole(["admin", "admin"]), (req, res, next) => rmsCtrl.killSwitch(req, res, next));
