import { Request, Response } from "express";
import { treasuryService } from "../services/treasury.service.ts";

export class TreasuryController {
  async getStatus(req: Request, res: Response) {
    try {
      const data = await treasuryService.getTreasuryStatus();
      res.status(200).json({
        success: true,
        data
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || "Failed to fetch treasury status"
      });
    }
  }

  async getHealth(req: Request, res: Response) {
    try {
      const data = await treasuryService.getTreasuryHealth();
      res.status(200).json({
        success: true,
        data
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || "Failed to fetch treasury health"
      });
    }
  }

  async mint(req: Request, res: Response) {
    try {
      const { amountAtm, purpose, authorizedBy } = req.body;
      if (!amountAtm || typeof amountAtm !== 'number') {
        return res.status(400).json({
          success: false,
          error: "amountAtm is required and must be a positive number"
        });
      }

      const result = await treasuryService.mintCapital({
        amountAtm,
        purpose: purpose || "Enterprise Capital Minting",
        authorizedBy
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || "Failed to mint capital"
      });
    }
  }

  async allocate(req: Request, res: Response) {
    try {
      const { targetType, targetId, amountAtm, allocatedBy } = req.body;
      if (!targetType || !targetId || !amountAtm || typeof amountAtm !== 'number') {
        return res.status(400).json({
          success: false,
          error: "targetType, targetId, and amountAtm (number) are required"
        });
      }

      const result = await treasuryService.allocateCapital({
        targetType,
        targetId,
        amountAtm,
        allocatedBy
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || "Failed to allocate capital"
      });
    }
  }

  async reserve(req: Request, res: Response) {
    try {
      const { reservationType, amountAtm, reason } = req.body;
      if (!reservationType || !amountAtm || !reason) {
        return res.status(400).json({
          success: false,
          error: "reservationType, amountAtm, and reason are required"
        });
      }

      const result = await treasuryService.reserveCapital({
        reservationType,
        amountAtm,
        reason
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || "Failed to reserve capital"
      });
    }
  }

  async release(req: Request, res: Response) {
    try {
      const { reservationId, amountAtm, releaseType, reason } = req.body;
      if (!amountAtm || !releaseType || !reason) {
        return res.status(400).json({
          success: false,
          error: "amountAtm, releaseType, and reason are required"
        });
      }

      const result = await treasuryService.releaseCapital({
        reservationId,
        amountAtm,
        releaseType,
        reason
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || "Failed to release capital"
      });
    }
  }

  async fundWallet(req: Request, res: Response) {
    try {
      const { walletType, walletAddress, amountAtm } = req.body;
      if (!walletType || !amountAtm) {
        return res.status(400).json({
          success: false,
          error: "walletType and amountAtm are required"
        });
      }

      const result = await treasuryService.fundWallet({
        walletType,
        walletAddress,
        amountAtm
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || "Failed to fund wallet"
      });
    }
  }

  // EP02.1 - Module 16: Capital Lifecycle
  async getLifecycle(req: Request, res: Response) {
    try {
      const data = await treasuryService.getCapitalLifecycles();
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || "Failed to fetch capital lifecycle" });
    }
  }

  async transitionLifecycle(req: Request, res: Response) {
    try {
      const { capitalId, targetStage, actor, notes } = req.body;
      if (!capitalId || !targetStage) {
        return res.status(400).json({ success: false, error: "capitalId and targetStage are required" });
      }
      const data = await treasuryService.transitionLifecycleStage(capitalId, targetStage, actor, notes);
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message || "Failed to transition lifecycle stage" });
    }
  }

  // EP02.1 - Module 17: Treasury State Machine
  async getStateMachine(req: Request, res: Response) {
    try {
      const data = await treasuryService.getCapitalStateMachine();
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || "Failed to fetch state machine" });
    }
  }

  async transitionState(req: Request, res: Response) {
    try {
      const { capitalId, currentState, targetState, transitionBy, reason } = req.body;
      if (!capitalId || !currentState || !targetState) {
        return res.status(400).json({ success: false, error: "capitalId, currentState, and targetState are required" });
      }
      const data = await treasuryService.transitionCapitalState(capitalId, currentState, targetState, transitionBy, reason);
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message || "Failed state transition" });
    }
  }

  // EP02.1 - Module 18: AI Funding Policy
  async getAiFundingPolicy(req: Request, res: Response) {
    try {
      const data = await treasuryService.getAiFundingPolicies();
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || "Failed to fetch AI funding policies" });
    }
  }

  async evaluateAiFunding(req: Request, res: Response) {
    try {
      const { aiModelId, requestedAmountAtm, reason } = req.body;
      if (!aiModelId || !requestedAmountAtm) {
        return res.status(400).json({ success: false, error: "aiModelId and requestedAmountAtm are required" });
      }
      const data = await treasuryService.evaluateAiFunding(aiModelId, requestedAmountAtm, reason || "Funding Evaluation Request");
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message || "Failed AI funding evaluation" });
    }
  }

  async updateAiFundingPolicy(req: Request, res: Response) {
    try {
      const { aiModelId, updates } = req.body;
      if (!aiModelId || !updates) {
        return res.status(400).json({ success: false, error: "aiModelId and updates are required" });
      }
      const data = await treasuryService.updateAiFundingPolicy(aiModelId, updates);
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message || "Failed to update AI funding policy" });
    }
  }

  // EP02.1 - Module 19: Paper / Live Treasury Isolation
  async getPaperLiveIsolation(req: Request, res: Response) {
    try {
      const data = await treasuryService.getPaperLiveTreasuryIsolation();
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || "Failed paper/live isolation check" });
    }
  }

  // EP02.1 - Module 20: Certificates
  async getCertificates(req: Request, res: Response) {
    try {
      const data = await treasuryService.getCertificates();
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || "Failed to fetch certificates" });
    }
  }

  async verifyCertificate(req: Request, res: Response) {
    try {
      const { certificateId } = req.body;
      if (!certificateId) {
        return res.status(400).json({ success: false, error: "certificateId is required" });
      }
      const data = await treasuryService.verifyCertificate(certificateId);
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message || "Failed to verify certificate" });
    }
  }

  // EP02.1 - Module 21: Flow Inspector
  async getCapitalFlow(req: Request, res: Response) {
    try {
      const data = await treasuryService.getCapitalFlowTracks();
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || "Failed to fetch capital flow tracks" });
    }
  }

  async traceCapitalFlow(req: Request, res: Response) {
    try {
      const { correlationId, amountAtm } = req.body;
      if (!amountAtm) {
        return res.status(400).json({ success: false, error: "amountAtm is required" });
      }
      const data = await treasuryService.traceCapitalFlow(correlationId, amountAtm);
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message || "Failed to trace capital flow" });
    }
  }

  // EP02.1 - Module 22: Treasury Health Engine
  async getHealthEngineReport(req: Request, res: Response) {
    try {
      const data = await treasuryService.getTreasuryHealthEngineReport();
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || "Failed health engine report" });
    }
  }

  // EP02.1 - Module 23: Emergency Engine
  async triggerEmergency(req: Request, res: Response) {
    try {
      const { action, actor, reason, amountAtm, targetId } = req.body;
      if (!action) {
        return res.status(400).json({ success: false, error: "action (FREEZE, UNLOCK, ALLOCATION, STOP, RECOVERY) is required" });
      }
      const data = await treasuryService.triggerEmergencyAction({ action, actor, reason, amountAtm, targetId });
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message || "Failed emergency trigger" });
    }
  }

  // EP02.1 - Module 24: Capital Reconciliation
  async runReconciliation(req: Request, res: Response) {
    try {
      const data = await treasuryService.runCapitalReconciliation();
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || "Failed reconciliation" });
    }
  }

  // EP02.1 - Module 25: Indian Market Policy
  async getIndianMarketPolicy(req: Request, res: Response) {
    try {
      const data = await treasuryService.getIndianMarketPolicies();
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || "Failed to fetch Indian market policy" });
    }
  }

  async validateIndianMarketOrder(req: Request, res: Response) {
    try {
      const { segment, capitalAtm, assetClass } = req.body;
      if (!segment || !capitalAtm) {
        return res.status(400).json({ success: false, error: "segment and capitalAtm are required" });
      }
      const data = await treasuryService.validateIndianMarketOrder(segment, capitalAtm, assetClass);
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message || "Failed Indian market validation" });
    }
  }

  // EP02.1 - Module 26: Treasury QA
  async runTreasuryQa(req: Request, res: Response) {
    try {
      const data = await treasuryService.runTreasuryQaSuite();
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || "Failed Treasury QA test suite" });
    }
  }

  // EP17: Treasury Settlement Engine & Multi-Wallets
  async getSettlements(req: Request, res: Response) {
    try {
      const data = await treasuryService.getTradeSettlements();
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || "Failed to fetch settlements" });
    }
  }

  async getSettlementBatches(req: Request, res: Response) {
    try {
      const data = await treasuryService.getSettlementBatches();
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || "Failed to fetch settlement batches" });
    }
  }

  async getWallets(req: Request, res: Response) {
    try {
      const data = await treasuryService.getMultiWallets();
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || "Failed to fetch multi-wallets" });
    }
  }

  async processSettlement(req: Request, res: Response) {
    try {
      const { symbol, quantity, executionPrice, grossAmountAtm, feeAmountAtm, settlementCycle, buyerWalletId, sellerWalletId, tradeId } = req.body;
      if (!symbol || !quantity || !executionPrice || !grossAmountAtm) {
        return res.status(400).json({ success: false, error: "symbol, quantity, executionPrice, and grossAmountAtm are required" });
      }
      const data = await treasuryService.processTradeSettlement({
        symbol,
        quantity,
        executionPrice,
        grossAmountAtm,
        feeAmountAtm,
        settlementCycle,
        buyerWalletId,
        sellerWalletId,
        tradeId
      });
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message || "Trade settlement failed" });
    }
  }

  async processBatch(req: Request, res: Response) {
    try {
      const { cycle } = req.body;
      const data = await treasuryService.processSettlementBatch(cycle || 'T+1');
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message || "Settlement batch processing failed" });
    }
  }
}

export const treasuryController = new TreasuryController();
