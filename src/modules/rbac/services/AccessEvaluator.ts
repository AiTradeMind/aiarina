import { RBACPolicy, AuthorizationContext } from "../types/index.ts";

export class AccessEvaluator {
  /**
   * Evaluates if policies allow or deny the given context action & resource.
   * Returns true if allowed, false if denied.
   */
  public evaluatePolicies(
    policies: RBACPolicy[],
    context: AuthorizationContext,
    action: string,
    resource: string
  ): { allowed: boolean; reason: string } {
    let hasAllow = false;
    let allowReason = "No matching allow policy found";

    // 1. Check for Explicit Deny first (Deny overrides any Allow)
    for (const policy of policies) {
      if (policy.effect === "DENY") {
        if (this.matchesPolicyTarget(policy, action, resource)) {
          if (this.evaluateConditions(policy.conditions, context)) {
            return {
              allowed: false,
              reason: `Explicit Deny policy matched: ${policy.name}`,
            };
          }
        }
      }
    }

    // 2. Check for Allow
    for (const policy of policies) {
      if (policy.effect === "ALLOW") {
        if (this.matchesPolicyTarget(policy, action, resource)) {
          if (this.evaluateConditions(policy.conditions, context)) {
            hasAllow = true;
            allowReason = `Allowed by policy: ${policy.name}`;
          }
        }
      }
    }

    return {
      allowed: hasAllow,
      reason: allowReason,
    };
  }

  /**
   * Check if policy target matches the action and resource.
   */
  private matchesPolicyTarget(policy: RBACPolicy, action: string, resource: string): boolean {
    const actionMatch = policy.actions.includes("*") || policy.actions.includes(action);
    const resourceMatch = policy.resources.includes("*") || policy.resources.includes(resource);
    return actionMatch && resourceMatch;
  }

  /**
   * Evaluate conditions on the policy.
   * E.g. time-based rules, workspace/org restrictions, ownership rules, IP-based.
   */
  private evaluateConditions(conditions: Record<string, any>, context: AuthorizationContext): boolean {
    if (!conditions || Object.keys(conditions).length === 0) {
      return true;
    }

    // A. Time-based Rules
    if (conditions.timeRestriction) {
      const { startHour, endHour, allowedDays } = conditions.timeRestriction;
      const now = context.currentTime || new Date();
      const currentHour = now.getHours();
      const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday

      if (startHour !== undefined && currentHour < startHour) return false;
      if (endHour !== undefined && currentHour > endHour) return false;
      if (allowedDays && !allowedDays.includes(currentDay)) return false;
    }

    // B. IP Restriction
    if (conditions.allowedIps && context.clientIp) {
      if (!conditions.allowedIps.includes(context.clientIp)) {
        return false;
      }
    }

    // C. Workspace Restrictions
    if (conditions.allowedWorkspaces && context.workspaceId) {
      if (!conditions.allowedWorkspaces.includes(context.workspaceId)) {
        return false;
      }
    }

    // D. Organization Restrictions
    if (conditions.allowedOrganizations && context.organizationId) {
      if (!conditions.allowedOrganizations.includes(context.organizationId)) {
        return false;
      }
    }

    // E. Ownership Rules (e.g. user must be the resource owner)
    if (conditions.mustBeOwner) {
      if (!context.resourceOwnerId || context.userId !== context.resourceOwnerId) {
        return false;
      }
    }

    return true;
  }
}
export const accessEvaluator = new AccessEvaluator();
