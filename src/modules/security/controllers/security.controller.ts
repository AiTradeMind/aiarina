import { Request, Response } from 'express';
import { EnterpriseSocService } from '../services/security.service';
import { securityService } from '../services/SecurityService';

export class EnterpriseSocController {
  public static getDashboard(req: Request, res: Response): void {
    try {
      const data = EnterpriseSocService.getDashboardOverview();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getThreats(req: Request, res: Response): void {
    try {
      const data = EnterpriseSocService.getThreats();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getIntrusions(req: Request, res: Response): void {
    try {
      const data = EnterpriseSocService.getIntrusions();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getVulnerabilities(req: Request, res: Response): void {
    try {
      const data = EnterpriseSocService.getVulnerabilities();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getSecrets(req: Request, res: Response): void {
    try {
      const data = EnterpriseSocService.getSecrets();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getPolicies(req: Request, res: Response): void {
    try {
      const data = EnterpriseSocService.getPolicies();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getIncidents(req: Request, res: Response): void {
    try {
      const data = EnterpriseSocService.getIncidents();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getAlerts(req: Request, res: Response): void {
    try {
      const data = EnterpriseSocService.getAlerts();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getAudit(req: Request, res: Response): void {
    try {
      const data = EnterpriseSocService.getAuditLogs();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getWorkers(req: Request, res: Response): void {
    try {
      const data = EnterpriseSocService.getWorkers();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static triggerScan(req: Request, res: Response): void {
    try {
      const data = EnterpriseSocService.triggerSecurityScan();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static rotateKeys(req: Request, res: Response): void {
    try {
      const keyId = req.body?.keyId;
      const data = EnterpriseSocService.rotateKeys(keyId);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getQaReport(req: Request, res: Response): void {
    try {
      const data = EnterpriseSocService.runEp28QaSuite();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const data = await securityService.getStatus();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async verifyAccess(req: Request, res: Response): Promise<void> {
    try {
      const data = await securityService.verifyAccess(req.body);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
