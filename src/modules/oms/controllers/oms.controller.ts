import { Response, NextFunction } from "express";
import { OMSService } from "../services/oms.service.ts";
import { OMSHealthService } from "../services/oms-health.service.ts";
import { AuthenticatedRequest } from "../../../middleware/auth.ts";
import { CreateOrderDTO, CancelOrderDTO, RetryOrderDTO } from "../dtos/oms.dto.ts";

export class OMSController {
  private omsService: OMSService;
  private healthService: OMSHealthService;

  constructor() {
    this.omsService = new OMSService();
    this.healthService = new OMSHealthService();
  }

  /**
   * GET /oms
   */
  async getOrders(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = req.query.status as any;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
      const result = await this.omsService.getOrders(limit, status);
      res.status(200).json({ success: true, count: result.length, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /oms/:id
   */
  async getOrder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id;
      const result = await this.omsService.getOrder(id);
      if (!result) {
        res.status(404).json({ success: false, message: `Order '${id}' not found.` });
        return;
      }
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /oms/queue
   */
  async getQueue(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
      const result = await this.omsService.getExecutionQueue(limit);
      res.status(200).json({ success: true, count: result.length, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /oms/history
   */
  async getHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orderId = req.query.orderId as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
      const result = await this.omsService.getOrderHistory(orderId, limit);
      res.status(200).json({ success: true, count: result.length, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /oms/health
   */
  async getHealth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const health = await this.healthService.getHealthReport();
      res.status(200).json({ success: true, health });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /oms/create
   */
  async createOrder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = CreateOrderDTO.validate(req.body);
      if (!validation.valid) {
        res.status(400).json({ success: false, errors: validation.errors });
        return;
      }
      const result = await this.omsService.processOrderRequest(req.body);
      res.status(result.approved ? 201 : 400).json({ success: result.approved, result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /oms/cancel
   */
  async cancelOrder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = CancelOrderDTO.validate(req.body);
      if (!validation.valid) {
        res.status(400).json({ success: false, errors: validation.errors });
        return;
      }
      const result = await this.omsService.cancelOrder(req.body.orderId, req.body.reason);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /oms/expire
   */
  async expireOrder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderId, reason } = req.body;
      if (!orderId) {
        res.status(400).json({ success: false, message: "orderId is required" });
        return;
      }
      const result = await this.omsService.expireOrder(orderId, reason);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /oms/retry
   */
  async retryOrder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = RetryOrderDTO.validate(req.body);
      if (!validation.valid) {
        res.status(400).json({ success: false, errors: validation.errors });
        return;
      }
      const result = await this.omsService.retryOrder(req.body.orderId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * Backward compatibility handler for legacy /orders endpoint
   */
  async processDecisionPackage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.omsService.processDecisionPackage(req.body);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getOrderBook(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.omsService.getOrderBook();
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getEvents(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.omsService.getEvents();
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
