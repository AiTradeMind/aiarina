import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../../middleware/auth.ts";
import { researchEP06Service } from "../services/ResearchEP06Service.ts";

export class ResearchEP06Controller {
  
  async createProject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body;
      const result = await researchEP06Service.createProject(data);
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getProjects(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await researchEP06Service.getProjects();
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async createJob(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body;
      const result = await researchEP06Service.createJob(data);
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getJobs(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await researchEP06Service.getJobs();
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async toggleJob(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { jobId, status } = req.body;
      await researchEP06Service.toggleJobStatus(jobId, status);
      res.status(200).json({
        success: true,
        message: "Job status toggled successfully."
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async triggerJob(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { jobId } = req.body;
      const task = await researchEP06Service.triggerJobRun(jobId);
      res.status(200).json({
        success: true,
        data: task
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getWatchlists(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await researchEP06Service.getWatchlists();
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async createWatchlist(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await researchEP06Service.createWatchlist(req.body);
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async updateWatchlistSymbols(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, symbols } = req.body;
      await researchEP06Service.updateWatchlistSymbols(id, symbols);
      res.status(200).json({
        success: true,
        message: "Watchlist updated successfully."
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getScanner(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const instrumentType = (req.query.instrumentType as any) || 'EQUITY';
      const scanType = (req.query.scanType as any) || 'Volume Leaders';
      const result = await researchEP06Service.scanMarket(instrumentType, scanType);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getDatasets(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await researchEP06Service.getDatasets();
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async createDataset(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await researchEP06Service.createDataset(req.body);
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getEvidence(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await researchEP06Service.getEvidence();
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async createEvidence(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await researchEP06Service.createEvidence(req.body);
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getNotes(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await researchEP06Service.getNotes();
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async createNote(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await researchEP06Service.createNote(req.body);
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getTimeline(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await researchEP06Service.getTimeline();
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getRuntimeTasks(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await researchEP06Service.getRuntimeTasks();
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getEvents(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await researchEP06Service.getEvents();
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async resetTestData(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { confirm, resetState } = req.body || {};
      const actor = req.user?.email || "SYSTEM_ADMIN";
      const organizationId = req.user?.organizationId || "ORG_DEFAULT";
      
      const result = await researchEP06Service.resetTestData({
        confirm: Boolean(confirm),
        resetState: resetState || "OFF",
        actor,
        organizationId
      });
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || "Research test reset operation failed"
      });
    }
  }

  async getEngineState(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const state = researchEP06Service.getEngineState();
      res.status(200).json({
        success: true,
        data: state
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async setEngineState(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { state } = req.body || {};
      if (state !== 'ON' && state !== 'OFF') {
        res.status(400).json({
          success: false,
          error: "Invalid state. Expected 'ON' or 'OFF'."
        });
        return;
      }
      const newState = researchEP06Service.setEngineState(state);
      res.status(200).json({
        success: true,
        data: newState
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

export const researchEP06Controller = new ResearchEP06Controller();
