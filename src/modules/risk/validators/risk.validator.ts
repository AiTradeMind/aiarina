import { RISK_TYPES, RISK_LEVELS, RiskType, RiskLevel } from "../constants/index.ts";
import { CreateRiskProfileDto, EvaluateRiskRequestDto, UpdateRiskLimitsDto } from "../dtos/risk.dto.ts";

export class RiskValidator {
  static validateCreateProfile(dto: CreateRiskProfileDto): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!dto.name || dto.name.trim().length === 0) {
      errors.push("Profile name is required");
    }

    if (dto.riskLevel && !RISK_LEVELS.includes(dto.riskLevel as any)) {
      errors.push(`Invalid risk level. Must be one of: ${RISK_LEVELS.join(", ")}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateLimits(dto: UpdateRiskLimitsDto): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (dto.maxPositionSize !== undefined && dto.maxPositionSize < 0) {
      errors.push("maxPositionSize must be non-negative");
    }

    if (dto.maxDailyLoss !== undefined && dto.maxDailyLoss < 0) {
      errors.push("maxDailyLoss must be non-negative");
    }

    if (dto.maxCapitalUtilization !== undefined && (dto.maxCapitalUtilization < 0 || dto.maxCapitalUtilization > 100)) {
      errors.push("maxCapitalUtilization must be between 0 and 100");
    }

    if (dto.maxConcentrationRatio !== undefined && (dto.maxConcentrationRatio < 0 || dto.maxConcentrationRatio > 100)) {
      errors.push("maxConcentrationRatio must be between 0 and 100");
    }

    if (dto.maxDrawdown !== undefined && (dto.maxDrawdown < 0 || dto.maxDrawdown > 100)) {
      errors.push("maxDrawdown must be between 0 and 100");
    }

    if (dto.minLiquidityScore !== undefined && (dto.minLiquidityScore < 0 || dto.minLiquidityScore > 100)) {
      errors.push("minLiquidityScore must be between 0 and 100");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateEvaluateRequest(dto: EvaluateRiskRequestDto): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!dto.targetId || dto.targetId.trim().length === 0) {
      errors.push("Target ID is required for risk assessment");
    }

    if (dto.riskType && !RISK_TYPES.includes(dto.riskType as any)) {
      errors.push(`Invalid risk type. Must be one of: ${RISK_TYPES.join(", ")}`);
    }

    if (dto.orderValue !== undefined && dto.orderValue < 0) {
      errors.push("orderValue cannot be negative");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
