import { Response, NextFunction } from "express";
import { ResearchService } from "../services/index.ts";
import { AuthenticatedRequest } from "../../../middleware/auth.ts";
import { MembershipRepository } from "../../identity/repositories/index.ts";
import { isInvalidOrg } from "../../../lib/utils.ts";

const researchService = new ResearchService();
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

export class ResearchController {
  async getReports(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
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
          data: [],
          total: 0
        });
        return;
      }

      try {
        const result = await researchService.getReports(orgId);
        res.status(200).json({
          success: true,
          data: result || [],
          total: result ? result.length : 0
        });
      } catch (dbError: any) {
        res.status(200).json({
          success: true,
          data: [],
          total: 0,
          dbError: dbError.message,
          errorCode: "DATABASE_UNAVAILABLE"
        });
      }
    } catch (error: any) {
      res.status(200).json({
        success: false,
        errorCode: "SYSTEM_ERROR",
        message: error.message,
        data: [],
        total: 0
      });
    }
  }

  async getReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      try {
        const organizationId = req.user?.organizationId as string;
        const result = await researchService.getReport(id, organizationId);
        if (!result) {
          res.status(404).json({ error: "Report not found" });
          return;
        }
        res.status(200).json(result);
      } catch (dbError: any) {
        res.status(404).json({
          error: "Report not found",
          dbError: dbError.message,
          errorCode: "DATABASE_UNAVAILABLE"
        });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async generate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
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
          message: "Simulation mode active. No actual report generated.",
          data: null
        });
        return;
      }

      const userId = req.user!.userId;
      try {
        const result = await researchService.generate(req.body, orgId, userId);
        res.status(201).json(result);
      } catch (dbError: any) {
        res.status(201).json({
          success: true,
          message: "Simulation mode active due to missing storage. No actual report saved.",
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

  async getHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
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
          data: [],
          total: 0
        });
        return;
      }

      try {
        const result = await researchService.getReports(orgId);
        res.status(200).json({
          success: true,
          data: result || [],
          total: result ? result.length : 0
        });
      } catch (dbError: any) {
        res.status(200).json({
          success: true,
          data: [],
          total: 0,
          dbError: dbError.message,
          errorCode: "DATABASE_UNAVAILABLE"
        });
      }
    } catch (error: any) {
      res.status(200).json({
        success: false,
        errorCode: "SYSTEM_ERROR",
        message: error.message,
        data: [],
        total: 0
      });
    }
  }
}

export * from "./research-center.controller.ts";
export * from "./ResearchEP06Controller.ts";
export * from "./ResearchEP03Controller.ts";
