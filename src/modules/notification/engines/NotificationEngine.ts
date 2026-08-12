import { notificationRepository } from "../repositories/NotificationRepository";
import { v4 as uuidv4 } from "uuid";

export class NotificationEngine {
  async sendNotification(data: any): Promise<any> {
    await notificationRepository.ensureTables();
    return { id: uuidv4(), ...data, status: 'PENDING', createdAt: new Date() };
  }

  async retryNotification(id: string): Promise<any> {
    return { id, status: 'RETRYING' };
  }

  async cancelNotification(id: string): Promise<any> {
    return { id, status: 'CANCELLED' };
  }
}

export const notificationEngine = new NotificationEngine();
