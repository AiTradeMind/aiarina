import { eq, and, desc, sql } from "drizzle-orm";
import { getDb } from "../../../db/client.ts";
import { 
  enterpriseNotifications, 
  notificationPreferences, 
  notificationDelivery 
} from "../../../db/schema.ts";
import { 
  IEnterpriseNotification, 
  INotificationPreference, 
  INotificationDelivery 
} from "../types/index.ts";

export class NotificationRepository {
  // --- Notifications ---
  async createNotification(notif: Partial<IEnterpriseNotification>): Promise<IEnterpriseNotification> {
    const db = getDb();
    const payload = {
      eventId: notif.eventId || null,
      userId: notif.userId!,
      title: notif.title!,
      message: notif.message!,
      priority: notif.priority || "LOW",
      isRead: notif.isRead ?? false,
      isArchived: notif.isArchived ?? false,
      expiresAt: notif.expiresAt || null,
    };
    const res = await db.insert(enterpriseNotifications).values(payload).returning();
    return res[0] as unknown as IEnterpriseNotification;
  }

  async getNotification(id: number): Promise<IEnterpriseNotification | null> {
    const db = getDb();
    const res = await db.select().from(enterpriseNotifications).where(eq(enterpriseNotifications.id, id)).limit(1);
    return (res[0] as unknown as IEnterpriseNotification) || null;
  }

  async listNotificationsForUser(userId: number, filters?: { isRead?: boolean; isArchived?: boolean }): Promise<IEnterpriseNotification[]> {
    const db = getDb();
    const conditions = [eq(enterpriseNotifications.userId, userId)];
    
    if (filters) {
      if (filters.isRead !== undefined) {
        conditions.push(eq(enterpriseNotifications.isRead, filters.isRead));
      }
      if (filters.isArchived !== undefined) {
        conditions.push(eq(enterpriseNotifications.isArchived, filters.isArchived));
      }
    }

    const res = await db
      .select()
      .from(enterpriseNotifications)
      .where(and(...conditions))
      .orderBy(desc(enterpriseNotifications.createdAt));
    return res as unknown as IEnterpriseNotification[];
  }

  async updateNotification(id: number, updates: Partial<IEnterpriseNotification>): Promise<IEnterpriseNotification | null> {
    const db = getDb();
    const res = await db
      .update(enterpriseNotifications)
      .set(updates)
      .where(eq(enterpriseNotifications.id, id))
      .returning();
    return (res[0] as unknown as IEnterpriseNotification) || null;
  }

  // --- Preferences ---
  async getPreferences(userId: number): Promise<INotificationPreference> {
    const db = getDb();
    const res = await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, userId)).limit(1);
    
    if (res.length > 0) {
      return res[0] as unknown as INotificationPreference;
    }

    // Default Preferences
    const defaults = {
      userId,
      emailEnabled: false,
      inAppEnabled: true,
      digestFrequency: "IMMEDIATE" as const,
      muteCategories: [] as string[],
      updatedAt: new Date()
    };

    const inserted = await db.insert(notificationPreferences).values(defaults).returning();
    return inserted[0] as unknown as INotificationPreference;
  }

  async updatePreferences(userId: number, updates: Partial<INotificationPreference>): Promise<INotificationPreference> {
    const db = getDb();
    // Ensure entry exists first
    await this.getPreferences(userId);

    const res = await db
      .update(notificationPreferences)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(notificationPreferences.userId, userId))
      .returning();
    return res[0] as unknown as INotificationPreference;
  }

  // --- Delivery Log ---
  async createDeliveryLog(log: Partial<INotificationDelivery>): Promise<INotificationDelivery> {
    const db = getDb();
    const payload = {
      notificationId: log.notificationId!,
      status: log.status || "PENDING",
      retryCount: log.retryCount ?? 0,
      errorDetails: log.errorDetails || null,
      deliveredAt: log.deliveredAt || null,
    };
    const res = await db.insert(notificationDelivery).values(payload).returning();
    return res[0] as unknown as INotificationDelivery;
  }

  async updateDeliveryLog(id: number, updates: Partial<INotificationDelivery>): Promise<INotificationDelivery | null> {
    const db = getDb();
    const res = await db
      .update(notificationDelivery)
      .set(updates)
      .where(eq(notificationDelivery.id, id))
      .returning();
    return (res[0] as unknown as INotificationDelivery) || null;
  }
}
export const notificationRepository = new NotificationRepository();
