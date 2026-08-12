import { Router, Request, Response, NextFunction } from "express";
import { StrategyFoundationController } from "../controllers/strategy-foundation.controller.ts";

export const strategyFoundationRouter = Router();
const controller = StrategyFoundationController.getInstance();

const RESERVED_KEYWORDS = new Set([
  "health",
  "status",
  "signals",
  "history",
  "evaluate",
  "activate",
  "pause",
  "disable",
  "create",
  "lifecycle",
  "builder",
  "versioning",
  "optimizer",
  "backtesting",
  "leaderboard",
  "marketplace",
  "governance",
  "analytics",
  "library",
  "ranking",
  "candidates",
  "runtime",
  "all",
  "events",
  "audits",
  "queue",
  "parameters",
  "toggle-status",
]);

// Explicit Routes
strategyFoundationRouter.get("/", (req: Request, res: Response) => controller.getStrategies(req, res));
strategyFoundationRouter.get("/health", (req: Request, res: Response) => controller.getHealth(req, res));
strategyFoundationRouter.get("/signals", (req: Request, res: Response) => controller.getSignals(req, res));
strategyFoundationRouter.get("/history", (req: Request, res: Response) => controller.getHistory(req, res));

strategyFoundationRouter.post("/evaluate", (req: Request, res: Response) => controller.evaluateStrategy(req, res));
strategyFoundationRouter.post("/create", (req: Request, res: Response) => controller.createStrategy(req, res));
strategyFoundationRouter.post("/activate", (req: Request, res: Response) => controller.activateStrategy(req, res));
strategyFoundationRouter.post("/pause", (req: Request, res: Response) => controller.pauseStrategy(req, res));
strategyFoundationRouter.post("/disable", (req: Request, res: Response) => controller.disableStrategy(req, res));

strategyFoundationRouter.post("/:id/activate", (req: Request, res: Response) => controller.activateStrategy(req, res));
strategyFoundationRouter.post("/:id/pause", (req: Request, res: Response) => controller.pauseStrategy(req, res));
strategyFoundationRouter.post("/:id/disable", (req: Request, res: Response) => controller.disableStrategy(req, res));

// Parametric Route GET /:id with middleware check for reserved subpath keywords
strategyFoundationRouter.get("/:id", (req: Request, res: Response, next: NextFunction) => {
  if (RESERVED_KEYWORDS.has(req.params.id)) {
    return next();
  }
  return controller.getStrategyById(req, res);
});
