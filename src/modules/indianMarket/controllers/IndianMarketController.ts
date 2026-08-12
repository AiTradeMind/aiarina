import { Request, Response, NextFunction } from "express";
import { indianMarketService } from "../services/IndianMarketService.ts";

export class IndianMarketController {
  
  // GET /api/indian-market/calendar
  async getCalendar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await indianMarketService.getTradingCalendar();
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/indian-market/calendar
  async addCalendarDay(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { date, dayType, sessionName, description } = req.body;
      if (!date || !dayType) {
        res.status(400).json({ error: "Missing required fields: date, dayType" });
        return;
      }
      if (dayType === 'HOLIDAY') {
        await indianMarketService.addHoliday(date, sessionName || "Regulatory Holiday", description || "");
      } else if (dayType === 'SPECIAL_SESSION') {
        await indianMarketService.addSpecialSession(date, sessionName || "Special Session", description || "");
      } else {
        res.status(400).json({ error: "Invalid dayType. Allowed values: [HOLIDAY, SPECIAL_SESSION]" });
        return;
      }
      res.status(201).json({ success: true, message: "Calendar day added successfully." });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // DELETE /api/indian-market/calendar/:date
  async deleteCalendarDay(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { date } = req.params;
      if (!date) {
        res.status(400).json({ error: "Missing parameter: date" });
        return;
      }
      await indianMarketService.removeCalendarDay(date);
      res.status(200).json({ success: true, message: `Removed calendar configuration for ${date}.` });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/indian-market/session
  async getSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await indianMarketService.getSessions();
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/indian-market/session
  async configureSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionType, isActive, startTime, endTime } = req.body;
      if (!sessionType) {
        res.status(400).json({ error: "Missing sessionType parameter." });
        return;
      }
      if (isActive !== undefined) {
        await indianMarketService.activateSession(sessionType);
      }
      if (startTime && endTime) {
        await indianMarketService.configureSessionTimes(sessionType, startTime, endTime);
      }
      res.status(200).json({ success: true, message: `Configured session: ${sessionType}` });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/indian-market/clock
  async getClock(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      let clock = await indianMarketService.getLatestClock();
      if (!clock) {
        clock = await indianMarketService.synchronizeClock();
      }
      res.status(200).json(clock);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/indian-market/clock/sync
  async syncClock(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const clock = await indianMarketService.synchronizeClock();
      res.status(200).json({ success: true, message: "Clocks synchronized successfully.", clock });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/indian-market/status
  async getStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await indianMarketService.getMarketStatus();
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/indian-market/settlement
  async getSettlement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await indianMarketService.getSettlementState();
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/indian-market/settlement/reconcile
  async runSettlement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await indianMarketService.runSettlementReconciliation();
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/indian-market/expiry
  async getExpiry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await indianMarketService.getExpiries();
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/indian-market/policies
  async getPolicies(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await indianMarketService.getPolicies();
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/indian-market/policies
  async updatePolicy(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { policyName, rules } = req.body;
      if (!policyName || !rules) {
        res.status(400).json({ error: "Missing required fields: policyName, rules" });
        return;
      }
      await indianMarketService.updatePolicy(policyName, rules);
      res.status(200).json({ success: true, message: `Rules for ${policyName} tuned successfully.` });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/indian-market/circuits
  async getCircuits(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { symbol } = req.query;
      const result = await indianMarketService.getCircuits(symbol as string);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/indian-market/circuits/halt
  async triggerHalt(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { symbol, direction, price } = req.body;
      if (!symbol || !direction || !price) {
        res.status(400).json({ error: "Missing parameters: symbol, direction, price" });
        return;
      }
      await indianMarketService.triggerHalt(symbol, direction, price);
      res.status(200).json({ success: true, message: `Halted trading on ${symbol} due to ${direction} circuit trigger.` });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/indian-market/circuits/recover
  async recoverHalt(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { symbol } = req.body;
      if (!symbol) {
        res.status(400).json({ error: "Missing parameter: symbol" });
        return;
      }
      await indianMarketService.recoverHalt(symbol);
      res.status(200).json({ success: true, message: `Recovered instrument ${symbol} from circuit breaker freeze.` });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/indian-market/auctions
  async getAuctions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await indianMarketService.getAuctions();
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/indian-market/auctions/state
  async updateAuction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { auctionId, status, volume } = req.body;
      if (!auctionId || !status) {
        res.status(400).json({ error: "Missing parameters: auctionId, status" });
        return;
      }
      await indianMarketService.updateAuction(auctionId, status, volume || 0);
      res.status(200).json({ success: true, message: `Updated auction ${auctionId} status to ${status}.` });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/indian-market/corporate-actions
  async getCorporateActions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await indianMarketService.getCorporateActions();
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/indian-market/corporate-actions/apply
  async applyCorporateAction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.body;
      if (!id) {
        res.status(400).json({ error: "Missing corporate action id." });
        return;
      }
      const result = await indianMarketService.applyCorporateAction(id);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/indian-market/validate
  async validateRuntime(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { moduleName, symbol } = req.body;
      if (!moduleName) {
        res.status(400).json({ error: "Missing moduleName parameter." });
        return;
      }
      const result = await indianMarketService.validateModule(moduleName, symbol);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/indian-market/events
  async getEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await indianMarketService.getEvents();
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/indian-market/sync
  async syncRuntime(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await indianMarketService.synchronizeRuntimeState();
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
export const indianMarketCtrl = new IndianMarketController();
