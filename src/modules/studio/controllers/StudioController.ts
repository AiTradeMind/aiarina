import { Request, Response } from "express";
import { studioService } from "../services/StudioService";
import { AuthenticatedRequest } from "../../../middleware/auth";

export class StudioController {
  async getStudioData(req: AuthenticatedRequest, res: Response): Promise<void> {
    const type = req.path.split('/').pop() || 'dashboard';
    const result = await studioService.getStudioData(type);
    res.json({ status: "success", data: result });
  }
}

export const studioController = new StudioController();
