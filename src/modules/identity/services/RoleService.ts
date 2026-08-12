import { RoleRepository } from "../repositories/index.ts";
import { Role, RoleType } from "../types/index.ts";

export class RoleService {
  private roleRepo = new RoleRepository();

  async getRoleByName(name: RoleType): Promise<Role> {
    const role = await this.roleRepo.findByName(name);
    if (!role) throw new Error("Role not found");
    return role;
  }

  async getAllRoles(): Promise<Role[]> {
    return await this.roleRepo.findAll();
  }
}
