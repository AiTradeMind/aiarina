import { Request, Response } from 'express';
import { EnterpriseCertificationService } from '../services/certification.service';

export class EnterpriseCertificationController {
  public static getDashboard(req: Request, res: Response): void {
    try {
      const data = EnterpriseCertificationService.getDashboardOverview();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getResults(req: Request, res: Response): void {
    try {
      const data = EnterpriseCertificationService.getResults();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getScorecard(req: Request, res: Response): void {
    try {
      const data = EnterpriseCertificationService.getScorecard();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getEvidence(req: Request, res: Response): void {
    try {
      const data = EnterpriseCertificationService.getEvidence();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getAudit(req: Request, res: Response): void {
    try {
      const data = EnterpriseCertificationService.getAuditLogs();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static runCertification(req: Request, res: Response): void {
    try {
      const data = EnterpriseCertificationService.triggerCertificationRun();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static exportCertificate(req: Request, res: Response): void {
    try {
      const data = EnterpriseCertificationService.exportCertificate();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getQaReport(req: Request, res: Response): void {
    try {
      const data = EnterpriseCertificationService.runEp30QaSuite();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
