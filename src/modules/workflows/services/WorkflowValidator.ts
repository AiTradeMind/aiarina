import { authorizationEngine } from "../../rbac/services/AuthorizationEngine.ts";
import { permissionService } from "../../rbac/services/PermissionService.ts";
import { roleResolver } from "../../rbac/services/RoleResolver.ts";
import { IWorkflowInstance, IWorkflowStep, CreateTemplatePayload, StartWorkflowPayload } from "../types/index.ts";

export class WorkflowValidator {
  public validateTemplate(payload: CreateTemplatePayload): void {
    if (!payload.name || payload.name.trim() === "") {
      throw new Error("Validation Error: Workflow template name is required");
    }
    if (!payload.type || !["SEQUENTIAL", "PARALLEL"].includes(payload.type)) {
      throw new Error("Validation Error: Workflow template type must be SEQUENTIAL or PARALLEL");
    }
    if (!payload.sourceModule || payload.sourceModule.trim() === "") {
      throw new Error("Validation Error: Workflow template sourceModule is required");
    }
    if (!payload.organizationId || payload.organizationId.trim() === "") {
      throw new Error("Validation Error: Workflow template organizationId is required");
    }
    if (!payload.workspaceId || payload.workspaceId.trim() === "") {
      throw new Error("Validation Error: Workflow template workspaceId is required");
    }
    if (!payload.steps || !Array.isArray(payload.steps) || payload.steps.length === 0) {
      throw new Error("Validation Error: Workflow template must have at least one step definition");
    }

    for (const step of payload.steps) {
      if (!step.name || step.name.trim() === "") {
        throw new Error("Validation Error: Step name is required for all steps");
      }
      if (!step.requiredRole && !step.requiredPermission) {
        throw new Error("Validation Error: Each step must declare a requiredRole or requiredPermission");
      }
    }
  }

  public validateStart(payload: StartWorkflowPayload): void {
    if (!payload.name || payload.name.trim() === "") {
      throw new Error("Validation Error: Workflow instance name is required");
    }
    if (!payload.type || !["SEQUENTIAL", "PARALLEL"].includes(payload.type)) {
      throw new Error("Validation Error: Workflow instance type must be SEQUENTIAL or PARALLEL");
    }
    if (!payload.sourceModule || payload.sourceModule.trim() === "") {
      throw new Error("Validation Error: Workflow instance sourceModule is required");
    }
    if (!payload.organizationId || payload.organizationId.trim() === "") {
      throw new Error("Validation Error: Workflow instance organizationId is required");
    }
    if (!payload.workspaceId || payload.workspaceId.trim() === "") {
      throw new Error("Validation Error: Workflow instance workspaceId is required");
    }
  }

  public async validateApproval(
    userId: number,
    organizationId: string,
    instance: IWorkflowInstance,
    step: IWorkflowStep,
    decision: "APPROVED" | "REJECTED" | "RETURNED"
  ): Promise<boolean> {
    // 1. Tenant boundary validation
    if (instance.organizationId !== organizationId) {
      throw new Error("Security Error: Tenant isolation violation. Cross-tenant approvals are strictly prohibited.");
    }

    // 2. State validation
    if (instance.status !== "PENDING_REVIEW") {
      throw new Error(`Business Rule Error: Workflow instance is in status '${instance.status}'. No review action is permitted.`);
    }
    if (step.status !== "PENDING") {
      throw new Error(`Business Rule Error: Step '${step.name}' is in status '${step.status}'. It cannot be approved.`);
    }

    // 3. User & Role validation (RBAC check)
    const userRoles = await permissionService.getUserRoles(userId);
    const rolesInContext = userRoles
      .filter(
        (ur) =>
          ur.organizationId === instance.organizationId &&
          (ur.workspaceId === null || ur.workspaceId === instance.workspaceId)
      )
      .map((ur) => ur.roleId);

    // SYSTEM_OWNER or PLATFORM_ADMIN can bypass/approve any step in their tenant
    const hasAdminBypass =
      rolesInContext.includes("SYSTEM_OWNER") ||
      rolesInContext.includes("PLATFORM_ADMIN");

    // Check direct assignment
    if (step.assignedUserId) {
      if (step.assignedUserId !== userId && !hasAdminBypass) {
        throw new Error("Security Error: This step has been delegated/assigned to another specific user.");
      }
      return true; // Explicit delegation matches
    }

    // Check required role
    if (step.requiredRole) {
      const activeRoles = await roleResolver.resolveActiveRoles(rolesInContext);
      const matchesRole = activeRoles.includes(step.requiredRole);

      if (!matchesRole && !hasAdminBypass) {
        throw new Error(`Security Error: User lacks required role '${step.requiredRole}' to perform this action.`);
      }
    }

    // Check required permission
    if (step.requiredPermission) {
      const checkRes = await authorizationEngine.checkPermission(
        userId,
        step.requiredPermission,
        `workflow:${instance.id}`,
        {
          userId,
          organizationId: instance.organizationId,
          workspaceId: instance.workspaceId,
        }
      );

      if (!checkRes.granted && !hasAdminBypass) {
        throw new Error(`Security Error: User lacks required permission '${step.requiredPermission}' (Reason: ${checkRes.reason}).`);
      }
    }

    return true;
  }
}

export const workflowValidator = new WorkflowValidator();
