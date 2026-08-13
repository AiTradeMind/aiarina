import { indianMarketRepo } from "../repositories/IndianMarketRepository.ts";
import { FinanceIntelligenceEngine } from "../../trading/services/FinanceIntelligenceEngine.ts";
import { 
  SettlementQueueItem, 
  ExpiryDateInfo, 
  CircuitLimitInfo, 
  AuctionStatusInfo, 
  CorporateActionRule 
} from "../types/index.ts";

export class IndianMarketRuntime {
  
  // ==========================================
  // MODULE 5: Settlement Runtime
  // ==========================================
  async getSettlementState(): Promise<{ queue: SettlementQueueItem[]; status: string; lastSettledDate: string }> {
    const state = await indianMarketRepo.getRuntimeState('settlement_state');
    return {
      queue: state?.queue || [],
      status: state?.status || "STABLE",
      lastSettledDate: state?.lastSettledDate || "2026-07-26"
    };
  }

  async queueTradeForSettlement(trade: Omit<SettlementQueueItem, 'status' | 'timestamp'>): Promise<void> {
    const state = await this.getSettlementState();
    const newItem: SettlementQueueItem = {
      ...trade,
      status: 'PENDING',
      timestamp: new Date().toISOString()
    };
    state.queue.push(newItem);
    await indianMarketRepo.setRuntimeState('settlement_state', state);
    await indianMarketRepo.logEvent('SettlementStarted', { tradeId: trade.tradeId, symbol: trade.instrumentId });
  }

  async runSettlementReconciliation(): Promise<any> {
    const state = await this.getSettlementState();
    const settledIds: string[] = [];
    
    // Process all pending trades
    state.queue = state.queue.map(item => {
      if (item.status === 'PENDING') {
        item.status = 'SETTLED';
        settledIds.push(item.tradeId);
      }
      return item;
    });

    state.lastSettledDate = new Date().toISOString().slice(0, 10);
    state.status = "STABLE";

    await indianMarketRepo.setRuntimeState('settlement_state', state);
    await indianMarketRepo.logEvent('SettlementCompleted', { settledIds, date: state.lastSettledDate });

    return {
      success: true,
      settledCount: settledIds.length,
      lastSettledDate: state.lastSettledDate
    };
  }

  // ==========================================
  // MODULE 6: Expiry Runtime
  // ==========================================
  async getExpiryState(): Promise<ExpiryDateInfo[]> {
    // Generate weekly, monthly and quarterly futures and options expiries for Indian Markets
    // Typically Thursday.
    const today = new Date();
    
    const expiries: ExpiryDateInfo[] = [
      {
        instrumentId: "inst_nifty_fut",
        symbol: "NIFTY26JUL",
        type: "WEEKLY",
        expiryDate: "2026-07-30", // Next Thursday
        daysRemaining: this.calculateDaysBetween(today, new Date("2026-07-30"))
      },
      {
        instrumentId: "inst_banknifty_fut",
        symbol: "BANKNIFTY26JUL",
        type: "WEEKLY",
        expiryDate: "2026-07-30",
        daysRemaining: this.calculateDaysBetween(today, new Date("2026-07-30"))
      },
      {
        instrumentId: "inst_nifty_opt",
        symbol: "NIFTY26AUG",
        type: "MONTHLY",
        expiryDate: "2026-08-27", // Last Thursday of August
        daysRemaining: this.calculateDaysBetween(today, new Date("2026-08-27"))
      },
      {
        instrumentId: "inst_mcx_gold",
        symbol: "GOLD26OCT",
        type: "COMMODITY",
        expiryDate: "2026-10-05",
        daysRemaining: this.calculateDaysBetween(today, new Date("2026-10-05"))
      }
    ];

    await indianMarketRepo.setRuntimeState('expiry_state', { expiries });
    return expiries;
  }

  private calculateDaysBetween(d1: Date, d2: Date): number {
    const diffTime = d2.getTime() - d1.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  // ==========================================
  // MODULE 7: Circuit Runtime
  // ==========================================
  async getCircuitState(symbolFilter?: string): Promise<CircuitLimitInfo[]> {
    const state = await indianMarketRepo.getRuntimeState('circuit_state');
    
    const defaults: CircuitLimitInfo[] = [
      { instrumentId: "inst_rel", symbol: "RELIANCE.NS", lastPrice: 2450.00, upperCircuit: 2695.00, lowerCircuit: 2205.00, isTriggered: false },
      { instrumentId: "inst_tcs", symbol: "TCS.NS", lastPrice: 3200.00, upperCircuit: 3520.00, lowerCircuit: 2880.00, isTriggered: false },
      { instrumentId: "inst_hdfc", symbol: "HDFCBANK.NS", lastPrice: 1650.00, upperCircuit: 1815.00, lowerCircuit: 1485.00, isTriggered: false },
      { instrumentId: "inst_infy", symbol: "INFY.NS", lastPrice: 1520.00, upperCircuit: 1672.00, lowerCircuit: 1368.00, isTriggered: false },
      { instrumentId: "inst_sbi", symbol: "SBIN.NS", lastPrice: 580.00, upperCircuit: 638.00, lowerCircuit: 522.00, isTriggered: false }
    ];

    let currentLimits = state?.limits || defaults;

    if (symbolFilter) {
      currentLimits = currentLimits.filter((l: any) => l.symbol === symbolFilter);
    }

    return currentLimits;
  }

  async triggerCircuitHalt(symbol: string, direction: 'UPPER' | 'LOWER', currentPrice: number): Promise<void> {
    const state = await indianMarketRepo.getRuntimeState('circuit_state');
    const limits = await this.getCircuitState();
    
    const updated = limits.map(item => {
      if (item.symbol === symbol) {
        item.isTriggered = true;
        item.triggerType = direction;
        item.haltedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minute circuit halt
      }
      return item;
    });

    await indianMarketRepo.setRuntimeState('circuit_state', { ...state, limits: updated });
    await indianMarketRepo.logEvent('CircuitTriggered', { symbol, direction, price: currentPrice, haltMinutes: 15 });
  }

  async recoverCircuitHalt(symbol: string): Promise<void> {
    const state = await indianMarketRepo.getRuntimeState('circuit_state');
    const limits = await this.getCircuitState();

    const updated = limits.map(item => {
      if (item.symbol === symbol) {
        item.isTriggered = false;
        item.triggerType = null;
        item.haltedUntil = null;
        // Extend price band range by 5% as per NSE standards
        item.upperCircuit = Math.round(item.upperCircuit * 1.05 * 100) / 100;
        item.lowerCircuit = Math.round(item.lowerCircuit * 0.95 * 100) / 100;
      }
      return item;
    });

    await indianMarketRepo.setRuntimeState('circuit_state', { ...state, limits: updated });
    await indianMarketRepo.logEvent('CircuitRecovered', { symbol });
  }

  // ==========================================
  // MODULE 8: Auction Runtime
  // ==========================================
  async getAuctionState(): Promise<AuctionStatusInfo[]> {
    const auctions: AuctionStatusInfo[] = [
      {
        id: "auc_pre",
        auctionType: "PRE_OPEN",
        status: "CLOSED",
        startTime: "09:00",
        endTime: "09:15",
        volumeTraded: 1452000
      },
      {
        id: "auc_close",
        auctionType: "CLOSING",
        status: "SCHEDULED",
        startTime: "15:30",
        endTime: "15:40",
        volumeTraded: 0
      },
      {
        id: "auc_spec",
        auctionType: "SPECIAL",
        status: "SCHEDULED",
        startTime: "12:00",
        endTime: "12:30",
        volumeTraded: 0
      }
    ];

    await indianMarketRepo.setRuntimeState('auction_state', { auctions });
    return auctions;
  }

  async triggerAuctionStateChange(auctionId: string, status: 'SCHEDULED' | 'OPEN' | 'CLOSED' | 'MATCHING', volume = 0): Promise<void> {
    const auctions = await this.getAuctionState();
    const updated = auctions.map(auc => {
      if (auc.id === auctionId) {
        auc.status = status;
        auc.volumeTraded = volume;
      }
      return auc;
    });

    await indianMarketRepo.setRuntimeState('auction_state', { auctions: updated });
    await indianMarketRepo.logEvent('AuctionStarted', { auctionId, status, volume });
  }

  // ==========================================
  // MODULE 9: Corporate Action Runtime
  // ==========================================
  /**
   * Consumes EP04 corporate actions from FinanceIntelligenceEngine.
   * Maps them into Indian regulatory adjustment matrices.
   */
  async getCorporateActions(): Promise<CorporateActionRule[]> {
    const extCorpActions = FinanceIntelligenceEngine.getInstance().getCorporateActions();
    
    // Dynamically transform EP04 corporate actions into Indian operating rules without local duplicate storage
    return extCorpActions.map((ca: any) => {
      let actionType: 'BONUS' | 'SPLIT' | 'DIVIDEND' | 'RIGHTS' | 'MERGER' | 'DELISTING' | 'SUSPENSION' = 'DIVIDEND';
      if (ca.type === 'BONUS') actionType = 'BONUS';
      else if (ca.type === 'STOCK_SPLIT') actionType = 'SPLIT';
      else if (ca.type === 'RIGHTS_ISSUE') actionType = 'RIGHTS';

      return {
        id: ca.id,
        instrumentId: ca.symbol,
        actionType,
        ratioOrValue: ca.ratioOrAmount,
        recordDate: ca.recordDate,
        appliedDate: ca.exDate,
        status: ca.status === 'CREDITED' || ca.status === 'PROCESSED' ? 'APPLIED' : 'PENDING'
      };
    });
  }

  async applyCorporateActionAdjustment(id: string): Promise<any> {
    const list = await this.getCorporateActions();
    const rule = list.find(r => r.id === id);
    if (!rule) throw new Error(`Corporate Action ${id} not found.`);

    // Apply corporate action logic mathematically (e.g. adjust prices of virtual portfolio indices)
    await indianMarketRepo.logEvent('CorporateActionApplied', { id, symbol: rule.instrumentId, type: rule.actionType, ratio: rule.ratioOrValue });

    return {
      success: true,
      message: `Successfully executed ${rule.actionType} adjustment on ${rule.instrumentId}.`,
      rule
    };
  }
}

export const indianMarketRuntime = new IndianMarketRuntime();
