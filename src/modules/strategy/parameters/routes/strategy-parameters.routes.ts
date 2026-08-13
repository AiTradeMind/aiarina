import { Router } from "express";
import { StrategyParametersController } from "../controllers/strategy-parameters.controller.ts";

export const strategyParametersRouter = Router();
const controller = new StrategyParametersController();

// Specific GET Routes
strategyParametersRouter.get("/overview/:strategyId", controller.getParameters);
strategyParametersRouter.get("/runtime/:strategyId", controller.getRuntimeApprovedParameters);
strategyParametersRouter.get("/presets/:strategyId", controller.getPresets);
strategyParametersRouter.get("/export/:strategyId", controller.exportParameters);

// Wildcard GET
strategyParametersRouter.get("/:strategyId", controller.getParameters);

// POST /api/strategy/parameters
strategyParametersRouter.post("/", controller.updateParameters);

// POST /api/strategy/parameters/reset
strategyParametersRouter.post("/reset", controller.resetParameters);

// POST /api/strategy/parameters/lock
strategyParametersRouter.post("/lock", controller.lockParameter);

// POST /api/strategy/parameters/bulk
strategyParametersRouter.post("/bulk", controller.bulkOperation);

// POST /api/strategy/parameters/restore-version
strategyParametersRouter.post("/restore-version", controller.restoreVersion);

// POST /api/strategy/parameters/simulate-risk
strategyParametersRouter.post("/simulate-risk", controller.simulateRisk);

// Presets Routes
strategyParametersRouter.post("/preset/apply", controller.applyPreset);
strategyParametersRouter.post("/preset/create", controller.createPreset);
strategyParametersRouter.put("/preset/:presetId", controller.updatePreset);
strategyParametersRouter.post("/preset/duplicate", controller.duplicatePreset);
strategyParametersRouter.delete("/preset/:presetId", controller.deletePreset);

// Export & Import
strategyParametersRouter.get("/export/:strategyId", controller.exportParameters);
strategyParametersRouter.post("/import", controller.importParameters);
