import { NotificationSettingsService } from './NotificationSettingsService';
import logger from '../../../lib/logger';

export class TelegramProvider {
  /**
   * Verify Telegram Bot connection using getMe endpoint.
   */
  static async verifyConnection(): Promise<{ ok: boolean; botName?: string; botId?: string; description?: string; status?: string }> {
    const settings = NotificationSettingsService.getInternalSettings();
    const token = settings.rawBotToken;

    if (!settings.telegramGatewayEnabled) {
      NotificationSettingsService.updateSettings({ connectionStatus: 'NOT_CONFIGURED' });
      return { ok: false, description: 'Telegram Gateway is Disabled (NOT_CONFIGURED)', status: 'NOT_CONFIGURED' };
    }

    if (!token) {
      NotificationSettingsService.updateSettings({ connectionStatus: 'NOT_CONFIGURED' });
      return { ok: false, description: 'Telegram Bot Token is missing', status: 'NOT_CONFIGURED' };
    }

    try {
      const url = `https://api.telegram.org/bot${token}/getMe`;
      const response = await fetch(url);
      const data = await response.json() as any;

      if (response.ok && data.ok) {
        const botUsername = `@${data.result?.username || 'ArinaBot'}`;
        const botId = `${data.result?.id || 'Unknown'}`;
        const now = new Date().toISOString();
        NotificationSettingsService.updateSettings({
          connectionStatus: 'CONNECTED',
          botName: botUsername,
          botId: botId,
          lastVerified: now
        });
        return { ok: true, botName: botUsername, botId: botId, status: 'CONNECTED' };
      } else {
        NotificationSettingsService.updateSettings({ connectionStatus: 'INVALID_TOKEN' });
        return { ok: false, description: data.description || 'Invalid Telegram Bot Token', status: 'INVALID_TOKEN' };
      }
    } catch (error: any) {
      logger.error({ error: error.message }, 'Telegram getMe verification failed');
      NotificationSettingsService.updateSettings({ connectionStatus: 'ERROR' });
      return { ok: false, description: error.message || 'Network exception during verification', status: 'ERROR' };
    }
  }

  /**
   * Send formatted message via Telegram sendMessage API.
   */
  static async sendMessage(text: string): Promise<{ ok: boolean; messageId?: number; httpStatus: number; description?: string; isMuted?: boolean }> {
    const settings = NotificationSettingsService.getInternalSettings();
    const token = settings.rawBotToken;
    const chatId = settings.telegramTargetChatId || settings.chatId;

    if (!settings.telegramGatewayEnabled) {
      return { ok: false, httpStatus: 400, description: 'Telegram Gateway is Disabled (NOT_CONFIGURED)' };
    }

    if (NotificationSettingsService.isMuteHoursActive()) {
      logger.info('Telegram message suppressed due to Mute Hours (Asia/Kolkata)');
      return { ok: false, httpStatus: 200, description: 'Suppressed due to Mute Hours (Asia/Kolkata)', isMuted: true };
    }

    if (!token || !chatId) {
      return { ok: false, httpStatus: 400, description: 'Telegram Setup Required: Missing Bot Token or Chat ID' };
    }

    try {
      const url = `https://api.telegram.org/bot${token}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'HTML'
        })
      });

      const data = await response.json() as any;

      if (response.ok && data.ok) {
        return {
          ok: true,
          messageId: data.result?.message_id,
          httpStatus: 200,
          description: '200 OK Delivered'
        };
      } else {
        return {
          ok: false,
          httpStatus: response.status || 400,
          description: data.description || 'Telegram API sendMessage failure'
        };
      }
    } catch (error: any) {
      logger.error({ error: error.message }, 'Telegram sendMessage network exception');
      return {
        ok: false,
        httpStatus: 500,
        description: `Network Exception: ${error.message}`
      };
    }
  }
}
