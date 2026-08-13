export type MarketRegimeType = 
  | 'BULL_MARKET' 
  | 'BEAR_MARKET' 
  | 'SIDEWAYS' 
  | 'HIGH_VOLATILITY' 
  | 'LOW_VOLATILITY' 
  | 'TRENDING' 
  | 'RANGE_BOUND' 
  | 'NEWS_DRIVEN' 
  | 'GAP_SESSION' 
  | 'EXPIRY_SESSION';

export interface TradePipelineInput {
  ticker: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  entryPrice: number;
  currentPrice: number;
  researchScore: number; // 0-100
  analyticsScore: number; // 0-100
  strategyScore: number; // 0-100
  marketConfidence: number; // 0-100
  liquidityScore: number; // 0-100
  newsScore: number; // 0-100
  volatilityScore: number; // 0-100
  holdingTimeMinutes: number;
  portfolioCapital: number;
  dailyDrawdownPercent: number;
  // CP-3.2B Adaptive Parameters
  atrPercent?: number; // e.g. 1.2%
  strategyType?: 'SCALPING' | 'INTRADAY' | 'SWING' | 'POSITIONAL';
  sectorExposurePercent?: number;
  correlationScore?: number; // 0-100
  bestAlternativeOpportunityScore?: number; // 0-100
}

export interface TradeEvaluationResult {
  approved: boolean;
  rejectReason?: string;
  marketRegime: MarketRegimeType;
  confidenceScore: number; // 0-100
  capitalSurvivalIndex: number; // CSI (0-100)
  positionSizing: 'FULL' | 'NORMAL' | 'HALF' | 'SMALL' | 'NO_TRADE';
  positionSizePercent: number; // 0 - 100%
  initialStopLossPrice: number;
  currentStopLossPrice: number;
  initialTargetPrice: number;
  currentTargetPrice: number;
  riskPercent: number;
  rewardPercent: number;
  expectedRewardToRiskRatio: number;
  opportunityScore: number; // 0-100
  opportunityCostAction: 'HOLD' | 'TRANSFER_CAPITAL' | 'EXIT_FOR_BETTER_OPPORTUNITY';
  nextAction: 'EXECUTE' | 'TRAIL_STOP' | 'REDUCE_TARGET' | 'TIME_EXIT' | 'PROFIT_LOCK_EXIT' | 'GREED_PREVENTION_EXIT' | 'OPPORTUNITY_EXIT' | 'DRAWDOWN_SUSPEND';
  pipelineStageStatuses: {
    researchCenter: boolean;
    analytics: boolean;
    strategyEngine: boolean;
    riskEngine: boolean;
    confidenceEngine: boolean;
    fundManager: boolean;
    execution: boolean;
  };
  multiLevelDrawdown: {
    aiLevel: 'SAFE' | 'WARNING' | 'BREACHED';
    strategyLevel: 'SAFE' | 'WARNING' | 'BREACHED';
    sectorLevel: 'SAFE' | 'WARNING' | 'BREACHED';
    portfolioLevel: 'SAFE' | 'WARNING' | 'BREACHED';
    arenaLevel: 'SAFE' | 'WARNING' | 'BREACHED';
  };
  learningPayload: {
    success: boolean;
    emotionSimulation: string;
    riskAccuracy: number;
    targetAccuracy: number;
    stopAccuracy: number;
    timeAccuracy: number;
  };
}

export class TradeConstitutionEngine {
  // Permanent Constitution Limits
  public static readonly MIN_ADAPTIVE_STOP_PCT = 0.008; // 0.8%
  public static readonly MAX_NORMAL_RISK_PCT = 0.020; // 2.0%
  public static readonly ABSOLUTE_MAX_RISK_PCT = 0.030; // 3.0% Hard Cap
  public static readonly MIN_CONFIDENCE_THRESHOLD = 70; // Below 70 => NO TRADE
  public static readonly DAILY_DRAWDOWN_LIMIT_PCT = 0.05; // 5% max daily drawdown

  /**
   * 1. Market Regime Engine
   */
  public classifyMarketRegime(volatility: number, analytics: number, news: number, holdingMins: number): MarketRegimeType {
    if (news > 85) return 'NEWS_DRIVEN';
    if (volatility > 80 && analytics > 80) return 'HIGH_VOLATILITY';
    if (volatility < 30) return 'LOW_VOLATILITY';
    if (analytics > 75) return 'TRENDING';
    if (analytics < 45) return 'RANGE_BOUND';
    if (holdingMins > 300) return 'SIDEWAYS';
    return 'BULL_MARKET';
  }

  /**
   * 2. Capital Survival Index (CSI) Calculator
   */
  public calculateCapitalSurvivalIndex(confidence: number, riskPct: number, drawdownPct: number): number {
    const riskDisciplineScore = Math.max(0, 100 - (riskPct / TradeConstitutionEngine.ABSOLUTE_MAX_RISK_PCT) * 50);
    const capitalProtectionScore = Math.max(0, 100 - (drawdownPct / TradeConstitutionEngine.DAILY_DRAWDOWN_LIMIT_PCT) * 100);
    const consistencyScore = confidence >= 85 ? 95 : confidence >= 70 ? 80 : 50;

    const csi = Math.round(
      (capitalProtectionScore * 0.35) +
      (riskDisciplineScore * 0.30) +
      (consistencyScore * 0.25) +
      (confidence * 0.10)
    );
    return Math.min(100, Math.max(0, csi));
  }

  public evaluateTrade(input: TradePipelineInput): TradeEvaluationResult {
    const marketRegime = this.classifyMarketRegime(
      input.volatilityScore,
      input.analyticsScore,
      input.newsScore,
      input.holdingTimeMinutes
    );

    // Multi-Level Drawdown Check
    const multiLevelDrawdown: TradeEvaluationResult['multiLevelDrawdown'] = {
      aiLevel: input.dailyDrawdownPercent >= 0.04 ? 'WARNING' : 'SAFE',
      strategyLevel: input.dailyDrawdownPercent >= 0.045 ? 'WARNING' : 'SAFE',
      sectorLevel: (input.sectorExposurePercent || 0) > 30 ? 'WARNING' : 'SAFE',
      portfolioLevel: input.dailyDrawdownPercent >= 0.05 ? 'BREACHED' : 'SAFE',
      arenaLevel: 'SAFE'
    };

    // 1. Pipeline Verification (Must pass all 7 stages)
    const pipelineStageStatuses = {
      researchCenter: input.researchScore >= 60,
      analytics: input.analyticsScore >= 60,
      strategyEngine: input.strategyScore >= 60,
      riskEngine: input.dailyDrawdownPercent < TradeConstitutionEngine.DAILY_DRAWDOWN_LIMIT_PCT,
      confidenceEngine: false,
      fundManager: input.portfolioCapital > 0 && (input.sectorExposurePercent || 0) < 35,
      execution: true
    };

    // Check Drawdown Limit
    if (input.dailyDrawdownPercent >= TradeConstitutionEngine.DAILY_DRAWDOWN_LIMIT_PCT) {
      multiLevelDrawdown.portfolioLevel = 'BREACHED';
      return this.rejectResult(pipelineStageStatuses, marketRegime, multiLevelDrawdown, 'DRAWDOWN_LIMIT_EXCEEDED', 'Daily Drawdown limit reached (5%). AI Trading Suspended for capital protection.');
    }

    // Correlation Check
    if ((input.correlationScore || 0) > 85) {
      return this.rejectResult(pipelineStageStatuses, marketRegime, multiLevelDrawdown, 'HIGH_CORRELATION_RISK', 'Trade rejected due to excessive correlation with existing portfolio positions (>85%).');
    }

    // 2. Confidence Engine Calculation
    const finalConfidence = Math.round(
      (input.marketConfidence * 0.20) +
      (input.researchScore * 0.15) +
      (input.strategyScore * 0.20) +
      (input.analyticsScore * 0.15) +
      (input.liquidityScore * 0.10) +
      (input.newsScore * 0.10) +
      (input.volatilityScore * 0.10)
    );

    pipelineStageStatuses.confidenceEngine = finalConfidence >= TradeConstitutionEngine.MIN_CONFIDENCE_THRESHOLD;

    if (!pipelineStageStatuses.researchCenter || !pipelineStageStatuses.analytics || !pipelineStageStatuses.strategyEngine || !pipelineStageStatuses.confidenceEngine || !pipelineStageStatuses.fundManager) {
      const failed = [];
      if (!pipelineStageStatuses.researchCenter) failed.push('Research Center');
      if (!pipelineStageStatuses.analytics) failed.push('Analytics');
      if (!pipelineStageStatuses.strategyEngine) failed.push('Strategy Engine');
      if (!pipelineStageStatuses.confidenceEngine) failed.push(`Confidence Engine (${finalConfidence}% < 70%)`);
      if (!pipelineStageStatuses.fundManager) failed.push('Fund Manager Sector Concentration');
      return this.rejectResult(pipelineStageStatuses, marketRegime, multiLevelDrawdown, 'PIPELINE_STAGE_REJECTED', `Trade rejected by: ${failed.join(', ')}`);
    }

    // 3. Adaptive Position Sizing Rules
    let positionSizing: TradeEvaluationResult['positionSizing'] = 'NO_TRADE';
    let positionSizePercent = 0;

    if (finalConfidence >= 95) {
      positionSizing = 'FULL';
      positionSizePercent = 100;
    } else if (finalConfidence >= 90) {
      positionSizing = 'NORMAL';
      positionSizePercent = 80;
    } else if (finalConfidence >= 80) {
      positionSizing = 'HALF';
      positionSizePercent = 50;
    } else if (finalConfidence >= 70) {
      positionSizing = 'SMALL';
      positionSizePercent = 25;
    }

    // 4. Adaptive Stop Loss Engine Rules
    const isBuy = input.action === 'BUY';
    const atrMultiplier = input.atrPercent || 0.012; // default 1.2% ATR
    let adaptiveStopPct = Math.max(TradeConstitutionEngine.MIN_ADAPTIVE_STOP_PCT, Math.min(TradeConstitutionEngine.MAX_NORMAL_RISK_PCT, atrMultiplier));
    
    // Emergency expansion if high volatility but high confidence
    if (marketRegime === 'HIGH_VOLATILITY' && finalConfidence >= 92) {
      adaptiveStopPct = Math.min(TradeConstitutionEngine.ABSOLUTE_MAX_RISK_PCT, adaptiveStopPct * 1.3);
    }

    const initialStopPrice = isBuy 
      ? input.entryPrice * (1 - adaptiveStopPct)
      : input.entryPrice * (1 + adaptiveStopPct);

    // 5. Adaptive Target Engine Rules
    let adaptiveTargetPct = 0.05; // Base 5%
    if (marketRegime === 'TRENDING' || marketRegime === 'HIGH_VOLATILITY') {
      adaptiveTargetPct = 0.08; // Expand to 8%
    } else if (marketRegime === 'LOW_VOLATILITY' || marketRegime === 'RANGE_BOUND') {
      adaptiveTargetPct = 0.03; // Contract to 3%
    }

    const initialTargetPrice = isBuy
      ? input.entryPrice * (1 + 0.05)
      : input.entryPrice * (1 - 0.05);

    const currentTargetPrice = isBuy
      ? input.entryPrice * (1 + adaptiveTargetPct)
      : input.entryPrice * (1 - adaptiveTargetPct);

    // 6. Dynamic Profit Lock & Greed Prevention
    const currentProfitPct = isBuy 
      ? (input.currentPrice - input.entryPrice) / input.entryPrice
      : (input.entryPrice - input.currentPrice) / input.entryPrice;

    let dynamicStopLossPrice = initialStopPrice;
    if (currentProfitPct >= 0.015) {
      dynamicStopLossPrice = isBuy
        ? input.entryPrice * (1 + (currentProfitPct * 0.5))
        : input.entryPrice * (1 - (currentProfitPct * 0.5));
    }

    const expectedRewardPct = Math.abs(currentTargetPrice - input.currentPrice) / input.currentPrice;
    const currentRiskFromNowPct = Math.abs(input.currentPrice - dynamicStopLossPrice) / input.currentPrice;
    const expectedRewardToRiskRatio = currentRiskFromNowPct > 0 ? expectedRewardPct / currentRiskFromNowPct : 0;

    // 7. Opportunity Cost Engine
    const currentOpportunityScore = Math.round((finalConfidence + (input.analyticsScore * 0.5)) / 1.5);
    const altOpportunityScore = input.bestAlternativeOpportunityScore || 0;
    
    let opportunityCostAction: TradeEvaluationResult['opportunityCostAction'] = 'HOLD';
    if (altOpportunityScore > currentOpportunityScore + 15 && currentProfitPct > 0) {
      opportunityCostAction = 'EXIT_FOR_BETTER_OPPORTUNITY';
    } else if (altOpportunityScore > currentOpportunityScore + 10) {
      opportunityCostAction = 'TRANSFER_CAPITAL';
    }

    // Determine Next Action
    let nextAction: TradeEvaluationResult['nextAction'] = 'EXECUTE';

    if (opportunityCostAction === 'EXIT_FOR_BETTER_OPPORTUNITY') {
      nextAction = 'OPPORTUNITY_EXIT';
    } else if (currentProfitPct >= adaptiveTargetPct) {
      nextAction = 'PROFIT_LOCK_EXIT';
    } else if (expectedRewardToRiskRatio < 1.0 && currentProfitPct > 0) {
      nextAction = 'GREED_PREVENTION_EXIT';
    } else if (input.holdingTimeMinutes > 120 && Math.abs(currentProfitPct) < 0.005) {
      nextAction = 'TIME_EXIT';
    } else if (currentProfitPct > 0.015) {
      nextAction = 'TRAIL_STOP';
    }

    const csi = this.calculateCapitalSurvivalIndex(finalConfidence, adaptiveStopPct, input.dailyDrawdownPercent);

    return {
      approved: true,
      marketRegime,
      confidenceScore: finalConfidence,
      capitalSurvivalIndex: csi,
      positionSizing,
      positionSizePercent,
      initialStopLossPrice: initialStopPrice,
      currentStopLossPrice: dynamicStopLossPrice,
      initialTargetPrice,
      currentTargetPrice,
      riskPercent: Number((adaptiveStopPct * 100).toFixed(2)),
      rewardPercent: Number((adaptiveTargetPct * 100).toFixed(2)),
      expectedRewardToRiskRatio: Number(expectedRewardToRiskRatio.toFixed(2)),
      opportunityScore: currentOpportunityScore,
      opportunityCostAction,
      nextAction,
      pipelineStageStatuses,
      multiLevelDrawdown,
      learningPayload: {
        success: currentProfitPct > 0,
        emotionSimulation: 'ADAPTIVE_INSTITUTIONAL_RULES',
        riskAccuracy: Number((finalConfidence * 0.96).toFixed(1)),
        targetAccuracy: Number((finalConfidence * 0.94).toFixed(1)),
        stopAccuracy: Number((finalConfidence * 0.98).toFixed(1)),
        timeAccuracy: Number((finalConfidence * 0.92).toFixed(1))
      }
    };
  }

  private rejectResult(pipelineStages: any, regime: MarketRegimeType, multiLevelDrawdown: any, code: string, reason: string): TradeEvaluationResult {
    return {
      approved: false,
      rejectReason: reason,
      marketRegime: regime,
      confidenceScore: 0,
      capitalSurvivalIndex: 100,
      positionSizing: 'NO_TRADE',
      positionSizePercent: 0,
      initialStopLossPrice: 0,
      currentStopLossPrice: 0,
      initialTargetPrice: 0,
      currentTargetPrice: 0,
      riskPercent: 0,
      rewardPercent: 0,
      expectedRewardToRiskRatio: 0,
      opportunityScore: 0,
      opportunityCostAction: 'HOLD',
      nextAction: 'DRAWDOWN_SUSPEND',
      pipelineStageStatuses: pipelineStages,
      multiLevelDrawdown,
      learningPayload: {
        success: false,
        emotionSimulation: 'RISK_AVOIDANCE',
        riskAccuracy: 100,
        targetAccuracy: 0,
        stopAccuracy: 100,
        timeAccuracy: 100
      }
    };
  }
}

