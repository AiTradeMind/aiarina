import { collaborationService } from "./CollaborationService.ts";
import { authorizationEngine } from "../../rbac/services/AuthorizationEngine.ts";
import { 
  CollabComment, 
  CollabTask, 
  CollabShare, 
  CollabPresence, 
  CollabActivity 
} from "../types/index.ts";

export class CollaborationEngine {
  /**
   * Post a threaded comment inside a workspace/resource context.
   * Checks for workspace.read permission.
   */
  async postComment(
    userId: number,
    content: string,
    resourceId: string,
    resourceType: string,
    parentId?: number,
    orgId?: string,
    workspaceId?: string
  ): Promise<CollabComment> {
    // 1. RBAC authorization check
    const auth = await authorizationEngine.checkPermission(userId, "workspace.read", resourceId, {
      userId,
      organizationId: orgId || null,
      workspaceId: workspaceId || null,
    });

    if (!auth.granted) {
      throw new Error(`Unauthorized to add comment: ${auth.reason}`);
    }

    return await collaborationService.addComment(userId, content, resourceId, resourceType, parentId);
  }

  /**
   * Retrieves comments. Requires workspace.read.
   */
  async getComments(
    userId: number,
    resourceId: string,
    orgId?: string,
    workspaceId?: string
  ): Promise<CollabComment[]> {
    const auth = await authorizationEngine.checkPermission(userId, "workspace.read", resourceId, {
      userId,
      organizationId: orgId || null,
      workspaceId: workspaceId || null,
    });

    if (!auth.granted) {
      throw new Error(`Unauthorized to read comments: ${auth.reason}`);
    }

    return await collaborationService.getComments(resourceId);
  }

  /**
   * Resolve comment thread. Requires workspace.update.
   */
  async resolveComment(
    commentId: number,
    userId: number,
    orgId?: string,
    workspaceId?: string
  ): Promise<CollabComment> {
    const auth = await authorizationEngine.checkPermission(userId, "workspace.update", `comment-${commentId}`, {
      userId,
      organizationId: orgId || null,
      workspaceId: workspaceId || null,
    });

    if (!auth.granted) {
      throw new Error(`Unauthorized to resolve comment: ${auth.reason}`);
    }

    return await collaborationService.resolveComment(commentId, userId);
  }

  /**
   * Pin or unpin comments. Requires workspace.update.
   */
  async togglePinComment(
    commentId: number,
    userId: number,
    orgId?: string,
    workspaceId?: string
  ): Promise<CollabComment> {
    const auth = await authorizationEngine.checkPermission(userId, "workspace.update", `comment-${commentId}`, {
      userId,
      organizationId: orgId || null,
      workspaceId: workspaceId || null,
    });

    if (!auth.granted) {
      throw new Error(`Unauthorized to pin/unpin comments: ${auth.reason}`);
    }

    return await collaborationService.togglePinComment(commentId, userId);
  }

  /**
   * Create tasks. Requires workspace.update.
   */
  async createTask(
    creatorId: number,
    title: string,
    description?: string,
    assigneeId?: number,
    dueDate?: Date,
    priority?: string,
    status?: string,
    labels?: string[],
    organizationId?: string,
    workspaceId?: string,
    resourceId?: string
  ): Promise<CollabTask> {
    const auth = await authorizationEngine.checkPermission(creatorId, "workspace.update", workspaceId || "global", {
      userId: creatorId,
      organizationId: organizationId || null,
      workspaceId: workspaceId || null,
    });

    if (!auth.granted) {
      throw new Error(`Unauthorized to create tasks: ${auth.reason}`);
    }

    return await collaborationService.createTask(
      creatorId,
      title,
      description,
      assigneeId,
      dueDate,
      priority,
      status,
      labels,
      organizationId,
      workspaceId,
      resourceId
    );
  }

  /**
   * Update task parameters (status, description, label). Requires workspace.update or assignee ownership.
   */
  async updateTask(
    taskId: number,
    userId: number,
    updates: Partial<CollabTask>,
    orgId?: string,
    workspaceId?: string
  ): Promise<CollabTask> {
    const auth = await authorizationEngine.checkPermission(userId, "workspace.update", `task-${taskId}`, {
      userId,
      organizationId: orgId || null,
      workspaceId: workspaceId || null,
    });

    if (!auth.granted) {
      throw new Error(`Unauthorized to edit tasks: ${auth.reason}`);
    }

    return await collaborationService.updateTask(taskId, userId, updates);
  }

  /**
   * List tasks within organization/workspace scope. Requires workspace.read.
   */
  async listTasks(
    userId: number,
    filters: { workspaceId?: string; organizationId?: string }
  ): Promise<CollabTask[]> {
    const auth = await authorizationEngine.checkPermission(userId, "workspace.read", filters.workspaceId || "global", {
      userId,
      organizationId: filters.organizationId || null,
      workspaceId: filters.workspaceId || null,
    });

    if (!auth.granted) {
      throw new Error(`Unauthorized to view tasks: ${auth.reason}`);
    }

    return await collaborationService.listTasks(filters);
  }

  /**
   * Share resource with link, workspace, or organization parameters.
   * Requires workspace.update (or research.export or report.export if sharing research/reports).
   */
  async shareResource(
    creatorId: number,
    resourceId: string,
    resourceType: string,
    shareType: string,
    organizationId?: string | null,
    workspaceId?: string | null,
    expiresAt?: Date | null
  ): Promise<CollabShare> {
    const action = resourceType.toLowerCase() === "research" ? "research.export" : "report.export";
    
    const auth = await authorizationEngine.checkPermission(creatorId, action, resourceId, {
      userId: creatorId,
      organizationId: organizationId || null,
      workspaceId: workspaceId || null,
    });

    if (!auth.granted) {
      throw new Error(`Unauthorized to share this resource: ${auth.reason}`);
    }

    return await collaborationService.shareResource(
      creatorId,
      resourceId,
      resourceType,
      shareType,
      organizationId,
      workspaceId,
      expiresAt
    );
  }

  /**
   * Resolve share link. Requires workspace.read.
   */
  async getShare(
    userId: number,
    resourceId: string,
    orgId?: string,
    workspaceId?: string
  ): Promise<CollabShare | null> {
    const auth = await authorizationEngine.checkPermission(userId, "workspace.read", resourceId, {
      userId,
      organizationId: orgId || null,
      workspaceId: workspaceId || null,
    });

    if (!auth.granted) {
      throw new Error(`Unauthorized to access shared resource: ${auth.reason}`);
    }

    return await collaborationService.getShare(resourceId);
  }

  /**
   * Set user presence/typing stats.
   */
  async setPresence(
    userId: number,
    status: string,
    activeWorkspaceId?: string,
    isTyping?: boolean,
    typingResourceId?: string
  ): Promise<CollabPresence> {
    return await collaborationService.setPresence(userId, status, activeWorkspaceId, isTyping, typingResourceId);
  }

  /**
   * Get team presence. Requires workspace.read.
   */
  async getPresence(userId: number, orgId?: string, workspaceId?: string): Promise<CollabPresence[]> {
    const auth = await authorizationEngine.checkPermission(userId, "workspace.read", workspaceId || "global", {
      userId,
      organizationId: orgId || null,
      workspaceId: workspaceId || null,
    });

    if (!auth.granted) {
      throw new Error(`Unauthorized to view presence: ${auth.reason}`);
    }

    return await collaborationService.getPresenceList();
  }

  /**
   * Get collaboration activity feed. Requires workspace.read.
   */
  async getActivityFeed(
    userId: number,
    filters: { workspaceId?: string; organizationId?: string; type?: string; limit?: number }
  ): Promise<CollabActivity[]> {
    const auth = await authorizationEngine.checkPermission(userId, "workspace.read", filters.workspaceId || "global", {
      userId,
      organizationId: filters.organizationId || null,
      workspaceId: filters.workspaceId || null,
    });

    if (!auth.granted) {
      throw new Error(`Unauthorized to view activity feed: ${auth.reason}`);
    }

    return await collaborationService.getFeed(filters);
  }
}
export const collaborationEngine = new CollaborationEngine();
