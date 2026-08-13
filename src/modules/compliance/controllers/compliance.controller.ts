import { Request, Response } from 'express';
import { EnterpriseComplianceService } from '../services/compliance.service';

export class EnterpriseComplianceController {
  public static getDashboard(req: Request, res: Response): void {
    try {
      const data = EnterpriseComplianceService.getDashboardOverview();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getRules(req: Request, res: Response): void {
    try {
      const data = EnterpriseComplianceService.getRulesList();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getPolicies(req: Request, res: Response): void {
    try {
      const data = EnterpriseComplianceService.getPoliciesList();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getValidations(req: Request, res: Response): void {
    try {
      const data = EnterpriseComplianceService.getValidationsList();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getViolations(req: Request, res: Response): void {
    try {
      const data = EnterpriseComplianceService.getViolationsList();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getExceptions(req: Request, res: Response): void {
    try {
      const data = EnterpriseComplianceService.getExceptionsList();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getEvidence(req: Request, res: Response): void {
    try {
      const data = EnterpriseComplianceService.getEvidenceList();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getReports(req: Request, res: Response): void {
    try {
      const data = EnterpriseComplianceService.getReportsList();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getCertificates(req: Request, res: Response): void {
    try {
      const data = EnterpriseComplianceService.getCertificatesList();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getAudit(req: Request, res: Response): void {
    try {
      const data = EnterpriseComplianceService.getAuditList();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static validate(req: Request, res: Response): void {
    try {
      const data = EnterpriseComplianceService.validateAllModules();
      res.json({ success: true, message: 'Compliance validation triggered successfully', data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static createException(req: Request, res: Response): void {
    try {
      const { ruleId, requestedBy, businessJustification } = req.body || {};
      if (!ruleId || !businessJustification) {
        res.status(400).json({ success: false, error: 'ruleId and businessJustification are required.' });
        return;
      }
      const data = EnterpriseComplianceService.createException({ ruleId, requestedBy, businessJustification });
      res.json({ success: true, message: 'Compliance exception request created and approved', data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getQaReport(req: Request, res: Response): void {
    try {
      const data = EnterpriseComplianceService.runEp23QaSuite();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
