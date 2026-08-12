import { Request, Response } from 'express';
import { EnterpriseReleaseService } from '../services/releases.service';

export class EnterpriseReleaseController {
  public static getDashboard(req: Request, res: Response): void {
    try {
      const data = EnterpriseReleaseService.getDashboardOverview();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getEnvironments(req: Request, res: Response): void {
    try {
      const data = EnterpriseReleaseService.getEnvironments();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getReleases(req: Request, res: Response): void {
    try {
      const data = EnterpriseReleaseService.getReleases();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getVersions(req: Request, res: Response): void {
    try {
      const data = EnterpriseReleaseService.getVersions();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getDeployments(req: Request, res: Response): void {
    try {
      const data = EnterpriseReleaseService.getDeployments();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getConfigurations(req: Request, res: Response): void {
    try {
      const data = EnterpriseReleaseService.getConfigurations();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getAudit(req: Request, res: Response): void {
    try {
      const data = EnterpriseReleaseService.getAuditLogs();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getApprovals(req: Request, res: Response): void {
    try {
      const data = EnterpriseReleaseService.getApprovals();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getRollbacks(req: Request, res: Response): void {
    try {
      const data = EnterpriseReleaseService.getRollbacks();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getWorkers(req: Request, res: Response): void {
    try {
      const data = EnterpriseReleaseService.getWorkers();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static deploy(req: Request, res: Response): void {
    try {
      const { environment, version, releaseId } = req.body || {};
      const data = EnterpriseReleaseService.triggerDeploy(environment, version, releaseId);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static rollback(req: Request, res: Response): void {
    try {
      const { environment, targetVersion } = req.body || {};
      const data = EnterpriseReleaseService.executeRollback(environment, targetVersion);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static approve(req: Request, res: Response): void {
    try {
      const { releaseId, approverRole, decision, comments } = req.body || {};
      const data = EnterpriseReleaseService.approveRelease(releaseId, approverRole, decision, comments);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getQaReport(req: Request, res: Response): void {
    try {
      const data = EnterpriseReleaseService.runEp29QaSuite();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
