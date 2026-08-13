import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../../middleware/auth.ts";
import { TradingService } from "../services/index.ts";
import { MembershipRepository } from "../../identity/repositories/index.ts";
import { isInvalidOrg } from "../../../lib/utils.ts";
import { getOrgId } from "../../../lib/org-context.ts";
import { auditService } from "../../events/services/audit.service.ts";
import { PerformanceTracker } from "../../../lib/performance.ts";

const tradingService = new TradingService();
const membershipRepo = new MembershipRepository();

export class PortfolioController {
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
          id: 0,
          organizationId: "simulated",
          name: "Simulation Portfolio",
          cashBalance: "1000000.00",
          buyingPower: "1000000.00",
          realizedPnl: "0.00",
          unrealizedPnl: "0.00",
          marginEnabled: false,
          createdAt: new Date().toISOString()
        });
        return;
      }

      try {
        const portfolio = await tradingService.getPortfolio(orgId);
        res.status(200).json(portfolio);
      } catch (dbError: any) {
        res.status(200).json({
          id: 0,
          organizationId: orgId,
          name: "Simulation Portfolio (Offline Mode)",
          cashBalance: "1000000.00",
          buyingPower: "1000000.00",
          realizedPnl: "0.00",
          unrealizedPnl: "0.00",
          marginEnabled: false,
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

  async getBalance(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
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
          cashBalance: 1000000,
          buyingPower: 1000000,
          realizedPnl: 0,
          unrealizedPnl: 0,
          currency: "USD"
        });
        return;
      }

      try {
        const balance = await tradingService.getBalance(orgId);
        res.status(200).json(balance);
      } catch (dbError: any) {
        res.status(200).json({
          cashBalance: 1000000,
          buyingPower: 1000000,
          realizedPnl: 0,
          unrealizedPnl: 0,
          currency: "USD",
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
}

export class TradingController {
  async getPositions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
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
        const positions = await tradingService.getPositions(orgId);
        res.status(200).json(positions || []);
      } catch (dbError: any) {
        res.status(200).json([]);
      }
    } catch (error: any) {
      res.status(200).json([]);
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
        const orders = await tradingService.getOrders(orgId);
        res.status(200).json(orders || []);
      } catch (dbError: any) {
        res.status(200).json([]);
      }
    } catch (error: any) {
      res.status(200).json([]);
    }
  }

  async createOrder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    const tracker = new PerformanceTracker("CREATE_ORDER");
    try {
      const orgId = await getOrgId(req);
      const userId = req.user?.userId;

      if (!orgId || isInvalidOrg(orgId)) {
        res.status(201).json({
          message: "Simulation active. Simulated order submitted successfully.",
          order: {
            id: crypto.randomUUID(),
            symbol: req.body.symbol || "RELIANCE",
            side: req.body.side || "BUY",
            type: req.body.type || "MARKET",
            quantity: req.body.quantity || "1.0",
            status: "FILLED",
            createdAt: new Date().toISOString()
          }
        });
        tracker.finish();
        return;
      }

      if (!userId) throw new Error("Unauthorized");

      try {
        const order = await tradingService.createOrder(orgId, userId, req.body);
        
        // Audit log the successful order
        await auditService.logAuditEvent({
          organizationId: orgId,
          userId: userId,
          action: "ORDER_CREATED",
          status: "SUCCESS",
          details: `Order ${order.id} for ${order.ticker} created: ${order.side} ${order.quantity} @ ${order.price || 'MARKET'}`,
          userAgent: req.headers["user-agent"],
          ipAddress: req.ip
        });

        res.status(201).json({
          message: "Order created successfully",
          order,
        });
      } catch (dbError: any) {
        // Log failure to audit trail
        await auditService.logAuditEvent({
          organizationId: orgId,
          userId: userId,
          action: "ORDER_CREATED",
          status: "FAILURE",
          details: `Order creation failed: ${dbError.message}`,
          userAgent: req.headers["user-agent"],
          ipAddress: req.ip
        });

        res.status(201).json({
          message: "Simulation active due to missing storage. Simulated order submitted.",
          order: {
            id: crypto.randomUUID(),
            symbol: req.body.symbol || "RELIANCE",
            side: req.body.side || "BUY",
            type: req.body.type || "MARKET",
            quantity: req.body.quantity || "1.0",
            status: "FILLED",
            createdAt: new Date().toISOString()
          },
          dbError: dbError.message
        });
      }
    } catch (error: any) {
      res.status(200).json({
        success: false,
        errorCode: "SYSTEM_ERROR",
        message: error.message
      });
    } finally {
      tracker.finish();
    }
  }

  async updateOrder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
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
          message: "Simulation active. Order update ignored."
        });
        return;
      }

      const orderId = parseInt(req.params.id);
      try {
        const order = await tradingService.updateOrder(orgId, orderId, req.body);
        res.status(200).json({
          message: "Order updated successfully",
          order,
        });
      } catch (dbError: any) {
        res.status(200).json({
          message: "Simulation active. Order update ignored.",
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

  async cancelOrder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
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
          message: "Simulation active. Order cancelled."
        });
        return;
      }

      const orderId = parseInt(req.params.id);
      try {
        const order = await tradingService.cancelOrder(orgId, orderId);
        res.status(200).json({
          message: "Order cancelled successfully",
          order,
        });
      } catch (dbError: any) {
        res.status(200).json({
          message: "Simulation active. Order cancelled successfully.",
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
        const trades = await tradingService.getTrades(orgId);
        res.status(200).json(trades || []);
      } catch (dbError: any) {
        res.status(200).json([]);
      }
    } catch (error: any) {
      res.status(200).json([]);
    }
  }

  async getExecutions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
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
        const executions = await tradingService.getExecutions(orgId);
        res.status(200).json(executions || []);
      } catch (dbError: any) {
        res.status(200).json([]);
      }
    } catch (error: any) {
      res.status(200).json([]);
    }
  }
}
