import { WorkspaceService } from "./WorkspaceService.ts";
import { OrganizationValidator } from "./OrganizationValidator.ts";
import { Workspace } from "../types/index.ts";

export class WorkspaceEngine {
  private workspaceService = new WorkspaceService();

  async provisionWorkspace(orgId: string, userId: number, name: string, config?: Partial<Workspace>): Promise<Workspace> {
    const visibility = config?.visibility || "PRIVATE";
    OrganizationValidator.validateWorkspaceVisibility(visibility);

    return await this.workspaceService.createWorkspace(orgId, userId, name, config);
  }

  async resolveWorkspaceContext(workspaceId: string, userId: number): Promise<Workspace> {
    return await this.workspaceService.getWorkspace(workspaceId, userId);
  }

  async queryAuthorizedWorkspaces(orgId: string, userId: number): Promise<Workspace[]> {
    return await this.workspaceService.listWorkspaces(orgId, userId);
  }

  async commitWorkspaceUpdates(workspaceId: string, userId: number, updates: Partial<Workspace>): Promise<Workspace> {
    if (updates.visibility) {
      OrganizationValidator.validateWorkspaceVisibility(updates.visibility);
    }
    return await this.workspaceService.updateWorkspace(workspaceId, userId, updates);
  }

  async archiveWorkspaceContext(workspaceId: string, userId: number): Promise<Workspace> {
    return await this.workspaceService.archiveWorkspace(workspaceId, userId);
  }

  async restoreWorkspaceContext(workspaceId: string, userId: number): Promise<Workspace> {
    return await this.workspaceService.restoreWorkspace(workspaceId, userId);
  }

  async reassignWorkspaceOwnership(workspaceId: string, requestorId: number, newOwnerId: number): Promise<Workspace> {
    return await this.workspaceService.transferOwnership(workspaceId, requestorId, newOwnerId);
  }
}
export const workspaceEngine = new WorkspaceEngine();
