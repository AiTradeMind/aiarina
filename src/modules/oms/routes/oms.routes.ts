import { Router } from "express";
import { OMSController } from "../controllers/oms.controller.ts";
import { requireRole } from "../../../middleware/auth.ts";

export const omsRouter = Router();
const omsCtrl = new OMSController();

// Phase 2.10 OMS APIs
omsRouter.get("/oms", requireRole(["trader", "admin", "analyst"]), (req, res, next) => omsCtrl.getOrders(req, res, next));
omsRouter.get("/oms/queue", requireRole(["trader", "admin", "analyst"]), (req, res, next) => omsCtrl.getQueue(req, res, next));
omsRouter.get("/oms/history", requireRole(["trader", "admin", "analyst"]), (req, res, next) => omsCtrl.getHistory(req, res, next));
omsRouter.get("/oms/health", requireRole(["trader", "admin", "analyst"]), (req, res, next) => omsCtrl.getHealth(req, res, next));
omsRouter.get("/oms/:id", requireRole(["trader", "admin", "analyst"]), (req, res, next) => omsCtrl.getOrder(req, res, next));

omsRouter.post("/oms/create", requireRole(["trader", "admin"]), (req, res, next) => omsCtrl.createOrder(req, res, next));
omsRouter.post("/oms/cancel", requireRole(["trader", "admin"]), (req, res, next) => omsCtrl.cancelOrder(req, res, next));
omsRouter.post("/oms/expire", requireRole(["trader", "admin"]), (req, res, next) => omsCtrl.expireOrder(req, res, next));
omsRouter.post("/oms/retry", requireRole(["trader", "admin"]), (req, res, next) => omsCtrl.retryOrder(req, res, next));

// Legacy compatibility routes
omsRouter.post("/orders", requireRole(["trader", "admin", "analyst"]), (req, res, next) => omsCtrl.processDecisionPackage(req, res, next));
omsRouter.post("/orders/cancel", requireRole(["trader", "admin"]), (req, res, next) => omsCtrl.cancelOrder(req, res, next));
omsRouter.get("/orders", requireRole(["trader", "admin", "analyst"]), (req, res, next) => omsCtrl.getOrders(req, res, next));
omsRouter.get("/orders/book", requireRole(["trader", "admin", "analyst"]), (req, res, next) => omsCtrl.getOrderBook(req, res, next));
omsRouter.get("/orders/queue", requireRole(["trader", "admin", "analyst"]), (req, res, next) => omsCtrl.getQueue(req, res, next));
omsRouter.get("/orders/events", requireRole(["trader", "admin", "analyst"]), (req, res, next) => omsCtrl.getEvents(req, res, next));
omsRouter.get("/orders/:id", requireRole(["trader", "admin", "analyst"]), (req, res, next) => omsCtrl.getOrder(req, res, next));
