import { Request, Response } from "express";
import { executionService } from "../services/ExecutionService.ts";
import { AuthenticatedRequest } from "../../../middleware/auth";

export class ExecutionController {
  // POST /api/executions/run
  public async runExecution(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const actorId = req.user?.userId || 1;
      const organizationId = req.user?.organizationId || "org_dev_123";
      
      const payload = { ...req.body, organizationId };
      const execution = await executionService.runExecution(actorId, payload);
      
      res.status(201).json({ success: true, data: execution });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // GET /api/executions
  public async getExecutions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const organizationId = req.user?.organizationId || "org_dev_123";
      const data = await executionService.getExecutions(organizationId);
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // GET /api/executions/:id
  public async getExecutionById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const organizationId = req.user?.organizationId || "org_dev_123";
      const data = await executionService.getExecutionById(req.params.id, organizationId);
      if (!data) {
        res.status(404).json({ error: "Execution not found" });
        return;
      }
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // GET /api/executions/:id/history
  public async getExecutionHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // In a real app we'd verify the execution belongs to the org first
      const data = await executionService.getExecutionHistory(req.params.id);
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}

export const executionController = new ExecutionController();
