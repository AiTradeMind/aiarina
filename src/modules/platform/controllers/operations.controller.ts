import { Request, Response, NextFunction } from 'express';
import { OperationsService } from '../services/operations.service';

export class OperationsController {
  public getDashboard(req: Request, res: Response, next: NextFunction): void {
    try {
      const data = OperationsService.getDashboardOverview();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  public getServices(req: Request, res: Response, next: NextFunction): void {
    try {
      const services = OperationsService.getServices();
      res.json({ success: true, count: services.length, data: services });
    } catch (error) {
      next(error);
    }
  }

  public getRuntime(req: Request, res: Response, next: NextFunction): void {
    try {
      const runtime = OperationsService.getRuntime();
      res.json({ success: true, data: runtime });
    } catch (error) {
      next(error);
    }
  }

  public getQueues(req: Request, res: Response, next: NextFunction): void {
    try {
      const queues = OperationsService.getQueues();
      res.json({ success: true, data: queues });
    } catch (error) {
      next(error);
    }
  }

  public getIncidents(req: Request, res: Response, next: NextFunction): void {
    try {
      const incidents = OperationsService.getIncidents();
      res.json({ success: true, count: incidents.length, data: incidents });
    } catch (error) {
      next(error);
    }
  }

  public createIncident(req: Request, res: Response, next: NextFunction): void {
    try {
      const { title, severity, affectedService, author } = req.body;
      if (!title || !severity || !affectedService) {
        res.status(400).json({ success: false, message: 'title, severity, and affectedService are required' });
        return;
      }
      const newInc = OperationsService.createIncident({ title, severity, affectedService, author });
      res.status(201).json({ success: true, data: newInc });
    } catch (error) {
      next(error);
    }
  }

  public createMaintenance(req: Request, res: Response, next: NextFunction): void {
    try {
      const { title, mode, targetModule, scheduledMinutes, author } = req.body;
      if (!title || !mode) {
        res.status(400).json({ success: false, message: 'title and mode are required' });
        return;
      }
      const newMnt = OperationsService.setMaintenance({ title, mode, targetModule, scheduledMinutes, author });
      res.status(201).json({ success: true, data: newMnt });
    } catch (error) {
      next(error);
    }
  }

  public getHealth(req: Request, res: Response, next: NextFunction): void {
    try {
      const health = OperationsService.getHealthBreakdown();
      res.json({ success: true, data: health });
    } catch (error) {
      next(error);
    }
  }

  public getFeatureFlags(req: Request, res: Response, next: NextFunction): void {
    try {
      const flags = OperationsService.getFeatureFlags();
      res.json({ success: true, count: flags.length, data: flags });
    } catch (error) {
      next(error);
    }
  }

  public toggleFeatureFlag(req: Request, res: Response, next: NextFunction): void {
    try {
      const { flagId } = req.body;
      if (!flagId) {
        res.status(400).json({ success: false, message: 'flagId is required' });
        return;
      }
      const result = OperationsService.toggleFeatureFlag(flagId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  public getDiagnostics(req: Request, res: Response, next: NextFunction): void {
    try {
      const diags = OperationsService.runDiagnostics();
      res.json({ success: true, count: diags.length, data: diags });
    } catch (error) {
      next(error);
    }
  }

  public getAuditLogs(req: Request, res: Response, next: NextFunction): void {
    try {
      const logs = OperationsService.getAuditLogs();
      res.json({ success: true, count: logs.length, data: logs });
    } catch (error) {
      next(error);
    }
  }

  public getQaReport(req: Request, res: Response, next: NextFunction): void {
    try {
      const qa = OperationsService.runEp20QaSuite();
      res.json({ success: true, data: qa });
    } catch (error) {
      next(error);
    }
  }
}
