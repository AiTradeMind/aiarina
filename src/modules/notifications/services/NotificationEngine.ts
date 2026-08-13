import { TradeAlertPayload, DailySummaryPayload, NotificationQueueItem } from '../types/notification.types';
import { NotificationDispatcher } from './NotificationDispatcher';
import { NotificationQueue } from './NotificationQueue';
import { NotificationSettingsService } from './NotificationSettingsService';
import { NotificationAuditService } from './NotificationAuditService';
import { TelegramProvider } from './TelegramProvider';

export class NotificationEngine {
  /**
   * Dispatch Trade Alert (BUY, SELL, EXIT, REJECTED).
   * Non-blocking: enters Queue immediately, returns queue item without waiting for Telegram.
   */
  static dispatchTradeAlert(payload: TradeAlertPayload): NotificationQueueItem {
    const { formattedText, sanitizedFields } = NotificationDispatcher.formatTradeAlert(payload);

    return NotificationQueue.enqueue({
      notificationType: 'TRADE_ALERT',
      channel: 'TELEGRAM',
      tradeId: payload.tradeId,
      payload,
      formattedText,
      sanitizedFields
    });
  }

  /**
   * Dispatch Daily Trading Summary.
   * Non-blocking queue entry.
   */
  static dispatchDailySummary(payload: DailySummaryPayload): NotificationQueueItem {
    const { formattedText, sanitizedFields } = NotificationDispatcher.formatDailySummary(payload);

    return NotificationQueue.enqueue({
      notificationType: 'DAILY_SUMMARY',
      channel: 'TELEGRAM',
      payload,
      formattedText,
      sanitizedFields
    });
  }

  /**
   * Dispatch Test Connection Notification.
   */
  static dispatchTestNotification(): NotificationQueueItem {
    const settings = NotificationSettingsService.getSettings();
    const botName = settings.botName || 'Telegram Bot';
    const text = [
      `✅ <b>AI ARINA Telegram Connected Successfully</b>`,
      ``,
      `• <b>Bot Username:</b> ${botName}`,
      `• <b>Protocol:</b> HTTPS Telegram Bot API`,
      `• <b>Timestamp:</b> ${new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })}`,
      `• <b>Status:</b> 200 OK Connection Verified`
    ].join('\n');

    return NotificationQueue.enqueue({
      notificationType: 'TEST_NOTIFICATION',
      channel: 'TELEGRAM',
      payload: { message: '✅ AI ARINA Telegram Connected Successfully' },
      formattedText: text,
      sanitizedFields: ['Bot Username', 'Protocol', 'Timestamp', 'Status']
    });
  }

  static getHealthMetrics() {
    return NotificationQueue.getMetrics();
  }

  static getAuditHistory() {
    return NotificationAuditService.getAuditLogs();
  }

  static getQueue() {
    return NotificationQueue.getQueue();
  }

  static getSettings() {
    return NotificationSettingsService.getSettings();
  }

  static updateSettings(partial: any) {
    return NotificationSettingsService.updateSettings(partial);
  }

  static async verifyTelegramConnection() {
    return await TelegramProvider.verifyConnection();
  }
}
