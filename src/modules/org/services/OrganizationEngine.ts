import { OrganizationService } from "./OrganizationService.ts";
import { OrganizationValidator } from "./OrganizationValidator.ts";
import { Organization, OrgMember, OrgSettings, OrganizationStats } from "../types/index.ts";

export class OrganizationEngine {
  private orgService = new OrganizationService();

  async provisionNewOrganization(name: string, ownerId: number, config?: Partial<Organization>): Promise<Organization> {
    const tz = config?.timezone || "UTC";
    const loc = config?.locale || "en-US";
    const curr = config?.currency || "USD";

    // Validate using OrganizationValidator
    OrganizationValidator.validateOrganization(name, tz, loc, curr);

    return await this.orgService.createOrganization(name, ownerId, config);
  }

  async fetchOrganizationDetails(orgId: string, userId: number): Promise<Organization> {
    return await this.orgService.getOrganization(orgId, userId);
  }

  async getMyAuthorizedOrganizations(userId: number): Promise<Organization[]> {
    return await this.orgService.listMyOrganizations(userId);
  }

  async updateOrganizationMetadata(orgId: string, userId: number, updates: Partial<Organization>): Promise<Organization> {
    if (updates.name !== undefined) {
      OrganizationValidator.validateOrganization(
        updates.name,
        updates.timezone || "UTC",
        updates.locale || "en-US",
        updates.currency || "USD"
      );
    }
    return await this.orgService.updateOrganization(orgId, userId, updates);
  }

  async suspendAndLockOrganization(orgId: string, userId: number): Promise<Organization> {
    return await this.orgService.archiveOrganization(orgId, userId);
  }

  async retrieveOrganizationSettings(orgId: string, userId: number): Promise<OrgSettings> {
    return await this.orgService.getSettings(orgId, userId);
  }

  async commitOrganizationSettings(orgId: string, userId: number, settings: Partial<OrgSettings>): Promise<OrgSettings> {
    return await this.orgService.updateSettings(orgId, userId, settings);
  }

  async inviteNewWorkspaceMember(orgId: string, requesterId: number, targetUserId: number, role: 'OWNER' | 'ADMIN' | 'MEMBER'): Promise<OrgMember> {
    OrganizationValidator.validateMemberRole(role);
    return await this.orgService.inviteMember(orgId, requesterId, targetUserId, role);
  }

  async terminateWorkspaceMembership(orgId: string, requesterId: number, targetUserId: number): Promise<boolean> {
    return await this.orgService.removeMember(orgId, requesterId, targetUserId);
  }

  async freezeWorkspaceMembership(orgId: string, requesterId: number, targetUserId: number): Promise<OrgMember> {
    return await this.orgService.suspendMember(orgId, requesterId, targetUserId);
  }

  async retrieveComplianceActivityMetrics(userId: number, orgId?: string): Promise<OrganizationStats> {
    return await this.orgService.getObservabilityStats(userId, orgId);
  }
}
export const organizationEngine = new OrganizationEngine();
