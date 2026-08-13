import { Request, Response } from "express";
import { FundService } from "../services/fund.service.ts";
import logger from "../../../lib/logger.ts";

export class FundController {
  private fundService: FundService;

  constructor() {
    this.fundService = FundService.getInstance();
  }

  public async getFunds(req: Request, res: Response): Promise<void> {
    try {
      const funds = await this.fundService.getAllFunds();
      res.status(200).json({ success: true, count: funds.length, data: funds });
    } catch (error: any) {
      logger.error({ error: error?.message }, "Failed to get funds");
      res.status(500).json({ success: false, error: error?.message || "Internal server error" });
    }
  }

  public async getFundById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const fund = await this.fundService.getFundById(id);
      if (!fund) {
        res.status(404).json({ success: false, error: `Fund account '${id}' not found.` });
        return;
      }
      res.status(200).json({ success: true, data: fund });
    } catch (error: any) {
      logger.error({ error: error?.message, fundId: req.params.id }, "Failed to get fund by id");
      res.status(500).json({ success: false, error: error?.message || "Internal server error" });
    }
  }

  public async getHealth(req: Request, res: Response): Promise<void> {
    try {
      const health = await this.fundService.getHealth();
      res.status(200).json({ success: true, data: health });
    } catch (error: any) {
      logger.error({ error: error?.message }, "Failed to get fund health");
      res.status(500).json({ success: false, error: error?.message || "Internal server error" });
    }
  }

  public async getAllocations(req: Request, res: Response): Promise<void> {
    try {
      const { fundId } = req.query;
      const allocations = await this.fundService.getAllocations(fundId as string);
      res.status(200).json({ success: true, count: allocations.length, data: allocations });
    } catch (error: any) {
      logger.error({ error: error?.message }, "Failed to get fund allocations");
      res.status(500).json({ success: false, error: error?.message || "Internal server error" });
    }
  }

  public async getReservations(req: Request, res: Response): Promise<void> {
    try {
      const { fundId } = req.query;
      const reservations = await this.fundService.getReservations(fundId as string);
      res.status(200).json({ success: true, count: reservations.length, data: reservations });
    } catch (error: any) {
      logger.error({ error: error?.message }, "Failed to get fund reservations");
      res.status(500).json({ success: false, error: error?.message || "Internal server error" });
    }
  }

  public async createFund(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.fundService.createFund(req.body);
      if (!result.success) {
        res.status(400).json({ success: false, ...result });
        return;
      }
      res.status(201).json({ success: true, ...result });
    } catch (error: any) {
      logger.error({ error: error?.message }, "Failed to create fund");
      res.status(500).json({ success: false, error: error?.message || "Internal server error" });
    }
  }

  public async allocateCapital(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.fundService.allocateCapital(req.body);
      if (!result.success) {
        res.status(400).json({ success: false, ...result });
        return;
      }
      res.status(200).json({ success: true, ...result });
    } catch (error: any) {
      logger.error({ error: error?.message }, "Failed to allocate capital");
      res.status(500).json({ success: false, error: error?.message || "Internal server error" });
    }
  }

  public async reserveCapital(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.fundService.reserveCapital(req.body);
      if (!result.success) {
        res.status(400).json({ success: false, ...result });
        return;
      }
      res.status(200).json({ success: true, ...result });
    } catch (error: any) {
      logger.error({ error: error?.message }, "Failed to reserve capital");
      res.status(500).json({ success: false, error: error?.message || "Internal server error" });
    }
  }

  public async releaseCapital(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.fundService.releaseCapital(req.body);
      if (!result.success) {
        res.status(400).json({ success: false, ...result });
        return;
      }
      res.status(200).json({ success: true, ...result });
    } catch (error: any) {
      logger.error({ error: error?.message }, "Failed to release capital");
      res.status(500).json({ success: false, error: error?.message || "Internal server error" });
    }
  }

  public async freezeFund(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.fundService.freezeFund(req.body);
      if (!result.success) {
        res.status(400).json({ success: false, ...result });
        return;
      }
      res.status(200).json({ success: true, ...result });
    } catch (error: any) {
      logger.error({ error: error?.message }, "Failed to freeze fund");
      res.status(500).json({ success: false, error: error?.message || "Internal server error" });
    }
  }

  public async unfreezeFund(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.fundService.unfreezeFund(req.body);
      if (!result.success) {
        res.status(400).json({ success: false, ...result });
        return;
      }
      res.status(200).json({ success: true, ...result });
    } catch (error: any) {
      logger.error({ error: error?.message }, "Failed to unfreeze fund");
      res.status(500).json({ success: false, error: error?.message || "Internal server error" });
    }
  }
}
