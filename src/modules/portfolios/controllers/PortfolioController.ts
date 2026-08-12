import { Request, Response } from "express";
import { portfolioService } from "../services/PortfolioService.ts";
import { AuthenticatedRequest } from "../../../middleware/auth";
import { portfolioRepository } from "../repositories/PortfolioRepository.ts";

export class PortfolioController {
  // GET /api/portfolio
  public async getPortfolios(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const organizationId = req.user?.organizationId || "org_dev_123";
      const portfolios = await portfolioRepository.getPortfoliosByOrg(organizationId);
      res.status(200).json({ success: true, data: portfolios });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // GET /api/portfolio/summary
  public async getPortfolioSummary(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const organizationId = req.user?.organizationId || "org_dev_123";
      const portfolioId = req.query.portfolioId as string || "default_portfolio";
      const data = await portfolioService.getPortfolioSummary(portfolioId, organizationId);
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // GET /api/portfolio/history
  public async getPortfolioHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const portfolioId = req.query.portfolioId as string || "default_portfolio";
      const data = await portfolioService.getPortfolioHistory(portfolioId);
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // GET /api/positions
  public async getPositions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const portfolioId = req.query.portfolioId as string;
      if (!portfolioId) {
        res.status(400).json({ error: "portfolioId query param is required" });
        return;
      }
      const data = await portfolioService.getPositions(portfolioId);
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // GET /api/positions/open
  public async getOpenPositions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const portfolioId = req.query.portfolioId as string;
      if (!portfolioId) {
        res.status(400).json({ error: "portfolioId query param is required" });
        return;
      }
      const data = await portfolioService.getPositions(portfolioId, 'OPEN');
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // GET /api/positions/closed
  public async getClosedPositions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const portfolioId = req.query.portfolioId as string;
      if (!portfolioId) {
        res.status(400).json({ error: "portfolioId query param is required" });
        return;
      }
      const data = await portfolioService.getPositions(portfolioId, 'CLOSED');
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // GET /api/positions/:id
  public async getPositionById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const organizationId = req.user?.organizationId || "org_dev_123";
      const data = await portfolioService.getPositionById(req.params.id, organizationId);
      if (!data) {
        res.status(404).json({ error: "Position not found" });
        return;
      }
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}

export const portfolioController = new PortfolioController();
