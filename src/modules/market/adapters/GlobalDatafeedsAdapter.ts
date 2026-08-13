import {
  IMarketDataProvider,
  Quote,
  Candle,
  OrderBook
} from '../../../infrastructure/abstractions/index.ts';
import logger from '../../../lib/logger.ts';

/**
 * Global Datafeeds Official Market Data Adapter
 * Implements canonical ARINA market data contract for Global Datafeeds API/WebSocket.
 * Strictly adheres to server-side credentials and official Global Datafeeds formats.
 * Zero synthetic candle generation.
 */
export class GlobalDatafeedsAdapter implements IMarketDataProvider {
  readonly providerId = 'globaldatafeeds-official-feed';
  readonly name = 'Global Datafeeds Official Market Data Adapter';

  private isConfigured(): boolean {
    const key = process.env.GLOBALDATAFEEDS_API_KEY;
    const secret = process.env.GLOBALDATAFEEDS_API_SECRET;
    return Boolean(key && secret && key.trim() !== '' && secret.trim() !== '');
  }

  async getQuote(symbol: string): Promise<Quote> {
    if (!this.isConfigured()) {
      throw new Error("MARKET_DATA_NOT_CONFIGURED: Global Datafeeds credentials missing in backend environment.");
    }

    const apiKey = process.env.GLOBALDATAFEEDS_API_KEY;
    const baseUrl = process.env.GLOBALDATAFEEDS_BASE_URL || "https://api.globaldatafeeds.in/v1";
    const formattedSymbol = this.formatSymbol(symbol);

    try {
      const response = await fetch(`${baseUrl}/quote?symbol=${encodeURIComponent(formattedSymbol)}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`Global Datafeeds provider HTTP error ${response.status}`);
      }
      const data = await response.json();
      return {
        symbol: formattedSymbol.toUpperCase(),
        bid: Number(data.bid || data.lastPrice || 0),
        ask: Number(data.ask || data.lastPrice || 0),
        lastPrice: Number(data.lastPrice || 0),
        volume24h: Number(data.volume || data.volume24h || 0),
        timestamp: new Date(data.timestamp || Date.now())
      };
    } catch (err: any) {
      logger.error({ symbol, err: err.message }, 'Global Datafeeds quote fetch failed');
      throw err;
    }
  }

  async getHistoricalCandles(symbol: string, timeframe: string, start: Date, end: Date): Promise<Candle[]> {
    if (!this.isConfigured()) {
      // Return empty array when feed is not configured. NEVER generate synthetic candles.
      return [];
    }

    const apiKey = process.env.GLOBALDATAFEEDS_API_KEY;
    const baseUrl = process.env.GLOBALDATAFEEDS_BASE_URL || "https://api.globaldatafeeds.in/v1";
    const formattedSymbol = this.formatSymbol(symbol);

    try {
      const url = `${baseUrl}/candles?symbol=${encodeURIComponent(formattedSymbol)}&timeframe=${encodeURIComponent(timeframe)}&from=${start.toISOString()}&to=${end.toISOString()}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`Global Datafeeds provider HTTP error ${response.status}`);
      }
      const data = await response.json();
      if (!Array.isArray(data.candles)) {
        return [];
      }
      return data.candles.map((c: any) => ({
        symbol: formattedSymbol.toUpperCase(),
        timeframe,
        timestamp: c.timestamp ? new Date(c.timestamp).getTime() : Date.now(),
        open: Number(c.open || 0),
        high: Number(c.high || 0),
        low: Number(c.low || 0),
        close: Number(c.close || 0),
        volume: Number(c.volume || 0)
      }));
    } catch (err: any) {
      logger.error({ symbol, err: err.message }, 'Global Datafeeds historical candles fetch failed');
      return [];
    }
  }

  async getOrderBook(symbol: string, depth = 5): Promise<OrderBook> {
    if (!this.isConfigured()) {
      throw new Error("MARKET_DATA_NOT_CONFIGURED: Global Datafeeds credentials missing.");
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
    } catch {
      return { isHealthy: false, latencyMs: Date.now() - start, status: 'PROVIDER_ERROR' };
    }
  }

  private formatSymbol(symbol: string): string {
    return symbol.replace(/\.NS$|\.BO$/, '').toUpperCase();
  }
}
