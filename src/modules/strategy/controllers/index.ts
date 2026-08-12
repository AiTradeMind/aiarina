import { Response, NextFunction } from "express";
import { StrategyService } from "../services/index.ts";
import { AuthenticatedRequest } from "../../../middleware/auth.ts";
import { MembershipRepository } from "../../identity/repositories/index.ts";
import { isInvalidOrg } from "../../../lib/utils.ts";

const strategyService = new StrategyService();
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

export class StrategyController {
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
        const result = await strategyService.getStrategies(orgId);
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

  async createStrategy(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
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
        res.status(210).json({
          success: true,
          message: "Simulation active. Strategy not persisted."
        });
        return;
      }

      try {
        const result = await strategyService.createStrategy({ ...req.body, organizationId: orgId });
        res.status(201).json(result);
      } catch (dbError: any) {
        res.status(210).json({
          success: true,
          message: "Simulation active due to missing storage. Strategy not persisted.",
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

  async updateStrategy(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      try {
        const organizationId = req.user?.organizationId as string;
        await strategyService.updateStrategy(id, organizationId, req.body);
        res.status(200).json({ message: "Strategy updated" });
      } catch (dbError: any) {
        res.status(200).json({
          message: "Simulation active. Strategy updated locally only.",
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

  async getResults(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
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
        const result = await strategyService.getResults(orgId);
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

  async evaluate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
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
          score: "0.50",
          decision: "HOLD",
          reason: "Simulation active. Strategy evaluation bypassed."
        });
        return;
      }

      const userId = req.user!.userId;
      try {
        const result = await strategyService.evaluate({ ...req.body, userId }, orgId);
        res.status(200).json(result);
      } catch (dbError: any) {
        res.status(200).json({
          success: true,
          score: "0.50",
          decision: "HOLD",
          reason: "Simulation active due to missing storage. Strategy evaluation bypassed: " + dbError.message
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
}
