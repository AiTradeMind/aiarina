import { Router } from "express";
import { orchestratorController } from "../controllers/OrchestratorController.ts";
import { requireRole } from "../../../middleware/auth.ts";

export const orchestratorRouter = Router();

orchestratorRouter.get("/status", requireRole(["admin", "trader"]), orchestratorController.getStatus as any);
orchestratorRouter.get("/jobs", requireRole(["admin"]), orchestratorController.getJobs as any);
orchestratorRouter.post("/run", requireRole(["admin", "trader", "analyst"]), orchestratorController.runPipeline as any);
