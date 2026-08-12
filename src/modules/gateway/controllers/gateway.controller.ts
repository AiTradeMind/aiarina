import { Request, Response } from 'express';
import { EnterpriseGatewayService } from '../services/gateway.service';
import { EnterpriseGatewayValidator } from '../validators/gateway.validator';

export class EnterpriseGatewayController {
  // GET /api/gateway
  public static async getOverview(req: Request, res: Response): Promise<void> {
    try {
      const data = EnterpriseGatewayService.getDashboardOverview();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // GET /api/gateway/status
  public static async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const data = await EnterpriseGatewayService.getGatewayStatus();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // GET /api/gateway/health
  public static async getHealth(req: Request, res: Response): Promise<void> {
    try {
      const data = await EnterpriseGatewayService.getGatewayHealth();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // GET /api/gateway/routes
  public static getRoutes(req: Request, res: Response): void {
    try {
      const data = EnterpriseGatewayService.getRoutes();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // GET /api/gateway/registry
  public static async getRegistry(req: Request, res: Response): Promise<void> {
    try {
      const data = await EnterpriseGatewayService.getRegistry();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // GET /api/gateway/metrics
  public static async getMetrics(req: Request, res: Response): Promise<void> {
    try {
      const data = await EnterpriseGatewayService.getMetrics();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // GET /api/gateway/logs
  public static async getLogs(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const data = await EnterpriseGatewayService.getLogs(limit);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // GET /api/gateway/usage
  public static async getUsage(req: Request, res: Response): Promise<void> {
    try {
      const data = await EnterpriseGatewayService.getUsage();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // GET /api/gateway/policies
  public static async getPolicies(req: Request, res: Response): Promise<void> {
    try {
      const data = await EnterpriseGatewayService.getPolicies();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // GET /api/gateway/versions
  public static getVersions(req: Request, res: Response): void {
    try {
      const data = EnterpriseGatewayService.getVersions();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // POST /api/gateway/verify
  public static async verifyRequest(req: Request, res: Response): Promise<void> {
    try {
      const validation = EnterpriseGatewayValidator.validateVerifyRequest(req.body);
      if (!validation.valid) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          details: validation.errors
        });
        return;
      }

      const response = await EnterpriseGatewayService.verifyGatewayRequest(req.body);
      res.status(response.statusCode).json(response);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // Existing methods for backward compatibility
  public static getDashboard(req: Request, res: Response): void {
    try {
      const data = EnterpriseGatewayService.getDashboardOverview();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getApiKeys(req: Request, res: Response): void {
    try {
      const data = EnterpriseGatewayService.getApiKeys();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getRateLimits(req: Request, res: Response): void {
    try {
      const data = EnterpriseGatewayService.getRateLimits();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getWebhooks(req: Request, res: Response): void {
    try {
      const data = EnterpriseGatewayService.getWebhooks();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getConnectors(req: Request, res: Response): void {
    try {
      const data = EnterpriseGatewayService.getConnectors();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getAnalytics(req: Request, res: Response): void {
    try {
      const data = EnterpriseGatewayService.getAnalytics();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getAudit(req: Request, res: Response): void {
    try {
      const data = EnterpriseGatewayService.getAuditLogs();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static handleWebhook(req: Request, res: Response): void {
    try {
      const data = EnterpriseGatewayService.processWebhook(req.body);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static validateRequest(req: Request, res: Response): void {
    try {
      const data = EnterpriseGatewayService.validateRequest(req.body);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static reloadGateway(req: Request, res: Response): void {
    try {
      const data = EnterpriseGatewayService.reloadGateway();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static getQaReport(req: Request, res: Response): void {
    try {
      const data = EnterpriseGatewayService.runEp27QaSuite();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
