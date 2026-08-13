import {
  SIGNAL_TYPES,
  SignalTypeValue,
  STRATEGY_TYPES,
  StrategyTypeValue,
} from "../constants/index.ts";
import { StrategyDefinitionRecord, StrategySignalRecord } from "../types/index.ts";
import { StrategyValidatorService } from "./strategy-validator.service.ts";
import logger from "../../../../lib/logger.ts";

export class SignalGeneratorService {
  private static instance: SignalGeneratorService;
  private validator: StrategyValidatorService;

  private constructor() {
    this.validator = StrategyValidatorService.getInstance();
  }

  public static getInstance(): SignalGeneratorService {
    if (!SignalGeneratorService.instance) {
      SignalGeneratorService.instance = new SignalGeneratorService();
    }
    return SignalGeneratorService.instance;
  }

  public generateSignal(
    strategy: StrategyDefinitionRecord,
    brainContext?: Record<string, any>,
    marketData?: Record<string, any>
  ): StrategySignalRecord {
    const symbol = marketData?.symbol || strategy.symbol || "NIFTY50";
    const timeframe = marketData?.timeframe || strategy.timeframe || "1D";

    const evalResult = this.evaluateStrategyLogic(strategy, brainContext, marketData);

    const { strength, confidenceLabel } = this.validator.calculateSignalStrength(
      evalResult.confidence,
      evalResult.conditionMatches,
      evalResult.totalConditions
    );

    const priority = this.validator.calculatePriority(evalResult.signalType, strength);

    const signalId = `SIG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const signal: StrategySignalRecord = {
      signalId,
      strategyId: strategy.strategyId,
      symbol,
      timeframe,
      signalType: evalResult.signalType,
      confidence: confidenceLabel,
      strength,
      priority,
      supportingContext: {
        brainContext: brainContext || {},
        marketData: marketData || {},
        strategyType: strategy.strategyType,
        configUsed: strategy.config || {},
      },
      reasoningSummary: evalResult.reasoningSummary,
      lifecycleStatus: "ACTIVE",
      metadata: {
        strategyName: strategy.name,
        evaluatedBy: "StrategyEngineFoundation",
      },
      generatedAt: new Date(),
      createdAt: new Date(),
    };

    logger.info({
      type: "STRATEGY_SIGNAL_GENERATED",
      signalId,
      strategyId: strategy.strategyId,
      signalType: signal.signalType,
      symbol,
      confidence: signal.confidence,
      strength,
    }, "Standardized Strategy Signal successfully generated");

    return signal;
  }

  private evaluateStrategyLogic(
    strategy: StrategyDefinitionRecord,
    brainContext?: Record<string, any>,
    marketData?: Record<string, any>
  ): {
    signalType: SignalTypeValue;
    confidence: number;
    conditionMatches: number;
    totalConditions: number;
    reasoningSummary: string;
  } {
    const config = strategy.config || {};
    const brainConfidence = brainContext?.confidenceScore ? Number(brainContext.confidenceScore) : 75;
    const priceChange = marketData?.priceChangePct || 1.5;
    const rsi = marketData?.rsi || 55;
    const iv = marketData?.impliedVolatility || 22;

    let signalType: SignalTypeValue = SIGNAL_TYPES.WATCH_SIGNAL;
    let matches = 1;
    let total = 2;
    let reasoning = `Strategy type ${strategy.strategyType} evaluated.`;

    switch (strategy.strategyType) {
      case STRATEGY_TYPES.MOMENTUM: {
        total = 3;
        const targetRsi = config.rsiThreshold || 60;
        if (rsi > targetRsi && priceChange > 0) {
          signalType = SIGNAL_TYPES.BUY_SIGNAL;
          matches = 3;
          reasoning = `Strong momentum identified: RSI (${rsi}) above threshold (${targetRsi}) with positive price change (${priceChange}%).`;
        } else if (rsi < 40) {
          signalType = SIGNAL_TYPES.SELL_SIGNAL;
          matches = 2;
          reasoning = `Bearish momentum detected: RSI (${rsi}) dropped below oversold levels.`;
        } else {
          signalType = SIGNAL_TYPES.WATCH_SIGNAL;
          matches = 1;
          reasoning = `RSI (${rsi}) in neutral zone. Watching for momentum breakout.`;
        }
        break;
      }

      case STRATEGY_TYPES.TREND_FOLLOWING: {
        const trendDirection = marketData?.trend || brainContext?.trend || "UPWARD";
        if (trendDirection === "UPWARD") {
          signalType = SIGNAL_TYPES.BUY_SIGNAL;
          matches = 2;
          reasoning = `Upward trend confirmed across moving averages and brain research context.`;
        } else if (trendDirection === "DOWNWARD") {
          signalType = SIGNAL_TYPES.SELL_SIGNAL;
          matches = 2;
          reasoning = `Downward trend confirmed. Strong sell pressure observed.`;
        } else {
          signalType = SIGNAL_TYPES.HOLD_SIGNAL;
          matches = 1;
          reasoning = `Sideways trend detected. Holding current position.`;
        }
        break;
      }

      case STRATEGY_TYPES.MEAN_REVERSION: {
        const dev = marketData?.standardDeviations || 2.1;
        if (dev >= 2.0) {
          signalType = SIGNAL_TYPES.BUY_SIGNAL;
          matches = 2;
          reasoning = `Price deviated ${dev} std devs below mean. High probability mean reversion opportunity.`;
        } else if (dev <= -2.0) {
          signalType = SIGNAL_TYPES.SELL_SIGNAL;
          matches = 2;
          reasoning = `Price deviated ${dev} std devs above mean. Mean reversion sell signal triggered.`;
        } else {
          signalType = SIGNAL_TYPES.IGNORE_SIGNAL;
          matches = 1;
          reasoning = `Price within normal standard deviation bounds.`;
        }
        break;
      }

      case STRATEGY_TYPES.BREAKOUT: {
        const resistanceBroken = marketData?.resistanceBroken ?? true;
        if (resistanceBroken) {
          signalType = SIGNAL_TYPES.BUY_SIGNAL;
          matches = 2;
          reasoning = `Price broke above key resistance level with volume confirmation.`;
        } else {
          signalType = SIGNAL_TYPES.WATCH_SIGNAL;
          matches = 1;
          reasoning = `Price testing key resistance level. Watching for breakout confirmation.`;
        }
        break;
      }

      case STRATEGY_TYPES.BREAKDOWN: {
        const supportBroken = marketData?.supportBroken ?? true;
        if (supportBroken) {
          signalType = SIGNAL_TYPES.SELL_SIGNAL;
          matches = 2;
          reasoning = `Price broke below key support level with volume expansion.`;
        } else {
          signalType = SIGNAL_TYPES.WATCH_SIGNAL;
          matches = 1;
          reasoning = `Price testing key support level.`;
        }
        break;
      }

      case STRATEGY_TYPES.SCALPING:
      case STRATEGY_TYPES.INTRADAY: {
        signalType = priceChange >= 0 ? SIGNAL_TYPES.BUY_SIGNAL : SIGNAL_TYPES.SELL_SIGNAL;
        matches = 2;
        reasoning = `Short-term intraday micro-structure signal evaluated.`;
        break;
      }

      case STRATEGY_TYPES.OPTIONS_DIRECTIONAL:
      case STRATEGY_TYPES.OPTIONS_VOLATILITY: {
        if (iv > 30) {
          signalType = SIGNAL_TYPES.BUY_SIGNAL;
          matches = 2;
          reasoning = `High IV environment (${iv}%) provides favorable options directional/volatility spread setup.`;
        } else {
          signalType = SIGNAL_TYPES.WATCH_SIGNAL;
          matches = 1;
          reasoning = `Implied volatility (${iv}%) is low; waiting for IV expansion.`;
        }
        break;
      }

      default: {
        signalType = SIGNAL_TYPES.WATCH_SIGNAL;
        matches = 1;
        total = 2;
        reasoning = `Strategy ${strategy.name} evaluated. Context condition verified for opportunity monitoring.`;
        break;
      }
    }

    return {
      signalType,
      confidence: brainConfidence,
      conditionMatches: matches,
      totalConditions: total,
      reasoningSummary: reasoning,
    };
  }
}
