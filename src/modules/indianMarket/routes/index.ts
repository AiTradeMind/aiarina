import { Router } from "express";
import { IndianMarketController } from "../controllers/IndianMarketController.ts";

export const indianMarketRouter = Router();
const indianMarketCtrl = new IndianMarketController();

// MODULE 17 - Enterprise API Endpoints
indianMarketRouter.get("/indian-market/calendar", (req, res, next) => indianMarketCtrl.getCalendar(req, res, next));
indianMarketRouter.post("/indian-market/calendar", (req, res, next) => indianMarketCtrl.addCalendarDay(req, res, next));
indianMarketRouter.delete("/indian-market/calendar/:date", (req, res, next) => indianMarketCtrl.deleteCalendarDay(req, res, next));

indianMarketRouter.get("/indian-market/session", (req, res, next) => indianMarketCtrl.getSessions(req, res, next));
indianMarketRouter.post("/indian-market/session", (req, res, next) => indianMarketCtrl.configureSession(req, res, next));

indianMarketRouter.get("/indian-market/clock", (req, res, next) => indianMarketCtrl.getClock(req, res, next));
indianMarketRouter.post("/indian-market/clock/sync", (req, res, next) => indianMarketCtrl.syncClock(req, res, next));

indianMarketRouter.get("/indian-market/status", (req, res, next) => indianMarketCtrl.getStatus(req, res, next));

indianMarketRouter.get("/indian-market/settlement", (req, res, next) => indianMarketCtrl.getSettlement(req, res, next));
indianMarketRouter.post("/indian-market/settlement/reconcile", (req, res, next) => indianMarketCtrl.runSettlement(req, res, next));

indianMarketRouter.get("/indian-market/expiry", (req, res, next) => indianMarketCtrl.getExpiry(req, res, next));

indianMarketRouter.get("/indian-market/policies", (req, res, next) => indianMarketCtrl.getPolicies(req, res, next));
indianMarketRouter.post("/indian-market/policies", (req, res, next) => indianMarketCtrl.updatePolicy(req, res, next));

indianMarketRouter.get("/indian-market/circuits", (req, res, next) => indianMarketCtrl.getCircuits(req, res, next));
indianMarketRouter.post("/indian-market/circuits/halt", (req, res, next) => indianMarketCtrl.triggerHalt(req, res, next));
indianMarketRouter.post("/indian-market/circuits/recover", (req, res, next) => indianMarketCtrl.recoverHalt(req, res, next));

indianMarketRouter.get("/indian-market/auctions", (req, res, next) => indianMarketCtrl.getAuctions(req, res, next));
indianMarketRouter.post("/indian-market/auctions/state", (req, res, next) => indianMarketCtrl.updateAuction(req, res, next));

indianMarketRouter.get("/indian-market/corporate-actions", (req, res, next) => indianMarketCtrl.getCorporateActions(req, res, next));
indianMarketRouter.post("/indian-market/corporate-actions/apply", (req, res, next) => indianMarketCtrl.applyCorporateAction(req, res, next));

indianMarketRouter.post("/indian-market/validate", (req, res, next) => indianMarketCtrl.validateRuntime(req, res, next));
indianMarketRouter.get("/indian-market/events", (req, res, next) => indianMarketCtrl.getEvents(req, res, next));
indianMarketRouter.post("/indian-market/sync", (req, res, next) => indianMarketCtrl.syncRuntime(req, res, next));
