import { KillSwitchState } from "../types/index.ts";
import { RuntimeGovernanceRepository } from "../repositories/runtime-governance.repository.ts";
import { PermissionMatrix } from "../../constitution/permissions/permission.matrix.ts";
import { GOVERNANCE_ROLES, GOVERNANCE_ACTIONS, GovernanceRole } from "../../constitution/constants/index.ts";
import logger from "../../../lib/logger.ts";

export class KillSwitchService {
  private static instance: KillSwitchService;
  private repository: RuntimeGovernanceRepository;

  private constructor() {
    this.repository = RuntimeGovernanceRepository.getInstance();
  }

  public static getInstance(): KillSwitchService {
    if (!KillSwitchService.instance) {
      KillSwitchService.instance = new KillSwitchService();
    }
    return KillSwitchService.instance;
  }

  private normalizeRole(roleStr?: string): GovernanceRole {
    if (!roleStr) return GOVERNANCE_ROLES.SUPER_ADMIN;
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

  public async isKillSwitchActive(scope: string = "GLOBAL"): Promise<{
    isActive: boolean;
    state?: KillSwitchState;
  }> {
    // Check global kill switch first
    const globalState = await this.repository.getKillSwitch("GLOBAL");
    if (globalState && globalState.isActive) {
      return { isActive: true, state: globalState };
    }

    if (scope !== "GLOBAL") {
      const scopedState = await this.repository.getKillSwitch(scope);
      if (scopedState && scopedState.isActive) {
        return { isActive: true, state: scopedState };
      }
    }

    return { isActive: false };
  }

  public async activateKillSwitch(
    scope: "GLOBAL" | "SYMBOL" | "STRATEGY" | "USER" = "GLOBAL",
    activatedBy: string = "SYSTEM",
    reason: string = "Emergency trading halt requested",
    role?: string
  ): Promise<KillSwitchState> {
    const callerRole = this.normalizeRole(role);
    const isAuthorized = PermissionMatrix.hasPermission(callerRole, GOVERNANCE_ACTIONS.LOCK);

    if (!isAuthorized) {
      logger.warn(
        { callerRole, scope },
        "Unauthorized attempt to activate Kill Switch blocked"
      );
      throw new Error(`Role '${role || callerRole}' is not authorized to activate Kill Switch.`);
    }

    const state: KillSwitchState = {
      scope,
      isActive: true,
      activatedBy,
      activatedAt: new Date(),
      reason,
    };

    await this.repository.saveKillSwitch(state);

    logger.error(
      {
        scope,
        activatedBy,
        reason,
        timestamp: state.activatedAt,
      },
      "KILL SWITCH ACTIVATED - ALL AUTOMATED OPERATIONS HALTED FOR SCOPE"
    );

    return state;
  }

  public async deactivateKillSwitch(
    scope: "GLOBAL" | "SYMBOL" | "STRATEGY" | "USER" = "GLOBAL",
    deactivatedBy: string = "SUPER_ADMIN",
    reason: string = "Emergency halt lifted following safety audit",
    role?: string
  ): Promise<KillSwitchState> {
    const callerRole = this.normalizeRole(role);
    const isAuthorized = PermissionMatrix.hasPermission(callerRole, GOVERNANCE_ACTIONS.LOCK);

    if (!isAuthorized) {
      logger.warn(
        { callerRole, scope },
        "Unauthorized attempt to deactivate Kill Switch blocked"
      );
      throw new Error(`Role '${role || callerRole}' is not authorized to deactivate Kill Switch.`);
    }

    const state: KillSwitchState = {
      scope,
      isActive: false,
      activatedBy: deactivatedBy,
      activatedAt: new Date(),
      reason: `Deactivated: ${reason}`,
    };

    await this.repository.saveKillSwitch(state);

    logger.info(
      {
        scope,
        deactivatedBy,
        reason,
      },
      "KILL SWITCH DEACTIVATED - NORMAL OPERATIONS RESTORED FOR SCOPE"
    );

    return state;
  }

  public async getKillSwitchState(scope: string = "GLOBAL"): Promise<KillSwitchState | null> {
    return this.repository.getKillSwitch(scope);
  }
}
