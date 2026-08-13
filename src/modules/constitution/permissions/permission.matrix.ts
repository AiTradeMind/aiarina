import { GOVERNANCE_ROLES, GOVERNANCE_ACTIONS, GovernanceRole, GovernanceAction } from "../constants/index.ts";

/**
 * Centralized Enterprise Governance Permission Matrix
 */
export class PermissionMatrix {
  private static readonly MATRIX: Record<GovernanceRole, GovernanceAction[]> = {
    [GOVERNANCE_ROLES.OWNER]: [
      GOVERNANCE_ACTIONS.READ,
      GOVERNANCE_ACTIONS.WRITE,
      GOVERNANCE_ACTIONS.REGISTER,
      GOVERNANCE_ACTIONS.LOCK,
      GOVERNANCE_ACTIONS.ACTIVATE,
      GOVERNANCE_ACTIONS.ARCHIVE,
      GOVERNANCE_ACTIONS.EXECUTE,
      GOVERNANCE_ACTIONS.APPROVE,
      GOVERNANCE_ACTIONS.REJECT,
    ],
    [GOVERNANCE_ROLES.SUPER_ADMIN]: [
      GOVERNANCE_ACTIONS.READ,
      GOVERNANCE_ACTIONS.WRITE,
      GOVERNANCE_ACTIONS.REGISTER,
      GOVERNANCE_ACTIONS.LOCK,
      GOVERNANCE_ACTIONS.ACTIVATE,
      GOVERNANCE_ACTIONS.ARCHIVE,
      GOVERNANCE_ACTIONS.EXECUTE,
      GOVERNANCE_ACTIONS.APPROVE,
      GOVERNANCE_ACTIONS.REJECT,
    ],
    [GOVERNANCE_ROLES.ADMIN]: [
      GOVERNANCE_ACTIONS.READ,
      GOVERNANCE_ACTIONS.WRITE,
      GOVERNANCE_ACTIONS.REGISTER,
      GOVERNANCE_ACTIONS.LOCK,
      GOVERNANCE_ACTIONS.ACTIVATE,
      GOVERNANCE_ACTIONS.ARCHIVE,
      GOVERNANCE_ACTIONS.APPROVE,
      GOVERNANCE_ACTIONS.REJECT,
    ],
    [GOVERNANCE_ROLES.MANAGER]: [
      GOVERNANCE_ACTIONS.READ,
      GOVERNANCE_ACTIONS.REGISTER,
      GOVERNANCE_ACTIONS.APPROVE,
      GOVERNANCE_ACTIONS.REJECT,
    ],
    [GOVERNANCE_ROLES.OPERATOR]: [
      GOVERNANCE_ACTIONS.READ,
      GOVERNANCE_ACTIONS.REGISTER,
      GOVERNANCE_ACTIONS.EXECUTE,
    ],
    [GOVERNANCE_ROLES.AUDITOR]: [
      GOVERNANCE_ACTIONS.READ,
    ],
    [GOVERNANCE_ROLES.VIEWER]: [
      GOVERNANCE_ACTIONS.READ,
    ],
    [GOVERNANCE_ROLES.SYSTEM]: [
      GOVERNANCE_ACTIONS.READ,
      GOVERNANCE_ACTIONS.WRITE,
      GOVERNANCE_ACTIONS.REGISTER,
      GOVERNANCE_ACTIONS.ACTIVATE,
      GOVERNANCE_ACTIONS.EXECUTE,
    ],
    [GOVERNANCE_ROLES.AI]: [
      GOVERNANCE_ACTIONS.READ,
      GOVERNANCE_ACTIONS.REGISTER,
    ],
  };

  /**
   * Check if a given role has permission to execute an action
   */
  public static hasPermission(role: GovernanceRole | string, action: GovernanceAction | string): boolean {
    const allowedActions = this.MATRIX[role as GovernanceRole];
    if (!allowedActions) {
      return false;
    }
    return allowedActions.includes(action as GovernanceAction);
  }

  /**
   * Get all allowed actions for a given role
   */
  public static getRolePermissions(role: GovernanceRole | string): GovernanceAction[] {
    return this.MATRIX[role as GovernanceRole] || [];
  }

  /**
   * Get entire permission matrix
   */
  public static getFullMatrix(): Record<GovernanceRole, GovernanceAction[]> {
    return { ...this.MATRIX };
  }
}
