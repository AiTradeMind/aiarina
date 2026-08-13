import { Request, Response } from 'express';
import { EnweService } from '../services/enwe.service';

export class EnweController {
  public static getNotifications(req: Request, res: Response): void {
    try {
      const { sourceModule, unreadOnly, category, priority } = req.query;
      const notifications = EnweService.getNotifications({
        sourceModule: sourceModule as string,
        unreadOnly: unreadOnly === 'true',
        category: category as string,
        priority: priority as string
      });
      res.json({ status: 'ok', data: notifications });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  public static getUnreadCount(req: Request, res: Response): void {
    try {
      const count = EnweService.getUnreadCount();
      res.json({ status: 'ok', data: { unreadCount: count } });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  public static markAsRead(req: Request, res: Response): void {
    try {
      const { id } = req.body;
      const result = EnweService.markAsRead(id || 'ALL');
      res.json({ status: 'ok', data: result });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  public static emitEvent(req: Request, res: Response): void {
    try {
      const { sourceModule, eventType, correlationId, priority, payload } = req.body;
      if (!sourceModule || !eventType) {
        res.status(400).json({ status: 'error', message: 'sourceModule and eventType are required' });
        return;
      }
      const result = EnweService.processEvent({
        sourceModule,
        eventType,
        correlationId,
        priority,
        payload
      });
      res.json({ status: 'ok', message: 'Event emitted to EP18 Event Bus', data: result });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  public static startWorkflow(req: Request, res: Response): void {
    try {
      const { name, type, sourceModule, correlationId, steps } = req.body;
      if (!name || !type || !sourceModule || !steps) {
        res.status(400).json({ status: 'error', message: 'name, type, sourceModule, and steps are required' });
        return;
      }
      const workflow = EnweService.startWorkflow({
        name,
        type,
        sourceModule,
        correlationId,
        steps
      });
      res.json({ status: 'ok', message: 'Workflow started', data: workflow });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  public static getWorkflows(req: Request, res: Response): void {
    try {
      const workflows = EnweService.getWorkflows();
      res.json({ status: 'ok', data: workflows });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  public static getWorkflowById(req: Request, res: Response): void {
    try {
      const { id } = req.params;
      const workflow = EnweService.getWorkflowById(id);
      if (!workflow) {
        res.status(404).json({ status: 'error', message: `Workflow ${id} not found` });
        return;
      }
      res.json({ status: 'ok', data: workflow });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  public static approveWorkflow(req: Request, res: Response): void {
    try {
      const { workflowId, approverRole, comments } = req.body;
      if (!workflowId) {
        res.status(400).json({ status: 'error', message: 'workflowId is required' });
        return;
      }
      const result = EnweService.approveWorkflow(workflowId, approverRole || 'CHIEF_RISK_OFFICER', comments);
      res.json({ status: 'ok', message: 'Workflow approved', data: result });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  public static rejectWorkflow(req: Request, res: Response): void {
    try {
      const { workflowId, approverRole, comments } = req.body;
      if (!workflowId) {
        res.status(400).json({ status: 'error', message: 'workflowId is required' });
        return;
      }
      const result = EnweService.rejectWorkflow(workflowId, approverRole || 'CHIEF_RISK_OFFICER', comments);
      res.json({ status: 'ok', message: 'Workflow rejected', data: result });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  public static getEscalations(req: Request, res: Response): void {
    try {
      const escalations = EnweService.getEscalations();
      res.json({ status: 'ok', data: escalations });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  public static triggerEscalation(req: Request, res: Response): void {
    try {
      const { workflowId, reason } = req.body;
      if (!workflowId || !reason) {
        res.status(400).json({ status: 'error', message: 'workflowId and reason are required' });
        return;
      }
      const log = EnweService.triggerEscalation(workflowId, reason);
      res.json({ status: 'ok', message: 'Escalation triggered', data: log });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  public static getTemplates(req: Request, res: Response): void {
    try {
      const templates = EnweService.getTemplates();
      res.json({ status: 'ok', data: templates });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  public static getDeliveryChannels(req: Request, res: Response): void {
    try {
      const channels = EnweService.getDeliveryChannels();
      res.json({ status: 'ok', data: channels });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  public static getWorkflowRuntime(req: Request, res: Response): void {
    try {
      const runtime = EnweService.getWorkflowRuntime();
      res.json({ status: 'ok', data: runtime });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  public static getAuditTrail(req: Request, res: Response): void {
    try {
      const audit = EnweService.getAuditTrail();
      res.json({ status: 'ok', data: audit });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  public static getQaReport(req: Request, res: Response): void {
    try {
      const report = EnweService.runEnweQaSuite();
      res.json({ status: 'ok', data: report });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }
}
