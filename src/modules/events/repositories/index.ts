import { eq, and, desc } from "drizzle-orm";
import { getDb } from "../../../db/client.ts";
import { eventLog, notifications, auditEvents, systemEvents } from "../../../db/schema.ts";
import { isInvalidOrg } from "../../../lib/utils.ts";
import { 
  EventLogEntry, 
  Notification, 
  AuditEvent, 
  SystemEvent, 
  EventType, 
  EventSource 
} from "../types/index.ts";

export class EventLogRepository {
  async create(data: any): Promise<EventLogEntry> {
    const db = getDb();
    const result = await db.insert(eventLog).values(data).returning();
    return {
      ...result[0],
      eventType: result[0].eventType as EventType,
      source: result[0].source as EventSource,
      createdAt: result[0].createdAt.toISOString(),
    };
  }

  async findByOrg(organizationId: string): Promise<EventLogEntry[]> {
    if (isInvalidOrg(organizationId)) {
      return [];
    }
    const db = getDb();
    const result = await db.select().from(eventLog)
      .where(eq(eventLog.organizationId, organizationId))
      .orderBy(desc(eventLog.createdAt));
    return result.map(e => ({
      ...e,
      eventType: e.eventType as EventType,
      source: e.source as EventSource,
      createdAt: e.createdAt.toISOString(),
    }));
  }
}

export class NotificationRepository {
  async create(data: any): Promise<Notification> {
    const db = getDb();
    const result = await db.insert(notifications).values(data).returning();
    return {
      ...result[0],
      type: result[0].type as any,
      createdAt: result[0].createdAt.toISOString(),
    };
  }

  async findByUser(userId: number, organizationId: string): Promise<Notification[]> {
    if (isInvalidOrg(organizationId)) {
      return [];
    }
    const db = getDb();
    const result = await db.select().from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.organizationId, organizationId)))
      .orderBy(desc(notifications.createdAt));
    return result.map(n => ({
      ...n,
      type: n.type as any,
      createdAt: n.createdAt.toISOString(),
    }));
  }

  async markAsRead(id: number): Promise<void> {
    const db = getDb();
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
  }
}

export class AuditRepository {
  async create(data: any): Promise<AuditEvent> {
    const db = getDb();
    const result = await db.insert(auditEvents).values(data).returning();
    return {
      ...result[0],
      status: result[0].status as any,
      timestamp: result[0].timestamp.toISOString(),
    };
  }

  async findByOrg(organizationId: string): Promise<AuditEvent[]> {
    if (isInvalidOrg(organizationId)) {
      return [];
    }
    const db = getDb();
    const result = await db.select().from(auditEvents)
      .where(eq(auditEvents.organizationId, organizationId))
      .orderBy(desc(auditEvents.timestamp));
    return result.map(a => ({
      ...a,
      status: a.status as any,
      timestamp: a.timestamp.toISOString(),
    }));
  }
}

export class SystemEventRepository {
  async create(data: any): Promise<SystemEvent> {
    const db = getDb();
    const result = await db.insert(systemEvents).values(data).returning();
    return {
      ...result[0],
      level: result[0].level as any,
      timestamp: result[0].timestamp.toISOString(),
    };
  }
}
