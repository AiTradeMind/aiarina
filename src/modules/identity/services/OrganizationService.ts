import { OrganizationRepository } from "../repositories/index.ts";
import { Organization } from "../types/index.ts";

export class OrganizationService {
  private orgRepo = new OrganizationRepository();

  async getOrganizationById(id: string): Promise<Organization> {
    const org = await this.orgRepo.findById(id);
    if (!org) throw new Error("Organization not found");
    return org;
  }

  async getAllOrganizations(): Promise<Organization[]> {
    return await this.orgRepo.findAll();
  }

  async createOrganization(name: string, description: string): Promise<Organization> {
    if (!name?.trim()) throw new Error("Organization name cannot be empty");
    return await this.orgRepo.create(name, description);
  }
}
