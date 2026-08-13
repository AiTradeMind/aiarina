import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../../middleware/auth.ts";
import { researchEP03Service } from "../services/ResearchEP03Service.ts";

export class ResearchEP03Controller {
  
  async getTemplates(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await researchEP03Service.getTemplates();
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async createTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await researchEP03Service.createTemplate(req.body);
      res.status(201).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async updateTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await researchEP03Service.updateTemplate(id, req.body);
      res.status(200).json({ success: true, message: "Template updated successfully." });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async cloneTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.body;
      const data = await researchEP03Service.cloneTemplate(id);
      res.status(201).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async exportTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.body;
      const data = await researchEP03Service.exportTemplate(id);
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async importTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { json } = req.body;
      const data = await researchEP03Service.importTemplate(json);
      res.status(201).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async createTemplateVersion(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, changeLog } = req.body;
      await researchEP03Service.createTemplateVersion(id, changeLog || "Incremental upgrade");
      res.status(200).json({ success: true, message: "Template version saved successfully." });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async runScan(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { templateId, scanType, params } = req.body;
      const result = await researchEP03Service.runScan(templateId, scanType || 'MANUAL', params || {});
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await researchEP03Service.getQueue();
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getWatchlistsGroups(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await researchEP03Service.getWatchlistGroups();
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async createWatchlistGroup(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await researchEP03Service.createWatchlistGroup(req.body);
      res.status(201).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getAlertRules(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await researchEP03Service.getAlertRules();
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async createAlertRule(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await researchEP03Service.createAlertRule(req.body);
      res.status(201).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getAlertHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await researchEP03Service.getAcknowledgements();
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async acknowledgeAlert(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, status } = req.body;
      await researchEP03Service.acknowledgeAlert(id, status || 'ACKNOWLEDGED');
      res.status(200).json({ success: true, message: "Alert acknowledged successfully." });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async snoozeAlert(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, snoozedUntil } = req.body;
      await researchEP03Service.acknowledgeAlert(id, 'SNOOZED', snoozedUntil);
      res.status(200).json({ success: true, message: "Alert snoozed successfully." });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getAlertMetrics(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await researchEP03Service.getMetrics();
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async simulateTriggers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const count = await researchEP03Service.generateMarketTriggers();
      res.status(200).json({ success: true, triggeredCount: count });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

export const researchEP03Controller = new ResearchEP03Controller();
