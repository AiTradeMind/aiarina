import { Router } from "express";
import { HealthService } from "./index";

export const healthRouter = Router();
const healthService = new HealthService();

healthRouter.get("/", async (req, res) => {
  const report = await healthService.check();
  const httpStatus = report.status === "DOWN" ? 503 : 200;
  res.status(httpStatus).json(report);
});
