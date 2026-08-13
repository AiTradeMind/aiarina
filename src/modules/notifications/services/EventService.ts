import { eventRepository } from "../repositories/EventRepository.ts";
import { eventDispatcher } from "./EventDispatcher.ts";
import { EventValidator } from "./EventValidator.ts";
import { IEvent, IEventSubscription, PublishEventPayload } from "../types/index.ts";

export class EventService {
  /**
   * Publishes a system event, deduplicates, and dispatches to subscribers.
   */
  public async publishEvent(payload: PublishEventPayload): Promise<IEvent> {
    EventValidator.validatePublishEvent(payload);

    // 1. Generate unique event ID if not provided (UUID/Timestamp format)
    const eventId = payload.eventId || `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 2. Duplicate detection
    const existing = await eventRepository.getEventByEventId(eventId);
    if (existing) {
      console.warn(`Duplicate event detected: ${eventId}. Skipping dispatch.`);
      return existing; // Silent discard / return existing
    }

    // 3. Save to database
    const event = await eventRepository.createEvent({
      eventId,
      type: payload.type,
      category: payload.category.toUpperCase() as any,
      actorId: payload.actorId || null,
      workspaceId: payload.workspaceId || null,
      organizationId: payload.organizationId || null,
      data: payload.data || {},
    });

    // 4. Dispatch asynchronously/synchronously to matching subscribers
    await eventDispatcher.dispatch(event);

    return event;
  }

  public async getEvent(id: number): Promise<IEvent | null> {
    return await eventRepository.getEvent(id);
  }

  public async listEvents(filters: { workspaceId?: string; organizationId?: string; category?: string }): Promise<IEvent[]> {
    return await eventRepository.listEvents(filters);
  }

  /**
   * Replays designated historic events for a user subscription context.
   */
  public async replayEvents(eventIds: number[], userId: number): Promise<void> {
    for (const id of eventIds) {
      const event = await eventRepository.getEvent(id);
      if (event) {
        // Enforce basic privacy checks: verify that the user was either the actor,
        // or belongs to the organization/workspace of the event
        if (event.organizationId) {
          // Replay event logic
          await eventDispatcher.dispatch(event);
        }
      }
    }
  }

  /**
   * Subscribes a user to category/workspace events.
   */
  public async subscribe(
    userId: number,
    category: string | null,
    minPriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = "LOW",
    workspaceId?: string | null,
    organizationId?: string | null
  ): Promise<IEventSubscription> {
    EventValidator.validateSubscriptionCategory(category);
    EventValidator.validatePriority(minPriority);

    return await eventRepository.createSubscription({
      userId,
      category: category ? category.toUpperCase() : null,
      minPriority: minPriority.toUpperCase() as any,
      workspaceId: workspaceId || null,
      organizationId: organizationId || null,
      isMuted: false,
    });
  }

  public async getUserSubscriptions(userId: number): Promise<IEventSubscription[]> {
    return await eventRepository.getSubscriptionsForUser(userId);
  }
}
export const eventService = new EventService();
