import { Request, Response } from "express";
import { GovernanceService } from "../services/index.ts";

export class GovernanceController {
  private service: GovernanceService;

  constructor() {
    this.service = new GovernanceService();
  }

  getGovernanceList = async (req: Request, res: Response) => {
    try {
      const data = await this.service.getGovernanceList();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getPolicies = async (req: Request, res: Response) => {
    try {
      const data = await this.service.getPolicies();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getApprovals = async (req: Request, res: Response) => {
    try {
      const { strategyId } = req.query;
      const data = await this.service.getApprovals(strategyId as string | undefined);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getHistory = async (req: Request, res: Response) => {
    try {
      const { strategyId } = req.query;
      const data = await this.service.getHistory(strategyId as string | undefined);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getCompliance = async (req: Request, res: Response) => {
    try {
      const { strategyId } = req.query;
      const data = await this.service.getCompliance(strategyId as string | undefined);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getPermissions = async (req: Request, res: Response) => {
    try {
      const { strategyId } = req.query;
      const data = await this.service.getPermissions(strategyId as string | undefined);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  submitForReview = async (req: Request, res: Response) => {
    try {
      const { strategyId, requestedBy, notes } = req.body;
      if (!strategyId) {
        return res.status(400).json({ error: "strategyId is required in the body" });
      }
      const data = await this.service.submitForReview(
        strategyId,
        requestedBy || "Institutional Quant Developer",
        notes
      );
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  approveStrategy = async (req: Request, res: Response) => {
    try {
      const { strategyId, reviewerEmail, comments } = req.body;
      if (!strategyId) {
        return res.status(400).json({ error: "strategyId is required in the body" });
      }
      const data = await this.service.approveStrategy(
        strategyId,
        reviewerEmail || "governance-officer@aiarina.local",
        comments
      );
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  rejectStrategy = async (req: Request, res: Response) => {
    try {
      const { strategyId, reviewerEmail, comments } = req.body;
      if (!strategyId || !comments) {
        return res.status(400).json({ error: "strategyId and comments are required in the body" });
      }
      const data = await this.service.rejectStrategy(
        strategyId,
        reviewerEmail || "governance-officer@aiarina.local",
        comments
      );
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  publishStrategy = async (req: Request, res: Response) => {
    try {
      const { strategyId, performedBy } = req.body;
      if (!strategyId) {
        return res.status(400).json({ error: "strategyId is required in the body" });
      }
      const data = await this.service.publishStrategy(
        strategyId,
        performedBy || "Institutional Quant Developer"
      );
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  archiveStrategy = async (req: Request, res: Response) => {
    try {
      const { strategyId, performedBy } = req.body;
      if (!strategyId) {
        return res.status(400).json({ error: "strategyId is required in the body" });
      }
      const data = await this.service.archiveStrategy(
        strategyId,
        performedBy || "Institutional Quant Developer"
      );
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  runComplianceCheck = async (req: Request, res: Response) => {
    try {
      const { strategyId } = req.body;
      if (!strategyId) {
        return res.status(400).json({ error: "strategyId is required in the body" });
      }
      const data = await this.service.runComplianceCheck(strategyId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  savePermission = async (req: Request, res: Response) => {
    try {
      const { strategyId, email, role, canEdit, canRun, canApprove, grantedBy } = req.body;
      if (!strategyId || !email) {
        return res.status(400).json({ error: "strategyId and email are required in the body" });
      }
      const data = await this.service.savePermission(
        strategyId,
        email,
        role || "Executor",
        !!canEdit,
        !!canRun,
        !!canApprove,
        grantedBy || "System Admin"
      );
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
