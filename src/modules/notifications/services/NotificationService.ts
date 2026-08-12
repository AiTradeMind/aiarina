import { notificationRepository } from "../repositories/NotificationRepository.ts";
import { IEnterpriseNotification, INotificationPreference, UpdatePreferencesPayload } from "../types/index.ts";

export class NotificationService {
  public async getNotifications(
    userId: number,
    filters?: { isRead?: boolean; isArchived?: boolean }
  ): Promise<IEnterpriseNotification[]> {
    return await notificationRepository.listNotificationsForUser(userId, filters);
  }

  public async markAsRead(id: number, userId: number): Promise<IEnterpriseNotification> {
    const notif = await notificationRepository.getNotification(id);
    if (!notif) throw new Error("Notification not found.");
    if (notif.userId !== userId) throw new Error("Access denied: Notification belongs to a different recipient.");

    const updated = await notificationRepository.updateNotification(id, { isRead: true });
    if (!updated) throw new Error("Could not update notification state.");
    return updated;
  }

  public async archiveNotification(id: number, userId: number): Promise<IEnterpriseNotification> {
    const notif = await notificationRepository.getNotification(id);
    if (!notif) throw new Error("Notification not found.");
    if (notif.userId !== userId) throw new Error("Access denied: Notification belongs to a different recipient.");

    const updated = await notificationRepository.updateNotification(id, { isArchived: true });
    if (!updated) throw new Error("Could not update notification state.");
    return updated;
  }

  public async getPreferences(userId: number): Promise<INotificationPreference> {
    return await notificationRepository.getPreferences(userId);
  }

  public async updatePreferences(userId: number, updates: UpdatePreferencesPayload): Promise<INotificationPreference> {
    const validUpdates: Partial<INotificationPreference> = {};
    if (updates.emailEnabled !== undefined) validUpdates.emailEnabled = updates.emailEnabled;
    if (updates.inAppEnabled !== undefined) validUpdates.inAppEnabled = updates.inAppEnabled;
    if (updates.digestFrequency !== undefined) validUpdates.digestFrequency = updates.digestFrequency;
    if (updates.muteCategories !== undefined) {
      validUpdates.muteCategories = updates.muteCategories.map(c => c.toUpperCase());
    }

    return await notificationRepository.updatePreferences(userId, validUpdates);
  }
}
export const notificationService = new NotificationService();
