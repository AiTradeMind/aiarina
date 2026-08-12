import { 
  EventLogRepository, 
  NotificationRepository, 
  AuditRepository, 
  SystemEventRepository 
} from "../repositories/index.ts";
import { PublishEventRequest } from "../types/index.ts";
import { WebSocketManager } from "../../../infrastructure/websocket/index.ts";
import logger from "../../../lib/logger";
import { auditService } from "./audit.service.ts";

export type EventCallback = (payload: any) => void | Promise<void>;

export class EventBusService {
  private eventRepo = new EventLogRepository();
  private notificationRepo = new NotificationRepository();
  private auditRepo = new AuditRepository();
  private systemRepo = new SystemEventRepository();
  private wsManager = WebSocketManager.getInstance();
  private subscribers: Map<string, EventCallback[]> = new Map();

  private static instance: EventBusService;

  public static getInstance(): EventBusService {
    if (!EventBusService.instance) {
      EventBusService.instance = new EventBusService();
    }
    return EventBusService.instance;
  }

  async publish(request: PublishEventRequest): Promise<void> {
    try {
      // 1. Log the event
      await this.eventRepo.create({
        eventType: request.eventType,
        source: request.source,
        organizationId: request.organizationId,
        userId: request.userId,
        entityId: request.entityId,
        payload: request.payload,
      });

      // 2. Handle Notification if requested
      if (request.notify) {
        await this.notificationRepo.create({
          organizationId: request.organizationId,
          userId: request.userId,
          title: request.notify.title,
          message: request.notify.message,
          type: request.notify.type || 'INFO',
        });
      }

      // 3. Handle Audit if requested
      if (request.audit) {
        await auditService.logAuditEvent({
          organizationId: request.organizationId,
          userId: request.userId,
          action: request.audit.action,
          status: request.audit.status,
          details: request.audit.details,
        });
      }

      // 4. Broadcast via WebSocket
      const room = request.organizationId ? `org:${request.organizationId}` : undefined;
      this.wsManager.emit(request.eventType, request.payload, room);

      // 5. Trigger In-memory subscribers
      const callbacks = this.subscribers.get(request.eventType) || [];
      for (const cb of callbacks) {
        try {
          await cb(request.payload);
        } catch (error: any) {
          logger.error(`Error in EventBus subscriber for [${request.eventType}]: ${error.message}`);
        }
      }

      logger.info({
        type: "EVENT_PUBLISHED",
        eventType: request.eventType,
        source: request.source,
        userId: request.userId,
        organizationId: request.organizationId
      }, `[EventBus] ${request.source}:${request.eventType} published.`);
    } catch (error: any) {
      logger.error({
        type: "EVENT_PUBLISH_FAILURE",
        eventType: request.eventType,
        error: error.message
      }, `Failed to publish event [${request.eventType}]: ${error.message}`);
    }
  }

  public subscribe(eventType: string, callback: EventCallback): void {
    const current = this.subscribers.get(eventType) || [];
    this.subscribers.set(eventType, [...current, callback]);
    logger.debug(`New subscription added for event: ${eventType}`);
  }

  async getEvents(organizationId: string) {
    return await this.eventRepo.findByOrg(organizationId);
  }

  async getAuditLog(organizationId: string) {
    return await this.auditRepo.findByOrg(organizationId);
  }

  async getNotifications(userId: number, organizationId: string) {
    return await this.notificationRepo.findByUser(userId, organizationId);
  }

  async markNotificationRead(notificationId: number) {
    await this.notificationRepo.markAsRead(notificationId);
  }

  async logSystemEvent(level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL', component: string, message: string, stackTrace?: string) {
    await this.systemRepo.create({
      level,
      component,
      message,
      stackTrace,
    });
  }
}
