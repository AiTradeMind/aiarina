import { Request, Response } from 'express';
import { EnterpriseBackupService } from '../services/backup.service';
import { EnterpriseBackupValidator } from '../validators/backup.validator';

export class EnterpriseBackupController {
  // GET /api/backup & /api/backup/status
  public static getStatus(req: Request, res: Response): void {
    try {
      const data = EnterpriseBackupService.getStatusOverview();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // GET /api/backup/jobs
  public static getJobs(req: Request, res: Response): void {
    try {
      const data = EnterpriseBackupService.getJobs();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // GET /api/backup/history
  public static getHistory(req: Request, res: Response): void {
    try {
      const data = EnterpriseBackupService.getHistory();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // GET /api/backup/snapshots
  public static getSnapshots(req: Request, res: Response): void {
    try {
      const data = EnterpriseBackupService.getSnapshots();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // GET /api/backup/retention
  public static getRetention(req: Request, res: Response): void {
    try {
      const data = EnterpriseBackupService.getRetentionPolicies();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // GET /api/backup/recovery
  public static getRecovery(req: Request, res: Response): void {
    try {
      const data = EnterpriseBackupService.getRecoveryPlans();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // GET /api/backup/reports
  public static getReports(req: Request, res: Response): void {
    try {
      const data = EnterpriseBackupService.getReports();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // GET /api/backup/validation
  public static getValidation(req: Request, res: Response): void {
    try {
      const data = EnterpriseBackupService.getValidations();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // GET /api/backup/integrity
  public static getIntegrity(req: Request, res: Response): void {
    try {
      const data = EnterpriseBackupService.getIntegrity();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // Backward compatible GET endpoints
  public static getDashboard(req: Request, res: Response): void {
    try {
      const data = EnterpriseBackupService.getDashboardOverview();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getPolicies(req: Request, res: Response): void {
    try {
      const data = EnterpriseBackupService.getPolicies();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getRestore(req: Request, res: Response): void {
    try {
      const data = EnterpriseBackupService.getRestores();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getCertificates(req: Request, res: Response): void {
    try {
      const data = EnterpriseBackupService.getCertificates();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getAudit(req: Request, res: Response): void {
    try {
      const data = EnterpriseBackupService.getAuditLogs();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getQaReport(req: Request, res: Response): void {
    try {
      const data = EnterpriseBackupService.runEp25QaSuite();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // POST Endpoints
  // POST /api/backup/create
  public static createBackup(req: Request, res: Response): void {
    try {
      const validation = EnterpriseBackupValidator.validateCreateBackup(req.body);
      if (!validation.valid) {
        res.status(400).json({ success: false, error: validation.error });
        return;
      }
      const data = EnterpriseBackupService.triggerBackup(req.body);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // POST /api/backup/restore
  public static executeRestore(req: Request, res: Response): void {
    try {
      const validation = EnterpriseBackupValidator.validateRestore(req.body);
      if (!validation.valid) {
        res.status(400).json({ success: false, error: validation.error });
        return;
      }
      const { snapshotId, restoreType } = req.body || {};
      const data = EnterpriseBackupService.triggerRestore(snapshotId, restoreType);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // POST /api/backup/verify
  public static verifyBackup(req: Request, res: Response): void {
    try {
      const { snapshotId } = req.body || {};
      const data = EnterpriseBackupService.verifyBackup(snapshotId);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // POST /api/backup/simulate
  public static simulateRecovery(req: Request, res: Response): void {
    try {
      const { planId } = req.body || {};
      const data = EnterpriseBackupService.simulateRecovery(planId);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // POST /api/backup/export
  public static exportBackup(req: Request, res: Response): void {
    try {
      const { snapshotId } = req.body || {};
      const data = EnterpriseBackupService.exportMetadata(snapshotId);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
