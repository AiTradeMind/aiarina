import logger from '../../../lib/logger';
import { BrokerAccountInfo, BrokerPosition } from '../../../infrastructure/abstractions';

export interface RiskLimits {
  maxPositionSizeUSD: number;
  maxDailyLossUSD: number;
  maxPortfolioExposureUSD: number;
  maxTradeFrequencyPerMin: number;
  emergencyStopActive: boolean;
}

export interface RiskEvaluationRequest {
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  account: BrokerAccountInfo;
  positions: BrokerPosition[];
}

export interface RiskEvaluationResult {
  passed: boolean;
  blockedReasons: string[];
  approvedQuantity: number;
  riskAuditId: string;
  timestamp: Date;
}

export class RiskEnforcementEngine {
  private static instance: RiskEnforcementEngine;

  private limits: RiskLimits = {
    maxPositionSizeUSD: 100000.00,    // Max $100k per position
    maxDailyLossUSD: 50000.00,        // Max $50k daily loss
    maxPortfolioExposureUSD: 500000.00, // Max $500k total exposure
    maxTradeFrequencyPerMin: 20,       // Max 20 trades per minute
    emergencyStopActive: false
  };

  private tradeTimestamps: number[] = [];

  private constructor() {}

  public static getInstance(): RiskEnforcementEngine {
    if (!RiskEnforcementEngine.instance) {
      RiskEnforcementEngine.instance = new RiskEnforcementEngine();
    }
    return RiskEnforcementEngine.instance;
  }

  public setRiskLimits(newLimits: Partial<RiskLimits>): void {
    this.limits = { ...this.limits, ...newLimits };
    logger.info({ limits: this.limits }, 'Risk limits updated');
  }

  public triggerEmergencyStop(active: boolean = true): void {
    this.limits.emergencyStopActive = active;
    logger.error({ emergencyStopActive: active }, 'EMERGENCY STOP state updated');
  }

  public evaluateRisk(request: RiskEvaluationRequest): RiskEvaluationResult {
    const riskAuditId = `rsk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const blockedReasons: string[] = [];

    // 1. Check Emergency Stop
    if (this.limits.emergencyStopActive) {
      blockedReasons.push('Emergency stop is currently ACTIVE. All trading blocked.');
    }

    // 2. Check Daily Loss Limit
    if (request.account.unrealizedPnL < -Math.abs(this.limits.maxDailyLossUSD)) {
      blockedReasons.push(`Daily drawdown threshold exceeded (${request.account.unrealizedPnL.toFixed(2)} USD < -${this.limits.maxDailyLossUSD} USD).`);
    }

    // 3. Check Order / Position Size Limit
    const proposedOrderValueUSD = request.quantity * request.price;
    const existingPosition = request.positions.find(p => p.symbol === request.symbol.toUpperCase());
    const existingVal = existingPosition ? existingPosition.quantity * existingPosition.markPrice : 0;
    const projectedVal = existingVal + proposedOrderValueUSD;

    if (projectedVal > this.limits.maxPositionSizeUSD) {
      blockedReasons.push(`Projected position value ($${projectedVal.toFixed(2)}) exceeds max position size ($${this.limits.maxPositionSizeUSD}).`);
    }

    // 4. Check Total Portfolio Exposure Limit
    const currentTotalExposure = request.positions.reduce((acc, p) => acc + p.quantity * p.markPrice, 0);
    const projectedTotalExposure = currentTotalExposure + proposedOrderValueUSD;

    if (projectedTotalExposure > this.limits.maxPortfolioExposureUSD) {
      blockedReasons.push(`Projected portfolio exposure ($${projectedTotalExposure.toFixed(2)}) exceeds max portfolio limit ($${this.limits.maxPortfolioExposureUSD}).`);
    }

    // 5. Check Trade Frequency Throttling
    const now = Date.now();
    this.tradeTimestamps = this.tradeTimestamps.filter(t => now - t <= 60000);
    if (this.tradeTimestamps.length >= this.limits.maxTradeFrequencyPerMin) {
      blockedReasons.push(`Trade rate limit exceeded (${this.tradeTimestamps.length} trades in last 60 seconds).`);
    }

    const passed = blockedReasons.length === 0;
    let approvedQuantity = request.quantity;

    if (passed) {
      this.tradeTimestamps.push(now);
    } else {
      approvedQuantity = 0;
      logger.warn({ riskAuditId, blockedReasons, symbol: request.symbol }, 'Trade blocked by Risk Enforcement Engine');
    }

    return {
      passed,
      blockedReasons,
      approvedQuantity,
      riskAuditId,
      timestamp: new Date()
    };
  }
}
