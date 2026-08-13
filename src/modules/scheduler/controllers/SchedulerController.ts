import { Request, Response } from "express";
import { schedulerService } from "../services/SchedulerService";
import { AuthenticatedRequest } from "../../../middleware/auth";

export class SchedulerController {
  async getStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    const result = await schedulerService.getStatus();
    res.json({ status: "success", data: result });
  }

  async createSchedule(req: AuthenticatedRequest, res: Response): Promise<void> {
    const result = await schedulerService.createSchedule(req.body);
    res.json({ status: "success", data: result });
  }

  async runSchedule(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.body;
    const result = await schedulerService.runSchedule(id);
    res.json({ status: "success", data: result });
  }

  async pauseSchedule(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.body;
    const result = await schedulerService.pauseSchedule(id);
    res.json({ status: "success", data: result });
  }

  async resumeSchedule(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.body;
    const result = await schedulerService.resumeSchedule(id);
    res.json({ status: "success", data: result });
  }

  async cancelSchedule(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.body;
    const result = await schedulerService.cancelSchedule(id);
    res.json({ status: "success", data: result });
  }
}

export const schedulerController = new SchedulerController();
