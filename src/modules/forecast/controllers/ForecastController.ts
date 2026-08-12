import { Request, Response } from "express";
import { forecastService } from "../services/ForecastService";
import { AuthenticatedRequest } from "../../../middleware/auth";

export class ForecastController {
  async getForecast(req: AuthenticatedRequest, res: Response): Promise<void> {
    const config = req.body;
    const result = await forecastService.runForecast(config);
    res.json({ status: "success", data: result });
  }

  async getHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ status: "success", data: [] });
  }
}
export const forecastController = new ForecastController();
