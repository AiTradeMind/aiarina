import { PermissionRepository } from "../repositories/PermissionRepository.ts";
import { RoleResolver } from "./RoleResolver.ts";

export class PermissionResolver {
  private permissionRepo = new PermissionRepository();
  private roleResolver = new RoleResolver();

  /**
   * Flat list of all resolved permissions for a user, taking role inheritance into account.
   */
  async resolvePermissionsForUser(userId: number, organizationId?: string | null, workspaceId?: string | null): Promise<string[]> {
    // Check cache first
    const cached = await this.permissionRepo.getCachedPermissions(userId);
    if (cached) {
      return cached;
    }

    // Get user roles from database
    const userRoles = await this.permissionRepo.getUserRoles(userId);
    if (userRoles.length === 0) {
      // Default to read-only/member if no explicit roles are found
      return [];
    }

    // Filter user roles matching the scope (or global / unscoped)
    const activeRoleIds = userRoles
      .filter(ur => {
        // Unscoped roles apply globally
        if (!ur.organizationId && !ur.workspaceId) return true;
        // Scoped to organization
        if (organizationId && ur.organizationId === organizationId) return true;
        // Scoped to workspace
        if (workspaceId && ur.workspaceId === workspaceId) return true;
        return false;
      })
      .map(ur => ur.roleId);

    // Resolve full role chain using inheritance
    const fullyResolvedRoleIds = await this.roleResolver.resolveActiveRoles(activeRoleIds);

    // Fetch permissions associated with all resolved roles
    const permissionSets = await Promise.all(
      fullyResolvedRoleIds.map(roleId => this.permissionRepo.getRolePermissions(roleId))
    );

    // Flatten and unique
    const uniquePermissions = Array.from(new Set(permissionSets.flat()));

    // Cache the resolved permissions (valid for 60 seconds)
    await this.permissionRepo.setCachedPermissions(userId, uniquePermissions, 60);

    return uniquePermissions;
  }

  /**
   * Helper to check if a permission list has matching action (supports wildcards like workspace.*, or *)
   */
  public matchPermission(assignedPermissions: string[], requiredAction: string): boolean {
    if (assignedPermissions.includes("*") || assignedPermissions.includes("admin")) {
      return true;
    }

    if (assignedPermissions.includes(requiredAction)) {
      return true;
    }

    // Support wildcard matching e.g. "workspace.*" matches "workspace.read"
    const requiredParts = requiredAction.split(".");
    if (requiredParts.length === 2) {
      const namespace = requiredParts[0];
      if (assignedPermissions.includes(`${namespace}.*`)) {
        return true;
      }
    }

    return false;
  }
}
export const permissionResolver = new PermissionResolver();
