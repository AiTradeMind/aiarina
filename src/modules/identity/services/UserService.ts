import bcryptjs from "bcryptjs";
import { UserRepository, MembershipRepository } from "../repositories/index.ts";
import { RoleType } from "../types/index.ts";

export class UserService {
  private userRepo = new UserRepository();

  async getUserById(id: number) {
    return await this.userRepo.findById(id);
  }

  async getUserByEmail(email: string) {
    return await this.userRepo.findByEmail(email);
  }

  async getAllUsers() {
    return await this.userRepo.findAll();
  }

  async createUser(email: string, role: RoleType, organizationId?: string, settings: Record<string, any> = {}, password?: string) {
    if (!email || !email.includes("@")) {
      throw new Error("Invalid email format");
    }
    const existing = await this.userRepo.findByEmail(email);
    if (existing) {
      throw new Error("User with this email already exists");
    }

    if (!password || password.trim().length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    const orgId = organizationId || "org-1";
    
    const passwordHash = bcryptjs.hashSync(password, 10);
    const finalSettings = {
      ...settings,
      passwordHash,
    };

    const newUser = await this.userRepo.create(email, role, finalSettings);
    
    if (orgId) {
      const membershipRepo = new MembershipRepository();
      await membershipRepo.addMembership(newUser.id, orgId, role);
    }

    return newUser;
  }

  async updateUser(id: number, email?: string, role?: RoleType, settings?: Record<string, any>, password?: string) {
    const existing = await this.userRepo.findById(id);
    if (!existing) {
      throw new Error("User not found");
    }

    const finalSettings = { ...((existing.settings || {}) as Record<string, any>) };
    
    if (settings) {
      Object.assign(finalSettings, settings);
    }

    if (password) {
      if (password.trim().length < 8) {
        throw new Error("Password must be at least 8 characters long");
      }
      finalSettings.passwordHash = bcryptjs.hashSync(password, 10);
    }

    return await this.userRepo.update(id, email, role, finalSettings);
  }

  async deleteUser(id: number) {
    const existing = await this.userRepo.findById(id);
    if (!existing) {
      throw new Error("User not found");
    }
    return await this.userRepo.delete(id);
  }
}
