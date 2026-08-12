import { OrganizationRepository } from "../repositories/OrganizationRepository.ts";
import { Organization, OrgMember, OrgSettings, OrganizationStats } from "../types/index.ts";

export class OrganizationService {
  private orgRepo = new OrganizationRepository();

  async createOrganization(name: string, ownerId: number, details?: Partial<Organization>): Promise<Organization> {
    if (!name || name.trim().length === 0) {
      throw new Error("Organization name is required.");
    }

    const orgId = `org-${Date.now()}`;
    const org = await this.orgRepo.create({
      id: orgId,
      name: name.trim(),
      logo: details?.logo || null,
      timezone: details?.timezone || "UTC",
      locale: details?.locale || "en-US",
      currency: details?.currency || "USD",
      tradingRegion: details?.tradingRegion || "US",
      status: "ACTIVE",
      branding: details?.branding || {},
    });

    // Owner automatically added as a member with OWNER role
    await this.orgRepo.addMember(org.id, ownerId, "OWNER");

    // Log this system event
    await this.orgRepo.logActivity(org.id, null, ownerId, "ORGANIZATION_CREATION", `Organization '${name}' was created successfully.`);

    return org;
  }

  async getOrganization(id: string, userId: number): Promise<Organization> {
    const isMember = await this.orgRepo.checkMembership(id, userId);
    if (!isMember) {
      throw new Error("Access Denied: You are not a member of this organization.");
    }

    const org = await this.orgRepo.findById(id);
    if (!org) {
      throw new Error("Organization not found.");
    }
    return org;
  }

  async listMyOrganizations(userId: number): Promise<Organization[]> {
    // In our system, if user is an admin they can view all organizations, or we can fetch only user's memberships
    // For simplicity and multi-tenant security, let's look up memberships.
    const allOrgs = await this.orgRepo.findAll();
    const myOrgs: Organization[] = [];
    
    for (const org of allOrgs) {
      const membership = await this.orgRepo.checkMembership(org.id, userId);
      if (membership) {
        myOrgs.push(org);
      }
    }
    return myOrgs;
  }

  async updateOrganization(id: string, userId: number, updates: Partial<Organization>): Promise<Organization> {
    const membership = await this.orgRepo.checkMembership(id, userId);
    if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
      throw new Error("Access Denied: Only organization Owners or Admins can update settings.");
    }

    const updated = await this.orgRepo.update(id, updates);
    if (!updated) {
      throw new Error("Failed to update organization.");
    }

    await this.orgRepo.logActivity(id, null, userId, "ORGANIZATION_UPDATE", `Organization details updated.`);
    return updated;
  }

  async archiveOrganization(id: string, userId: number): Promise<Organization> {
    const membership = await this.orgRepo.checkMembership(id, userId);
    if (!membership || membership.role !== "OWNER") {
      throw new Error("Access Denied: Only organization Owners can archive the organization.");
    }

    const updated = await this.orgRepo.update(id, { status: "ARCHIVED" });
    if (!updated) {
      throw new Error("Failed to archive organization.");
    }

    await this.orgRepo.logActivity(id, null, userId, "ORGANIZATION_ARCHIVE", `Organization has been archived.`);
    return updated;
  }

  async restoreOrganization(id: string, userId: number): Promise<Organization> {
    const membership = await this.orgRepo.checkMembership(id, userId);
    if (!membership || membership.role !== "OWNER") {
      throw new Error("Access Denied: Only organization Owners can restore the organization.");
    }

    const updated = await this.orgRepo.update(id, { status: "ACTIVE" });
    if (!updated) {
      throw new Error("Failed to restore organization.");
    }

    await this.orgRepo.logActivity(id, null, userId, "ORGANIZATION_RESTORE", `Organization restored to active status.`);
    return updated;
  }

  async getSettings(orgId: string, userId: number): Promise<OrgSettings> {
    const membership = await this.orgRepo.checkMembership(orgId, userId);
    if (!membership) {
      throw new Error("Access Denied: You are not a member of this organization.");
    }

    const settings = await this.orgRepo.getSettings(orgId);
    if (!settings) {
      throw new Error("Settings not found.");
    }
    return settings;
  }

  async updateSettings(orgId: string, userId: number, settings: Partial<OrgSettings>): Promise<OrgSettings> {
    const membership = await this.orgRepo.checkMembership(orgId, userId);
    if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
      throw new Error("Access Denied: Only organization Owners or Admins can modify settings.");
    }

    const updated = await this.orgRepo.updateSettings(orgId, settings);
    await this.orgRepo.logActivity(orgId, null, userId, "ORGANIZATION_SETTINGS_UPDATE", `Settings updated.`);
    return updated;
  }

  // --- Member Management ---
  async listMembers(orgId: string, userId: number): Promise<OrgMember[]> {
    const membership = await this.orgRepo.checkMembership(orgId, userId);
    if (!membership) {
      throw new Error("Access Denied: You must be a member to view the directory.");
    }
    return await this.orgRepo.getMembers(orgId);
  }

  async inviteMember(orgId: string, requestorId: number, targetUserId: number, role: 'OWNER' | 'ADMIN' | 'MEMBER'): Promise<OrgMember> {
    const membership = await this.orgRepo.checkMembership(orgId, requestorId);
    if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
      throw new Error("Access Denied: Only organization Owners or Admins can invite members.");
    }

    const alreadyMember = await this.orgRepo.checkMembership(orgId, targetUserId);
    if (alreadyMember) {
      throw new Error("This user is already a member of the organization.");
    }

    const member = await this.orgRepo.addMember(orgId, targetUserId, role);
    await this.orgRepo.logActivity(orgId, null, requestorId, "MEMBER_INVITE", `User ${targetUserId} was invited as ${role}.`);
    return member;
  }

  async removeMember(orgId: string, requestorId: number, targetUserId: number): Promise<boolean> {
    const membership = await this.orgRepo.checkMembership(orgId, requestorId);
    if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
      throw new Error("Access Denied: Only organization Owners or Admins can remove members.");
    }

    if (requestorId === targetUserId) {
      throw new Error("You cannot remove yourself. Transfer ownership or leave instead.");
    }

    const targetMember = await this.orgRepo.checkMembership(orgId, targetUserId);
    if (targetMember && targetMember.role === "OWNER" && membership.role !== "OWNER") {
      throw new Error("Access Denied: Admin cannot remove the organization Owner.");
    }

    const success = await this.orgRepo.removeMember(orgId, targetUserId);
    if (success) {
      await this.orgRepo.logActivity(orgId, null, requestorId, "MEMBER_REMOVE", `User ${targetUserId} was removed from the organization.`);
    }
    return success;
  }

  async suspendMember(orgId: string, requestorId: number, targetUserId: number): Promise<OrgMember> {
    const membership = await this.orgRepo.checkMembership(orgId, requestorId);
    if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
      throw new Error("Access Denied: Only organization Owners or Admins can suspend members.");
    }

    const targetMember = await this.orgRepo.checkMembership(orgId, targetUserId);
    if (targetMember && targetMember.role === "OWNER") {
      throw new Error("Access Denied: You cannot suspend the organization Owner.");
    }

    const updated = await this.orgRepo.updateMemberRoleAndStatus(orgId, targetUserId, undefined, "SUSPENDED");
    if (!updated) {
      throw new Error("Member not found.");
    }

    await this.orgRepo.logActivity(orgId, null, requestorId, "MEMBER_SUSPEND", `Member ${targetUserId} status changed to SUSPENDED.`);
    return updated;
  }

  async restoreMember(orgId: string, requestorId: number, targetUserId: number): Promise<OrgMember> {
    const membership = await this.orgRepo.checkMembership(orgId, requestorId);
    if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
      throw new Error("Access Denied: Only organization Owners or Admins can restore suspended members.");
    }

    const updated = await this.orgRepo.updateMemberRoleAndStatus(orgId, targetUserId, undefined, "ACTIVE");
    if (!updated) {
      throw new Error("Member not found.");
    }

    await this.orgRepo.logActivity(orgId, null, requestorId, "MEMBER_RESTORE", `Member ${targetUserId} status restored to ACTIVE.`);
    return updated;
  }

  async transferOwnership(orgId: string, currentOwnerId: number, targetUserId: number): Promise<boolean> {
    const membership = await this.orgRepo.checkMembership(orgId, currentOwnerId);
    if (!membership || membership.role !== "OWNER") {
      throw new Error("Access Denied: Only the organization Owner can transfer ownership.");
    }

    const targetMember = await this.orgRepo.checkMembership(orgId, targetUserId);
    if (!targetMember) {
      throw new Error("Target user must be an active member of this organization before transferring ownership.");
    }

    // Update current owner to admin
    await this.orgRepo.updateMemberRoleAndStatus(orgId, currentOwnerId, "ADMIN");
    // Update target user to owner
    await this.orgRepo.updateMemberRoleAndStatus(orgId, targetUserId, "OWNER");

    await this.orgRepo.logActivity(orgId, null, currentOwnerId, "OWNER_TRANSFER", `Ownership transferred to user ${targetUserId}.`);
    return true;
  }

  async getObservabilityStats(userId: number, orgId?: string): Promise<OrganizationStats> {
    if (orgId) {
      const membership = await this.orgRepo.checkMembership(orgId, userId);
      if (!membership) {
        throw new Error("Access Denied: You are not authorized to view stats for this organization.");
      }
    }
    return await this.orgRepo.getStats(orgId);
  }
}
export const organizationService = new OrganizationService();
