import { Response, NextFunction } from "express";
import { PortfolioService } from "../services/portfolio.service.ts";
import { PortfolioHealthService } from "../services/portfolio-health.service.ts";
import { AuthenticatedRequest } from "../../../middleware/auth.ts";
import { OMSExecutionDTO } from "../dtos/portfolio.dto.ts";

export class PortfolioController {
  private portfolioService: PortfolioService;
  private healthService: PortfolioHealthService;

  constructor() {
    this.portfolioService = new PortfolioService();
    this.healthService = new PortfolioHealthService();
  }

  /**
   * GET /portfolio
   */
  async getPortfolios(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.portfolioService.getPortfolios();
      res.status(200).json({ success: true, count: result.length, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /portfolio/:id
   */
  async getPortfolio(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id;
      const result = await this.portfolioService.getPortfolio(id);
      if (!result) {
        res.status(404).json({ success: false, message: `Portfolio '${id}' not found.` });
        return;
      }
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /portfolio/positions
   */
  async getPositions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const portfolioId = (req.query.portfolioId as string) || "PF-MAIN-001";
      const status = req.query.status as string | undefined;
      const result = await this.portfolioService.getPositions(portfolioId, status);
      res.status(200).json({ success: true, count: result.length, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /portfolio/holdings
   */
  async getHoldings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const portfolioId = (req.query.portfolioId as string) || "PF-MAIN-001";
      const result = await this.portfolioService.getHoldings(portfolioId);
      res.status(200).json({ success: true, count: result.length, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /portfolio/pnl
   */
  async getPnL(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const portfolioId = (req.query.portfolioId as string) || "PF-MAIN-001";
      const result = await this.portfolioService.getPnL(portfolioId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /portfolio/exposure
   */
  async getExposure(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const portfolioId = (req.query.portfolioId as string) || "PF-MAIN-001";
      const result = await this.portfolioService.getExposure(portfolioId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /portfolio/snapshots
   */
  async getSnapshots(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const portfolioId = (req.query.portfolioId as string) || "PF-MAIN-001";
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
      const result = await this.portfolioService.getSnapshots(portfolioId, limit);
      res.status(200).json({ success: true, count: result.length, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /portfolio/history
   */
  async getHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const portfolioId = (req.query.portfolioId as string) || "PF-MAIN-001";
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
      const result = await this.portfolioService.getHistory(portfolioId, limit);
      res.status(200).json({ success: true, count: result.length, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /portfolio/health
   */
  async getHealth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const portfolioId = (req.query.portfolioId as string) || "PF-MAIN-001";
      const health = await this.healthService.getHealthReport(portfolioId);
      res.status(200).json({ success: true, health });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /portfolio/oms-update
   * Internal ingestion route for receiving execution updates ONLY from OMS
   */
  async receiveOMSExecution(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = OMSExecutionDTO.validate(req.body);
      if (!validation.valid) {
        res.status(400).json({ success: false, errors: validation.errors });
        return;
      }

      const execution = OMSExecutionDTO.fromPayload(req.body);
      const source = req.headers["x-service-source"] as string || "OMS";

      const result = await this.portfolioService.processOMSExecution(execution, source);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * Direct trade execution rejection guard
   */
  async rejectDirectTrade(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    res.status(403).json({
      success: false,
      message: "Governance Restriction: Portfolio module NEVER executes trades directly. Submit trades via OMS.",
    });
  }
}
