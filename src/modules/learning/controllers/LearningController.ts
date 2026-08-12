import { Response } from "express";
import { learningService } from "../services/LearningService";
import { learningValidator } from "../validators/LearningValidator";
import { AuthenticatedRequest } from "../../../middleware/auth";

export class LearningController {
  public async getLearning(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const organizationId = req.user?.organizationId || "org_dev_123";
      learningValidator.validateOrganizationId(organizationId);
      const data = await learningService.getLearningData(organizationId);
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public async getHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const organizationId = req.user?.organizationId || "org_dev_123";
      learningValidator.validateOrganizationId(organizationId);
      const data = await learningService.getHistory(organizationId);
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public async getFeedback(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const organizationId = req.user?.organizationId || "org_dev_123";
      learningValidator.validateOrganizationId(organizationId);
      const data = await learningService.getFeedback(organizationId);
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public async getPatterns(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const organizationId = req.user?.organizationId || "org_dev_123";
      learningValidator.validateOrganizationId(organizationId);
      const data = await learningService.getPatterns(organizationId);
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public async getSnapshots(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const organizationId = req.user?.organizationId || "org_dev_123";
      learningValidator.validateOrganizationId(organizationId);
      const data = await learningService.getSnapshots(organizationId);
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public async getKnowledge(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const organizationId = req.user?.organizationId || "org_dev_123";
      learningValidator.validateOrganizationId(organizationId);
      const data = await learningService.getKnowledge(organizationId);
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
}

export const learningController = new LearningController();
