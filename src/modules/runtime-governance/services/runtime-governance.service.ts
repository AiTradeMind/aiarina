import {
  RuntimeEvaluationRequest,
  RuntimeEvaluationResult,
  RuntimeGovernancePolicy,
  CircuitBreakerState,
  KillSwitchState,
  GovernanceAuditLogRecord,
} from "../types/index.ts";
import { RUNTIME_GOVERNANCE_ERRORS } from "../constants/index.ts";
import { RuntimeGovernancePipelineService } from "./runtime-governance-pipeline.service.ts";
import { KillSwitchService } from "./kill-switch.service.ts";
import { CircuitBreakerService } from "./circuit-breaker.service.ts";
import { RuntimePolicyService } from "./runtime-policy.service.ts";
import { RuntimeGovernanceRepository } from "../repositories/runtime-governance.repository.ts";
import logger from "../../../lib/logger.ts";

export class RuntimeGovernanceService {
  private static instance: RuntimeGovernanceService;

  private pipelineService: RuntimeGovernancePipelineService;
  private killSwitchService: KillSwitchService;
  private circuitBreakerService: CircuitBreakerService;
  private policyService: RuntimePolicyService;
  private repository: RuntimeGovernanceRepository;

  private constructor() {
    this.pipelineService = RuntimeGovernancePipelineService.getInstance();
    this.killSwitchService = KillSwitchService.getInstance();
    this.circuitBreakerService = CircuitBreakerService.getInstance();
    this.policyService = RuntimePolicyService.getInstance();
    this.repository = RuntimeGovernanceRepository.getInstance();
  }

  public static getInstance(): RuntimeGovernanceService {
    if (!RuntimeGovernanceService.instance) {
      RuntimeGovernanceService.instance = new RuntimeGovernanceService();
    }
    return RuntimeGovernanceService.instance;
  }

  public async evaluateAction(request: RuntimeEvaluationRequest): Promise<RuntimeEvaluationResult> {
    return this.pipelineService.runGovernancePipeline(request);
  }

  public async activateKillSwitch(
    scope: "GLOBAL" | "SYMBOL" | "STRATEGY" | "USER" = "GLOBAL",
    operator: string = "SYSTEM",
    reason: string = "Manual emergency halt requested",
    role?: string
  ): Promise<KillSwitchState> {
    return this.killSwitchService.activateKillSwitch(scope, operator, reason, role);
  }

  public async deactivateKillSwitch(
    scope: "GLOBAL" | "SYMBOL" | "STRATEGY" | "USER" = "GLOBAL",
    operator: string = "SUPER_ADMIN",
    reason: string = "Emergency halt cleared",
    role?: string
  ): Promise<KillSwitchState> {
    return this.killSwitchService.deactivateKillSwitch(scope, operator, reason, role);
  }

  public async getKillSwitchStatus(scope: string = "GLOBAL"): Promise<KillSwitchState | null> {
    return this.killSwitchService.getKillSwitchState(scope);
  }

  public async tripCircuitBreaker(
    target: string = "GLOBAL",
    reason: string = "Anomalous error rate detected",
    cooldownMs: number = 60000
  ): Promise<CircuitBreakerState> {
    return this.circuitBreakerService.tripCircuitBreaker(target, reason, cooldownMs);
  }

  public async resetCircuitBreaker(
    target: string = "GLOBAL",
    operator: string = "OPERATOR"
  ): Promise<CircuitBreakerState> {
    return this.circuitBreakerService.resetCircuitBreaker(target, operator);
  }

  public async getAllCircuitBreakers(): Promise<CircuitBreakerState[]> {
    return this.circuitBreakerService.getAllBreakers();
  }

  public async savePolicy(policy: RuntimeGovernancePolicy): Promise<RuntimeGovernancePolicy> {
    return this.policyService.createOrUpdatePolicy(policy);
  }

  public async getActivePolicies(): Promise<RuntimeGovernancePolicy[]> {
    return this.policyService.getAllPolicies();
  }

  public async getAuditLogs(limit: number = 50): Promise<GovernanceAuditLogRecord[]> {
    return this.repository.getAuditLogs(limit);
  }

  public async getHealthStatus(): Promise<{
    status: "HEALTHY" | "DEGRADED" | "CRITICAL";
    killSwitchActive: boolean;
    circuitBreakersOpenCount: number;
    activePoliciesCount: number;
    timestamp: Date;
  }> {
    const killSwitch = await this.killSwitchService.isKillSwitchActive("GLOBAL");
    const breakers = await this.circuitBreakerService.getAllBreakers();
    const openBreakers = breakers.filter((b) => b.status === "OPEN");
    const policies = await this.policyService.getAllPolicies();

    let status: "HEALTHY" | "DEGRADED" | "CRITICAL" = "HEALTHY";
    if (killSwitch.isActive) {
      status = "CRITICAL";
    } else if (openBreakers.length > 0) {
      status = "DEGRADED";
    }

    return {
      status,
      killSwitchActive: killSwitch.isActive,
      circuitBreakersOpenCount: openBreakers.length,
      activePoliciesCount: policies.length,
      timestamp: new Date(),
    };
  }

  // Strict Business Rule Boundary Enforcement
  public executeOrderDirectly(): never {
    throw new Error(
      `${RUNTIME_GOVERNANCE_ERRORS.EXECUTION_PROHIBITED}: Runtime Governance Engine enforces safety policy only and is strictly prohibited from executing market orders directly.`
    );
  }

  public transferFundsDirectly(): never {
    throw new Error(
      `${RUNTIME_GOVERNANCE_ERRORS.EXECUTION_PROHIBITED}: Runtime Governance Engine is strictly prohibited from managing capital allocations or fund transfers.`
    );
  }
}
