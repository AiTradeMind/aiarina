import { Response, NextFunction } from "express";
import { PaperExecutionService } from "../services/index.ts";
import { AuthenticatedRequest } from "../../../middleware/auth.ts";

const execService = new PaperExecutionService();

export class PaperExecutionController {
  async simulateExecution(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await execService.simulateExecution(req.body);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getExecutions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await execService.getExecutions();
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getExecution(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await execService.getExecution(id);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getFills(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const executionId = req.query.executionId ? parseInt(req.query.executionId as string, 10) : undefined;
      const result = await execService.getFills(executionId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getRuntime(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await execService.getRuntime();
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAudit(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const executionId = req.query.executionId ? parseInt(req.query.executionId as string, 10) : undefined;
      const result = await execService.getAudit(executionId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
