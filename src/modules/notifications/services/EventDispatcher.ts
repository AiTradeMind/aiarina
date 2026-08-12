import { eventRepository } from "../repositories/EventRepository.ts";
import { notificationRepository } from "../repositories/NotificationRepository.ts";
import { IEvent, IEnterpriseNotification } from "../types/index.ts";

export class EventDispatcher {
  /**
   * Matches published events to subscribers, enforces cross-tenant boundaries, 
   * evaluates preferences, and creates notifications.
   */
  public async dispatch(event: IEvent): Promise<IEnterpriseNotification[]> {
    const startTime = Date.now();
    let deliveredCount = 0;
    let failedCount = 0;
    const createdNotifications: IEnterpriseNotification[] = [];

    try {
      // 1. Fetch matching subscriptions for the event's category and tenant
      const filters: { organizationId?: string; category?: string } = {};
      if (event.organizationId) {
        filters.organizationId = event.organizationId;
      }
      if (event.category) {
        filters.category = event.category;
      }

      const subscriptions = await eventRepository.listSubscriptions(filters);

      // 2. Process subscriptions
      for (const sub of subscriptions) {
        // Enforce Cross-Tenant Isolation
        if (event.organizationId && sub.organizationId !== event.organizationId) {
          continue; // Block cross-tenant delivery
        }

        // Enforce Workspace Visibility
        if (event.workspaceId && sub.workspaceId && sub.workspaceId !== event.workspaceId) {
          continue; // Block if subscribed to a different workspace
        }

        // Check user preferences
        const prefs = await notificationRepository.getPreferences(sub.userId);
        if (!prefs.inAppEnabled) {
          continue; // User disabled in-app notifications
        }

        if (prefs.muteCategories.includes(event.category)) {
          continue; // Category is muted by user
        }

        // Determine priority level (default to MEDIUM or read from event data)
        const priority = (event.data?.priority || "MEDIUM").toUpperCase() as any;
        const validPriorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
        
        // Priority filter validation
        const eventPriorityIndex = validPriorities.indexOf(priority);
        const minPriorityIndex = validPriorities.indexOf(sub.minPriority);
        if (eventPriorityIndex < minPriorityIndex) {
          continue; // Skip because event priority is lower than user's subscription minimum
        }

        // Create the notification
        const title = this.formatTitle(event);
        const message = this.formatMessage(event);

        const notif = await notificationRepository.createNotification({
          eventId: event.id,
          userId: sub.userId,
          title,
          message,
          priority,
          isRead: false,
          isArchived: false,
          expiresAt: event.data?.expiresAt ? new Date(event.data.expiresAt) : null,
        });

        // Create delivery log
        await notificationRepository.createDeliveryLog({
          notificationId: notif.id,
          status: "SENT",
          retryCount: 0,
          deliveredAt: new Date(),
        });

        createdNotifications.push(notif);
        deliveredCount++;
      }

      // Log success metrics
      const latency = Date.now() - startTime;
      await eventRepository.logMetrics(1, deliveredCount, failedCount, latency);

    } catch (err: any) {
      console.error("Event dispatch error:", err);
      failedCount++;
      await eventRepository.logMetrics(1, deliveredCount, failedCount, Date.now() - startTime);
    }

    return createdNotifications;
  }

  private formatTitle(event: IEvent): string {
    if (event.data?.title) return event.data.title;
    const parts = event.type.split(".");
    const action = parts[parts.length - 1];
    return `New ${event.category} Activity: ${action.charAt(0).toUpperCase() + action.slice(1)}`;
  }

  private formatMessage(event: IEvent): string {
    if (event.data?.message) return event.data.message;
    return `An event of type '${event.type}' was published under category '${event.category}'.`;
  }
}
export const eventDispatcher = new EventDispatcher();
