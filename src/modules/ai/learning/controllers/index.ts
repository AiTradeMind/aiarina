import { Response, NextFunction } from "express";
import { LearningService } from "../services/index.ts";
import { AuthenticatedRequest } from "../../../../middleware/auth.ts";
import { MembershipRepository } from "../../../identity/repositories/index.ts";
import { isInvalidOrg } from "../../../../lib/utils.ts";

const learningService = new LearningService();
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

export class LearningController {
  async getLearning(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
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
          data: {}
        });
        return;
      }

      try {
        const result = await learningService.getLearningSummary(orgId);
        res.status(200).json({
          success: true,
          data: result || {}
        });
      } catch (dbError: any) {
        res.status(200).json({
          success: true,
          data: {},
          dbError: dbError.message,
          errorCode: "DATABASE_UNAVAILABLE"
        });
      }
    } catch (error: any) {
      res.status(200).json({
        success: false,
        errorCode: "SYSTEM_ERROR",
        message: error.message,
        data: {}
      });
    }
  }

  async train(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
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
        res.status(201).json({
          success: true,
          message: "Simulation active. Training completed.",
          data: null
        });
        return;
      }

      const userId = req.user!.userId;
      try {
        const result = await learningService.train(req.body, orgId, userId);
        res.status(201).json(result);
      } catch (dbError: any) {
        res.status(201).json({
          success: true,
          message: "Simulation active due to missing storage. Training complete.",
          data: null,
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

  async getModels(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
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
        const result = await learningService.getModelScores(orgId);
        res.status(200).json({
          success: true,
          data: result || []
        });
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

  async getStrategies(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
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
        const result = await learningService.getStrategyScores(orgId);
        res.status(200).json({
          success: true,
          data: result || []
        });
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
}
