import { notificationEngine } from "../engines/NotificationEngine";

export class NotificationService {
  async getStatus(): Promise<any> {
    return { status: "OK", timestamp: new Date() };
  }

  async sendNotification(data: any): Promise<any> {
    return await notificationEngine.sendNotification(data);
  }

  async retryNotification(id: string): Promise<any> {
    return await notificationEngine.retryNotification(id);
  }

  async cancelNotification(id: string): Promise<any> {
    return await notificationEngine.cancelNotification(id);
  }
}

export const notificationService = new NotificationService();
