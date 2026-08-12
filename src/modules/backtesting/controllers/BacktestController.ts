import { Request, Response } from "express";
import { backtestCoordinator } from "../services/BacktestCoordinator";
import { backtestValidator } from "../validators/BacktestValidator";
import { AuthenticatedRequest } from "../../../middleware/auth";

export class BacktestController {
  async runBacktest(req: AuthenticatedRequest, res: Response): Promise<void> {
    const config = req.body;
    if (!backtestValidator.validateConfig(config)) {
      res.status(400).json({ status: "error", message: "Invalid config" });
      return;
    }
    const result = await backtestCoordinator.coordinateBacktest(config);
    res.json({ status: "success", data: result });
  }

  async getHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ status: "success", data: [] });
  }
}

export const backtestController = new BacktestController();
