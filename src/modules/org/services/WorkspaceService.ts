import { WorkspaceRepository } from "../repositories/WorkspaceRepository.ts";
import { OrganizationRepository } from "../repositories/OrganizationRepository.ts";
import { Workspace } from "../types/index.ts";

export class WorkspaceService {
  private workspaceRepo = new WorkspaceRepository();
  private orgRepo = new OrganizationRepository();

  async createWorkspace(orgId: string, userId: number, name: string, details?: Partial<Workspace>): Promise<Workspace> {
    const membership = await this.orgRepo.checkMembership(orgId, userId);
    if (!membership) {
      throw new Error("Access Denied: You are not a member of this organization.");
    }

    if (!name || name.trim().length === 0) {
      throw new Error("Workspace name is required.");
    }

    const wksId = `wks-${Date.now()}`;
    const workspace = await this.workspaceRepo.create({
      id: wksId,
      organizationId: orgId,
      name: name.trim(),
      ownerId: userId,
      visibility: details?.visibility || "PRIVATE",
      status: "ACTIVE",
      preferences: details?.preferences || {},
      metadata: details?.metadata || {},
    });

    await this.orgRepo.logActivity(orgId, wksId, userId, "WORKSPACE_CREATION", `Workspace '${name}' was created successfully.`);
    return workspace;
  }

  async getWorkspace(id: string, userId: number): Promise<Workspace> {
    const workspace = await this.workspaceRepo.findById(id);
    if (!workspace) {
      throw new Error("Workspace not found.");
    }

    // Secure workspace isolation: Check if requester is in the same organization
    const membership = await this.orgRepo.checkMembership(workspace.organizationId, userId);
    if (!membership) {
      throw new Error("Access Denied: You are not authorized to view this workspace.");
    }

    // If private, only owner or organization admin/owner can view
    if (workspace.visibility === "PRIVATE" && workspace.ownerId !== userId && membership.role !== "OWNER" && membership.role !== "ADMIN") {
      throw new Error("Access Denied: This workspace is private and you are not the owner.");
    }

    return workspace;
  }

  async listWorkspaces(orgId: string, userId: number): Promise<Workspace[]> {
    const membership = await this.orgRepo.checkMembership(orgId, userId);
    if (!membership) {
      throw new Error("Access Denied: You are not a member of this organization.");
    }

    const allWorkspaces = await this.workspaceRepo.findByOrg(orgId);
    
    // Filter by visibility/ownership: public, internal, or private owned by the user
    return allWorkspaces.filter(wks => {
      if (wks.status === "DELETED") return false;
      if (wks.visibility === "PUBLIC" || wks.visibility === "INTERNAL") return true;
      if (wks.ownerId === userId) return true;
      // Org Owner and Admin see private workspaces too
      if (membership.role === "OWNER" || membership.role === "ADMIN") return true;
      return false;
    });
  }

  async updateWorkspace(id: string, userId: number, updates: Partial<Workspace>): Promise<Workspace> {
    const wks = await this.workspaceRepo.findById(id);
    if (!wks) {
      throw new Error("Workspace not found.");
    }

    const membership = await this.orgRepo.checkMembership(wks.organizationId, userId);
    if (!membership) {
      throw new Error("Access Denied.");
    }

    // Only owner, admin, or org owner can update
    const isOwner = wks.ownerId === userId;
    const isOrgPrivileged = membership.role === "OWNER" || membership.role === "ADMIN";
    
    if (!isOwner && !isOrgPrivileged) {
      throw new Error("Access Denied: Only the workspace owner or organization administrators can modify workspace configurations.");
    }

    const updated = await this.workspaceRepo.update(id, updates);
    if (!updated) {
      throw new Error("Failed to update workspace.");
    }

    await this.orgRepo.logActivity(wks.organizationId, id, userId, "WORKSPACE_UPDATE", `Workspace details updated.`);
    return updated;
  }

  async archiveWorkspace(id: string, userId: number): Promise<Workspace> {
    const wks = await this.workspaceRepo.findById(id);
    if (!wks) {
      throw new Error("Workspace not found.");
    }

    const membership = await this.orgRepo.checkMembership(wks.organizationId, userId);
    if (!membership) {
      throw new Error("Access Denied.");
    }

    const isOwner = wks.ownerId === userId;
    const isOrgOwner = membership.role === "OWNER";

    if (!isOwner && !isOrgOwner) {
      throw new Error("Access Denied: Only the workspace owner or organization owner can archive a workspace.");
    }

    const updated = await this.workspaceRepo.update(id, { status: "ARCHIVED" });
    if (!updated) {
      throw new Error("Failed to archive workspace.");
    }

    await this.orgRepo.logActivity(wks.organizationId, id, userId, "WORKSPACE_ARCHIVE", `Workspace archived.`);
    return updated;
  }

  async restoreWorkspace(id: string, userId: number): Promise<Workspace> {
    const wks = await this.workspaceRepo.findById(id);
    if (!wks) {
      throw new Error("Workspace not found.");
    }

    const membership = await this.orgRepo.checkMembership(wks.organizationId, userId);
    if (!membership) {
      throw new Error("Access Denied.");
    }

    const isOwner = wks.ownerId === userId;
    const isOrgOwner = membership.role === "OWNER";

    if (!isOwner && !isOrgOwner) {
      throw new Error("Access Denied: Only the workspace owner or organization owner can restore a workspace.");
    }

    const updated = await this.workspaceRepo.update(id, { status: "ACTIVE" });
    if (!updated) {
      throw new Error("Failed to restore workspace.");
    }

    await this.orgRepo.logActivity(wks.organizationId, id, userId, "WORKSPACE_RESTORE", `Workspace restored to active.`);
    return updated;
  }

  async transferOwnership(id: string, requestorId: number, newOwnerId: number): Promise<Workspace> {
    const wks = await this.workspaceRepo.findById(id);
    if (!wks) {
      throw new Error("Workspace not found.");
    }

    const membership = await this.orgRepo.checkMembership(wks.organizationId, requestorId);
    if (!membership) {
      throw new Error("Access Denied.");
    }

    const isOwner = wks.ownerId === requestorId;
    const isOrgOwner = membership.role === "OWNER";

    if (!isOwner && !isOrgOwner) {
      throw new Error("Access Denied: Only the workspace owner or organization owner can transfer ownership.");
    }

    // Verify new owner is part of organization
    const targetMembership = await this.orgRepo.checkMembership(wks.organizationId, newOwnerId);
    if (!targetMembership) {
      throw new Error("The target user is not a member of this organization.");
    }

    const updated = await this.workspaceRepo.transferOwnership(id, newOwnerId);
    if (!updated) {
      throw new Error("Failed to transfer ownership.");
    }

    await this.orgRepo.logActivity(wks.organizationId, id, requestorId, "WORKSPACE_OWNERSHIP_TRANSFER", `Ownership transferred to user ${newOwnerId}.`);
    return updated;
  }
}
export const workspaceService = new WorkspaceService();
