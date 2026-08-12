import { Request, Response, NextFunction } from "express";
import { GenesisCoordinatorService } from "../modules/genesis/services/genesis-coordinator.service.ts";

export function enforceTradingLock(req: Request, res: Response, next: NextFunction) {
  const lockCheck = GenesisCoordinatorService.verifyTradingLockAllowed();
  if (!lockCheck.allowed) {
    return res.status(403).json({
      status: "ERROR",
      code: lockCheck.code || "AI_NOT_ACTIVATED",
      message: lockCheck.message || "Trading operation rejected by Genesis Trading Lock Engine. System is in Zero State and AI Models are OFF.",
    });
  }
  next();
}
