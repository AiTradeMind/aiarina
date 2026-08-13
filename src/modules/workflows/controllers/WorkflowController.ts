import { Response } from "express";
import { AuthenticatedRequest } from "../../../middleware/auth.ts";
import { workflowService } from "../services/WorkflowService.ts";
import { workflowEngine } from "../services/WorkflowEngine.ts";
import { approvalEngine } from "../services/ApprovalEngine.ts";
import { approvalService } from "../services/ApprovalService.ts";

export class WorkflowController {
  // POST /api/workflows/templates
  public async createTemplate(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const actorId = req.user?.userId || 1;
      const orgId = req.body.organizationId || req.user?.organizationId || "org_dev_123";
      const wksId = req.body.workspaceId || "wks_dev_123";

      const template = await workflowService.createTemplate({
        name: req.body.name,
        type: req.body.type,
        sourceModule: req.body.sourceModule,
        organizationId: orgId,
        workspaceId: wksId,
        steps: req.body.steps || [],
      });

      res.status(201).json({ success: true, data: template });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // GET /api/workflows/templates
  public async listTemplates(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = (req.query.organizationId as string) || req.user?.organizationId || "org_dev_123";
      const templates = await workflowService.listTemplates(orgId);

      res.status(200).json({ success: true, data: templates });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // POST /api/workflows/start
  public async startWorkflow(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const actorId = req.user?.userId || 1;
      const orgId = req.body.organizationId || req.user?.organizationId || "org_dev_123";
      const wksId = req.body.workspaceId || "wks_dev_123";

      const instance = await workflowEngine.startWorkflow(actorId, {
        templateId: req.body.templateId,
        name: req.body.name,
        type: req.body.type,
        sourceModule: req.body.sourceModule,
        correlationId: req.body.correlationId,
        organizationId: orgId,
        workspaceId: wksId,
        data: req.body.data,
        expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : undefined,
      });

      res.status(201).json({ success: true, data: instance });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // GET /api/workflows/:id
  public async getWorkflowById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const instanceId = parseInt(req.params.id, 10);
      if (isNaN(instanceId)) {
        res.status(400).json({ error: "Invalid workflow instance ID" });
        return;
      }

      const instance = await workflowService.getInstance(instanceId);
      if (!instance) {
        res.status(404).json({ error: "Workflow instance not found" });
        return;
      }

      // Secure tenant boundary
      const orgId = req.user?.organizationId || "org_dev_123";
      if (instance.organizationId !== orgId && (req.user?.role as string) !== "PLATFORM_ADMIN" && (req.user?.role as string) !== "admin") {
        res.status(403).json({ error: "Security Access Denied: Tenant boundary violation." });
        return;
      }

      const steps = await workflowRepository.getStepsForInstance(instanceId);
      const approvals = await approvalService.getApprovalsForInstance(instanceId);
      const history = await workflowService.getHistory(instanceId);
      const metrics = await workflowService.getMetrics(instanceId);

      res.status(200).json({
        success: true,
        data: {
          instance,
          steps,
          approvals,
          history,
          metrics,
        },
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // POST /api/workflows/:id/approve
  public async approveWorkflow(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const actorId = req.user?.userId || 1;
      const orgId = req.user?.organizationId || "org_dev_123";
      const instanceId = parseInt(req.params.id, 10);
      const { comments } = req.body;

      if (isNaN(instanceId)) {
        res.status(400).json({ error: "Invalid workflow instance ID" });
        return;
      }

      const updated = await approvalEngine.processDecision(
        actorId,
        orgId,
        instanceId,
        "APPROVED",
        comments
      );

      res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // POST /api/workflows/:id/reject
  public async rejectWorkflow(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const actorId = req.user?.userId || 1;
      const orgId = req.user?.organizationId || "org_dev_123";
      const instanceId = parseInt(req.params.id, 10);
      const { comments } = req.body;

      if (isNaN(instanceId)) {
        res.status(400).json({ error: "Invalid workflow instance ID" });
        return;
      }

      const updated = await approvalEngine.processDecision(
        actorId,
        orgId,
        instanceId,
        "REJECTED",
        comments
      );

      res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // POST /api/workflows/:id/return
  public async returnWorkflow(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const actorId = req.user?.userId || 1;
      const orgId = req.user?.organizationId || "org_dev_123";
      const instanceId = parseInt(req.params.id, 10);
      const { comments } = req.body;

      if (isNaN(instanceId)) {
        res.status(400).json({ error: "Invalid workflow instance ID" });
        return;
      }

      const updated = await approvalEngine.processDecision(
        actorId,
        orgId,
        instanceId,
        "RETURNED",
        comments
      );

      res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // POST /api/workflows/:id/cancel
  public async cancelWorkflow(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const actorId = req.user?.userId || 1;
      const orgId = req.user?.organizationId || "org_dev_123";
      const instanceId = parseInt(req.params.id, 10);
      const { comments } = req.body;

      if (isNaN(instanceId)) {
        res.status(400).json({ error: "Invalid workflow instance ID" });
        return;
      }

      const updated = await workflowEngine.cancelWorkflow(actorId, orgId, instanceId, comments);

      res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // POST /api/workflows/:id/delegate
  public async delegateWorkflow(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const actorId = req.user?.userId || 1;
      const orgId = req.user?.organizationId || "org_dev_123";
      const instanceId = parseInt(req.params.id, 10);
      const { delegateUserId, comments } = req.body;

      if (isNaN(instanceId) || !delegateUserId) {
        res.status(400).json({ error: "Invalid workflow instance ID or delegateUserId" });
        return;
      }

      const updatedStep = await approvalEngine.delegate(
        actorId,
        orgId,
        instanceId,
        delegateUserId,
        comments
      );

      res.status(200).json({ success: true, data: updatedStep });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // POST /api/workflows/:id/escalate
  public async escalateWorkflow(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const actorId = req.user?.userId || 1;
      const orgId = req.user?.organizationId || "org_dev_123";
      const instanceId = parseInt(req.params.id, 10);
      const { escalatedRole, reason } = req.body;

      if (isNaN(instanceId) || !escalatedRole || !reason) {
        res.status(400).json({ error: "Invalid parameters for escalation" });
        return;
      }

      const updatedStep = await approvalEngine.escalate(
        actorId,
        orgId,
        instanceId,
        escalatedRole,
        reason
      );

      res.status(200).json({ success: true, data: updatedStep });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // GET /api/workflows/history
  public async getHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = (req.query.organizationId as string) || req.user?.organizationId || "org_dev_123";
      const history = await workflowService.listHistory(orgId);

      res.status(200).json({ success: true, data: history });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}

import { workflowRepository } from "../repositories/WorkflowRepository.ts";
export const workflowController = new WorkflowController();
