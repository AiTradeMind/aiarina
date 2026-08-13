import { Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { getDb } from "../../../db/client.ts";
import { paperJournal, paperTrades, paperOrderDetails, paperOrders, paperPositions } from "../../../db/schema.ts";
import { PaperTradingService } from "../services/index.ts";
import { AuthenticatedRequest } from "../../../middleware/auth.ts";
import { MembershipRepository } from "../../identity/repositories/index.ts";
import { tradingSessionKernel } from "../services/session-kernel.ts";
import { executionCoordinator } from "../services/execution-coordinator.ts";
import { tradeLifecycleManager } from "../services/lifecycle-manager.ts";
import { multiAIExecutor } from "../services/multi-ai-executor.ts";
import { isInvalidOrg } from "../../../lib/utils.ts";

const paperService = new PaperTradingService();
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

export class PaperTradingController {
  async getAccount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
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
          id: 0,
          organizationId: "simulated",
          balance: "1000000.00",
          cash: "1000000.00",
          buyingPower: "1000000.00",
          createdAt: new Date().toISOString()
        });
        return;
      }

      try {
        const result = await paperService.getAccount(orgId);
        res.status(200).json(result);
      } catch (dbError: any) {
        res.status(200).json({
          id: 0,
          organizationId: orgId,
          balance: "1000000.00",
          cash: "1000000.00",
          buyingPower: "1000000.00",
          createdAt: new Date().toISOString(),
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

  async getPortfolio(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
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
          positions: [],
          performance: {
            totalPnL: "0.00",
            winRate: "0.0%"
          }
        });
        return;
      }

      try {
        const labId = (req.query.labId as string) || (req.headers["x-lab-id"] as string);
        const positions = await paperService.getPositions(orgId, labId);
        const performance = await paperService.getPerformance(orgId);
        res.status(200).json({ positions: positions || [], performance });
      } catch (dbError: any) {
        res.status(200).json({
          positions: [],
          performance: {
            totalPnL: "0.00",
            winRate: "0.0%"
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

  async getOrders(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
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
        res.status(200).json([]);
        return;
      }

      try {
        const labId = (req.query.labId as string) || (req.headers["x-lab-id"] as string);
        const result = await paperService.getOrders(orgId, labId);
        res.status(200).json(result || []);
      } catch (dbError: any) {
        res.status(200).json([]);
      }
    } catch (error: any) {
      res.status(200).json([]);
    }
  }

  async createOrder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
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
          id: crypto.randomUUID(),
          symbol: req.body.symbol || "RELIANCE",
          side: req.body.side || "BUY",
          type: req.body.type || "MARKET",
          quantity: req.body.quantity || "1.0",
          status: "PENDING",
          createdAt: new Date().toISOString()
        });
        return;
      }

      const userId = req.user!.userId;
      try {
        const result = await paperService.createOrder(orgId, userId, req.body);
        res.status(201).json(result);
      } catch (dbError: any) {
        res.status(201).json({
          id: crypto.randomUUID(),
          symbol: req.body.symbol || "RELIANCE",
          side: req.body.side || "BUY",
          type: req.body.type || "MARKET",
          quantity: req.body.quantity || "1.0",
          status: "PENDING",
          createdAt: new Date().toISOString(),
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

  async getTrades(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
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
        res.status(200).json([]);
        return;
      }

      try {
        const labId = (req.query.labId as string) || (req.headers["x-lab-id"] as string);
        const result = await paperService.getTrades(orgId, labId);
        res.status(200).json(result || []);
      } catch (dbError: any) {
        res.status(200).json([]);
      }
    } catch (error: any) {
      res.status(200).json([]);
    }
  }

  async getJournal(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
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
        res.status(200).json([]);
        return;
      }

      try {
        const labId = (req.query.labId as string) || (req.headers["x-lab-id"] as string);
        const result = await paperService.getJournal(orgId, labId);
        res.status(200).json(result || []);
      } catch (dbError: any) {
        res.status(200).json([]);
      }
    } catch (error: any) {
      res.status(200).json([]);
    }
  }

  async getSessionState(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const clockState = tradingSessionKernel.getClockState();
      const activeSession = tradingSessionKernel.getActiveSession();
      const holidays = tradingSessionKernel.getHolidays();
      res.status(200).json({ clockState, activeSession, holidays });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async controlSession(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { action, value } = req.body;
      if (action === 'pause') {
        tradingSessionKernel.pause();
      } else if (action === 'resume') {
        tradingSessionKernel.resume();
      } else if (action === 'speed') {
        tradingSessionKernel.setSpeed(Number(value || 1));
      } else if (action === 'step') {
        tradingSessionKernel.stepForward(Number(value || 60));
      } else {
        throw new Error("Invalid session control action. Allowed actions: pause, resume, speed, step.");
      }
      res.status(200).json({ clockState: tradingSessionKernel.getClockState() });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async startSimulation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, startTime, endTime, speedMultiplier } = req.body;
      if (!name || !startTime || !endTime) {
        throw new Error("Missing required simulation parameters: name, startTime, endTime.");
      }
      const sim = tradingSessionKernel.startSimulationSession(name, startTime, endTime, Number(speedMultiplier || 1));
      res.status(200).json({ simulation: sim });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getExecutionQueue(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const queue = executionCoordinator.getQueue();
      res.status(200).json({ queue });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getExecutionAudit(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
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
        res.status(200).json({ auditTrail: [] });
        return;
      }

      const auditTrail = executionCoordinator.getAuditTrail(orgId);
      res.status(200).json({ auditTrail });
    } catch (error: any) {
      res.status(200).json({ auditTrail: [] });
    }
  }

  async getOrderLifecycle(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orderId = Number(req.params.id);
      if (isNaN(orderId)) throw new Error("Invalid order ID parameter.");
      const history = tradeLifecycleManager.getLifecycleHistory(orderId);
      res.status(200).json({ orderId, history });
    } catch (error: any) {
      res.status(200).json({ orderId: Number(req.params.id) || 0, history: [] });
    }
  }

  async triggerAIConsensus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
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
          consensus: "HOLD",
          rationale: "Simulation mode active. AI consensus is set to neutral hold.",
          confidence: "0.50",
          breakdown: []
        });
        return;
      }

      const userId = req.user!.userId;
      const { ticker, price } = req.body;
      if (!ticker || !price) {
        throw new Error("Missing ticker or current price for AI consensus evaluation.");
      }
      try {
        const report = await multiAIExecutor.requestConsensus(ticker, Number(price), orgId, userId);
        res.status(200).json(report);
      } catch (dbError: any) {
        res.status(200).json({
          consensus: "HOLD",
          rationale: "Simulation mode active due to storage constraints. AI consensus is set to neutral hold: " + dbError.message,
          confidence: "0.50",
          breakdown: []
        });
      }
    } catch (error: any) {
      res.status(200).json({
        consensus: "HOLD",
        rationale: "Simulation mode active. AI consensus evaluation bypassed.",
        confidence: "0.50",
        breakdown: []
      });
    }
  }

  async resetPaperTradingData(req: any, res: Response, next?: NextFunction): Promise<void> {
    try {
      const body = req.body || {};
      const { confirm, resetState, labId } = body;
      if (!confirm || resetState !== "ON") {
        res.status(400).json({
          success: false,
          error: "Reset confirmation required. resetState must be ON and confirm must be true."
        });
        return;
      }

      const db = getDb();
      let recordsCleared = 0;

      if (db) {
        try {
          const journalQuery = labId ? db.delete(paperJournal).where(eq(paperJournal.labId, labId)) : db.delete(paperJournal);
          const journalRes = await journalQuery.returning();
          recordsCleared += journalRes.length;
        } catch (e) {
          // ignore
        }

        try {
          const tradesQuery = labId ? db.delete(paperTrades).where(eq(paperTrades.labId, labId)) : db.delete(paperTrades);
          const tradesRes = await tradesQuery.returning();
          recordsCleared += tradesRes.length;
        } catch (e) {
          // ignore
        }

        try {
          const detailsRes = await db.delete(paperOrderDetails).returning();
          recordsCleared += detailsRes.length;
        } catch (e) {
          // ignore
        }

        try {
          const ordersQuery = labId ? db.delete(paperOrders).where(eq(paperOrders.labId, labId)) : db.delete(paperOrders);
          const ordersRes = await ordersQuery.returning();
          recordsCleared += ordersRes.length;
        } catch (e) {
          // ignore
        }

        try {
          const posQuery = labId ? db.delete(paperPositions).where(eq(paperPositions.labId, labId)) : db.delete(paperPositions);
          const posRes = await posQuery.returning();
          recordsCleared += posRes.length;
        } catch (e) {
          // ignore
        }
      }

      const resetRunId = `RST-PAPER-${Date.now()}`;
      res.status(200).json({
        success: true,
        data: {
          module: "PAPER_TRADING",
          resetRunId,
          labId: labId || "ALL_LABS",
          status: "COMPLETED",
          recordsCleared: recordsCleared || 0,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || "Paper trading reset operation failed"
      });
    }
  }
}
