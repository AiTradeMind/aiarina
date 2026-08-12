import { Request, Response } from "express";
import { VersioningService } from "../services/index.ts";
import { runSafeStartupSeed } from "../../../../db/client";

const versioningService = new VersioningService();
// Seed safely behind connection verification
runSafeStartupSeed(() => versioningService.seedInitialData());

export class VersioningController {
  async getVersions(req: Request, res: Response) {
    try {
      const strategyId = req.params.strategyId || req.query.strategyId as string || 'STRAT-001';
      const data = await versioningService.getVersions(strategyId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getVersionById(req: Request, res: Response) {
    try {
      const data = await versioningService.getVersionById(req.params.id);
      if (!data) return res.status(404).json({ error: 'Version not found' });
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async compareVersions(req: Request, res: Response) {
    try {
      const { v1, v2 } = req.query;
      const data = await versioningService.compareVersions(v1 as string, v2 as string);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getHistory(req: Request, res: Response) {
    try {
      const strategyId = req.params.strategyId || req.params.id || 'STRAT-001';
      const data = await versioningService.getHistory(strategyId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async createVersion(req: Request, res: Response) {
    try {
      const result = await versioningService.createVersion(req.body);
      if (!result.success) return res.status(400).json({ error: result.error });
      res.json(result.data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async releaseVersion(req: Request, res: Response) {
    try {
      const { versionId, operator } = req.body;
      const result = await versioningService.releaseVersion(versionId, operator || 'Enterprise Operator');
      if (!result.success) return res.status(400).json({ error: result.error });
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async rollbackVersion(req: Request, res: Response) {
    try {
      const result = await versioningService.rollbackVersion(req.body);
      if (!result.success) return res.status(400).json({ error: result.error });
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async archiveVersion(req: Request, res: Response) {
    try {
      const { versionId, operator } = req.body;
      const result = await versioningService.archiveVersion(versionId, operator || 'Enterprise Operator');
      if (!result.success) return res.status(400).json({ error: result.error });
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async restoreVersion(req: Request, res: Response) {
    try {
      const result = await versioningService.restoreVersion(req.body);
      if (!result.success) return res.status(400).json({ error: result.error });
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async cloneVersion(req: Request, res: Response) {
    try {
      const result = await versioningService.cloneVersion(req.body);
      if (!result.success) return res.status(400).json({ error: result.error });
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getDiff(req: Request, res: Response) {
    try {
      const data = await versioningService.getDiff(req.params.id);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getChangelog(req: Request, res: Response) {
    try {
      const data = await versioningService.getChangelog(req.params.id);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAnalytics(req: Request, res: Response) {
    try {
      const strategyId = req.query.strategyId as string;
      const data = await versioningService.getAnalytics(strategyId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
