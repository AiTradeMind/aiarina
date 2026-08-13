import { PublishEventPayload } from "../types/index.ts";

export class EventValidator {
  public static validatePublishEvent(payload: PublishEventPayload): void {
    if (!payload.type || payload.type.trim().length === 0) {
      throw new Error("Event type is required and cannot be empty.");
    }

    const validCategories = new Set([
      "RESEARCH",
      "AI_MODELS",
      "CONSENSUS",
      "LEARNING",
      "GOVERNANCE",
      "ORGANIZATIONS",
      "WORKSPACES",
      "RBAC",
      "COLLAB",
      "AUDIT"
    ]);

    if (!payload.category || !validCategories.has(payload.category.toUpperCase())) {
      throw new Error(
        `Invalid event category: ${payload.category}. Must be one of: ${Array.from(validCategories).join(", ")}`
      );
    }

    if (payload.eventId && payload.eventId.trim().length === 0) {
      throw new Error("eventId cannot be empty when specified.");
    }
  }

  public static validateSubscriptionCategory(category: string | null): void {
    if (category === null) return;
    const validCategories = new Set([
      "RESEARCH",
      "AI_MODELS",
      "CONSENSUS",
      "LEARNING",
      "GOVERNANCE",
      "ORGANIZATIONS",
      "WORKSPACES",
      "RBAC",
      "COLLAB",
      "AUDIT"
    ]);

    if (!validCategories.has(category.toUpperCase())) {
      throw new Error(
        `Invalid subscription category: ${category}. Must be one of: ${Array.from(validCategories).join(", ")}`
      );
    }
  }

  public static validatePriority(priority: string): void {
    const validPriorities = new Set(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
    if (!validPriorities.has(priority.toUpperCase())) {
      throw new Error(`Invalid priority level: ${priority}. Must be LOW, MEDIUM, HIGH, or CRITICAL.`);
    }
  }
}
