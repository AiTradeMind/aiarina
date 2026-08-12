import { Response, NextFunction } from "express";
import { TradeJournalService } from "../services/index.ts";
import { AuthenticatedRequest } from "../../../middleware/auth.ts";

const tradeJournalService = new TradeJournalService();

export class TradeJournalController {
  async getTrades(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await tradeJournalService.getTrades();
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getTrade(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await tradeJournalService.getTrade(id);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getJournal(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const tradeId = req.query.tradeId ? parseInt(req.query.tradeId as string, 10) : undefined;
      const result = await tradeJournalService.getJournal(tradeId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getTimeline(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const tradeId = req.query.tradeId ? parseInt(req.query.tradeId as string, 10) : undefined;
      const result = await tradeJournalService.getTimeline(tradeId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getReplay(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const tradeId = req.query.tradeId ? parseInt(req.query.tradeId as string, 10) : undefined;
      const result = await tradeJournalService.getReplay(tradeId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getEvidence(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const tradeId = req.query.tradeId ? parseInt(req.query.tradeId as string, 10) : undefined;
      const result = await tradeJournalService.getEvidence(tradeId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getPerformance(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const tradeId = req.query.tradeId ? parseInt(req.query.tradeId as string, 10) : undefined;
      const result = await tradeJournalService.getPerformance(tradeId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
