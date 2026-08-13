import { Request, Response } from 'express';
import { alertService } from '../services/AlertService.ts';

export class AlertController {
  public static async getAlerts(req: Request, res: Response): Promise<void> {
    try {
      const { severity, status, sourceModule, aiModelId, market, category, exchange, labId } = req.query;
      const alerts = await alertService.getAlerts({
        severity: severity as string,
        status: status as string,
        sourceModule: sourceModule as string,
        aiModelId: aiModelId as string,
        market: market as string,
        category: category as string,
        exchange: exchange as string,
        labId: labId as string,
      });
      res.json({ status: 'ok', data: alerts });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  public static async getAlertById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const alert = await alertService.getAlertById(id);
      if (!alert) {
        res.status(404).json({ status: 'error', message: `Alert ${id} not found` });
        return;
      }
      res.json({ status: 'ok', data: alert });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  public static async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updated = await alertService.markAsRead(id);
      res.json({ status: 'ok', message: 'Alert marked as read', data: updated });
    } catch (error: any) {
      res.status(404).json({ status: 'error', message: error.message });
    }
  }

  public static async acknowledgeAlert(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updated = await alertService.acknowledgeAlert(id);
      res.json({ status: 'ok', message: 'Alert acknowledged', data: updated });
    } catch (error: any) {
      res.status(404).json({ status: 'error', message: error.message });
    }
  }

  public static async resolveAlert(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updated = await alertService.resolveAlert(id);
      res.json({ status: 'ok', message: 'Alert resolved', data: updated });
    } catch (error: any) {
      res.status(404).json({ status: 'error', message: error.message });
    }
  }
}
