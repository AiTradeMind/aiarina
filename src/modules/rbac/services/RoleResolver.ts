import { PermissionRepository } from "../repositories/PermissionRepository.ts";
import { RBACRole } from "../types/index.ts";

export class RoleResolver {
  private permissionRepo = new PermissionRepository();

  /**
   * Resolves the entire active role hierarchy chain for a list of starting role IDs.
   * If roles inherit from parent roles (or parentRoleId links), we traverse the chain to collect all related roles.
   */
  async resolveActiveRoles(roleIds: string[]): Promise<string[]> {
    const roles = await this.permissionRepo.listRoles();
    const roleMap = new Map<string, RBACRole>();
    for (const r of roles) {
      roleMap.set(r.id, r);
    }

    const resolved = new Set<string>();
    const queue = [...roleIds];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (!resolved.has(currentId)) {
        resolved.add(currentId);
        const currentRole = roleMap.get(currentId);
        if (currentRole && currentRole.parentRoleId) {
          // Add parent role in the hierarchy to allow inheritance of parent permissions
          queue.push(currentRole.parentRoleId);
        }
      }
    }

    return Array.from(resolved);
  }

  /**
   * Returns child roles or parent roles.
   */
  async getAncestry(roleId: string): Promise<string[]> {
    const roles = await this.permissionRepo.listRoles();
    const roleMap = new Map<string, RBACRole>();
    for (const r of roles) {
      roleMap.set(r.id, r);
    }

    const path: string[] = [];
    let currentId: string | null = roleId;

    while (currentId) {
      path.push(currentId);
      const role = roleMap.get(currentId);
      currentId = role ? role.parentRoleId : null;
    }

    return path;
  }
}
export const roleResolver = new RoleResolver();
