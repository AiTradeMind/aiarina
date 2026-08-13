import { Request, Response } from "express";
import { LifecycleService } from "../services/index.ts";

const lifecycleService = new LifecycleService();

export class LifecycleController {
  async getLifecycles(req: Request, res: Response) {
    const lifecycles = await lifecycleService.getLifecycles();
    res.json(lifecycles);
  }

  async getLifecycle(req: Request, res: Response) {
    const modelId = parseInt(req.params.modelId);
    const lifecycle = await lifecycleService.getLifecycleByModelId(modelId);
    if (!lifecycle) return res.status(404).json({ error: "Lifecycle not found" });
    res.json(lifecycle);
  }

  async transition(req: Request, res: Response) {
    const modelId = parseInt(req.params.modelId);
    const { newState, userId, reason, notes } = req.body;
    const result = await lifecycleService.transitionState({ modelId, newState, userId, reason, notes });
    if (!result.success) return res.status(400).json({ error: result.error });
    res.json({ success: true });
  }
}
