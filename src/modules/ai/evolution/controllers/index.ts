import { Request, Response } from "express";
import { EvolutionService } from "../services/index.ts";
import { runSafeStartupSeed } from "../../../../db/client";

const evolutionService = new EvolutionService();

// Initialize data safely behind connection verification
runSafeStartupSeed(() => evolutionService.seedInitialData());

export class EvolutionController {
  async getProfiles(req: Request, res: Response) {
    try {
      const profiles = await evolutionService.getProfiles();
      res.json(profiles);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getPatterns(req: Request, res: Response) {
    try {
      const patterns = await evolutionService.getPatterns();
      res.json(patterns);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getHistory(req: Request, res: Response) {
    try {
      const history = await evolutionService.getHistory();
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getSnapshots(req: Request, res: Response) {
    try {
      const snapshots = await evolutionService.getSnapshots();
      res.json(snapshots);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async learn(req: Request, res: Response) {
    try {
      const { modelId, eventType, category, description } = req.body;
      const result = await evolutionService.learn(modelId, eventType, category, description);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async analyze(req: Request, res: Response) {
    try {
      const { modelId } = req.body;
      const result = await evolutionService.analyze(modelId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async snapshot(req: Request, res: Response) {
    try {
      const { modelId, reason } = req.body;
      const result = await evolutionService.snapshot(modelId, reason);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
