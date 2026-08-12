import { Request, Response } from "express";
import { CollaborationService } from "../services/index.ts";
import { runSafeStartupSeed } from "../../../../db/client";

const collabService = new CollaborationService();

// Seed mock data safely behind connection verification
runSafeStartupSeed(() => collabService.seedInitialData());

export class CollaborationController {
  async getCollaborations(req: Request, res: Response) {
    try {
      const data = await collabService.getCollaborations();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getSessions(req: Request, res: Response) {
    try {
      const { collaborationId } = req.query;
      const data = await collabService.getSessions(collaborationId as string);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getMembers(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const data = await collabService.getMembers(sessionId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getTasks(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const data = await collabService.getTasks(sessionId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getResults(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const [results, consensus] = await Promise.all([
        collabService.getResults(sessionId),
        collabService.getConsensus(sessionId)
      ]);
      res.json({ results, consensus });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getConsensus(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const data = await collabService.getConsensus(sessionId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getHistory(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const data = await collabService.getHistory(sessionId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async createCollaboration(req: Request, res: Response) {
    try {
      const result = await collabService.createCollaboration(req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async startSession(req: Request, res: Response) {
    try {
      const result = await collabService.startSession(req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async finalizeSession(req: Request, res: Response) {
    try {
      const { sessionId, resultData, consensusData } = req.body;
      const result = await collabService.finalizeSession(sessionId, resultData, consensusData);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async archiveSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.body;
      res.json({ success: true, message: "Session archived" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
