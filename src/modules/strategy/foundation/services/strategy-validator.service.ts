import { STRATEGY_TYPES, StrategyTypeValue, STRATEGY_ERRORS } from "../constants/index.ts";
import { GOVERNANCE_ROLES, GOVERNANCE_ACTIONS } from "../../../constitution/constants/index.ts";
import { PermissionMatrix } from "../../../constitution/permissions/permission.matrix.ts";
import logger from "../../../../lib/logger.ts";

export class StrategyValidatorService {
  private static instance: StrategyValidatorService;

  private constructor() {}

  public static getInstance(): StrategyValidatorService {
    if (!StrategyValidatorService.instance) {
      StrategyValidatorService.instance = new StrategyValidatorService();
    }
    return StrategyValidatorService.instance;
  }

  public validateConfiguration(config: Record<string, any>, strategyType: StrategyTypeValue): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!Object.values(STRATEGY_TYPES).includes(strategyType)) {
      errors.push(STRATEGY_ERRORS.INVALID_STRATEGY_TYPE);
    }

    if (!config || typeof config !== "object") {
      errors.push("Strategy config must be a valid non-null object.");
      return { isValid: false, errors, warnings };
    }

    // Type specific rule validation
    switch (strategyType) {
      case STRATEGY_TYPES.MOMENTUM:
        if (config.rsiThreshold && (config.rsiThreshold < 0 || config.rsiThreshold > 100)) {
          errors.push("Momentum RSI threshold must be between 0 and 100.");
        }
        break;

      case STRATEGY_TYPES.TREND_FOLLOWING:
        if (config.shortMa && config.longMa && config.shortMa >= config.longMa) {
          warnings.push("Short Moving Average should typically be smaller than Long Moving Average.");
        }
        break;

      case STRATEGY_TYPES.MEAN_REVERSION:
        if (config.stdDevMultiplier && config.stdDevMultiplier <= 0) {
          errors.push("Mean Reversion stdDevMultiplier must be greater than 0.");
        }
        break;

      case STRATEGY_TYPES.BREAKOUT:
      case STRATEGY_TYPES.BREAKDOWN:
        if (config.lookbackPeriods && config.lookbackPeriods < 1) {
          errors.push("Breakout/Breakdown lookbackPeriods must be at least 1.");
        }
        break;

      case STRATEGY_TYPES.OPTIONS_DIRECTIONAL:
      case STRATEGY_TYPES.OPTIONS_VOLATILITY:
        if (config.impliedVolatilityThreshold && config.impliedVolatilityThreshold < 0) {
          errors.push("Implied volatility threshold must be non-negative.");
        }
        break;

      default:
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  public validateGovernance(role?: string, action: string = "EXECUTE"): {
    isCompliant: boolean;
    reason?: string;
    policyId?: string;
  } {
    const rawRole = (role || "SYSTEM").toUpperCase();
    let normalizedRole: string = GOVERNANCE_ROLES.SYSTEM;
    if (rawRole === "OWNER") normalizedRole = GOVERNANCE_ROLES.OWNER;
    else if (rawRole === "SUPER_ADMIN" || rawRole === "SUPERADMIN") normalizedRole = GOVERNANCE_ROLES.SUPER_ADMIN;
    else if (rawRole === "ADMIN") normalizedRole = GOVERNANCE_ROLES.ADMIN;
    else if (rawRole === "MANAGER") normalizedRole = GOVERNANCE_ROLES.MANAGER;
    else if (rawRole === "OPERATOR") normalizedRole = GOVERNANCE_ROLES.OPERATOR;
    else if (rawRole === "AUDITOR") normalizedRole = GOVERNANCE_ROLES.AUDITOR;
    else if (rawRole === "VIEWER") normalizedRole = GOVERNANCE_ROLES.VIEWER;
    else if (rawRole === "AI") normalizedRole = GOVERNANCE_ROLES.AI;

    const rawAction = (action || "EXECUTE").toUpperCase();
    let normalizedAction: string = GOVERNANCE_ACTIONS.EXECUTE;
    if (rawAction === "READ") normalizedAction = GOVERNANCE_ACTIONS.READ;
    else if (rawAction === "WRITE") normalizedAction = GOVERNANCE_ACTIONS.WRITE;
    else if (rawAction === "REGISTER") normalizedAction = GOVERNANCE_ACTIONS.REGISTER;
    else if (rawAction === "LOCK") normalizedAction = GOVERNANCE_ACTIONS.LOCK;
    else if (rawAction === "ACTIVATE") normalizedAction = GOVERNANCE_ACTIONS.ACTIVATE;
    else if (rawAction === "ARCHIVE") normalizedAction = GOVERNANCE_ACTIONS.ARCHIVE;
    else if (rawAction === "APPROVE") normalizedAction = GOVERNANCE_ACTIONS.APPROVE;
    else if (rawAction === "REJECT") normalizedAction = GOVERNANCE_ACTIONS.REJECT;

    const allowed = PermissionMatrix.hasPermission(normalizedRole as any, normalizedAction as any);

    if (!allowed) {
      logger.warn({
        type: "STRATEGY_GOVERNANCE_REJECTED",
        userRole: normalizedRole,
        action: normalizedAction,
      }, "Strategy governance permission check failed");

      return {
        isCompliant: false,
        reason: `Role '${normalizedRole}' is not authorized to execute '${normalizedAction}' action on Strategy Engine Foundation.`,
        policyId: `CONSTITUTION_POL_PERM_MATRIX_${normalizedRole}_${normalizedAction}`,
      };
    }

    return {
      isCompliant: true,
      policyId: `CONSTITUTION_POL_PERM_MATRIX_${normalizedRole}_${normalizedAction}`,
    };
  }

  public calculateSignalStrength(
    contextConfidence: number = 75,
    conditionMatches: number = 1,
    totalConditions: number = 1
  ): { strength: number; confidenceLabel: "HIGH" | "MEDIUM" | "LOW" } {
    const matchRatio = totalConditions > 0 ? conditionMatches / totalConditions : 1;
    const rawStrength = (contextConfidence * 0.5) + (matchRatio * 100 * 0.5);
    const strength = Math.min(100, Math.max(0, Math.round(rawStrength * 100) / 100));

    let confidenceLabel: "HIGH" | "MEDIUM" | "LOW" = "MEDIUM";
    if (strength >= 80) confidenceLabel = "HIGH";
    else if (strength < 50) confidenceLabel = "LOW";

    return { strength, confidenceLabel };
  }

  public calculatePriority(signalType: string, strength: number): string {
    if (signalType === "EXIT_SIGNAL" || strength >= 85) {
      return "HIGH";
    }
    if (signalType === "IGNORE_SIGNAL" || strength < 40) {
      return "LOW";
    }
    return "NORMAL";
  }
}
