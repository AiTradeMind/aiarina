import { PermissionRepository } from "../repositories/PermissionRepository.ts";
import { PermissionResolver } from "./PermissionResolver.ts";
import { AccessEvaluator } from "./AccessEvaluator.ts";
import { AuthorizationContext, AccessDecision } from "../types/index.ts";

export class AuthorizationEngine {
  private permissionRepo = new PermissionRepository();
  private permissionResolver = new PermissionResolver();
  private accessEvaluator = new AccessEvaluator();

  /**
   * Main entrypoint to determine access rights for a user action on a resource.
   */
  async checkPermission(
    userId: number,
    action: string,
    resource: string,
    context: AuthorizationContext = { userId }
  ): Promise<AccessDecision> {
    const startTime = Date.now();
    await this.permissionRepo.ensureRbacTables();

    // Default decision is Deny (Least Privilege)
    let granted = false;
    let reason = "Denied by default: Least Privilege strategy active";

    try {
      // 1. Resolve Flattened Permissions (Role & Inherited)
      const userPermissions = await this.permissionResolver.resolvePermissionsForUser(
        userId,
        context.organizationId,
        context.workspaceId
      );

      const hasRBACPermission = this.permissionResolver.matchPermission(userPermissions, action);

      if (hasRBACPermission) {
        granted = true;
        reason = `Access granted via assigned role permissions matching: ${action}`;
      } else {
        reason = `Denied: Missing required role permission [${action}]`;
      }

      // 2. Load and Evaluate Policies (Allow/Deny policy overrides)
      const policies = await this.permissionRepo.getPoliciesForScope(
        context.organizationId,
        context.workspaceId
      );

      if (policies.length > 0) {
        const policyResult = this.accessEvaluator.evaluatePolicies(
          policies,
          context,
          action,
          resource
        );

        // If policy specifies an allowance or denial, we override standard RBAC mapping.
        // Explicit policy effects are superior.
        if (policyResult.allowed) {
          granted = true;
          reason = policyResult.reason;
        } else if (!policyResult.allowed && policyResult.reason.includes("Explicit Deny")) {
          granted = false;
          reason = policyResult.reason;
        }
      }

      // 3. Cross-Tenant isolation enforcement
      if (context.organizationId && context.organizationId !== "system") {
        // Enforce that user has a role mapped specifically to this organization
        const userRoles = await this.permissionRepo.getUserRoles(userId);
        const hasOrgAssociation = userRoles.some(ur => 
          ur.organizationId === context.organizationId || ur.roleId === "SYSTEM_OWNER" || ur.roleId === "PLATFORM_ADMIN"
        );
        if (!hasOrgAssociation) {
          granted = false;
          reason = "Access denied: Tenant isolation policy violation";
        }
      }

    } catch (err: any) {
      granted = false;
      reason = `Authorization Exception: ${err.message}`;
    }

    const latencyMs = Date.now() - startTime;

    // 4. Log security observability events
    await this.permissionRepo.logPermissionCheck({
      userId,
      action,
      resource,
      organizationId: context.organizationId,
      workspaceId: context.workspaceId,
      decision: granted ? "GRANTED" : "DENIED",
      reason,
      latencyMs
    });

    return {
      granted,
      reason,
      latencyMs
    };
  }
}
export const authorizationEngine = new AuthorizationEngine();
