import { Response, NextFunction } from "express";
import { PMSService } from "../services/index.ts";
import { AuthenticatedRequest } from "../../../middleware/auth.ts";

const pmsService = new PMSService();

export class PMSController {
  async getPortfolios(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await pmsService.getPortfolios();
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getPortfolio(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await pmsService.getPortfolio(id);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getPositions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const portfolioId = req.query.portfolioId ? parseInt(req.query.portfolioId as string, 10) : undefined;
      const result = await pmsService.getPositions(portfolioId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getHoldings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const portfolioId = req.query.portfolioId ? parseInt(req.query.portfolioId as string, 10) : undefined;
      const result = await pmsService.getHoldings(portfolioId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getExposure(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const portfolioId = req.query.portfolioId ? parseInt(req.query.portfolioId as string, 10) : undefined;
      const result = await pmsService.getExposure(portfolioId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getPerformance(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const portfolioId = req.query.portfolioId ? parseInt(req.query.portfolioId as string, 10) : undefined;
      const result = await pmsService.getPerformance(portfolioId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getPnL(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const portfolioId = req.query.portfolioId ? parseInt(req.query.portfolioId as string, 10) : undefined;
      const result = await pmsService.getPnL(portfolioId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
