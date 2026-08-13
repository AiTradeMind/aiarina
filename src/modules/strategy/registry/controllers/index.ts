import { Request, Response } from "express";
import { RegistryService } from "../services/index.ts";
import { runSafeStartupSeed } from "../../../../db/client";

const registryService = new RegistryService();
runSafeStartupSeed(() => registryService.seedInitialData());

export class RegistryController {
  async getStrategies(req: Request, res: Response) {
    try {
      const data = await registryService.getStrategies();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getStrategyById(req: Request, res: Response) {
    try {
      const data = await registryService.getStrategyById(req.params.id);
      if (!data) return res.status(404).json({ error: "Not found" });
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getCategories(req: Request, res: Response) {
    try {
      const data = await registryService.getCategories();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getTemplates(req: Request, res: Response) {
    try {
      const data = await registryService.getTemplates();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async registerStrategy(req: Request, res: Response) {
    try {
      const result = await registryService.registerStrategy(req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateStrategy(req: Request, res: Response) {
    try {
      const result = await registryService.updateStrategy(req.params.id, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteStrategy(req: Request, res: Response) {
    try {
      const result = await registryService.deleteStrategy(req.params.id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
