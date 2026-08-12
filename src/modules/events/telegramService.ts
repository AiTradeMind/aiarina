import logger from '../../lib/logger';
import { NotificationSettingsService, maskToken } from '../notifications/services/NotificationSettingsService';
import { NotificationEngine } from '../notifications/services/NotificationEngine';
import { NotificationQueue } from '../notifications/services/NotificationQueue';
import { TradeAlertPayload, DailySummaryPayload } from '../notifications/types/notification.types';

export interface TelegramConfig {
  enabled: boolean;
  botToken: string; // Masked when returned to UI
  chatId: string;
  tradingAlertsEnabled: boolean;
  dailySummaryEnabled: boolean;
  muteHours: {
    enabled: boolean;
    start: string; // e.g. "22:00"
    end: string;   // e.g. "06:00"
  };
  lastUpdated: string;
}

export { maskToken };

// GET CONFIG
export function getTelegramConfig(): TelegramConfig & { maskedBotToken: string } {
  const settings = NotificationSettingsService.getSettings();
  return {
    enabled: settings.telegramGatewayEnabled,
    botToken: '',
    maskedBotToken: settings.maskedBotToken,
    chatId: settings.telegramTargetChatId,
    tradingAlertsEnabled: settings.tradeAlertsEnabled,
    dailySummaryEnabled: settings.dailyTradingSummaryEnabled,
    muteHours: {
      enabled: settings.muteHoursEnabled,
      start: settings.muteHoursStart,
      end: settings.muteHoursEnd
    },
    lastUpdated: settings.lastVerified || new Date().toISOString()
  };
}

// UPDATE CONFIG
export function updateTelegramConfig(newConfig: Partial<TelegramConfig>): TelegramConfig & { maskedBotToken: string } {
  NotificationSettingsService.updateSettings({
    telegramGatewayEnabled: newConfig.enabled,
    botToken: newConfig.botToken,
    chatId: newConfig.chatId,
    tradeAlertsEnabled: newConfig.tradingAlertsEnabled,
    dailyTradingSummaryEnabled: newConfig.dailySummaryEnabled,
    muteHours: newConfig.muteHours
  });
  return getTelegramConfig();
}

// FORMAT TRADE ALERT
export function formatTradeAlertText(payload: TradeAlertPayload): { text: string; fields: string[] } {
  const text = [
    `🚨 <b>AI ARINA TRADE ALERT</b>`,
    ``,
    `• <b>Trade Status:</b> ${payload.status} Executed`,
    `• <b>Exchange:</b> ${payload.exchange}`,
    `• <b>Market Type:</b> ${payload.marketType}`,
    `• <b>Instrument:</b> ${payload.instrumentName}`,
    `• <b>Quantity:</b> ${payload.quantity}`,
    `• <b>Entry Price:</b> ₹${payload.entryPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
    `• <b>Exit Price:</b> ${payload.exitPrice ? `₹${payload.exitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'N/A'}`,
    `• <b>Current P&L:</b> ${payload.currentPnl !== undefined ? `${payload.currentPnl >= 0 ? '+' : ''}₹${payload.currentPnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'N/A'}`,
    `• <b>Final P&L:</b> ${payload.finalPnl !== undefined ? `${payload.finalPnl >= 0 ? '+' : ''}₹${payload.finalPnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'N/A'}`,
    `• <b>Trade Time:</b> ${payload.tradeTime}`,
    `• <b>Trade ID:</b> ${payload.tradeId}`
  ].join('\n');

  const fields = [
    'Trade Status', 'Exchange', 'Market Type', 'Instrument Name',
    'Quantity', 'Entry Price', 'Exit Price', 'Current PnL', 'Final PnL',
    'Trade Time', 'Trade ID'
  ];

  return { text, fields };
}

// FORMAT DAILY SUMMARY
export function formatDailySummaryText(payload: DailySummaryPayload): { text: string; fields: string[] } {
  const text = [
    `📊 <b>AI ARINA DAILY TRADING SUMMARY</b>`,
    ``,
    `• <b>Date:</b> ${payload.date}`,
    `• <b>Total Trades:</b> ${payload.totalTrades}`,
    `• <b>Winning Trades:</b> ${payload.winningTrades}`,
    `• <b>Losing Trades:</b> ${payload.losingTrades}`,
    `• <b>Win Rate:</b> ${payload.winRatePct.toFixed(1)}%`,
    `• <b>Net P&L:</b> ${payload.netPnl >= 0 ? '+' : ''}$${payload.netPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    `• <b>Gross Profit:</b> +$${payload.grossProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    `• <b>Gross Loss:</b> -$${Math.abs(payload.grossLoss).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    `• <b>Opening Capital:</b> $${payload.openingCapital.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    `• <b>Closing Capital:</b> $${payload.closingCapital.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    ``,
    `<b>Market Breakdown:</b>`,
    `- Equity: ${payload.marketBreakdown.equity}`,
    `- ETF: ${payload.marketBreakdown.etf}`,
    `- Index: ${payload.marketBreakdown.index}`,
    `- Futures: ${payload.marketBreakdown.futures}`,
    `- Options: ${payload.marketBreakdown.options}`,
    `- Commodity: ${payload.marketBreakdown.commodity}`,
    ``,
    `• <b>Trading Status:</b> ${payload.tradingStatus}`
  ].join('\n');

  const fields = [
    'Date', 'Total Trades', 'Winning Trades', 'Losing Trades', 'Win Rate %',
    'Net PnL', 'Gross Profit', 'Gross Loss', 'Opening Capital', 'Closing Capital',
    'Market Breakdown', 'Trading Status'
  ];

  return { text, fields };
}

// QUEUE TELEGRAM NOTIFICATION
export async function queueTelegramNotification(
  type: 'TRADE_ALERT' | 'DAILY_SUMMARY' | 'TEST_NOTIFICATION',
  messageText: string,
  sanitizedFields: string[],
  tradeId?: string
) {
  if (type === 'TEST_NOTIFICATION') {
    return NotificationEngine.dispatchTestNotification();
  } else if (type === 'TRADE_ALERT') {
    return NotificationEngine.dispatchTradeAlert({
      tradeId: tradeId || `TRD-${Date.now()}`,
      status: 'BUY',
      exchange: 'NSE',
      marketType: 'Equity',
      instrumentName: 'ALERT',
      quantity: 1,
      entryPrice: 100,
      tradeTime: new Date().toLocaleTimeString('en-US')
    });
  } else {
    return NotificationEngine.dispatchDailySummary({
      date: new Date().toISOString().split('T')[0],
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRatePct: 0,
      netPnl: 0,
      grossProfit: 0,
      grossLoss: 0,
      openingCapital: 100000,
      closingCapital: 100000,
      marketBreakdown: { equity: 0, etf: 0, index: 0, futures: 0, options: 0, commodity: 0 },
      tradingStatus: 'OFFLINE'
    });
  }
}

// RETRY QUEUED NOTIFICATION
export async function retryQueuedNotification(id: string) {
  return await NotificationQueue.retryItem(id);
}

// GET QUEUE AUDIT
export function getNotificationQueue() {
  return NotificationQueue.getQueue();
}
