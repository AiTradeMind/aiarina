import { CollaborationRepository } from "../repositories/CollaborationRepository.ts";
import { CollaborationValidator } from "./CollaborationValidator.ts";
import { 
  CollabComment, 
  CollabTask, 
  CollabShare, 
  CollabActivity, 
  CollabPresence 
} from "../types/index.ts";

export class CollaborationService {
  private repo = new CollaborationRepository();

  // --- Comments ---
  async addComment(
    userId: number,
    content: string,
    resourceId: string,
    resourceType: string,
    parentId?: number
  ): Promise<CollabComment> {
    CollaborationValidator.validateComment(content, resourceId, resourceType);

    const comment = await this.repo.createComment({
      userId,
      content,
      resourceId,
      resourceType: resourceType.toUpperCase(),
      parentId: parentId || null,
    });

    // Extract and record mentions (e.g. "@123" where 123 is a user ID)
    const mentions = this.extractMentions(content);
    for (const targetUserId of mentions) {
      await this.repo.addMention(comment.id, targetUserId);
    }

    // Log in collaboration activity feed
    await this.repo.logActivity({
      userId,
      type: "COMMENT",
      details: {
        commentId: comment.id,
        resourceId,
        resourceType,
        mentionCount: mentions.length,
      },
    });

    return comment;
  }

  async getComments(resourceId: string): Promise<CollabComment[]> {
    return await this.repo.getCommentsForResource(resourceId);
  }

  async resolveComment(commentId: number, userId: number): Promise<CollabComment> {
    const comment = await this.repo.getComment(commentId);
    if (!comment) throw new Error("Comment not found.");

    const updated = await this.repo.updateComment(commentId, { isResolved: true });
    if (!updated) throw new Error("Could not update comment.");

    await this.repo.logActivity({
      userId,
      type: "COMMENT",
      details: {
        commentId,
        action: "RESOLVE",
        resourceId: comment.resourceId,
      },
    });

    return updated;
  }

  async togglePinComment(commentId: number, userId: number): Promise<CollabComment> {
    const comment = await this.repo.getComment(commentId);
    if (!comment) throw new Error("Comment not found.");

    const updated = await this.repo.updateComment(commentId, { isPinned: !comment.isPinned });
    if (!updated) throw new Error("Could not update comment.");

    await this.repo.logActivity({
      userId,
      type: "COMMENT",
      details: {
        commentId,
        action: updated.isPinned ? "PIN" : "UNPIN",
        resourceId: comment.resourceId,
      },
    });

    return updated;
  }

  private extractMentions(content: string): number[] {
    const regex = /@(\d+)/g;
    const matches: number[] = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      const uId = parseInt(match[1], 10);
      if (!isNaN(uId)) {
        matches.push(uId);
      }
    }
    return Array.from(new Set(matches));
  }

  // --- Tasks ---
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
    const pri = (priority || "MEDIUM").toUpperCase() as any;
    const sta = (status || "TODO").toUpperCase() as any;

    CollaborationValidator.validateTask(title, pri, sta);

    const task = await this.repo.createTask({
      title,
      description,
      assigneeId: assigneeId || null,
      creatorId,
      dueDate: dueDate || null,
      priority: pri,
      status: sta,
      labels: labels || [],
      organizationId: organizationId || null,
      workspaceId: workspaceId || null,
      resourceId: resourceId || null,
    });

    await this.repo.logActivity({
      userId: creatorId,
      workspaceId,
      organizationId,
      type: "TASK",
      details: {
        taskId: task.id,
        action: "CREATE",
        title,
        assigneeId,
      },
    });

    return task;
  }

  async updateTask(
    taskId: number,
    userId: number,
    updates: Partial<CollabTask>
  ): Promise<CollabTask> {
    const existing = await this.repo.getTask(taskId);
    if (!existing) throw new Error("Task not found.");

    const updated = await this.repo.updateTask(taskId, updates);
    if (!updated) throw new Error("Could not update task.");

    await this.repo.logActivity({
      userId,
      workspaceId: existing.workspaceId,
      organizationId: existing.organizationId,
      type: "TASK",
      details: {
        taskId,
        action: "UPDATE",
        updates: Object.keys(updates),
      },
    });

    return updated;
  }

  async listTasks(filters: { workspaceId?: string; organizationId?: string }): Promise<CollabTask[]> {
    return await this.repo.listTasks(filters);
  }

  // --- Shares ---
  async shareResource(
    creatorId: number,
    resourceId: string,
    resourceType: string,
    shareType: string,
    organizationId?: string | null,
    workspaceId?: string | null,
    expiresAt?: Date | null
  ): Promise<CollabShare> {
    const sType = (shareType || "WORKSPACE").toUpperCase() as any;
    CollaborationValidator.validateShare(resourceId, resourceType, sType);

    const share = await this.repo.createShare({
      resourceId,
      resourceType: resourceType.toUpperCase(),
      creatorId,
      shareType: sType,
      organizationId: organizationId || null,
      workspaceId: workspaceId || null,
      expiresAt: expiresAt || null,
    });

    await this.repo.logActivity({
      userId: creatorId,
      workspaceId,
      organizationId,
      type: "SHARE",
      details: {
        shareId: share.id,
        resourceId,
        resourceType,
        shareType: sType,
      },
    });

    return share;
  }

  async getShare(resourceId: string): Promise<CollabShare | null> {
    return await this.repo.getShareByResource(resourceId);
  }

  // --- Presence ---
  async setPresence(
    userId: number,
    status: string,
    activeWorkspaceId?: string,
    isTyping?: boolean,
    typingResourceId?: string
  ): Promise<CollabPresence> {
    const stat = (status || "ONLINE").toUpperCase() as any;
    CollaborationValidator.validatePresenceStatus(stat);

    return await this.repo.updatePresence({
      userId,
      status: stat,
      activeWorkspaceId: activeWorkspaceId || null,
      isTyping: isTyping ?? false,
      typingResourceId: typingResourceId || null,
    });
  }

  async getPresenceList(): Promise<CollabPresence[]> {
    return await this.repo.listPresence();
  }

  // --- Feeds ---
  async getFeed(filters: { workspaceId?: string; organizationId?: string; type?: string; limit?: number }): Promise<CollabActivity[]> {
    return await this.repo.listActivities(filters);
  }
}
export const collaborationService = new CollaborationService();
