import { Request, Response } from "express";
import { MarketplaceService } from "../services";

export class MarketplaceController {
  private service: MarketplaceService;

  constructor() {
    this.service = new MarketplaceService();
  }

  getMarketplaces = async (req: Request, res: Response) => {
    try {
      const data = await this.service.getMarketplaces();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getPublications = async (req: Request, res: Response) => {
    try {
      const data = await this.service.getPublications();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getTemplates = async (req: Request, res: Response) => {
    try {
      const data = await this.service.getTemplates();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getFeatured = async (req: Request, res: Response) => {
    try {
      const data = await this.service.getFeatured();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getReviews = async (req: Request, res: Response) => {
    try {
      const { publicationId } = req.query;
      const data = await this.service.getReviews(publicationId as string | undefined);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getUsageStatistics = async (req: Request, res: Response) => {
    try {
      const data = await this.service.getUsageStatistics();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  publishStrategy = async (req: Request, res: Response) => {
    try {
      const data = await this.service.publishStrategy(req.body);
      res.status(201).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  installStrategy = async (req: Request, res: Response) => {
    try {
      const data = await this.service.installStrategy(req.body);
      res.status(201).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  cloneStrategy = async (req: Request, res: Response) => {
    try {
      const data = await this.service.cloneStrategy(req.body);
      res.status(201).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
