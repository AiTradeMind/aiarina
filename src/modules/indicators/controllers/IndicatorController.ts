import { Request, Response } from "express";
import { indicatorService } from "../services/IndicatorService.ts";
import { indicatorRepo } from "../repositories/IndicatorRepository.ts";

export class IndicatorController {
  
  public getDefinitions = async (req: Request, res: Response): Promise<void> => {
    try {
      const defs = indicatorService.registry.getAll();
      res.json({ success: true, data: defs });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  public createDefinition = async (req: Request, res: Response): Promise<void> => {
    try {
      const { indicatorId, name, type, parameters } = req.body;
      if (!indicatorId || !name || !type) {
        res.status(400).json({ success: false, error: "Missing required properties: indicatorId, name, type." });
        return;
      }

      const newDef = { indicatorId, name, type, parameters: parameters || {} };
      indicatorService.registry.register(newDef);
      await indicatorRepo.saveDefinition(newDef);

      res.status(201).json({ success: true, message: "Indicator definition registered successfully.", data: newDef });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  public getReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const symbol = (req.query.symbol as string) || "RELIANCE";
      const timeframe = (req.query.timeframe as string) || "1h";
      const barsCount = parseInt(req.query.barsCount as string) || 120;

      const report = await indicatorService.getConsolidatedIndicatorReport(symbol, timeframe, barsCount);
      res.json({ success: true, data: report });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  public getMultiTimeframe = async (req: Request, res: Response): Promise<void> => {
    try {
      const symbol = (req.query.symbol as string) || "RELIANCE";
      const tfs = req.query.timeframes 
        ? (req.query.timeframes as string).split(",") 
        : ["5m", "15m", "1h", "1d"];

      const matrix = await indicatorService.getMultiTimeframeAnalysis(symbol, tfs);
      res.json({ success: true, data: { symbol, matrix } });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  public getSignals = async (req: Request, res: Response): Promise<void> => {
    try {
      const symbol = req.query.symbol as string;
      const timeframe = req.query.timeframe as string;

      const signals = await indicatorRepo.getSignals(symbol, timeframe);
      res.json({ success: true, data: signals });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  public getSignalHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const symbol = req.query.symbol as string;
      const history = await indicatorRepo.getSignalHistory(symbol);
      res.json({ success: true, data: history });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  public getHealth = async (req: Request, res: Response): Promise<void> => {
    try {
      const report = indicatorService.health.getHealthReport();
      res.json({ success: true, data: report });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  /**
   * Post custom bars array & parameter configs to calculate indicator values dynamically.
   */
  public calculateDynamic = async (req: Request, res: Response): Promise<void> => {
    try {
      const { type, bars, parameters } = req.body;
      if (!type || !Array.isArray(bars)) {
        res.status(400).json({ success: false, error: "Type string and bars array are required in payload." });
        return;
      }

      const results = indicatorService.calculateIndicator(type, bars, parameters || {});
      res.json({ success: true, data: results });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };
}

export const indicatorController = new IndicatorController();
