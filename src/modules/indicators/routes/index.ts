import { Router } from "express";
import { indicatorController } from "../controllers/IndicatorController.ts";

export const indicatorsRouter = Router();

// Definitions
indicatorsRouter.get("/definitions", indicatorController.getDefinitions);
indicatorsRouter.post("/definitions", indicatorController.createDefinition);

// Core Report (Consolidated indicator calculation + multi-indicator signal consensus)
indicatorsRouter.get("/report", indicatorController.getReport);

// Multi-Timeframe Analysis Matrix
indicatorsRouter.get("/multi-timeframe", indicatorController.getMultiTimeframe);

// Dynamic Calculations
indicatorsRouter.post("/calculate", indicatorController.calculateDynamic);

// Signal queries
indicatorsRouter.get("/signals", indicatorController.getSignals);
indicatorsRouter.get("/signals/history", indicatorController.getSignalHistory);

// Health Monitoring Metrics
indicatorsRouter.get("/health", indicatorController.getHealth);
