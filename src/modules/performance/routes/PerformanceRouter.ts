import { Router } from "express";
import { performanceController } from "../controllers/PerformanceController.ts";
import { requireRole } from "../../../middleware/auth.ts";

export const ep07PerformanceRouter = Router();

// Part 7: API endpoints
ep07PerformanceRouter.get("/", requireRole(["admin", "analyst"]), performanceController.getPerformance as any);
ep07PerformanceRouter.get("/ai", requireRole(["admin", "analyst"]), (req, res, next) => { req.query.entityType = 'AI_MODEL'; performanceController.getPerformance(req as any, res) });
ep07PerformanceRouter.get("/strategies", requireRole(["admin", "analyst"]), (req, res, next) => { req.query.entityType = 'STRATEGY'; performanceController.getPerformance(req as any, res) });
ep07PerformanceRouter.get("/markets", requireRole(["admin", "analyst"]), (req, res, next) => { req.query.entityType = 'MARKET'; performanceController.getPerformance(req as any, res) });
ep07PerformanceRouter.get("/history", requireRole(["admin", "analyst"]), performanceController.getHistory as any);
