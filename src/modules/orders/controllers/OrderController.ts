import { Response } from "express";
import { AuthenticatedRequest } from "../../../middleware/auth.ts";
import { orderService } from "../services/OrderService.ts";

export class OrderController {
  // POST /api/orders
  public async createOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const actorId = req.user?.userId || 1;
      const orgId = req.user?.organizationId || "org_dev_123";
      const idempotencyKey = req.headers["x-idempotency-key"] as string | undefined;
      const payload = { ...req.body, organizationId: orgId };
      const order = await orderService.createOrder(actorId, payload, idempotencyKey);
      res.status(201).json({ success: true, data: order });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // GET /api/orders
  public async getOrders(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user?.organizationId || "org_dev_123";
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      const orders = await orderService.getOrders(orgId, limit, offset);
      res.status(200).json({ success: true, data: orders });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // GET /api/orders/:id
  public async getOrderById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user?.organizationId || "org_dev_123";
      const { id } = req.params;
      const order = await orderService.getOrderById(id, orgId);
      if (!order) {
        res.status(404).json({ error: "Order not found" });
        return;
      }
      res.status(200).json({ success: true, data: order });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // DELETE /api/orders/:id
  public async cancelOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const actorId = req.user?.userId || 1;
      const orgId = req.user?.organizationId || "org_dev_123";
      const { id } = req.params;
      const order = await orderService.cancelOrder(actorId, id, orgId);
      res.status(200).json({ success: true, data: order });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // PATCH /api/orders/:id
  public async updateOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const actorId = req.user?.userId || 1;
      const orgId = req.user?.organizationId || "org_dev_123";
      const { id } = req.params;
      const payload = req.body;
      const order = await orderService.updateOrder(actorId, id, orgId, payload);
      res.status(200).json({ success: true, data: order });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // GET /api/orders/:id/history (Wait, do we have history in orderEngine/orderService?)
  // History is not exposed in EP-01A controller. I will add it here.
  // Actually the prompt says "GET /api/orders/:id/history" and "GET /api/orders/:id/versions".

  public async getOrderVersions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user?.organizationId || "org_dev_123";
      const { id } = req.params;
      const versions = await orderService.getOrderVersions(id, orgId);
      res.status(200).json({ success: true, data: versions });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  public async getOrderHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user?.organizationId || "org_dev_123";
      const { id } = req.params;
      const history = await orderService.getOrderHistory(id, orgId);
      res.status(200).json({ success: true, data: history });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  public async getOrderIdempotency(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user?.organizationId || "org_dev_123";
      const { key } = req.params;
      const { idempotencyService } = await import("../services/IdempotencyService.ts");
      const record = await idempotencyService.getExistingRequest(key, orgId);
      if (!record) {
        res.status(404).json({ error: "Idempotency record not found" });
        return;
      }
      res.status(200).json({ success: true, data: record });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // GET /api/orders/metrics
  public async getMetrics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user?.organizationId || "org_dev_123";
      const date = req.query.date as string | undefined;
      const { orderMetricsService } = await import("../services/OrderMetricsService.ts");
      const data = await orderMetricsService.getMetrics(orgId, date);
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // GET /api/orders/statistics
  public async getStatistics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user?.organizationId || "org_dev_123";
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      const { orderMetricsService } = await import("../services/OrderMetricsService.ts");
      const data = await orderMetricsService.getMetricsRange(orgId, startDate || new Date().toISOString().split('T')[0], endDate || new Date().toISOString().split('T')[0]);
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // GET /api/orders/dashboard
  public async getDashboard(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user?.organizationId || "org_dev_123";
      const { orderAnalyticsService } = await import("../services/OrderAnalyticsService.ts");
      const data = await orderAnalyticsService.getDashboard(orgId);
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // GET /api/orders/health
  public async getHealth(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user?.organizationId || "org_dev_123";
      const { orderHealthService } = await import("../services/OrderHealthService.ts");
      const data = await orderHealthService.getHealth(orgId);
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // GET /api/orders/reports
  public async getReports(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = req.user?.organizationId || "org_dev_123";
      const type = (req.query.type as any) || 'full';
      const { orderReportingService } = await import("../services/OrderReportingService.ts");
      const data = await orderReportingService.generateReport(orgId, type);
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}

export const orderController = new OrderController();
