// @ts-nocheck
import { RiskLevel, RiskType } from "../constants/index.ts";
import { RiskAssessmentMetrics, RiskAssessmentRequest, RiskEngineLimits } from "../types/index.ts";

export class RiskCalculatorService {
  calculateMetrics(request: RiskAssessmentRequest, limits: RiskEngineLimits): RiskAssessmentMetrics {
    const portfolioValue = request.portfolioValue || 100000;
    const orderValue = request.orderValue || 0;
    const positionSize = request.positionSize || orderValue;
    const dailyPnl = request.dailyPnl || 0;
    const availableMargin = request.availableMargin || portfolioValue;
    const requiredMargin = request.requiredMargin || (orderValue * (limits.requiredMarginRatio / 100));

    const grossExposure = positionSize;
    const netExposure = positionSize; // Simplified net exposure
    const longExposure = positionSize > 0 ? positionSize : 0;
    const shortExposure = positionSize < 0 ? Math.abs(positionSize) : 0;

    const capitalUtilization = portfolioValue > 0 ? (grossExposure / portfolioValue) * 100 : 0;
    const concentrationRatio = portfolioValue > 0 ? (positionSize / portfolioValue) * 100 : 0;
    const dailyLoss = dailyPnl < 0 ? Math.abs(dailyPnl) : 0;
    const maxDrawdown = portfolioValue > 0 ? (dailyLoss / portfolioValue) * 100 : 0;
    const leverage = portfolioValue > 0 ? grossExposure / portfolioValue : 1;

    const volatilityIndex = request.volatilityIndex !== undefined ? request.volatilityIndex : 20.0;
    const liquidityScore = request.liquidityScore !== undefined ? request.liquidityScore : 85.0;

    // Calculate score (0 - 100)
    let score = 0;

    // 1. Position size relative to limit (0-25 pts)
    const positionUtil = (positionSize / limits.maxPositionSize) * 25;
    score += Math.min(25, Math.max(0, positionUtil));

    // 2. Capital utilization relative to limit (0-20 pts)
    const capUtil = (capitalUtilization / limits.maxCapitalUtilization) * 20;
    score += Math.min(20, Math.max(0, capUtil));

    // 3. Concentration ratio relative to limit (0-20 pts)
    const concUtil = (concentrationRatio / limits.maxConcentrationRatio) * 20;
    score += Math.min(20, Math.max(0, concUtil));

    // 4. Volatility contribution (0-15 pts)
    const volUtil = (volatilityIndex / 50) * 15;
    score += Math.min(15, Math.max(0, volUtil));

    // 5. Liquidity risk penalty (0-20 pts)
    if (liquidityScore < limits.minLiquidityScore) {
      score += Math.min(20, ((limits.minLiquidityScore - liquidityScore) / limits.minLiquidityScore) * 20 + 10);
    }

    const roundedScore = Math.min(100, Math.round(score * 100) / 100);

    return {
      riskScore: roundedScore,
      grossExposure,
      netExposure,
      longExposure,
      shortExposure,
      capitalUtilization: Math.round(capitalUtilization * 100) / 100,
      positionSize,
      dailyLoss,
      maxDrawdown: Math.round(maxDrawdown * 100) / 100,
      concentrationRatio: Math.round(concentrationRatio * 100) / 100,
      volatilityIndex,
      liquidityScore,
      availableMargin,
      requiredMargin,
      leverage: Math.round(leverage * 100) / 100,
    };
  }

  determineRiskLevel(score: number): RiskLevel {
    if (score >= 90) return 'BLOCKED';
    if (score >= 75) return 'CRITICAL';
    if (score >= 55) return 'HIGH';
    if (score >= 35) return 'MEDIUM';
    if (score >= 15) return 'LOW';
    return 'VERY_LOW';
  }
}
