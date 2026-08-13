import { TradeAlertPayload, DailySummaryPayload } from '../types/notification.types';

export class NotificationDispatcher {
  /**
   * Format Trade Alert HTML string adhering strictly to allowed fields.
   * Internal logic/AI parameters are strictly stripped.
   */
  static formatTradeAlert(payload: TradeAlertPayload): { formattedText: string; sanitizedFields: string[] } {
    const formattedText = [
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

    const sanitizedFields = [
      'Trade Status', 'Exchange', 'Market Type', 'Instrument Name',
      'Quantity', 'Entry Price', 'Exit Price', 'Current PnL', 'Final PnL',
      'Trade Time', 'Trade ID'
    ];

    return { formattedText, sanitizedFields };
  }

  /**
   * Format Daily Performance Report HTML string.
   */
  static formatDailySummary(payload: DailySummaryPayload): { formattedText: string; sanitizedFields: string[] } {
    const formattedText = [
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

    const sanitizedFields = [
      'Date', 'Total Trades', 'Winning Trades', 'Losing Trades', 'Win Rate %',
      'Net PnL', 'Gross Profit', 'Gross Loss', 'Opening Capital', 'Closing Capital',
      'Market Breakdown', 'Trading Status'
    ];

    return { formattedText, sanitizedFields };
  }
}
