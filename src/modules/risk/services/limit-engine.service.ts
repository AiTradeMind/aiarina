// @ts-nocheck
import { RiskAssessmentMetrics, RiskEngineLimits } from "../types/index.ts";

export interface LimitCheckResult {
  passed: boolean;
  breaches: {
    limitName: string;
    actualValue: number;
    threshold: number;
    message: string;
  }[];
}

export class LimitEngineService {
  validateLimits(metrics: RiskAssessmentMetrics, limits: RiskEngineLimits): LimitCheckResult {
    const breaches: LimitCheckResult['breaches'] = [];

    // 1. Position Size Limit
    if (metrics.positionSize > limits.maxPositionSize) {
      breaches.push({
        limitName: 'MAX_POSITION_SIZE',
        actualValue: metrics.positionSize,
        threshold: limits.maxPositionSize,
        message: `Position size (${metrics.positionSize.toLocaleString()}) exceeds limit (${limits.maxPositionSize.toLocaleString()})`,
      });
    }

    // 2. Daily Loss Limit
    if (metrics.dailyLoss > limits.maxDailyLoss) {
      breaches.push({
        limitName: 'MAX_DAILY_LOSS',
        actualValue: metrics.dailyLoss,
        threshold: limits.maxDailyLoss,
        message: `Daily loss (${metrics.dailyLoss.toLocaleString()}) exceeds limit (${limits.maxDailyLoss.toLocaleString()})`,
      });
    }

    // 3. Capital Utilization Limit
    if (metrics.capitalUtilization > limits.maxCapitalUtilization) {
      breaches.push({
        limitName: 'MAX_CAPITAL_UTILIZATION',
        actualValue: metrics.capitalUtilization,
        threshold: limits.maxCapitalUtilization,
        message: `Capital utilization (${metrics.capitalUtilization.toFixed(1)}%) exceeds limit (${limits.maxCapitalUtilization}%)`,
      });
    }

    // 4. Concentration Ratio Limit
    if (metrics.concentrationRatio > limits.maxConcentrationRatio) {
      breaches.push({
        limitName: 'MAX_CONCENTRATION_RATIO',
        actualValue: metrics.concentrationRatio,
        threshold: limits.maxConcentrationRatio,
        message: `Concentration ratio (${metrics.concentrationRatio.toFixed(1)}%) exceeds limit (${limits.maxConcentrationRatio}%)`,
      });
    }

    // 5. Drawdown Limit
    if (metrics.maxDrawdown > limits.maxDrawdown) {
      breaches.push({
        limitName: 'MAX_DRAWDOWN',
        actualValue: metrics.maxDrawdown,
        threshold: limits.maxDrawdown,
        message: `Drawdown (${metrics.maxDrawdown.toFixed(1)}%) exceeds limit (${limits.maxDrawdown}%)`,
      });
    }

    // 6. Minimum Liquidity Score
    if (metrics.liquidityScore < limits.minLiquidityScore) {
      breaches.push({
        limitName: 'MIN_LIQUIDITY_SCORE',
        actualValue: metrics.liquidityScore,
        threshold: limits.minLiquidityScore,
        message: `Liquidity score (${metrics.liquidityScore}) is below required minimum (${limits.minLiquidityScore})`,
      });
    }

    return {
      passed: breaches.length === 0,
      breaches,
    };
  }
}
