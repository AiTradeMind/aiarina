import { Request, Response } from "express";
import { genesisCoordinatorService, GenesisCoordinatorService } from "../services/genesis-coordinator.service.ts";

export class GenesisController {
  async startGenesis(req: Request, res: Response) {
    try {
      const result = await genesisCoordinatorService.runGenesisBoot();
      res.status(200).json({
        status: "SUCCESS",
        message: "Enterprise Genesis Boot completed successfully. Platform initialized in Zero State with Trading Lock enabled.",
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        status: "ERROR",
        message: error.message || "Genesis Boot execution failed",
      });
    }
  }

  async resetGenesis(req: Request, res: Response) {
    try {
      const result = await genesisCoordinatorService.resetToZeroState();
      res.status(200).json({
        status: "SUCCESS",
        message: "Enterprise reset to Factory Zero State completed successfully.",
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        status: "ERROR",
        message: error.message || "Genesis reset failed",
      });
    }
  }

  async getGenesisStatus(req: Request, res: Response) {
    try {
      const status = await genesisCoordinatorService.getGenesisStatus();
      res.status(200).json({
        status: "SUCCESS",
        data: status,
      });
    } catch (error: any) {
      res.status(500).json({
        status: "ERROR",
        message: error.message || "Failed to retrieve Genesis status",
      });
    }
  }

  async getSystemState(req: Request, res: Response) {
    try {
      const status = await genesisCoordinatorService.getGenesisStatus();
      const lockCheck = GenesisCoordinatorService.verifyTradingLockAllowed();
      res.status(200).json({
        status: "SUCCESS",
        data: {
          zeroState: status.zeroState,
          tradingLock: lockCheck,
          systemStatus: "ZERO_STATE_READY",
          activeAiModels: 0,
          totalAiModels: 28,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        status: "ERROR",
        message: error.message || "Failed to retrieve System State",
      });
    }
  }

  async getSystemBoot(req: Request, res: Response) {
    try {
      const status = await genesisCoordinatorService.getGenesisStatus();
      res.status(200).json({
        status: "SUCCESS",
        data: status.bootConfig,
      });
    } catch (error: any) {
      res.status(500).json({
        status: "ERROR",
        message: error.message || "Failed to retrieve System Boot record",
      });
    }
  }
}

export const genesisController = new GenesisController();
