import { Request, Response } from 'express';
import { EnterpriseSchedulerService } from '../services/scheduler.service';

export class EnterpriseSchedulerController {
  public static getDashboard(req: Request, res: Response): void {
    try {
      const data = EnterpriseSchedulerService.getDashboardOverview();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getJobs(req: Request, res: Response): void {
    try {
      const data = EnterpriseSchedulerService.getJobs();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getSchedules(req: Request, res: Response): void {
    try {
      const data = EnterpriseSchedulerService.getSchedules();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getDependencies(req: Request, res: Response): void {
    try {
      const data = EnterpriseSchedulerService.getDependencies();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getRules(req: Request, res: Response): void {
    try {
      const data = EnterpriseSchedulerService.getRules();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getQueue(req: Request, res: Response): void {
    try {
      const data = EnterpriseSchedulerService.getQueue();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getRetries(req: Request, res: Response): void {
    try {
      const data = EnterpriseSchedulerService.getRetries();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getCalendar(req: Request, res: Response): void {
    try {
      const data = EnterpriseSchedulerService.getCalendar();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getAudit(req: Request, res: Response): void {
    try {
      const data = EnterpriseSchedulerService.getAuditLogs();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getWorkers(req: Request, res: Response): void {
    try {
      const data = EnterpriseSchedulerService.getWorkers();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static createJob(req: Request, res: Response): void {
    try {
      const data = EnterpriseSchedulerService.createJob(req.body);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static runJob(req: Request, res: Response): void {
    try {
      const { jobId } = req.body;
      const data = EnterpriseSchedulerService.runJob(jobId || 'SCH-JOB-101');
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static cancelJob(req: Request, res: Response): void {
    try {
      const { jobId } = req.body;
      const data = EnterpriseSchedulerService.cancelJob(jobId || 'SCH-JOB-101');
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getQaReport(req: Request, res: Response): void {
    try {
      const data = EnterpriseSchedulerService.runEp26QaSuite();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
