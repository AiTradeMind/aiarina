import { Request, Response } from "express";
import { ResearchSimulationService } from "../services/simulation.service.ts";
import { AssetClass } from "../types/simulation.ts";

export class ResearchSimulationController {
  private service: ResearchSimulationService;

  constructor(service?: ResearchSimulationService) {
    this.service = service || new ResearchSimulationService();
  }

  // GET /api/research/simulation/impact
  public getImpactMatrix = async (req: Request, res: Response): Promise<void> => {
    try {
      const filterClass = req.query.assetClass as AssetClass | undefined;
      const data = await this.service.getImpactMatrix(filterClass);
      res.status(200).json({
        success: true,
        count: data.length,
        data,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error?.message || "Failed to retrieve impact matrix"
      });
    }
  };

  // POST /api/research/simulation/impact/run
  public runImpactSimulation = async (req: Request, res: Response): Promise<void> => {
    try {
      const input = req.body || {};
      const data = await this.service.runImpactSimulation(input);
      res.status(200).json({
        success: true,
        message: "Impact simulation executed successfully",
        count: data.length,
        data,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error?.message || "Failed to execute impact simulation"
      });
    }
  };

  // GET /api/research/simulation/correlations
  public getCorrelations = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.service.getCorrelations();
      res.status(200).json({
        success: true,
        count: data.length,
        data,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error?.message || "Failed to retrieve correlation records"
      });
    }
  };

  // POST /api/research/simulation/correlations/run
  public runCorrelationSimulation = async (req: Request, res: Response): Promise<void> => {
    try {
      const input = req.body || {};
      const data = await this.service.runCorrelationSimulation(input);
      res.status(200).json({
        success: true,
        message: "Correlation simulation executed successfully",
        count: data.length,
        data,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error?.message || "Failed to execute correlation simulation"
      });
    }
  };

  // GET /api/research/simulation/duplicates
  public getDuplicates = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.service.getDuplicates();
      res.status(200).json({
        success: true,
        count: data.length,
        data,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error?.message || "Failed to retrieve duplicate detection records"
      });
    }
  };

  // POST /api/research/simulation/duplicates/run
  public runDuplicateDetection = async (req: Request, res: Response): Promise<void> => {
    try {
      const input = req.body || {};
      const data = await this.service.runDuplicateDetection(input);
      res.status(200).json({
        success: true,
        message: "Duplicate detection executed successfully",
        count: data.length,
        data,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error?.message || "Failed to execute duplicate detection"
      });
    }
  };

  // GET /api/research/simulation/consensus
  public getConsensus = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.service.getConsensusRecords();
      res.status(200).json({
        success: true,
        count: data.length,
        data,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error?.message || "Failed to retrieve research consensus records"
      });
    }
  };

  // POST /api/research/simulation/consensus/run
  public runConsensus = async (req: Request, res: Response): Promise<void> => {
    try {
      const input = req.body || {};
      const record = await this.service.runResearchConsensus(input);
      res.status(200).json({
        success: true,
        message: "Research consensus evaluation executed successfully",
        data: record,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error?.message || "Failed to execute research consensus evaluation"
      });
    }
  };
}
