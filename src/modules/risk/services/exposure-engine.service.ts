// @ts-nocheck
import { RiskAssessmentMetrics, RiskEngineLimits } from "../types/index.ts";

export interface ExposureAnalysis {
  grossExposure: number;
  netExposure: number;
  longExposure: number;
  shortExposure: number;
  leverage: number;
  concentrationRatio: number;
  isConcentrationBreached: boolean;
  isLeverageExcessive: boolean;
  warnings: string[];
}

export class ExposureEngineService {
  analyzeExposure(metrics: RiskAssessmentMetrics, limits: RiskEngineLimits): ExposureAnalysis {
    const warnings: string[] = [];

    const isConcentrationBreached = metrics.concentrationRatio > limits.maxConcentrationRatio;
    if (isConcentrationBreached) {
      warnings.push(`Concentration ratio (${metrics.concentrationRatio.toFixed(1)}%) exceeds limit (${limits.maxConcentrationRatio}%)`);
    }

    const maxAllowedLeverage = limits.maxCapitalUtilization > 0 ? (limits.maxCapitalUtilization / 50) : 2.0;
    const isLeverageExcessive = metrics.leverage > maxAllowedLeverage;
    if (isLeverageExcessive) {
      warnings.push(`Leverage multiplier (${metrics.leverage.toFixed(2)}x) exceeds safe limit (${maxAllowedLeverage.toFixed(2)}x)`);
    }

    return {
      grossExposure: metrics.grossExposure,
      netExposure: metrics.netExposure,
      longExposure: metrics.longExposure,
      shortExposure: metrics.shortExposure,
      leverage: metrics.leverage,
      concentrationRatio: metrics.concentrationRatio,
      isConcentrationBreached,
      isLeverageExcessive,
      warnings,
    };
  }
}
