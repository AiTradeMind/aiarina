import { CollabComment, CollabTask, CollabShare } from "../types/index.ts";

export class CollaborationValidator {
  public static validateComment(content: string, resourceId: string, resourceType: string): void {
    if (!content || content.trim().length === 0) {
      throw new Error("Comment content cannot be empty.");
    }
    if (content.length > 5000) {
      throw new Error("Comment content cannot exceed 5000 characters.");
    }
    if (!resourceId || resourceId.trim().length === 0) {
      throw new Error("ResourceId is required for comments.");
    }
    const validResourceTypes = new Set(["RESEARCH", "REPORT", "STRATEGY", "KNOWLEDGE", "SESSION"]);
    if (!validResourceTypes.has(resourceType.toUpperCase())) {
      throw new Error(`Invalid resource type: ${resourceType}. Must be RESEARCH, REPORT, STRATEGY, KNOWLEDGE, or SESSION.`);
    }
  }

  public static validateTask(title: string, priority: string, status: string): void {
    if (!title || title.trim().length < 3) {
      throw new Error("Task title must be at least 3 characters long.");
    }
    if (title.length > 255) {
      throw new Error("Task title cannot exceed 255 characters.");
    }

    const validPriorities = new Set(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
    if (!validPriorities.has(priority.toUpperCase())) {
      throw new Error(`Invalid task priority: ${priority}. Must be LOW, MEDIUM, HIGH, or CRITICAL.`);
    }

    const validStatuses = new Set(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]);
    if (!validStatuses.has(status.toUpperCase())) {
      throw new Error(`Invalid task status: ${status}. Must be TODO, IN_PROGRESS, REVIEW, or DONE.`);
    }
  }

  public static validateShare(resourceId: string, resourceType: string, shareType: string): void {
    if (!resourceId || resourceId.trim().length === 0) {
      throw new Error("ResourceId is required for sharing.");
    }
    const validResourceTypes = new Set(["RESEARCH", "REPORT", "STRATEGY", "KNOWLEDGE"]);
    if (!validResourceTypes.has(resourceType.toUpperCase())) {
      throw new Error(`Invalid resource type for sharing: ${resourceType}.`);
    }

    const validShareTypes = new Set(["INTERNAL_LINK", "WORKSPACE", "ORGANIZATION", "PUBLIC_READ"]);
    if (!validShareTypes.has(shareType.toUpperCase())) {
      throw new Error(`Invalid share type: ${shareType}. Must be INTERNAL_LINK, WORKSPACE, ORGANIZATION, or PUBLIC_READ.`);
    }
  }

  public static validatePresenceStatus(status: string): void {
    const validStatuses = new Set(["ONLINE", "AWAY", "OFFLINE"]);
    if (!validStatuses.has(status.toUpperCase())) {
      throw new Error(`Invalid presence status: ${status}. Must be ONLINE, AWAY, or OFFLINE.`);
    }
  }
}
