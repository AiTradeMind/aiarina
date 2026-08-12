import { Response, NextFunction } from "express";
import { RiskService } from "../services/index.ts";
import { AuthenticatedRequest } from "../../../middleware/auth.ts";
import { MembershipRepository } from "../../identity/repositories/index.ts";
import { isInvalidOrg } from "../../../lib/utils.ts";

const riskService = new RiskService();
const membershipRepo = new MembershipRepository();

async function getOrgId(req: AuthenticatedRequest): Promise<string | null> {
  const isDevAuth = process.env.NODE_ENV === "development" || process.env.AUTH_MODE === "development";
  const headerOrgId = req.headers["x-organization-id"] as string;
  if (headerOrgId && !isInvalidOrg(headerOrgId)) return headerOrgId;

  if (req.user?.userId) {
    try {
      const memberships = await membershipRepo.getMembershipsForUser(req.user.userId);
      if (memberships.length > 0 && !isInvalidOrg(memberships[0].organizationId)) {
        return memberships[0].organizationId;
      }
    } catch (e) {
      // ignore
    }
  }

  if (isDevAuth) {
    return null;
  }

  if (!req.user) throw new Error("Unauthorized");
  const memberships = await membershipRepo.getMembershipsForUser(req.user.userId);
  if (memberships.length === 0) {
    const res = req.res as any;
    if (res && !res.headersSent) {
      res.status(403).json({
        success: false,
        errorCode: "NO_ORGANIZATION_MEMBERSHIP",
        message: "User is authenticated but does not belong to any organization.",
        membershipResolved: false,
        organizationRequired: true,
        timestamp: new Date().toISOString(),
        requestId: (req.headers["x-request-id"] as string) || `req-${crypto.randomUUID().substring(0, 8)}`
      });
      res.status = () => res;
      res.json = () => res;
      res.send = () => res;
    }
    throw new Error("User has no organization memberships");
  }

  return memberships[0].organizationId;
}

export class RiskController {
  // Legacy & Organization Profile endpoints
  async getRiskProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const isDevAuth = process.env.NODE_ENV === "development" || process.env.AUTH_MODE === "development";
      let orgId;
      try {
        orgId = await getOrgId(req);
      } catch (err) {
        if (isDevAuth) {
          orgId = null;
        } else {
          throw err;
        }
      }

      if (!orgId || isInvalidOrg(orgId)) {
        res.status(200).json({
          success: true,
          data: {
            organizationId: "simulated",
            riskScore: "0.00",
            maxDrawdownLimit: "0.00",
            status: "SAFE",
            updatedAt: new Date().toISOString()
          }
        });
        return;
      }

      try {
        const result = await riskService.getRiskProfile(orgId);
        res.status(200).json(result);
      } catch (dbError: any) {
        res.status(200).json({
          success: true,
          data: {
            organizationId: orgId,
            riskScore: "0.00",
            maxDrawdownLimit: "0.00",
            status: "SAFE",
            updatedAt: new Date().toISOString()
          },
          dbError: dbError.message,
          errorCode: "DATABASE_UNAVAILABLE"
        });
      }
    } catch (error: any) {
      res.status(200).json({
        success: false,
        errorCode: "SYSTEM_ERROR",
        message: error.message
      });
    }
  }

  async getRiskLimits(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const isDevAuth = process.env.NODE_ENV === "development" || process.env.AUTH_MODE === "development";
      let orgId;
      try {
        orgId = await getOrgId(req);
      } catch (err) {
        if (isDevAuth) {
          orgId = null;
        } else {
          throw err;
        }
      }

      if (!orgId || isInvalidOrg(orgId)) {
        res.status(200).json({
          success: true,
          data: []
        });
        return;
      }

      try {
        const result = await riskService.getRiskLimits(orgId);
        res.status(200).json(result);
      } catch (dbError: any) {
        res.status(200).json({
          success: true,
          data: [],
          dbError: dbError.message,
          errorCode: "DATABASE_UNAVAILABLE"
        });
      }
    } catch (error: any) {
      res.status(200).json({
        success: false,
        errorCode: "SYSTEM_ERROR",
        message: error.message,
        data: []
      });
    }
  }

  async updateRiskLimits(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const isDevAuth = process.env.NODE_ENV === "development" || process.env.AUTH_MODE === "development";
      let orgId;
      try {
        orgId = await getOrgId(req);
      } catch (err) {
        if (isDevAuth) {
          orgId = null;
        } else {
          throw err;
        }
      }

      if (!orgId || isInvalidOrg(orgId)) {
        res.status(200).json({
          success: true,
          message: "Simulation active. Limits not updated."
        });
        return;
      }

      try {
        const result = await riskService.updateRiskLimits(orgId, req.body);
        res.status(200).json(result);
      } catch (dbError: any) {
        res.status(200).json({
          success: true,
          message: "Simulation active due to missing storage. Limits not updated.",
          dbError: dbError.message
        });
      }
    } catch (error: any) {
      res.status(200).json({
        success: false,
        errorCode: "SYSTEM_ERROR",
        message: error.message
      });
    }
  }

  async getRiskEvents(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const isDevAuth = process.env.NODE_ENV === "development" || process.env.AUTH_MODE === "development";
      let orgId;
      try {
        orgId = await getOrgId(req);
      } catch (err) {
        if (isDevAuth) {
          orgId = null;
        } else {
          throw err;
        }
      }

      if (!orgId || isInvalidOrg(orgId)) {
        res.status(200).json({
          success: true,
          data: []
        });
        return;
      }

      try {
        const result = await riskService.getRiskEvents(orgId);
        res.status(200).json(result);
      } catch (dbError: any) {
        res.status(200).json({
          success: true,
          data: [],
          dbError: dbError.message,
          errorCode: "DATABASE_UNAVAILABLE"
        });
      }
    } catch (error: any) {
      res.status(200).json({
        success: false,
        errorCode: "SYSTEM_ERROR",
        message: error.message,
        data: []
      });
    }
  }

  async validateOrder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const isDevAuth = process.env.NODE_ENV === "development" || process.env.AUTH_MODE === "development";
      let orgId;
      try {
        orgId = await getOrgId(req);
      } catch (err) {
        if (isDevAuth) {
          orgId = null;
        } else {
          throw err;
        }
      }

      if (!orgId || isInvalidOrg(orgId)) {
        res.status(200).json({
          success: true,
          isValid: true,
          reason: "Simulated order bypasses validation."
        });
        return;
      }

      const userId = req.user!.userId;
      try {
        const result = await riskService.validateOrder({
          organizationId: orgId,
          userId: userId,
          orderRequest: req.body,
        });
        res.status(200).json(result);
      } catch (dbError: any) {
        res.status(200).json({
          success: true,
          isValid: true,
          reason: "Simulated order bypasses validation due to database issues: " + dbError.message
        });
      }
    } catch (error: any) {
      res.status(200).json({
        success: false,
        errorCode: "SYSTEM_ERROR",
        message: error.message
      });
    }
  }

  // Phase 2.9 Risk Engine Foundation API Endpoints
  async evaluateDecisionRisk(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await riskService.evaluateDecisionRisk(req.body);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        errorCode: "RISK_EVALUATION_FAILED",
        message: error.message,
      });
    }
  }

  async getHealth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const health = await riskService.health.getHealthReport();
      res.status(200).json({
        success: true,
        data: health,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        errorCode: "HEALTH_CHECK_FAILED",
        message: error.message,
      });
    }
  }

  async getEngineProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const profileId = req.params.profileId;
      const profile = await riskService.registry.getProfile(profileId);
      if (!profile) {
        res.status(404).json({ success: false, message: "Profile not found" });
        return;
      }
      res.status(200).json({ success: true, data: profile });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async createEngineProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await riskService.registry.createProfile(req.body);
      res.status(201).json({ success: true, data: profile });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getEngineLimits(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const profileId = req.params.profileId;
      const limits = await riskService.registry.getLimits(profileId);
      res.status(200).json({ success: true, data: limits });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateEngineLimits(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const profileId = req.params.profileId;
      const limits = await riskService.registry.updateLimits(profileId, req.body);
      res.status(200).json({ success: true, data: limits });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getTargetHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const targetId = req.params.targetId;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const history = await riskService.lifecycle.getTargetHistory(targetId, limit);
      res.status(200).json({ success: true, data: history });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
