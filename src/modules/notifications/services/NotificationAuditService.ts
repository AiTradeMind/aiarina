import { NotificationAuditLog, NotificationQueueItem } from '../types/notification.types';

let auditLogs: NotificationAuditLog[] = [
  {
    id: 'AUD-2026-901',
    notificationId: 'TG-Q-2026-101',
    tradeId: 'TRD-2026-8821',
    notificationType: 'TRADE_ALERT',
    channel: 'TELEGRAM',
    createdTime: '10:14:22 AM',
    deliveredTime: '10:14:23 AM',
    retryCount: 0,
    telegramResponse: '200 OK (Telegram Message ID: #984210)',
    deliveryStatus: 'Delivered',
    latencyMs: 142
  },
  {
    id: 'AUD-2026-900',
    notificationId: 'TG-Q-2026-100',
    tradeId: undefined,
    notificationType: 'DAILY_SUMMARY',
    channel: 'TELEGRAM',
    createdTime: '09:00:00 AM',
    deliveredTime: '09:00:02 AM',
    retryCount: 0,
    telegramResponse: '200 OK (Telegram Message ID: #984199)',
    deliveryStatus: 'Delivered',
    latencyMs: 210
  }
];

export class NotificationAuditService {
  static recordAudit(item: NotificationQueueItem, latencyMs: number = 150): NotificationAuditLog {
    const auditRecord: NotificationAuditLog = {
      id: `AUD-2026-${Math.floor(100 + Math.random() * 900)}`,
      notificationId: item.id,
      tradeId: item.tradeId,
      notificationType: item.notificationType,
      channel: item.channel,
      createdTime: item.createdTime,
      deliveredTime: item.deliveredTime || new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      retryCount: item.retryCount,
      telegramResponse: item.telegramResponse || '200 OK',
      deliveryStatus: item.state,
      latencyMs
    };

    auditLogs.unshift(auditRecord);
    return auditRecord;
  }

  static getAuditLogs(): NotificationAuditLog[] {
    return auditLogs;
  }
}
