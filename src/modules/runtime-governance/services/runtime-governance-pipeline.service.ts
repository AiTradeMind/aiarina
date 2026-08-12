import {
  RuntimeEvaluationRequest,
  RuntimeEvaluationResult,
  GovernanceAuditLogRecord,
} from "../types/index.ts";
import { EVALUATION_STATUSES } from "../constants/index.ts";
import { KillSwitchService } from "./kill-switch.service.ts";
import { CircuitBreakerService } from "./circuit-breaker.service.ts";
import { RuntimePolicyService } from "./runtime-policy.service.ts";
import { RuntimeGovernanceRepository } from "../repositories/runtime-governance.repository.ts";
import logger from "../../../lib/logger.ts";

export class RuntimeGovernancePipelineService {
  private static instance: RuntimeGovernancePipelineService;

  private killSwitchService: KillSwitchService;
  private circuitBreakerService: CircuitBreakerService;
  private policyService: RuntimePolicyService;
  private repository: RuntimeGovernanceRepository;

  private constructor() {
    this.killSwitchService = KillSwitchService.getInstance();
    this.circuitBreakerService = CircuitBreakerService.getInstance();
    this.policyService = RuntimePolicyService.getInstance();
    this.repository = RuntimeGovernanceRepository.getInstance();
  }

  public static getInstance(): RuntimeGovernancePipelineService {
    if (!RuntimeGovernancePipelineService.instance) {
      RuntimeGovernancePipelineService.instance = new RuntimeGovernancePipelineService();
    }
    return RuntimeGovernancePipelineService.instance;
  }

  public async runGovernancePipeline(
    request: RuntimeEvaluationRequest
  ): Promise<RuntimeEvaluationResult> {
    const evaluationId = `RTEVAL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const startTime = Date.now();

    logger.info(
      { evaluationId, actionType: request.actionType, actorId: request.actorId },
      "Starting Runtime Governance Pipeline Execution"
    );

    // Stage 1: Input Sanitization
    if (!request.actionType) {
      const errRes: RuntimeEvaluationResult = {
        evaluationId,
        status: EVALUATION_STATUSES.REJECTED,
        riskScore: 100.0,
        isCompliant: false,
        violations: [
          {
            policyId: "POL-INVALID-INPUT",
            policyName: "Input Validation",
            category: "COMPLIANCE_RULE",
            enforcementLevel: "STRICT_BLOCK",
            reason: "Missing required 'actionType' in evaluation request.",
          },
        ],
        triggeredPolicies: ["POL-INVALID-INPUT"],
        metadata: { stage: "INPUT_SANITIZATION" },
        timestamp: new Date(),
      };
      await this.logAudit(errRes, request);
      return errRes;
    }

    // Stage 2: Kill Switch Check
    const targetScope = request.symbol ? "SYMBOL" : "GLOBAL";
    const killSwitchStatus = await this.killSwitchService.isKillSwitchActive(targetScope);
    if (killSwitchStatus.isActive) {
      const ksRes: RuntimeEvaluationResult = {
        evaluationId,
        status: EVALUATION_STATUSES.KILL_SWITCH_ACTIVE,
        riskScore: 100.0,
        isCompliant: false,
        violations: [
          {
            policyId: "POL-KILL-SWITCH",
            policyName: "Emergency Kill Switch Enforcement",
            category: "KILL_SWITCH",
            enforcementLevel: "STRICT_BLOCK",
            reason: `Emergency Kill Switch is currently ACTIVE for scope '${targetScope}'. Reason: ${killSwitchStatus.state?.reason || "Emergency halt"}`,
          },
        ],
        triggeredPolicies: ["POL-KILL-SWITCH"],
        metadata: { stage: "KILL_SWITCH_CHECK", killSwitchState: killSwitchStatus.state },
        timestamp: new Date(),
      };
      await this.logAudit(ksRes, request);
      return ksRes;
    }

    // Stage 3: Circuit Breaker Check
    const cbTarget = request.symbol || "GLOBAL";
    const cbCheck = await this.circuitBreakerService.checkCircuitBreaker(cbTarget);
    if (cbCheck.isOpen) {
      const cbRes: RuntimeEvaluationResult = {
        evaluationId,
        status: EVALUATION_STATUSES.CIRCUIT_BROKEN,
        riskScore: 90.0,
        isCompliant: false,
        violations: [
          {
            policyId: "POL-CIRCUIT-BREAKER",
            policyName: "Circuit Breaker Protection",
            category: "CIRCUIT_BREAKER",
            enforcementLevel: "STRICT_BLOCK",
            reason: `Circuit Breaker is OPEN for target '${cbTarget}'. Trip count: ${cbCheck.state.tripCount}. Reason: ${cbCheck.state.reason || "System instability"}`,
          },
        ],
        triggeredPolicies: ["POL-CIRCUIT-BREAKER"],
        metadata: { stage: "CIRCUIT_BREAKER_CHECK", circuitBreakerState: cbCheck.state },
        timestamp: new Date(),
      };
      await this.logAudit(cbRes, request);
      return cbRes;
    }

    // Stage 4 & 5: Constitution Check & Policy Evaluation
    const policyResult = await this.policyService.evaluatePolicies(request);

    let finalStatus: any = EVALUATION_STATUSES.APPROVED;
    if (!policyResult.isCompliant) {
      finalStatus = EVALUATION_STATUSES.REJECTED;
    } else if (policyResult.requiresSecondaryApproval) {
      finalStatus = EVALUATION_STATUSES.REQUIRES_APPROVAL;
    }

    const durationMs = Date.now() - startTime;

    const finalResult: RuntimeEvaluationResult = {
      evaluationId,
      status: finalStatus,
      riskScore: policyResult.riskScore,
      isCompliant: policyResult.isCompliant,
      violations: policyResult.violations,
      triggeredPolicies: policyResult.triggeredPolicies,
      metadata: {
        durationMs,
        requiresSecondaryApproval: policyResult.requiresSecondaryApproval,
        actorRole: request.role,
        symbol: request.symbol,
        amount: request.amount,
      },
      timestamp: new Date(),
    };

    // Stage 6: Audit Logging
    await this.logAudit(finalResult, request);

    logger.info(
      {
        evaluationId,
        status: finalResult.status,
        riskScore: finalResult.riskScore,
        violationsCount: finalResult.violations.length,
        durationMs,
      },
      "Runtime Governance Pipeline Execution Completed"
    );

    return finalResult;
  }

  private async logAudit(result: RuntimeEvaluationResult, request: RuntimeEvaluationRequest): Promise<void> {
    const auditRecord: GovernanceAuditLogRecord = {
      logId: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      evaluationId: result.evaluationId,
      actionType: request.actionType || "UNKNOWN",
      actorId: request.actorId || request.role || "SYSTEM",
      resultStatus: result.status,
      riskScore: result.riskScore,
      details: {
        violations: result.violations,
        triggeredPolicies: result.triggeredPolicies,
        metadata: result.metadata,
      },
      createdAt: new Date(),
    };

    await this.repository.saveAuditLog(auditRecord);
  }
}
