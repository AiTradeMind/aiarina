import { eq, and, desc, sql } from "drizzle-orm";
import { getDb } from "../../../db/client.ts";
import { 
  events, 
  eventSubscriptions, 
  notificationMetrics,
  users
} from "../../../db/schema.ts";
import { 
  IEvent, 
  IEventSubscription, 
  INotificationMetrics 
} from "../types/index.ts";

export class EventRepository {
  private static tablesChecked = false;

  public async ensureNotificationTables(): Promise<void> {
    if (EventRepository.tablesChecked) return;
    const db = getDb();
    try {
      // 1. Create Events Table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS events (
          id SERIAL PRIMARY KEY,
          event_id VARCHAR(100) UNIQUE NOT NULL,
          type VARCHAR(100) NOT NULL,
          category VARCHAR(50) NOT NULL,
          actor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          workspace_id VARCHAR(50),
          organization_id VARCHAR(50),
          data JSONB DEFAULT '{}'::jsonb NOT NULL,
          created_at TIMESTAMP DEFAULT now() NOT NULL
        );
      `);

      // 2. Create Event Subscriptions Table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS event_subscriptions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
          role_id VARCHAR(50),
          workspace_id VARCHAR(50),
          organization_id VARCHAR(50),
          category VARCHAR(50),
          min_priority VARCHAR(20) DEFAULT 'LOW' NOT NULL,
          is_muted BOOLEAN DEFAULT FALSE NOT NULL,
          created_at TIMESTAMP DEFAULT now() NOT NULL
        );
      `);

      // 3. Create Enterprise Notifications Table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS enterprise_notifications (
          id SERIAL PRIMARY KEY,
          event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          priority VARCHAR(50) DEFAULT 'LOW' NOT NULL,
          is_read BOOLEAN DEFAULT FALSE NOT NULL,
          is_archived BOOLEAN DEFAULT FALSE NOT NULL,
          expires_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT now() NOT NULL
        );
      `);

      // 4. Create Notification Preferences Table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS notification_preferences (
          user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
          email_enabled BOOLEAN DEFAULT FALSE NOT NULL,
          in_app_enabled BOOLEAN DEFAULT TRUE NOT NULL,
          digest_frequency VARCHAR(50) DEFAULT 'IMMEDIATE' NOT NULL,
          mute_categories JSONB DEFAULT '[]'::jsonb NOT NULL,
          updated_at TIMESTAMP DEFAULT now() NOT NULL
        );
      `);

      // 5. Create Notification Delivery Table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS notification_delivery (
          id SERIAL PRIMARY KEY,
          notification_id INTEGER REFERENCES enterprise_notifications(id) ON DELETE CASCADE NOT NULL,
          status VARCHAR(50) DEFAULT 'PENDING' NOT NULL,
          retry_count INTEGER DEFAULT 0 NOT NULL,
          error_details TEXT,
          delivered_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT now() NOT NULL
        );
      `);

      // 6. Create Notification Metrics Table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS notification_metrics (
          id SERIAL PRIMARY KEY,
          date TIMESTAMP DEFAULT now() NOT NULL,
          published_events INTEGER DEFAULT 0 NOT NULL,
          delivered_notifications INTEGER DEFAULT 0 NOT NULL,
          failed_deliveries INTEGER DEFAULT 0 NOT NULL,
          avg_latency_ms INTEGER DEFAULT 0 NOT NULL,
          created_at TIMESTAMP DEFAULT now() NOT NULL
        );
      `);

      EventRepository.tablesChecked = true;
    } catch (err) {
      console.error("Error setting up missing event and notification tables:", err);
    }
  }

  constructor() {
    this.ensureNotificationTables().catch(() => {});
  }

  // --- Events ---
  async createEvent(event: Partial<IEvent>): Promise<IEvent> {
    await this.ensureNotificationTables();
    const db = getDb();
    const payload = {
      eventId: event.eventId!,
      type: event.type!,
      category: event.category!,
      actorId: event.actorId || null,
      workspaceId: event.workspaceId || null,
      organizationId: event.organizationId || null,
      data: event.data || {},
    };
    const res = await db.insert(events).values(payload).returning();
    return res[0] as unknown as IEvent;
  }

  async getEvent(id: number): Promise<IEvent | null> {
    await this.ensureNotificationTables();
    const db = getDb();
    const res = await db.select().from(events).where(eq(events.id, id)).limit(1);
    return (res[0] as unknown as IEvent) || null;
  }

  async getEventByEventId(eventId: string): Promise<IEvent | null> {
    await this.ensureNotificationTables();
    const db = getDb();
    const res = await db.select().from(events).where(eq(events.eventId, eventId)).limit(1);
    return (res[0] as unknown as IEvent) || null;
  }

  async listEvents(filters: { workspaceId?: string; organizationId?: string; category?: string }): Promise<IEvent[]> {
    await this.ensureNotificationTables();
    const db = getDb();
    const conditions = [];
    if (filters.workspaceId) conditions.push(eq(events.workspaceId, filters.workspaceId));
    if (filters.organizationId) conditions.push(eq(events.organizationId, filters.organizationId));
    if (filters.category) conditions.push(eq(events.category, filters.category as any));

    let query = db.select().from(events).orderBy(desc(events.createdAt));
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    const res = await query;
    return res as unknown as IEvent[];
  }

  // --- Subscriptions ---
  async createSubscription(sub: Partial<IEventSubscription>): Promise<IEventSubscription> {
    await this.ensureNotificationTables();
    const db = getDb();
    const payload = {
      userId: sub.userId!,
      roleId: sub.roleId || null,
      workspaceId: sub.workspaceId || null,
      organizationId: sub.organizationId || null,
      category: sub.category || null,
      minPriority: sub.minPriority || "LOW",
      isMuted: sub.isMuted ?? false,
    };
    const res = await db.insert(eventSubscriptions).values(payload).returning();
    return res[0] as unknown as IEventSubscription;
  }

  async getSubscriptionsForUser(userId: number): Promise<IEventSubscription[]> {
    await this.ensureNotificationTables();
    const db = getDb();
    const res = await db.select().from(eventSubscriptions).where(eq(eventSubscriptions.userId, userId));
    return res as unknown as IEventSubscription[];
  }

  async listSubscriptions(filters: { organizationId?: string; category?: string }): Promise<IEventSubscription[]> {
    await this.ensureNotificationTables();
    const db = getDb();
    const conditions = [];
    if (filters.organizationId) conditions.push(eq(eventSubscriptions.organizationId, filters.organizationId));
    if (filters.category) conditions.push(eq(eventSubscriptions.category, filters.category));

    let query = db.select().from(eventSubscriptions);
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    const res = await query;
    return res as unknown as IEventSubscription[];
  }

  // --- Metrics ---
  async logMetrics(published: number, delivered: number, failed: number, latencyMs: number): Promise<void> {
    await this.ensureNotificationTables();
    const db = getDb();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Drizzle upsert or insert simple record
    await db.insert(notificationMetrics).values({
      date: today,
      publishedEvents: published,
      deliveredNotifications: delivered,
      failedDeliveries: failed,
      avgLatencyMs: latencyMs,
    });
  }

  async getMetrics(): Promise<INotificationMetrics[]> {
    await this.ensureNotificationTables();
    const db = getDb();
    const res = await db.select().from(notificationMetrics).orderBy(desc(notificationMetrics.createdAt)).limit(10);
    return res as unknown as INotificationMetrics[];
  }
}
export const eventRepository = new EventRepository();
