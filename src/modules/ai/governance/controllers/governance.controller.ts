import { Request, Response, NextFunction } from 'express';
import { AIGovernanceService } from '../services/governance.service';
import { governancePipelineService, governanceRepo, auditEngine } from '../services/governance-pipeline.service';

export class AIGovernanceController {
  // === EP22 EXISTING MODEL LIFECYCLE & REGISTRY CONTROLLERS ===

  public getModels(req: Request, res: Response, next: NextFunction): void {
    try {
      const data = AIGovernanceService.getModelsList();
      res.json({ success: true, count: data.length, data });
    } catch (error) {
      next(error);
    }
  }

  public getProviders(req: Request, res: Response, next: NextFunction): void {
    try {
      const data = AIGovernanceService.getProvidersList();
      res.json({ success: true, count: data.length, data });
    } catch (error) {
      next(error);
    }
  }

  public getEvaluations(req: Request, res: Response, next: NextFunction): void {
    try {
      const data = AIGovernanceService.getEvaluationsList();
      res.json({ success: true, count: data.length, data });
    } catch (error) {
      next(error);
    }
  }

  public getLeaderboard(req: Request, res: Response, next: NextFunction): void {
    try {
      const data = AIGovernanceService.getLeaderboard();
      res.json({ success: true, count: data.length, data });
    } catch (error) {
      next(error);
    }
  }

  public getDeployments(req: Request, res: Response, next: NextFunction): void {
    try {
      const data = AIGovernanceService.getDeploymentsList();
      res.json({ success: true, count: data.length, data });
    } catch (error) {
      next(error);
    }
  }

  public getPolicies(req: Request, res: Response, next: NextFunction): void {
    try {
      const data = AIGovernanceService.getPoliciesList();
      res.json({ success: true, count: data.length, data });
    } catch (error) {
      next(error);
    }
  }

  public getVersions(req: Request, res: Response, next: NextFunction): void {
    try {
      const data = AIGovernanceService.getVersionsList();
      res.json({ success: true, count: data.length, data });
    } catch (error) {
      next(error);
    }
  }

  public getAudit(req: Request, res: Response, next: NextFunction): void {
    try {
      const data = AIGovernanceService.getAuditList();
      res.json({ success: true, count: data.length, data });
    } catch (error) {
      next(error);
    }
  }

  public getQaReport(req: Request, res: Response, next: NextFunction): void {
    try {
      const data = AIGovernanceService.runEp22QaSuite();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  public registerModel(req: Request, res: Response, next: NextFunction): void {
    try {
      const { name, provider, family, version, owner, capabilities, license, workspace } = req.body;
      if (!name || !provider) {
        res.status(400).json({ success: false, message: 'name and provider are required' });
        return;
      }
      const data = AIGovernanceService.registerModel({
        name,
        provider,
        family: family || provider,
        version: version || 'v1.0.0',
        owner: owner || 'Enterprise Admin',
        capabilities: capabilities || ['General AI'],
        license: license || 'Commercial',
        workspace
      });
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  public approveModel(req: Request, res: Response, next: NextFunction): void {
    try {
      const { modelId, stage } = req.body;
      if (!modelId || !stage) {
        res.status(400).json({ success: false, message: 'modelId and stage are required' });
        return;
      }
      const data = AIGovernanceService.approveModel(modelId, stage);
      if (!data) {
        res.status(404).json({ success: false, message: 'Model not found' });
        return;
      }
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  public promoteModel(req: Request, res: Response, next: NextFunction): void {
    try {
      const { modelId, targetEnv } = req.body;
      if (!modelId) {
        res.status(400).json({ success: false, message: 'modelId is required' });
        return;
      }
      const data = AIGovernanceService.promoteModel(modelId, targetEnv || 'PRODUCTION');
      if (!data) {
        res.status(404).json({ success: false, message: 'Model not found' });
        return;
      }
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  public rollbackModel(req: Request, res: Response, next: NextFunction): void {
    try {
      const { modelId } = req.body;
      if (!modelId) {
        res.status(400).json({ success: false, message: 'modelId is required' });
        return;
      }
      const data = AIGovernanceService.rollbackModel(modelId);
      if (!data) {
        res.status(404).json({ success: false, message: 'Model not found' });
        return;
      }
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  public retireModel(req: Request, res: Response, next: NextFunction): void {
    try {
      const { modelId } = req.body;
      if (!modelId) {
        res.status(400).json({ success: false, message: 'modelId is required' });
        return;
      }
      const data = AIGovernanceService.retireModel(modelId);
      if (!data) {
        res.status(404).json({ success: false, message: 'Model not found' });
        return;
      }
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // === EP06 PHASE 4 GOVERNANCE RUNTIME PIPELINE CONTROLLERS ===

  public async getSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const data = await governanceRepo.listSessions(limit);
      res.json({ success: true, count: data.length, data });
    } catch (error) {
      next(error);
    }
  }

  public async getSessionDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionId = parseInt(req.params.id, 10);
      if (isNaN(sessionId)) {
        res.status(400).json({ success: false, message: "Invalid session ID format" });
        return;
      }

      const session = await governanceRepo.getSession(sessionId);
      if (!session) {
        res.status(404).json({ success: false, message: "Governance session not found" });
        return;
      }

      const safetyReport = await governanceRepo.getSafetyReportBySession(sessionId);
      const violations = await governanceRepo.getViolations(sessionId);
      const explainability = await governanceRepo.getExplainabilityBySession(sessionId);
      const compliance = await governanceRepo.getComplianceBySession(sessionId);
      const humanReview = await governanceRepo.getHumanReviewBySession(sessionId);

      res.json({
        success: true,
        data: {
          session,
          safetyReport,
          violations,
          explainability,
          compliance,
          humanReview
        }
      });
    } catch (error) {
      next(error);
    }
  }

  public async createGovernanceSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, organizationId, modelId, requestPayload, responsePayload } = req.body;
      if (!requestPayload || !responsePayload) {
        res.status(400).json({ success: false, message: "requestPayload and responsePayload are required" });
        return;
      }

      const result = await governancePipelineService.governRequest({
        userId,
        organizationId,
        modelId,
        requestPayload,
        responsePayload
      });

      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  public async getHumanReviewQueue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = req.query.status as any;
      const data = await governanceRepo.listHumanReviews(status);
      res.json({ success: true, count: data.length, data });
    } catch (error) {
      next(error);
    }
  }

  public async submitHumanReviewDecision(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reviewId = parseInt(req.params.id, 10);
      const { reviewerId, status, reviewerNotes, decisionOverride } = req.body;

      if (isNaN(reviewId)) {
        res.status(400).json({ success: false, message: "Invalid human review ID format" });
        return;
      }
      if (!status || !["APPROVED", "REJECTED", "ESCALATED"].includes(status)) {
        res.status(400).json({ success: false, message: "Invalid or missing review status" });
        return;
      }

      const review = await governanceRepo.listHumanReviews();
      const targetReview = review.find(r => r.id === reviewId);

      if (!targetReview) {
        res.status(404).json({ success: false, message: "Human review queue item not found" });
        return;
      }

      const updatedReview = await governanceRepo.updateHumanReview(reviewId, {
        reviewerId,
        status,
        reviewerNotes,
        decisionOverride: decisionOverride || false,
        reviewedAt: new Date(),
        approvalHistory: [
          ...(targetReview.approvalHistory || []),
          {
            reviewerId,
            status,
            reviewerNotes,
            decisionOverride,
            timestamp: new Date().toISOString()
          }
        ]
      });

      // Also update the parent session status if reviewer overrides or approves
      if (status === "APPROVED" || status === "REJECTED") {
        await governanceRepo.updateSession(targetReview.sessionId, {
          status: status
        });
      }

      res.json({ success: true, data: updatedReview });
    } catch (error) {
      next(error);
    }
  }

  public async getMetricsHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 30;
      const data = await governanceRepo.listMetrics(limit);
      res.json({ success: true, count: data.length, data });
    } catch (error) {
      next(error);
    }
  }

  public async triggerAuditReplay(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId, userId } = req.body;
      if (!sessionId) {
        res.status(400).json({ success: false, message: "sessionId is required to trigger a replay" });
        return;
      }

      const result = await auditEngine.replaySession(sessionId, userId);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  public async getAuditReplayHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await governanceRepo.listAuditReplays();
      res.json({ success: true, count: data.length, data });
    } catch (error) {
      next(error);
    }
  }
}
