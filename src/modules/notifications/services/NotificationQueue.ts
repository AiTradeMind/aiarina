import { NotificationQueueItem, QueueState, NotificationType } from '../types/notification.types';
import { TelegramProvider } from './TelegramProvider';
import { NotificationAuditService } from './NotificationAuditService';
import { NotificationSettingsService } from './NotificationSettingsService';
import logger from '../../../lib/logger';

let queueState: NotificationQueueItem[] = [];

export class NotificationQueue {
  static enqueue(item: Omit<NotificationQueueItem, 'id' | 'state' | 'retryCount' | 'maxRetries' | 'createdTime' | 'scheduledTime'>): NotificationQueueItem {
    const queueItem: NotificationQueueItem = {
      ...item,
      id: `TG-Q-2026-${Math.floor(100 + Math.random() * 900)}`,
      state: 'Pending',
      retryCount: 0,
      maxRetries: 3,
      createdTime: new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      scheduledTime: new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    queueState.unshift(queueItem);

    // Asynchronously trigger queue processing without blocking execution
    setTimeout(() => {
      this.processItem(queueItem.id).catch(err => {
        logger.error({ error: err.message }, 'Non-blocking queue dispatch error');
      });
    }, 10);

    return queueItem;
  }

  static async processItem(id: string): Promise<NotificationQueueItem | null> {
    const item = queueState.find(q => q.id === id);
    if (!item) return null;

    item.state = 'Processing';
    const startTime = Date.now();

    // Dispatch via Telegram Provider
    const result = await TelegramProvider.sendMessage(item.formattedText);
    const latency = Date.now() - startTime;

    item.httpStatusCode = result.httpStatus;
    item.latencyMs = latency;

    if (result.ok) {
      item.state = 'Delivered';
      item.deliveredTime = new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      item.telegramMessageId = result.messageId;
      item.telegramResponse = `200 OK (Telegram Message ID: #${result.messageId})`;
      
      NotificationSettingsService.incrementDelivered();
      NotificationAuditService.recordAudit(item, latency);
      logger.info({ id: item.id }, 'Notification Delivered Successfully');
    } else {
      item.retryCount += 1;
      if (item.retryCount <= item.maxRetries) {
        item.state = 'Retry';
        item.telegramResponse = `Attempt ${item.retryCount} Failed: ${result.description}`;
        logger.warn({ id: item.id, attempt: item.retryCount }, 'Notification delivery failed, scheduled for retry');
      } else {
        item.state = 'Failed';
        item.errorMessage = result.description;
        item.telegramResponse = `FAILED (Max Retries Reached): ${result.description}`;
        
        NotificationSettingsService.incrementFailed();
        NotificationAuditService.recordAudit(item, latency);
        logger.error({ id: item.id }, 'Notification Moved to Failed Queue after max retries');
      }
    }

    return item;
  }

  static async retryItem(id: string): Promise<NotificationQueueItem | null> {
    const item = queueState.find(q => q.id === id);
    if (!item) return null;

    item.state = 'Processing';
    return await this.processItem(id);
  }

  static getQueue(): NotificationQueueItem[] {
    return queueState;
  }

  static getMetrics() {
    const settings = NotificationSettingsService.getSettings();
    const pending = queueState.filter(q => q.state === 'Pending' || q.state === 'Processing').length;
    const retry = queueState.filter(q => q.state === 'Retry').length;
    const delivered = queueState.filter(q => q.state === 'Delivered').length;
    const failed = queueState.filter(q => q.state === 'Failed').length;

    const latencies = queueState.filter(q => q.latencyMs !== undefined).map(q => q.latencyMs!);
    const avgLatency = latencies.length > 0 ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 145;

    return {
      telegramStatus: settings.connectionStatus === 'CONNECTED' ? 'CONNECTED' : settings.connectionStatus === 'ERROR' ? 'ERROR' : settings.connectionStatus === 'NOT_CONFIGURED' ? 'NOT_CONFIGURED' : 'DISCONNECTED',
      queueSize: queueState.length,
      pendingCount: pending,
      deliveredToday: settings.deliveredToday || delivered,
      failedToday: settings.failedToday || failed,
      avgDeliveryTimeMs: avgLatency,
      retryQueueSize: retry
    };
  }
}
