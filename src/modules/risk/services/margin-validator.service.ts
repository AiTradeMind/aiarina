// @ts-nocheck
import { RiskAssessmentMetrics, RiskEngineLimits } from "../types/index.ts";

export interface MarginValidationResult {
  isValid: boolean;
  requiredMargin: number;
  availableMargin: number;
  marginUtilization: number;
  marginCallTriggered: boolean;
  message?: string;
}

export class MarginValidatorService {
  validateMargin(metrics: RiskAssessmentMetrics, limits: RiskEngineLimits, marginCallLevel = 85.0): MarginValidationResult {
    const requiredMargin = metrics.requiredMargin;
    const availableMargin = metrics.availableMargin;

    if (availableMargin <= 0 && requiredMargin > 0) {
      return {
        isValid: false,
        requiredMargin,
        availableMargin,
        marginUtilization: 100,
        marginCallTriggered: true,
        message: "Insufficient margin available: Available margin is zero or negative",
      };
    }

    const marginUtilization = availableMargin > 0 ? (requiredMargin / availableMargin) * 100 : 0;
    const marginCallTriggered = marginUtilization >= marginCallLevel;

    if (requiredMargin > availableMargin) {
      return {
        isValid: false,
        requiredMargin,
        availableMargin,
        marginUtilization: Math.round(marginUtilization * 100) / 100,
        marginCallTriggered: true,
        message: `Required margin (${requiredMargin.toLocaleString()}) exceeds available margin (${availableMargin.toLocaleString()})`,
      };
    }

    return {
      isValid: true,
      requiredMargin,
      availableMargin,
      marginUtilization: Math.round(marginUtilization * 100) / 100,
      marginCallTriggered,
      message: marginCallTriggered
        ? `Warning: Margin utilization (${marginUtilization.toFixed(1)}%) reached margin call threshold (${marginCallLevel}%)`
        : "Margin requirements satisfied",
    };
  }
}
