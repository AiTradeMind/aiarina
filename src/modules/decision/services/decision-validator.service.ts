import {
  DECISION_CONFIDENCE,
  DECISION_PRIORITY,
  DECISION_ERRORS,
  DecisionConfidenceValue,
  DecisionPriorityValue,
  DecisionTypeValue,
} from "../constants/index.ts";
import { EvaluateDecisionDTO } from "../types/index.ts";
import { PermissionMatrix } from "../../constitution/permissions/permission.matrix.ts";
import { GOVERNANCE_ROLES, GOVERNANCE_ACTIONS } from "../../constitution/constants/index.ts";
import logger from "../../../lib/logger.ts";

export class DecisionValidatorService {
  /**
   * Validate input parameters before decision pipeline evaluation
   */
  public validateInputs(dto: EvaluateDecisionDTO): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!dto.brainContext && !dto.contextId && (!dto.researchEvidence || dto.researchEvidence.length === 0)) {
      errors.push(DECISION_ERRORS.MISSING_REQUIRED_INPUTS);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Evaluate governance and constitution policies
   */
  public validateGovernance(
    operatorRole: string = GOVERNANCE_ROLES.SYSTEM,
    action: string = GOVERNANCE_ACTIONS.EXECUTE
  ): { allowed: boolean; policyReference: string } {
    let normalizedRole: string = operatorRole;
    if (operatorRole.toUpperCase() === "SYSTEM") normalizedRole = GOVERNANCE_ROLES.SYSTEM;
    else if (operatorRole.toUpperCase() === "OWNER") normalizedRole = GOVERNANCE_ROLES.OWNER;
    else if (operatorRole.toUpperCase() === "SUPER_ADMIN" || operatorRole.toUpperCase() === "SUPER ADMIN") normalizedRole = GOVERNANCE_ROLES.SUPER_ADMIN;
    else if (operatorRole.toUpperCase() === "ADMIN") normalizedRole = GOVERNANCE_ROLES.ADMIN;
    else if (operatorRole.toUpperCase() === "MANAGER") normalizedRole = GOVERNANCE_ROLES.MANAGER;
    else if (operatorRole.toUpperCase() === "OPERATOR") normalizedRole = GOVERNANCE_ROLES.OPERATOR;
    else if (operatorRole.toUpperCase() === "AUDITOR") normalizedRole = GOVERNANCE_ROLES.AUDITOR;
    else if (operatorRole.toUpperCase() === "VIEWER") normalizedRole = GOVERNANCE_ROLES.VIEWER;
    else if (operatorRole.toUpperCase() === "AI") normalizedRole = GOVERNANCE_ROLES.AI;

    let normalizedAction: string = action;
    if (action.toUpperCase() === "EXECUTE") normalizedAction = GOVERNANCE_ACTIONS.EXECUTE;
    else if (action.toUpperCase() === "READ") normalizedAction = GOVERNANCE_ACTIONS.READ;
    else if (action.toUpperCase() === "WRITE") normalizedAction = GOVERNANCE_ACTIONS.WRITE;
    else if (action.toUpperCase() === "REGISTER") normalizedAction = GOVERNANCE_ACTIONS.REGISTER;
    else if (action.toUpperCase() === "APPROVE") normalizedAction = GOVERNANCE_ACTIONS.APPROVE;
    else if (action.toUpperCase() === "REJECT") normalizedAction = GOVERNANCE_ACTIONS.REJECT;

    const allowed = PermissionMatrix.hasPermission(normalizedRole as any, normalizedAction as any);
    const policyReference = `CONSTITUTION_POL_PERM_MATRIX_${normalizedRole}_${normalizedAction}`;

    if (!allowed) {
      logger.warn(
        { type: "DECISION_GOVERNANCE_DENIED", operatorRole, action },
        "Governance validation failed for decision engine operation"
      );
    }

    return { allowed, policyReference };
  }

  /**
   * Calculate confidence score and mapped confidence level
   */
  public calculateConfidenceScore(
    knowledgeCount: number,
    evidenceCount: number,
    baseConfidence: number = 75.0
  ): { confidenceScore: number; confidenceLevel: DecisionConfidenceValue } {
    let score = baseConfidence + knowledgeCount * 3 + evidenceCount * 2;
    score = Math.min(Math.max(score, 10.0), 99.0);

    let confidenceLevel: DecisionConfidenceValue = DECISION_CONFIDENCE.MEDIUM;
    if (score >= 90.0) confidenceLevel = DECISION_CONFIDENCE.VERY_HIGH;
    else if (score >= 80.0) confidenceLevel = DECISION_CONFIDENCE.HIGH;
    else if (score >= 60.0) confidenceLevel = DECISION_CONFIDENCE.MEDIUM;
    else if (score >= 40.0) confidenceLevel = DECISION_CONFIDENCE.LOW;
    else confidenceLevel = DECISION_CONFIDENCE.VERY_LOW;

    return { confidenceScore: Math.round(score * 100) / 100, confidenceLevel };
  }

  /**
   * Calculate risk score (0-100)
   */
  public calculateRiskScore(
    decisionType: DecisionTypeValue,
    confidenceScore: number
  ): number {
    let baseRisk = 50.0;
    if (decisionType === "BUY" || decisionType === "SELL" || decisionType === "INCREASE") {
      baseRisk = 45.0;
    } else if (decisionType === "HOLD" || decisionType === "WATCH" || decisionType === "IGNORE") {
      baseRisk = 15.0;
    } else if (decisionType === "EXIT" || decisionType === "REDUCE") {
      baseRisk = 25.0;
    }

    // High confidence reduces risk score
    const riskScore = Math.max(10.0, Math.min(95.0, baseRisk + (100 - confidenceScore) * 0.3));
    return Math.round(riskScore * 100) / 100;
  }

  /**
   * Calculate priority level
   */
  public calculatePriority(
    decisionType: DecisionTypeValue,
    confidenceScore: number,
    riskScore: number
  ): DecisionPriorityValue {
    if (confidenceScore >= 85.0 && (decisionType === "EXIT" || decisionType === "SELL")) {
      return DECISION_PRIORITY.CRITICAL;
    }
    if (confidenceScore >= 75.0 && (decisionType === "BUY" || decisionType === "INCREASE")) {
      return DECISION_PRIORITY.HIGH;
    }
    if (decisionType === "HOLD" || decisionType === "WATCH") {
      return DECISION_PRIORITY.NORMAL;
    }
    return DECISION_PRIORITY.LOW;
  }
}
