import { NotificationSettings } from '../types/notification.types';
import logger from '../../../lib/logger';
import { getDb } from '../../../db/client.ts';
import { system_settings } from '../../../db/schema.ts';
import { eq } from 'drizzle-orm';

const SETTINGS_KEY = 'notification_settings';

const initialToken = process.env.TELEGRAM_BOT_TOKEN || '';
const initialChatId = process.env.TELEGRAM_CHAT_ID || '';

export function maskToken(token: string): string {
  if (!token) return '';
  if (token.length < 8) return '••••••••';
  return `${token.substring(0, 6)}••••${token.substring(token.length - 4)}`;
}

export function isMaskedToken(value: string): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  return (
    trimmed.includes('••••') ||
    trimmed.includes('****') ||
    /^[a-zA-Z0-9]{6}\.{3}[a-zA-Z0-9]{4}$/.test(trimmed)
  );
}

// Internal raw state (contains raw botToken)
let settingsState: {
  globalSystemNotifications: boolean;
  orderExecutionAlerts: boolean;
  telegramGatewayEnabled: boolean;
  telegramBotToken: string;
  telegramTargetChatId: string;
  tradeAlertsEnabled: boolean;
  dailyTradingSummaryEnabled: boolean;
  muteHoursEnabled: boolean;
  muteHoursStart: string;
  muteHoursEnd: string;
  connectionStatus: 'CONNECTED' | 'DISCONNECTED' | 'VERIFYING' | 'ERROR' | 'NOT_CONFIGURED' | 'INVALID_TOKEN';
  botName?: string;
  botId?: string;
  lastVerified?: string;
  lastDelivery?: string;
  deliveredToday: number;
  failedToday: number;
} = {
  globalSystemNotifications: true,
  orderExecutionAlerts: true,
  telegramGatewayEnabled: process.env.TELEGRAM_ENABLED !== 'false',
  telegramBotToken: initialToken,
  telegramTargetChatId: initialChatId,
  tradeAlertsEnabled: true,
  dailyTradingSummaryEnabled: true,
  muteHoursEnabled: false,
  muteHoursStart: '22:00',
  muteHoursEnd: '06:00',
  connectionStatus: 'NOT_CONFIGURED',
  botName: undefined,
  botId: undefined,
  lastVerified: undefined,
  lastDelivery: undefined,
  deliveredToday: 0,
  failedToday: 0
};

let dbLoaded = false;

async function syncWithDb() {
  if (dbLoaded) return;
  try {
    const db = getDb();
    if (!db) return;
    const records = await db.select().from(system_settings).where(eq(system_settings.key, SETTINGS_KEY));
    if (records.length > 0 && records[0].value) {
      const saved = records[0].value as any;
      if (typeof saved === 'object') {
        if (saved.globalSystemNotifications !== undefined) settingsState.globalSystemNotifications = Boolean(saved.globalSystemNotifications);
        if (saved.orderExecutionAlerts !== undefined) settingsState.orderExecutionAlerts = Boolean(saved.orderExecutionAlerts);
        if (saved.telegramGatewayEnabled !== undefined) settingsState.telegramGatewayEnabled = Boolean(saved.telegramGatewayEnabled);
        if (saved.telegramBotToken !== undefined && saved.telegramBotToken) settingsState.telegramBotToken = saved.telegramBotToken;
        if (saved.telegramTargetChatId !== undefined) settingsState.telegramTargetChatId = String(saved.telegramTargetChatId);
        if (saved.tradeAlertsEnabled !== undefined) settingsState.tradeAlertsEnabled = Boolean(saved.tradeAlertsEnabled);
        if (saved.dailyTradingSummaryEnabled !== undefined) settingsState.dailyTradingSummaryEnabled = Boolean(saved.dailyTradingSummaryEnabled);
        if (saved.muteHoursEnabled !== undefined) settingsState.muteHoursEnabled = Boolean(saved.muteHoursEnabled);
        if (saved.muteHoursStart !== undefined) settingsState.muteHoursStart = String(saved.muteHoursStart);
        if (saved.muteHoursEnd !== undefined) settingsState.muteHoursEnd = String(saved.muteHoursEnd);
        if (saved.connectionStatus !== undefined) settingsState.connectionStatus = saved.connectionStatus;
        if (saved.botName !== undefined) settingsState.botName = saved.botName;
        if (saved.botId !== undefined) settingsState.botId = saved.botId;
        if (saved.lastVerified !== undefined) settingsState.lastVerified = saved.lastVerified;
      }
    }
    dbLoaded = true;
  } catch (err) {
    // Non-blocking fallback for environment without active DB
  }
}

async function persistToDb() {
  try {
    const db = getDb();
    if (!db) return;
    const existing = await db.select().from(system_settings).where(eq(system_settings.key, SETTINGS_KEY));
    if (existing.length > 0) {
      await db.update(system_settings)
        .set({ value: settingsState as any, updatedAt: new Date() })
        .where(eq(system_settings.key, SETTINGS_KEY));
    } else {
      await db.insert(system_settings).values({
        key: SETTINGS_KEY,
        value: settingsState as any,
        updatedBy: 'SYSTEM'
      });
    }
  } catch (err) {
    // Non-blocking catch
  }
}

export class NotificationSettingsService {
  /**
   * Public settings getter - NEVER leaks raw botToken to API responses or frontend.
   */
  static getSettings(): NotificationSettings {
    syncWithDb().catch(() => {});
    const masked = maskToken(settingsState.telegramBotToken);

    return {
      globalSystemNotifications: settingsState.globalSystemNotifications,
      orderExecutionAlerts: settingsState.orderExecutionAlerts,
      telegramGatewayEnabled: settingsState.telegramGatewayEnabled,
      telegramBotToken: '', // Strip raw token for frontend security
      telegramTargetChatId: settingsState.telegramTargetChatId,
      tradeAlertsEnabled: settingsState.tradeAlertsEnabled,
      dailyTradingSummaryEnabled: settingsState.dailyTradingSummaryEnabled,
      muteHoursEnabled: settingsState.muteHoursEnabled,
      muteHoursStart: settingsState.muteHoursStart,
      muteHoursEnd: settingsState.muteHoursEnd,
      maskedBotToken: masked,
      connectionStatus: settingsState.connectionStatus,
      botName: settingsState.botName,
      botId: settingsState.botId,
      lastVerified: settingsState.lastVerified,
      lastDelivery: settingsState.lastDelivery,
      deliveredToday: settingsState.deliveredToday,
      failedToday: settingsState.failedToday,

      // Aliases
      telegramEnabled: settingsState.telegramGatewayEnabled,
      botToken: '',
      chatId: settingsState.telegramTargetChatId,
      tradingAlertsEnabled: settingsState.tradeAlertsEnabled,
      dailySummaryEnabled: settingsState.dailyTradingSummaryEnabled,
      notificationsEnabled: settingsState.globalSystemNotifications,
      notificationsOrderAlerts: settingsState.orderExecutionAlerts,
      muteHours: {
        enabled: settingsState.muteHoursEnabled,
        start: settingsState.muteHoursStart,
        end: settingsState.muteHoursEnd
      }
    };
  }

  /**
   * Internal backend getter with actual raw botToken for server-side Telegram API dispatches.
   */
  static getInternalSettings(): NotificationSettings & { rawBotToken: string } {
    syncWithDb().catch(() => {});
    const publicSettings = this.getSettings();
    return {
      ...publicSettings,
      telegramBotToken: settingsState.telegramBotToken,
      botToken: settingsState.telegramBotToken,
      rawBotToken: settingsState.telegramBotToken
    };
  }

  static updateSettings(partial: Record<string, any>): NotificationSettings {
    let tokenChanged = false;

    // Check bot token inputs (canonical or aliases)
    const incomingToken = partial.telegramBotToken !== undefined ? partial.telegramBotToken : partial.botToken;
    if (typeof incomingToken === 'string' && incomingToken.trim() !== '') {
      const trimmedToken = incomingToken.trim();
      // DO NOT overwrite stored raw token if incoming string is masked!
      if (!isMaskedToken(trimmedToken) && trimmedToken !== settingsState.telegramBotToken) {
        settingsState.telegramBotToken = trimmedToken;
        tokenChanged = true;
      }
    }

    // Check chat id inputs
    const incomingChatId = partial.telegramTargetChatId !== undefined ? partial.telegramTargetChatId : partial.chatId;
    if (typeof incomingChatId === 'string') {
      const trimmedChatId = incomingChatId.trim();
      if (trimmedChatId !== settingsState.telegramTargetChatId) {
        tokenChanged = true;
      }
      settingsState.telegramTargetChatId = trimmedChatId;
    }

    // Check boolean switches
    if (partial.globalSystemNotifications !== undefined) settingsState.globalSystemNotifications = Boolean(partial.globalSystemNotifications);
    if (partial.notificationsEnabled !== undefined) settingsState.globalSystemNotifications = Boolean(partial.notificationsEnabled);

    if (partial.orderExecutionAlerts !== undefined) settingsState.orderExecutionAlerts = Boolean(partial.orderExecutionAlerts);
    if (partial.notificationsOrderAlerts !== undefined) settingsState.orderExecutionAlerts = Boolean(partial.notificationsOrderAlerts);

    if (partial.telegramGatewayEnabled !== undefined) settingsState.telegramGatewayEnabled = Boolean(partial.telegramGatewayEnabled);
    if (partial.telegramEnabled !== undefined) settingsState.telegramGatewayEnabled = Boolean(partial.telegramEnabled);

    if (partial.tradeAlertsEnabled !== undefined) settingsState.tradeAlertsEnabled = Boolean(partial.tradeAlertsEnabled);
    if (partial.tradingAlertsEnabled !== undefined) settingsState.tradeAlertsEnabled = Boolean(partial.tradingAlertsEnabled);

    if (partial.dailyTradingSummaryEnabled !== undefined) settingsState.dailyTradingSummaryEnabled = Boolean(partial.dailyTradingSummaryEnabled);
    if (partial.dailySummaryEnabled !== undefined) settingsState.dailyTradingSummaryEnabled = Boolean(partial.dailySummaryEnabled);

    // Mute Hours
    if (partial.muteHoursEnabled !== undefined) settingsState.muteHoursEnabled = Boolean(partial.muteHoursEnabled);
    if (partial.telegramMuteHoursEnabled !== undefined) settingsState.muteHoursEnabled = Boolean(partial.telegramMuteHoursEnabled);
    if (partial.muteHoursStart !== undefined) settingsState.muteHoursStart = String(partial.muteHoursStart);
    if (partial.telegramMuteStart !== undefined) settingsState.muteHoursStart = String(partial.telegramMuteStart);
    if (partial.muteHoursEnd !== undefined) settingsState.muteHoursEnd = String(partial.muteHoursEnd);
    if (partial.telegramMuteEnd !== undefined) settingsState.muteHoursEnd = String(partial.telegramMuteEnd);

    if (partial.muteHours && typeof partial.muteHours === 'object') {
      if (partial.muteHours.enabled !== undefined) settingsState.muteHoursEnabled = Boolean(partial.muteHours.enabled);
      if (partial.muteHours.start !== undefined) settingsState.muteHoursStart = String(partial.muteHours.start);
      if (partial.muteHours.end !== undefined) settingsState.muteHoursEnd = String(partial.muteHours.end);
    }

    // Connection Status
    if (partial.connectionStatus) {
      settingsState.connectionStatus = partial.connectionStatus;
    } else if (tokenChanged && settingsState.connectionStatus === 'CONNECTED') {
      settingsState.connectionStatus = 'NOT_CONFIGURED';
    }

    if (partial.botName !== undefined) settingsState.botName = partial.botName;
    if (partial.botId !== undefined) settingsState.botId = partial.botId;
    if (partial.lastVerified !== undefined) settingsState.lastVerified = partial.lastVerified;

    persistToDb().catch(() => {});
    logger.info({ gatewayEnabled: settingsState.telegramGatewayEnabled, chatId: settingsState.telegramTargetChatId }, 'Notification Settings Updated');
    return this.getSettings();
  }

  static disconnectTelegram(): NotificationSettings {
    settingsState.telegramBotToken = '';
    settingsState.telegramTargetChatId = '';
    settingsState.connectionStatus = 'NOT_CONFIGURED';
    settingsState.botName = undefined;
    settingsState.botId = undefined;
    settingsState.lastVerified = undefined;

    persistToDb().catch(() => {});
    logger.info('Telegram Disconnected and credentials cleared from backend state');
    return this.getSettings();
  }

  static incrementDelivered() {
    settingsState.deliveredToday += 1;
    settingsState.lastDelivery = new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' });
    persistToDb().catch(() => {});
  }

  static incrementFailed() {
    settingsState.failedToday += 1;
    persistToDb().catch(() => {});
  }

  /**
   * Deterministic Mute Hours check bound to canonical ARINA timezone: Asia/Kolkata
   */
  static isMuteHoursActive(): boolean {
    if (!settingsState.muteHoursEnabled || !settingsState.muteHoursStart || !settingsState.muteHoursEnd) {
      return false;
    }

    try {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      };
      const formatter = new Intl.DateTimeFormat('en-GB', options);
      const parts = formatter.formatToParts(now);

      let hourStr = '00';
      let minStr = '00';
      for (const p of parts) {
        if (p.type === 'hour') hourStr = p.value;
        if (p.type === 'minute') minStr = p.value;
      }

      const currentMinutes = parseInt(hourStr, 10) * 60 + parseInt(minStr, 10);

      const [startH, startM] = settingsState.muteHoursStart.split(':').map(n => parseInt(n, 10));
      const [endH, endM] = settingsState.muteHoursEnd.split(':').map(n => parseInt(n, 10));

      const startMin = (startH || 0) * 60 + (startM || 0);
      const endMin = (endH || 0) * 60 + (endM || 0);

      if (startMin === endMin) return false;

      if (startMin < endMin) {
        return currentMinutes >= startMin && currentMinutes < endMin;
      } else {
        // Overnight range e.g. 22:00 to 06:00
        return currentMinutes >= startMin || currentMinutes < endMin;
      }
    } catch (err) {
      return false;
    }
  }
}
