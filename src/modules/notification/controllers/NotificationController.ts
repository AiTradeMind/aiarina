import { Request, Response } from "express";
import { notificationService } from "../services/NotificationService";
import { AuthenticatedRequest } from "../../../middleware/auth";

export class NotificationController {
  async getStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    const result = await notificationService.getStatus();
    res.json({ status: "success", data: result });
  }

  async sendNotification(req: AuthenticatedRequest, res: Response): Promise<void> {
    const result = await notificationService.sendNotification(req.body);
    res.json({ status: "success", data: result });
  }

  async retryNotification(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.body;
    const result = await notificationService.retryNotification(id);
    res.json({ status: "success", data: result });
  }

  async cancelNotification(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.body;
    const result = await notificationService.cancelNotification(id);
    res.json({ status: "success", data: result });
  }
}

export const notificationController = new NotificationController();
