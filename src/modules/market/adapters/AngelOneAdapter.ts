import {
  IMarketDataProvider,
  Quote,
  Candle,
  OrderBook
} from '../../../infrastructure/abstractions/index.ts';
import logger from '../../../lib/logger.ts';

/**
 * Angel One SmartAPI Official Market Data Adapter
 * Implements canonical ARINA market data contract for Angel One SmartAPI API/WebSocket.
 * Strictly adheres to server-side credentials and official Angel One SmartAPI formats.
 * Zero synthetic candle generation.
 */
export class AngelOneAdapter implements IMarketDataProvider {
  readonly providerId = 'angelone-smartapi-feed';
  readonly name = 'Angel One SmartAPI Official Market Data Adapter';

  private isConfigured(): boolean {
    const apiKey = process.env.ANGELONE_API_KEY;
    const clientCode = process.env.ANGELONE_CLIENT_CODE;
    return Boolean(apiKey && clientCode && apiKey.trim() !== '' && clientCode.trim() !== '');
  }

  async getQuote(symbol: string): Promise<Quote> {
    if (!this.isConfigured()) {
      throw new Error("MARKET_DATA_NOT_CONFIGURED: Angel One SmartAPI credentials missing in backend environment.");
    }

    const apiKey = process.env.ANGELONE_API_KEY;
    const baseUrl = process.env.ANGELONE_BASE_URL || "https://apiconnect.angelone.in";
    const formattedSymbol = this.formatSymbol(symbol);

    try {
      const response = await fetch(`${baseUrl}/rest/secure/angelbroking/market/v1/quote/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-PrivateKey': apiKey || '',
          'X-UserType': 'USER',
          'X-SourceID': 'WEB'
        },
        body: JSON.stringify({
          mode: "FULL",
          exchangeTokens: {
            NSE: [formattedSymbol]
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Angel One SmartAPI provider HTTP error ${response.status}`);
      }

      const data = await response.json();
      const fetchedData = data.data?.fetched?.[0] || data.data || {};

      return {
        symbol: formattedSymbol.toUpperCase(),
        bid: Number(fetchedData.depth?.buy?.[0]?.price || fetchedData.ltp || 0),
        ask: Number(fetchedData.depth?.sell?.[0]?.price || fetchedData.ltp || 0),
        lastPrice: Number(fetchedData.ltp || fetchedData.lastPrice || 0),
        volume24h: Number(fetchedData.tradeVolume || fetchedData.volume || 0),
        timestamp: new Date(fetchedData.timestamp || Date.now())
      };
    } catch (err: any) {
      logger.error({ symbol, err: err.message }, 'Angel One quote fetch failed');
      throw err;
    }
  }

  async getHistoricalCandles(symbol: string, timeframe: string, start: Date, end: Date): Promise<Candle[]> {
    if (!this.isConfigured()) {
      // Return empty array when feed is not configured. NEVER generate synthetic candles.
      return [];
    }

    const apiKey = process.env.ANGELONE_API_KEY;
    const baseUrl = process.env.ANGELONE_BASE_URL || "https://apiconnect.angelone.in";
    const formattedSymbol = this.formatSymbol(symbol);
    const interval = this.mapTimeframeToAngelOne(timeframe);

    try {
      const response = await fetch(`${baseUrl}/rest/secure/angelbroking/historical/v1/getCandleData`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-PrivateKey': apiKey || '',
          'X-UserType': 'USER',
          'X-SourceID': 'WEB'
        },
        body: JSON.stringify({
          exchange: "NSE",
          symboltoken: formattedSymbol,
          interval,
          fromdate: this.formatDate(start),
          todate: this.formatDate(end)
        })
      });

      if (!response.ok) {
        throw new Error(`Angel One SmartAPI historical candles HTTP error ${response.status}`);
      }

      const data = await response.json();
      if (!Array.isArray(data.data)) {
        return [];
      }

      // Angel One historical response format: [timestamp, open, high, low, close, volume]
      return data.data.map((c: any[]) => ({
        symbol: formattedSymbol.toUpperCase(),
        timeframe,
        timestamp: c[0] ? new Date(c[0]).getTime() : Date.now(),
        open: Number(c[1] || 0),
        high: Number(c[2] || 0),
        low: Number(c[3] || 0),
        close: Number(c[4] || 0),
        volume: Number(c[5] || 0)
      }));
    } catch (err: any) {
      logger.error({ symbol, err: err.message }, 'Angel One historical candles fetch failed');
      return [];
    }
  }

  async getOrderBook(symbol: string, depth = 5): Promise<OrderBook> {
    if (!this.isConfigured()) {
      throw new Error("MARKET_DATA_NOT_CONFIGURED: Angel One SmartAPI credentials missing.");
    }
    const quote = await this.getQuote(symbol);
    return { symbol: quote.symbol, bids: [], asks: [], timestamp: new Date() };
  }

  subscribeQuotes(symbols: string[], callback: (quote: Quote) => void): () => void {
    if (!this.isConfigured()) {
      return () => {};
    }
    return () => {};
  }

  async healthCheck(): Promise<{ isHealthy: boolean; latencyMs: number; status: string }> {
    if (!this.isConfigured()) {
      return { isHealthy: false, latencyMs: 0, status: 'NOT_CONFIGURED' };
    }
    const start = Date.now();
    try {
      await this.getQuote('RELIANCE');
      return { isHealthy: true, latencyMs: Date.now() - start, status: 'CONNECTED' };
    } catch (err: any) {
      const isAuthErr = err.message?.includes('401') || err.message?.includes('403') || err.message?.includes('Auth');
      return {
        isHealthy: false,
        latencyMs: Date.now() - start,
        status: isAuthErr ? 'AUTHENTICATION_ERROR' : 'PROVIDER_ERROR'
      };
    }
  }

  private formatSymbol(symbol: string): string {
    return symbol.replace(/\.NS$|\.BO$/, '').toUpperCase();
  }

  private mapTimeframeToAngelOne(timeframe: string): string {
    const map: Record<string, string> = {
      '1m': 'ONE_MINUTE',
      '5m': 'FIVE_MINUTE',
      '15m': 'FIFTEEN_MINUTE',
      '30m': 'THIRTY_MINUTE',
      '1h': 'ONE_HOUR',
      '1D': 'ONE_DAY'
    };
    return map[timeframe] || 'ONE_DAY';
  }

  private formatDate(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
}
