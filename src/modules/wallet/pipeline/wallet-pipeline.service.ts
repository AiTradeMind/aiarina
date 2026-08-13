import { PipelineStage, WALLET_PIPELINE_STAGES } from "../constants/index.ts";
import { WalletPipelineExecutionResult } from "../types/index.ts";
import { PermissionMatrix } from "../../constitution/permissions/permission.matrix.ts";
import { GOVERNANCE_ROLES, GOVERNANCE_ACTIONS, GovernanceRole } from "../../constitution/constants/index.ts";
import { RuntimePolicyService } from "../../runtime-governance/services/runtime-policy.service.ts";
import { KillSwitchService } from "../../runtime-governance/services/kill-switch.service.ts";
import { CircuitBreakerService } from "../../runtime-governance/services/circuit-breaker.service.ts";
import { WalletRepository } from "../repositories/wallet.repository.ts";
import logger from "../../../lib/logger.ts";

export class WalletPipelineService {
  private static instance: WalletPipelineService;
  private runtimePolicyService: RuntimePolicyService;
  private killSwitchService: KillSwitchService;
  private circuitBreakerService: CircuitBreakerService;
  private repository: WalletRepository;

  private constructor() {
    this.runtimePolicyService = RuntimePolicyService.getInstance();
    this.killSwitchService = KillSwitchService.getInstance();
    this.circuitBreakerService = CircuitBreakerService.getInstance();
    this.repository = WalletRepository.getInstance();
  }

  public static getInstance(): WalletPipelineService {
    if (!WalletPipelineService.instance) {
      WalletPipelineService.instance = new WalletPipelineService();
    }
    return WalletPipelineService.instance;
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
      walletId?: string;
      sourceWalletId?: string;
      destinationWalletId?: string;
      amount?: number;
      actorRole?: string;
      actorId?: string;
      details?: Record<string, any>;
    },
    executionFn: () => Promise<T>
  ): Promise<WalletPipelineExecutionResult<T>> {
    const startTime = Date.now();
    let currentStage: PipelineStage = WALLET_PIPELINE_STAGES.REQUEST;

    try {
      logger.info(
        { operationType, walletId: params.walletId || params.sourceWalletId },
        "Wallet Pipeline Started"
      );

      // 1. Stage: REQUEST
      currentStage = WALLET_PIPELINE_STAGES.REQUEST;

      // 2. Stage: VALIDATE_GOVERNANCE
      currentStage = WALLET_PIPELINE_STAGES.VALIDATE_GOVERNANCE;
      const ksCheck = await this.killSwitchService.isKillSwitchActive("GLOBAL");
      if (ksCheck.isActive) {
        throw new Error(
          `GOVERNANCE_KILL_SWITCH_ACTIVE: Global kill switch is active. Reason: ${
            ksCheck.state?.reason || "System halted"
          }`
        );
      }

      const targetWalletId = params.walletId || params.sourceWalletId;
      if (targetWalletId) {
        const cbCheck = await this.circuitBreakerService.checkCircuitBreaker(targetWalletId);
        if (cbCheck.isOpen) {
          throw new Error(
            `CIRCUIT_BREAKER_TRIPPED: Circuit breaker tripped for wallet '${targetWalletId}'. Reason: ${
              cbCheck.state.reason || "Automatic trigger"
            }`
          );
        }
      }

      const role = this.normalizeRole(params.actorRole);
      const isAllowed = PermissionMatrix.hasPermission(role, GOVERNANCE_ACTIONS.EXECUTE); // reuse baseline permission check
      if (!isAllowed && role !== GOVERNANCE_ROLES.SYSTEM) {
        logger.warn(
          { role, action: "WALLET_OPERATION" },
          "Permission warning for role in Wallet Pipeline"
        );
      }

      // 3. Stage: VALIDATE_WALLETS
      currentStage = WALLET_PIPELINE_STAGES.VALIDATE_WALLETS;
      if (params.sourceWalletId && operationType !== "UNFREEZE_WALLET") {
        const srcWallet = await this.repository.getWalletAccountById(params.sourceWalletId);
        if (srcWallet && (srcWallet.status === "FROZEN" || srcWallet.status === "LOCKED")) {
          throw new Error(`WALLET_INACTIVE: Source wallet '${params.sourceWalletId}' is currently ${srcWallet.status}.`);
        }
      }
      if (params.walletId && operationType !== "UNFREEZE_WALLET" && operationType !== "CREATE_WALLET") {
        const targetWallet = await this.repository.getWalletAccountById(params.walletId);
        if (targetWallet && targetWallet.status === "FROZEN") {
          throw new Error(`WALLET_FROZEN: Wallet '${params.walletId}' is currently FROZEN.`);
        }
      }

      // 4. Stage: VALIDATE_BALANCE
      currentStage = WALLET_PIPELINE_STAGES.VALIDATE_BALANCE;
      if (params.amount && params.sourceWalletId) {
        const bal = await this.repository.getWalletBalance(params.sourceWalletId);
        if (bal && bal.availableBalance < params.amount) {
          throw new Error(
            `INSUFFICIENT_FUNDS: Wallet '${params.sourceWalletId}' has insufficient available balance (${bal.availableBalance}) for amount (${params.amount}).`
          );
        }
      }

      // 5. Stage: LOCK_FUNDS
      currentStage = WALLET_PIPELINE_STAGES.LOCK_FUNDS;

      // 6. Stage: RECORD_LEDGER
      currentStage = WALLET_PIPELINE_STAGES.RECORD_LEDGER;

      // 7. Stage: COMMIT_TRANSFER
      currentStage = WALLET_PIPELINE_STAGES.COMMIT_TRANSFER;
      const resultData = await executionFn();

      // 8. Stage: READY
      currentStage = WALLET_PIPELINE_STAGES.READY;
      const executionTimeMs = Date.now() - startTime;
      const auditLogId = `AUDIT-WALLET-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      logger.info(
        { operationType, executionTimeMs, auditLogId },
        "Wallet Pipeline Completed Successfully"
      );

      return {
        success: true,
        pipelineStage: currentStage,
        executionTimeMs,
        data: resultData,
        auditLogId,
      };
    } catch (error: any) {
      const executionTimeMs = Date.now() - startTime;
      logger.error(
        {
          operationType,
          stage: currentStage,
          executionTimeMs,
          error: error.message,
        },
        "Wallet Pipeline Execution Failed"
      );

      return {
        success: false,
        pipelineStage: currentStage,
        executionTimeMs,
        failureReason: error.message || "Unknown error during wallet pipeline execution",
      };
    }
  }
}
