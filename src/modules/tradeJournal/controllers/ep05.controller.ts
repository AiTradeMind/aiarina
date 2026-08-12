import { Request, Response } from "express";
import { tradeService } from "../services/TradeService.ts";
import { AuthenticatedRequest } from "../../../middleware/auth.ts";

export class EP05TradeJournalController {
  // GET /api/trades
  public async getTrades(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const portfolioId = req.query.portfolioId as string;
      if (!portfolioId) {
        res.status(400).json({ error: "portfolioId query param is required" });
        return;
      }
      const data = await tradeService.getTrades(portfolioId);
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // GET /api/trades/open
  public async getOpenTrades(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const portfolioId = req.query.portfolioId as string;
      if (!portfolioId) {
        res.status(400).json({ error: "portfolioId query param is required" });
        return;
      }
      const data = await tradeService.getTrades(portfolioId, 'OPEN'); // Assuming action logic or status
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // GET /api/trades/closed
  public async getClosedTrades(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const portfolioId = req.query.portfolioId as string;
      if (!portfolioId) {
        res.status(400).json({ error: "portfolioId query param is required" });
        return;
      }
      const data = await tradeService.getTrades(portfolioId, 'CLOSED');
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // GET /api/trades/:id
  public async getTradeById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const organizationId = req.user?.organizationId || "org_dev_123";
      const data = await tradeService.getTrade(req.params.id, organizationId);
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // GET /api/pnl/history
  public async getPnlHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const portfolioId = req.query.portfolioId as string;
      if (!portfolioId) {
        res.status(400).json({ error: "portfolioId query param is required" });
        return;
      }
      const data = await tradeService.getPnlSnapshots(portfolioId);
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // GET /api/pnl/statistics
  public async getPnlStatistics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const portfolioId = req.query.portfolioId as string;
      if (!portfolioId) {
        res.status(400).json({ error: "portfolioId query param is required" });
        return;
      }
      const data = await tradeService.getStatistics(portfolioId);
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}

export const ep05TradeJournalController = new EP05TradeJournalController();
