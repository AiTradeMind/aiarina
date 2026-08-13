import { PipelineStage, FUND_PIPELINE_STAGES } from "../constants/index.ts";
import { PipelineExecutionResult } from "../types/index.ts";
import { PermissionMatrix } from "../../constitution/permissions/permission.matrix.ts";
import { GOVERNANCE_ROLES, GOVERNANCE_ACTIONS, GovernanceRole } from "../../constitution/constants/index.ts";
import { RuntimePolicyService } from "../../runtime-governance/services/runtime-policy.service.ts";
import { KillSwitchService } from "../../runtime-governance/services/kill-switch.service.ts";
import { CircuitBreakerService } from "../../runtime-governance/services/circuit-breaker.service.ts";
import { FundRepository } from "../repositories/fund.repository.ts";
import { FundValidator } from "../validators/fund.validator.ts";
import logger from "../../../lib/logger.ts";

export class FundPipelineService {
  private static instance: FundPipelineService;
  private runtimePolicyService: RuntimePolicyService;
  private killSwitchService: KillSwitchService;
  private circuitBreakerService: CircuitBreakerService;
  private repository: FundRepository;

  private constructor() {
    this.runtimePolicyService = RuntimePolicyService.getInstance();
    this.killSwitchService = KillSwitchService.getInstance();
    this.circuitBreakerService = CircuitBreakerService.getInstance();
    this.repository = FundRepository.getInstance();
  }

  public static getInstance(): FundPipelineService {
    if (!FundPipelineService.instance) {
      FundPipelineService.instance = new FundPipelineService();
    }
    return FundPipelineService.instance;
  }

  private normalizeRole(roleStr?: string): GovernanceRole {
    if (!roleStr) return GOVERNANCE_ROLES.SYSTEM;
    const clean = roleStr.replace(/_/g, " ").trim().toUpperCase();

    if (clean === "OWNER") return GOVERNANCE_ROLES.OWNER;
    if (clean === "SUPER ADMIN" || clean === "SUPERADMIN") return GOVERNANCE_ROLES.SUPER_ADMIN;
    if (clean === "ADMIN") return GOVERNANCE_ROLES.ADMIN;
    if (clean === "MANAGER") return GOVERNANCE_ROLES.MANAGER;
    if (clean === "OPERATOR") return GOVERNANCE_ROLES.OPERATOR;
    if (clean === "AUDITOR") return GOVERNANCE_ROLES.AUDITOR;
    if (clean === "VIEWER") return GOVERNANCE_ROLES.VIEWER;
    if (clean === "AI") return GOVERNANCE_ROLES.AI;
    if (clean === "SYSTEM") return GOVERNANCE_ROLES.SYSTEM;

    return GOVERNANCE_ROLES.VIEWER;
  }

  public async runPipeline<T>(
    operationType: string,
    params: {
      fundId?: string;
      sourceFundId?: string;
      amount?: number;
      actorRole?: string;
      actorId?: string;
      details?: Record<string, any>;
    },
    executionFn: () => Promise<T>
  ): Promise<PipelineExecutionResult<T>> {
    const startTime = Date.now();
    let currentStage: PipelineStage = FUND_PIPELINE_STAGES.REQUEST;

    try {
      // 1. Stage: REQUEST
      currentStage = FUND_PIPELINE_STAGES.REQUEST;
      logger.info({ operationType, fundId: params.fundId || params.sourceFundId }, "Fund Pipeline Started");

      // Prohibition check on parameters/details
      FundValidator.validateProhibitionCall(operationType);

      // 2. Stage: VALIDATE_GOVERNANCE
      currentStage = FUND_PIPELINE_STAGES.VALIDATE_GOVERNANCE;
      const callerRole = this.normalizeRole(params.actorRole);
      const isPermitted = PermissionMatrix.hasPermission(callerRole, GOVERNANCE_ACTIONS.EXECUTE);
      if (!isPermitted) {
        throw new Error(`GOVERNANCE_REJECT: Role '${params.actorRole || callerRole}' lacks Constitution permission to execute '${operationType}'.`);
      }

      // Check Kill Switch
      const killSwitchCheck = await this.killSwitchService.isKillSwitchActive("GLOBAL");
      if (killSwitchCheck.isActive) {
        throw new Error(`KILL_SWITCH_ACTIVE: Global kill switch active. Reason: ${killSwitchCheck.state?.reason}`);
      }

      // Check Circuit Breaker
      const breakerTarget = params.fundId || params.sourceFundId || "GLOBAL";
      const breakerCheck = await this.circuitBreakerService.checkCircuitBreaker(breakerTarget);
      if (breakerCheck.isOpen) {
        throw new Error(`CIRCUIT_BREAKER_OPEN: Circuit breaker for '${breakerTarget}' is OPEN.`);
      }

      // Evaluate Policies via RuntimePolicyService
      const evalResult = await this.runtimePolicyService.evaluatePolicies({
        actionType: operationType,
        symbol: breakerTarget,
        amount: params.amount,
        role: params.actorRole || "SYSTEM",
        actorId: params.actorId || "SYSTEM",
        metadata: params.details,
      });

      if (!evalResult.isCompliant) {
        const failureReason = evalResult.violations.map((v) => v.reason).join("; ");
        return {
          success: false,
          pipelineStage: currentStage,
          executionTimeMs: Date.now() - startTime,
          failureReason: `GOVERNANCE_VIOLATION: ${failureReason}`,
          governanceViolations: evalResult.violations,
          riskScore: evalResult.riskScore,
        };
      }

      // 3. Stage: VALIDATE_FUNDS
      currentStage = FUND_PIPELINE_STAGES.VALIDATE_FUNDS;
      const targetFundId = params.fundId || params.sourceFundId;
      if (targetFundId && operationType !== "UNFREEZE_FUND") {
        const fund = await this.repository.getAccountById(targetFundId);
        if (fund && fund.status === "FROZEN") {
          throw new Error(`FUND_FROZEN: Fund '${targetFundId}' is currently FROZEN.`);
        }
      }

      // 4. Stage: VALIDATE_LIMITS
      currentStage = FUND_PIPELINE_STAGES.VALIDATE_LIMITS;
      if (targetFundId && params.amount) {
        const metadataInfo = await this.repository.getMetadata(targetFundId);
        if (metadataInfo && metadataInfo.maxAllocationLimit) {
          if (params.amount > metadataInfo.maxAllocationLimit) {
            throw new Error(`LIMIT_EXCEEDED: Amount ₹${params.amount} exceeds max allocation limit of ₹${metadataInfo.maxAllocationLimit}`);
          }
        }
      }

      // 5. Stage: ALLOCATE_RESERVE
      currentStage = FUND_PIPELINE_STAGES.ALLOCATE_RESERVE;
      const resultData = await executionFn();

      // 6. Stage: AUDIT
      currentStage = FUND_PIPELINE_STAGES.AUDIT;
      const auditLogId = `AUDIT-FUND-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // 7. Stage: READY
      currentStage = FUND_PIPELINE_STAGES.READY;
      const executionTimeMs = Date.now() - startTime;

      logger.info({ operationType, executionTimeMs, auditLogId }, "Fund Pipeline Completed Successfully");

      return {
        success: true,
        pipelineStage: currentStage,
        executionTimeMs,
        data: resultData,
        riskScore: evalResult.riskScore,
        auditLogId,
      };
    } catch (error: any) {
      const executionTimeMs = Date.now() - startTime;
      logger.error({ operationType, stage: currentStage, error: error?.message, executionTimeMs }, "Fund Pipeline Execution Failed");

      return {
        success: false,
        pipelineStage: currentStage,
        executionTimeMs,
        failureReason: error?.message || "Unknown pipeline failure",
      };
    }
  }
}
