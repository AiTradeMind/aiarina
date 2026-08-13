import { Request, Response } from "express";
import { tradingOrchestrator } from "../engines/TradingOrchestrator.ts";
import { pipelineValidator } from "../validators/PipelineValidator.ts";
import { AuthenticatedRequest } from "../../../middleware/auth.ts";
import { orchestratorRepository } from "../repositories/OrchestratorRepository.ts";

export class OrchestratorController {
  public async getStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      res.status(200).json({ success: true, status: "RUNNING" });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  public async getJobs(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Mocked for now, normally we'd query repository for jobs
      res.status(200).json({ success: true, data: [] });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  public async runPipeline(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const payload = req.body;
      payload.organizationId = req.user?.organizationId || "org_dev_123";
      
      pipelineValidator.validate(payload);
      
      // We run this asynchronously or await based on requirements. Awaiting to give direct response.
      await tradingOrchestrator.run(payload);
      
      res.status(200).json({ success: true, message: "Pipeline execution completed." });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}

export const orchestratorController = new OrchestratorController();
