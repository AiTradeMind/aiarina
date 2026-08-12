import { Router } from "express";
import { EventController } from "../controllers/index.ts";
import {  } from "../../../middleware/auth.ts";

export const eventRouter = Router();
const eventCtrl = new EventController();

eventRouter.get("/events", (req, res, next) => eventCtrl.getEvents(req, res, next));
eventRouter.get("/audit", (req, res, next) => eventCtrl.getAuditLog(req, res, next));
eventRouter.get("/notifications", (req, res, next) => eventCtrl.getNotifications(req, res, next));
eventRouter.put("/notifications/:id/read", (req, res, next) => eventCtrl.markNotificationRead(req, res, next));
