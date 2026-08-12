import { eventService } from "./EventService.ts";
import { notificationService } from "./NotificationService.ts";
import { authorizationEngine } from "../../rbac/services/AuthorizationEngine.ts";
import { IEvent, IEventSubscription, IEnterpriseNotification, PublishEventPayload } from "../types/index.ts";

export class EventEngine {
  /**
   * Securely publishes a system event after performing RBAC checks on the actor.
   */
  public async publishEvent(actorId: number, payload: PublishEventPayload): Promise<IEvent> {
    const orgId = payload.organizationId || null;
    const wksId = payload.workspaceId || null;

    // 1. Map event category to required RBAC action checks
    let requiredAction = "workspace.read";
    if (payload.category === "COLLAB" || payload.category === "WORKSPACES") {
      requiredAction = "workspace.read";
    } else if (payload.category === "RESEARCH") {
      requiredAction = "workspace.read";
    } else if (payload.category === "GOVERNANCE" || payload.category === "AUDIT") {
      requiredAction = "workspace.update";
    }

    // 2. Perform authorization check
    const auth = await authorizationEngine.checkPermission(actorId, requiredAction, wksId || "global", {
      userId: actorId,
      organizationId: orgId,
      workspaceId: wksId,
    });

    if (!auth.granted) {
      throw new Error(`Unauthorized to publish event: ${auth.reason}`);
    }

    return await eventService.publishEvent({
      ...payload,
      actorId,
    });
  }

  /**
   * Securely subscribes a user to event categories.
   */
  public async subscribe(
    userId: number,
    category: string | null,
    minPriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = "LOW",
    workspaceId?: string | null,
    organizationId?: string | null
  ): Promise<IEventSubscription> {
    // Subscriber must have workspace.read permission
    const auth = await authorizationEngine.checkPermission(userId, "workspace.read", workspaceId || "global", {
      userId,
      organizationId: organizationId || null,
      workspaceId: workspaceId || null,
    });

    if (!auth.granted) {
      throw new Error(`Unauthorized to subscribe: ${auth.reason}`);
    }

    return await eventService.subscribe(userId, category, minPriority, workspaceId, organizationId);
  }

  /**
   * Securely replays designated historical events for a user.
   */
  public async replayEvents(eventIds: number[], userId: number, orgId?: string, workspaceId?: string): Promise<void> {
    const auth = await authorizationEngine.checkPermission(userId, "workspace.read", workspaceId || "global", {
      userId,
      organizationId: orgId || null,
      workspaceId: workspaceId || null,
    });

    if (!auth.granted) {
      throw new Error(`Unauthorized to replay events: ${auth.reason}`);
    }

    await eventService.replayEvents(eventIds, userId);
  }
}
export const eventEngine = new EventEngine();
export const notificationEngine = notificationService; // Alias for simplicity
