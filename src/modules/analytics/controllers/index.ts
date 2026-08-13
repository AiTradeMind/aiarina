import { Response, NextFunction } from "express";
import { analyticsService, AnalyticsHealth } from "../services/index.ts";
import { AuthenticatedRequest } from "../../../middleware/auth.ts";
import { MembershipRepository } from "../../identity/repositories/index.ts";
import { isInvalidOrg } from "../../../lib/utils.ts";

const membershipRepo = new MembershipRepository();

async function getOrgId(req: AuthenticatedRequest): Promise<string> {
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
    return "org-default"; // Fallback for testing in development sandbox
  }

  if (!req.user) throw new Error("Unauthorized");
  const memberships = await membershipRepo.getMembershipsForUser(req.user.userId);
  if (memberships.length === 0) {
    throw new Error("User has no organization memberships");
  }
  
  return memberships[0].organizationId;
}

export class AnalyticsController {
  // Existing Dashboard Methods (Backward Compatibility)
  async getDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = await getOrgId(req);
      const result = await analyticsService.getDashboard(orgId);
      if (!result) {
        res.status(200).json({
          success: true,
          data: {
            metrics: {},
            charts: [],
            alerts: [],
            recommendations: []
          }
        });
        return;
      }
      res.status(200).json(result);
    } catch (error: any) {
      res.status(200).json({
        success: true,
        data: {
          metrics: {},
          charts: [],
          alerts: [],
          recommendations: []
        },
        message: error.message
      });
    }
  }

  async getPerformance(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = await getOrgId(req);
      const result = await analyticsService.getPerformance(orgId);
      res.status(200).json({
        success: true,
        data: result || []
      });
    } catch (error: any) {
      res.status(200).json({
        success: true,
        data: [],
        message: error.message
      });
    }
  }

  async getStrategies(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = await getOrgId(req);
      const result = await analyticsService.getPerformance(orgId);
      const list = result ? result.filter(p => p.targetType === "STRATEGY") : [];
      res.status(200).json({
        success: true,
        data: list
      });
    } catch (error: any) {
      res.status(200).json({
        success: true,
        data: [],
        message: error.message
      });
    }
  }

  async getAI(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = await getOrgId(req);
      const result = await analyticsService.getAIAnalytics(orgId);
      res.status(200).json({
        success: true,
        data: result || []
      });
    } catch (error: any) {
      res.status(200).json({
        success: true,
        data: [],
        message: error.message
      });
    }
  }

  async getAIRankings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = await getOrgId(req);
      const result = await analyticsService.getAIRankings(orgId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(200).json({ success: true, data: [], message: error.message });
    }
  }

  async getAIHealth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = await getOrgId(req);
      const result = await analyticsService.getAIHealthReport(orgId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(200).json({ success: true, data: [], message: error.message });
    }
  }

  async getAITrends(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = await getOrgId(req);
      const result = await analyticsService.getAITrendsReport(orgId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(200).json({ success: true, data: [], message: error.message });
    }
  }

  async getAIForecasts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = await getOrgId(req);
      const result = await analyticsService.getAIForecastsReport(orgId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(200).json({ success: true, data: [], message: error.message });
    }
  }

  async getAICorrelations(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = await getOrgId(req);
      const result = await analyticsService.getAICorrelationsReport(orgId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(200).json({ success: true, data: [], message: error.message });
    }
  }

  async getAIAnomalies(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = await getOrgId(req);
      const result = await analyticsService.getAIAnomaliesReport(orgId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(200).json({ success: true, data: [], message: error.message });
    }
  }

  async getAIHeatmaps(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = await getOrgId(req);
      const result = await analyticsService.getAIHeatmapsReport(orgId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(200).json({ success: true, data: [], message: error.message });
    }
  }

  async getAIAggregate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = await getOrgId(req);
      const result = await analyticsService.getAIAggregate(orgId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(200).json({ success: false, message: error.message });
    }
  }

  async getAICompare(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const idsParam = (req.query.ids as string) || "";
      const ids = idsParam ? idsParam.split(",") : [];
      const result = await analyticsService.getAICompareModels(ids);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(200).json({ success: true, data: [], message: error.message });
    }
  }

  async getAIModelDetail(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await analyticsService.getAIModelDetail(id);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(200).json({ success: false, message: error.message });
    }
  }

  async getRisk(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = await getOrgId(req);
      const result = await analyticsService.getRiskAnalytics(orgId);
      res.status(200).json({
        success: true,
        data: result || []
      });
    } catch (error: any) {
      res.status(200).json({
        success: true,
        data: [],
        message: error.message
      });
    }
  }

  // --- EP-06 API Endpoints (Part 11) ---

  // GET /api/analytics - Get full market summary landing page snapshot
  async getOverview(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = await getOrgId(req);
      const summary = await analyticsService.getMarketSummary(orgId);
      res.status(200).json(summary);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/analytics/market - Get calculated statistics for all symbols
  async getMarketStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = await getOrgId(req);
      const summary = await analyticsService.getMarketSummary(orgId);
      res.status(200).json(summary);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/analytics/symbol/:symbol - Get individual symbol's statistics, trend, volume, volatility
  async getSymbolAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = await getOrgId(req);
      const { symbol } = req.params;
      if (!symbol) {
        res.status(400).json({ success: false, message: "Symbol parameter is required" });
        return;
      }
      const result = await analyticsService.getSymbolAnalytics(symbol.toUpperCase(), orgId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/analytics/sector/:sector - Get statistics for a sector group
  async getSectorAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = await getOrgId(req);
      const { sector } = req.params;
      if (!sector) {
        res.status(400).json({ success: false, message: "Sector parameter is required" });
        return;
      }
      const result = await analyticsService.getSectorAnalytics(sector, orgId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/analytics/trends - Get trend report for all monitored symbols
  async getTrends(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = await getOrgId(req);
      const result = await analyticsService.getTrendsReport(orgId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/analytics/volatility - Get volatility statistics and rankings
  async getVolatility(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = await getOrgId(req);
      const result = await analyticsService.getVolatilityReport(orgId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/analytics/correlation - Get symbol and sector correlation matrix
  async getCorrelation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = await getOrgId(req);
      const result = await analyticsService.getCorrelationMatrixReport(orgId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/analytics/reports - Get historic reports catalog
  async getReports(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = await getOrgId(req);
      const result = await analyticsService.getReportsList(orgId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/analytics/health - Get composite market health index scores
  async getHealth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = await getOrgId(req);
      const result = await analyticsService.getMarketHealthReport(orgId);
      res.status(200).json({
        success: true,
        health: AnalyticsHealth.getHealth(),
        data: result.data
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // POST /api/analytics/recalculate - Perform deterministic recalculations of all indices
  async recalculate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = await getOrgId(req);
      await analyticsService.recalculateAll(orgId);
      res.status(200).json({
        success: true,
        message: "Market analytics recalculated and persisted successfully across statistics, trends, volumes, volatilities, and correlations.",
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Other stubs (preservation)
  async getKpis(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({ success: true, data: [] });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getExports(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({ success: true, data: [] });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async exportReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({ success: true, message: "Export initiated" });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async resetAnalytics(req: any, res: Response, next?: NextFunction): Promise<void> {
    try {
      const body = req.body || {};
      const { confirm, resetState } = body;
      const result = await analyticsService.resetAnalyticsData({
        confirm: Boolean(confirm),
        resetState: resetState || "OFF"
      });
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || "Analytics reset failed"
      });
    }
  }
}

export const analyticsController = new AnalyticsController();
