import { Request, Response } from "express";
import { BrainManagerService } from "../services";

const brainManager = new BrainManagerService();

export class BrainController {
  async getStatus(req: Request, res: Response) {
    try {
      const status = await brainManager.getStatus();
      res.json(status);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getTasks(req: Request, res: Response) {
    try {
      const tasks = await brainManager.getTasks();
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getHistory(req: Request, res: Response) {
    try {
      const history = await brainManager.getHistory();
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async analyzeRequest(req: Request, res: Response) {
    try {
      const { intent, context, options } = req.body;
      if (!intent) return res.status(400).json({ error: "Intent is required" });
      const task = await brainManager.analyzeRequest({ intent, context, options });
      res.status(201).json(task);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async planConsensus(req: Request, res: Response) {
    try {
      const { taskId, requiredModels } = req.body;
      if (!taskId || !requiredModels) return res.status(400).json({ error: "taskId and requiredModels are required" });
      const plan = await brainManager.planConsensus(taskId, requiredModels);
      res.status(201).json(plan);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async assignTask(req: Request, res: Response) {
    try {
      const { taskId, modelId, role } = req.body;
      if (!taskId || !modelId || !role) return res.status(400).json({ error: "taskId, modelId, and role are required" });
      const assignment = await brainManager.assignTask(taskId, modelId, role);
      res.status(201).json(assignment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
