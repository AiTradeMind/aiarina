import { Request, Response } from 'express';
import { EnterpriseObservabilityService } from '../services/observability.service';

export class EnterpriseObservabilityController {
  public static getDashboard(req: Request, res: Response): void {
    try {
      const data = EnterpriseObservabilityService.getDashboardOverview();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getMetrics(req: Request, res: Response): void {
    try {
      const data = EnterpriseObservabilityService.getMetrics();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getTraces(req: Request, res: Response): void {
    try {
      const data = EnterpriseObservabilityService.getTraces();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getLogs(req: Request, res: Response): void {
    try {
      const data = EnterpriseObservabilityService.getLogs();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getPerformance(req: Request, res: Response): void {
    try {
      const data = EnterpriseObservabilityService.getPerformanceSummary();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getErrors(req: Request, res: Response): void {
    try {
      const data = EnterpriseObservabilityService.getErrors();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getCapacity(req: Request, res: Response): void {
    try {
      const data = EnterpriseObservabilityService.getCapacityForecasts();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getSlo(req: Request, res: Response): void {
    try {
      const data = EnterpriseObservabilityService.getSloTargets();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getTelemetry(req: Request, res: Response): void {
    try {
      const data = EnterpriseObservabilityService.getTelemetryTrends();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getAudit(req: Request, res: Response): void {
    try {
      const data = EnterpriseObservabilityService.getAuditLogs();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getQaReport(req: Request, res: Response): void {
    try {
      const data = EnterpriseObservabilityService.runEp24QaSuite();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
