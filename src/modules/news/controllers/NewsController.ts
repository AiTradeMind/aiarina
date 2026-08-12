import { Request, Response } from "express";
import { newsService } from "../services/NewsService.ts";
import { newsRepo } from "../repositories/NewsRepository.ts";

export class NewsController {

  public getNews = async (req: Request, res: Response): Promise<void> => {
    try {
      const category = req.query.category as string;
      const priority = req.query.priority as string;
      const limit = parseInt(req.query.limit as string) || 50;

      const articles = await newsService.searchArticles({ category, priority, limit });
      res.json({ success: true, data: articles });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  public getLatest = async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 30;
      const articles = await newsRepo.getLatestArticles(limit);
      res.json({ success: true, data: articles });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  public search = async (req: Request, res: Response): Promise<void> => {
    try {
      const keyword = req.query.keyword as string;
      const category = req.query.category as string;
      const companySymbol = req.query.companySymbol as string;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      const tag = req.query.tag as string;
      const priority = req.query.priority as string;
      const limit = parseInt(req.query.limit as string) || 100;

      const articles = await newsService.searchArticles({
        keyword,
        category,
        companySymbol,
        startDate,
        endDate,
        tag,
        priority,
        limit
      });

      res.json({ success: true, data: articles });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  public getByCompany = async (req: Request, res: Response): Promise<void> => {
    try {
      const symbol = req.params.symbol;
      if (!symbol) {
        res.status(400).json({ success: false, error: "Company symbol parameter is required." });
        return;
      }

      const limit = parseInt(req.query.limit as string) || 50;
      const articles = await newsService.searchArticles({ companySymbol: symbol, limit });
      res.json({ success: true, data: articles });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  public getCategories = async (req: Request, res: Response): Promise<void> => {
    try {
      const categories = await newsRepo.getCategories();
      res.json({ success: true, data: categories });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  public getCorporateActions = async (req: Request, res: Response): Promise<void> => {
    try {
      const symbol = req.query.symbol as string;
      const type = req.query.type as string;

      const actions = await newsRepo.getCorporateActions(symbol, type);
      res.json({ success: true, data: actions });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  public getCorporateActionsBySymbol = async (req: Request, res: Response): Promise<void> => {
    try {
      const symbol = req.params.symbol;
      if (!symbol) {
        res.status(400).json({ success: false, error: "Symbol parameter is required." });
        return;
      }

      const actions = await newsRepo.getCorporateActions(symbol);
      res.json({ success: true, data: actions });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  public getEconomicCalendar = async (req: Request, res: Response): Promise<void> => {
    try {
      const country = req.query.country as string;
      const category = req.query.category as string;

      const events = await newsRepo.getEconomicEvents(country, category);
      res.json({ success: true, data: events });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  public getUpcomingEconomicEvents = async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const events = await newsRepo.getUpcomingEconomicEvents(limit);
      res.json({ success: true, data: events });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  public getHealth = async (req: Request, res: Response): Promise<void> => {
    try {
      const report = newsService.health.getHealthReport();
      const dbCounts = await newsRepo.getCounts();

      res.json({
        success: true,
        data: {
          ...report,
          dbStats: dbCounts
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };
}

export const newsController = new NewsController();
