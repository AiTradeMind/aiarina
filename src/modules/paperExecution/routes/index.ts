import { Router } from "express";
import { PaperExecutionController } from "../controllers/index.ts";
import { requireRole } from "../../../middleware/auth.ts";

export const paperExecutionEngineRouter = Router();
const ctrl = new PaperExecutionController();

paperExecutionEngineRouter.post("/simulate", requireRole(["trader", "admin", "admin"]), (req, res, next) => ctrl.simulateExecution(req, res, next));
paperExecutionEngineRouter.get("/", requireRole(["trader", "admin", "analyst"]), (req, res, next) => ctrl.getExecutions(req, res, next));
paperExecutionEngineRouter.get("/runtime", requireRole(["trader", "admin", "analyst"]), (req, res, next) => ctrl.getRuntime(req, res, next));
paperExecutionEngineRouter.get("/fills", requireRole(["trader", "admin", "analyst"]), (req, res, next) => ctrl.getFills(req, res, next));
paperExecutionEngineRouter.get("/audit", requireRole(["trader", "admin", "analyst"]), (req, res, next) => ctrl.getAudit(req, res, next));
paperExecutionEngineRouter.get("/:id", requireRole(["trader", "admin", "analyst"]), (req, res, next) => ctrl.getExecution(req, res, next));
