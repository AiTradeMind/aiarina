import { PermissionRepository } from "../repositories/PermissionRepository.ts";
import { RBACRole, RBACPermission, RBACUserRole, RBACPolicy, RBACPermissionLog } from "../types/index.ts";
import { auditEngine } from "../../audit/services/AuditEngine.ts";

export class PermissionService {
  private permissionRepo = new PermissionRepository();

  async createCustomRole(id: string, name: string, description?: string, parentRoleId?: string, actorId?: number, orgId?: string): Promise<RBACRole> {
    const role = await this.permissionRepo.createRole({
      id,
      name,
      description,
      isCustom: true,
      parentRoleId
    });
    
    if (orgId && actorId) {
      await auditEngine.logEvent({
        organizationId: orgId,
        actorId: actorId,
        action: "CREATE_CUSTOM_ROLE",
        sourceModule: "RBAC",
        resourceType: "ROLE",
        resourceId: id,
        severity: "INFO",
        details: { name, description, parentRoleId }
      });
    }
    return role;
  }

  async getRole(id: string): Promise<RBACRole | null> {
    return await this.permissionRepo.getRole(id);
  }

  async listRoles(): Promise<RBACRole[]> {
    return await this.permissionRepo.listRoles();
  }

  async updateRole(id: string, updates: Partial<RBACRole>, actorId?: number, orgId?: string): Promise<RBACRole | null> {
    const role = await this.permissionRepo.updateRole(id, updates);
    if (role && orgId && actorId) {
      await auditEngine.logEvent({
        organizationId: orgId,
        actorId: actorId,
        action: "UPDATE_ROLE",
        sourceModule: "RBAC",
        resourceType: "ROLE",
        resourceId: id,
        severity: "WARNING",
        details: { updates }
      });
    }
    return role;
  }

  async deleteRole(id: string, actorId?: number, orgId?: string): Promise<boolean> {
    const result = await this.permissionRepo.deleteRole(id);
    if (result && orgId && actorId) {
      await auditEngine.logEvent({
        organizationId: orgId,
        actorId: actorId,
        action: "DELETE_ROLE",
        sourceModule: "RBAC",
        resourceType: "ROLE",
        resourceId: id,
        severity: "WARNING"
      });
    }
    return result;
  }

  async createPermission(id: string, name: string, description?: string): Promise<RBACPermission> {
    return await this.permissionRepo.createPermission({ id, name, description });
  }

  async listPermissions(): Promise<RBACPermission[]> {
    return await this.permissionRepo.listPermissions();
  }

  async assignPermissionToRole(roleId: string, permissionId: string, actorId?: number, orgId?: string): Promise<void> {
    await this.permissionRepo.assignPermissionToRole(roleId, permissionId);
    if (orgId && actorId) {
      await auditEngine.logEvent({
        organizationId: orgId,
        actorId: actorId,
        action: "ASSIGN_PERMISSION",
        sourceModule: "RBAC",
        resourceType: "ROLE",
        resourceId: roleId,
        severity: "WARNING",
        details: { permissionId }
      });
    }
  }

  async revokePermissionFromRole(roleId: string, permissionId: string, actorId?: number, orgId?: string): Promise<boolean> {
    const result = await this.permissionRepo.revokePermissionFromRole(roleId, permissionId);
    if (result && orgId && actorId) {
      await auditEngine.logEvent({
        organizationId: orgId,
        actorId: actorId,
        action: "REVOKE_PERMISSION",
        sourceModule: "RBAC",
        resourceType: "ROLE",
        resourceId: roleId,
        severity: "WARNING",
        details: { permissionId }
      });
    }
    return result;
  }

  async assignRoleToUser(
    userId: number,
    roleId: string,
    organizationId: string | null = null,
    workspaceId: string | null = null,
    actorId?: number
  ): Promise<RBACUserRole> {
    // Invalidate permission cache on role change
    await this.permissionRepo.invalidateCache(userId);
    const result = await this.permissionRepo.assignRoleToUser(userId, roleId, organizationId, workspaceId);
    
    if (organizationId) {
      await auditEngine.logEvent({
        organizationId,
        workspaceId: workspaceId || undefined,
        actorId: actorId || userId, // Fallback if actorId isn't provided
        action: "ASSIGN_USER_ROLE",
        sourceModule: "RBAC",
        resourceType: "USER",
        resourceId: userId.toString(),
        severity: "WARNING",
        details: { roleId, organizationId, workspaceId }
      });
    }
    
    return result;
  }

  async removeRoleFromUser(
    userId: number,
    roleId: string,
    organizationId: string | null = null,
    workspaceId: string | null = null,
    actorId?: number
  ): Promise<boolean> {
    // Invalidate permission cache on role change
    await this.permissionRepo.invalidateCache(userId);
    const result = await this.permissionRepo.removeRoleFromUser(userId, roleId, organizationId, workspaceId);
    
    if (result && organizationId) {
      await auditEngine.logEvent({
        organizationId,
        workspaceId: workspaceId || undefined,
        actorId: actorId || userId,
        action: "REMOVE_USER_ROLE",
        sourceModule: "RBAC",
        resourceType: "USER",
        resourceId: userId.toString(),
        severity: "WARNING",
        details: { roleId, organizationId, workspaceId }
      });
    }
    
    return result;
  }

  async getUserRoles(userId: number): Promise<RBACUserRole[]> {
    return await this.permissionRepo.getUserRoles(userId);
  }

  async createPolicy(policy: Partial<RBACPolicy>, actorId?: number, orgId?: string): Promise<RBACPolicy> {
    const result = await this.permissionRepo.createPolicy(policy);
    
    if (orgId && actorId) {
      await auditEngine.logEvent({
        organizationId: orgId,
        actorId: actorId,
        action: "CREATE_POLICY",
        sourceModule: "RBAC",
        resourceType: "POLICY",
        resourceId: result.id.toString(),
        severity: "WARNING",
        details: { name: policy.name, effect: policy.effect }
      });
    }
    return result;
  }

  async listPolicies(): Promise<RBACPolicy[]> {
    return await this.permissionRepo.listPolicies();
  }

  async deletePolicy(id: string, actorId?: number, orgId?: string): Promise<boolean> {
    const result = await this.permissionRepo.deletePolicy(id);
    
    if (result && orgId && actorId) {
      await auditEngine.logEvent({
        organizationId: orgId,
        actorId: actorId,
        action: "DELETE_POLICY",
        sourceModule: "RBAC",
        resourceType: "POLICY",
        resourceId: id,
        severity: "WARNING"
      });
    }
    return result;
  }

  async getLogs(limit = 100): Promise<RBACPermissionLog[]> {
    return await this.permissionRepo.getLogs(limit);
  }

  async getObservabilityStats(): Promise<any> {
    const logs = await this.getLogs(1000);
    const deniedCount = logs.filter(l => l.decision === "DENIED").length;
    const grantedCount = logs.filter(l => l.decision === "GRANTED").length;
    const totalCount = logs.length;
    
    let totalLatency = 0;
    for (const log of logs) {
      totalLatency += log.latencyMs;
    }
    const avgLatencyMs = totalCount > 0 ? Number((totalLatency / totalCount).toFixed(2)) : 0;

    return {
      totalChecks: totalCount,
      grantedCount,
      deniedCount,
      avgLatencyMs,
      recentLogs: logs.slice(0, 10)
    };
  }
}
export const permissionService = new PermissionService();
