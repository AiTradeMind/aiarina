import { Quote, Candle, IMarketDataProvider } from "../../../infrastructure/abstractions";
import logger from "../../../lib/logger";

/**
 * BSE Official Real-Time Market Data Adapter
 * Strictly adheres to BSE data format, INR currency (₹), and explicit exchange origin (BSE -> ARINA).
 * Operates ONLY when authorized provider credentials exist in the environment.
 * Zero synthetic or fake candle generation.
 */
export class BSEDataAdapter implements IMarketDataProvider {
  readonly providerId = 'bse-official-feed';
  readonly name = 'BSE Official Real-Time Market Data Adapter';

  private activeSubscriptions: Map<string, Set<(quote: Quote) => void>> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();

  private isConfigured(): boolean {
    const key = process.env.BSE_MARKET_DATA_API_KEY;
    const secret = process.env.BSE_MARKET_DATA_API_SECRET;
    return Boolean(key && secret && key.trim() !== '' && secret.trim() !== '');
  }

  async getQuote(symbol: string): Promise<Quote> {
    if (!this.isConfigured()) {
      throw new Error("MARKET_DATA_NOT_CONFIGURED: Authorized BSE market data credentials missing in backend environment.");
    }

    const apiKey = process.env.BSE_MARKET_DATA_API_KEY;
    const baseUrl = process.env.BSE_MARKET_DATA_BASE_URL || "https://api.bseindia.com/v1";
    const formattedSymbol = symbol.endsWith('.BO') ? symbol : `${symbol}.BO`;

    try {
      const response = await fetch(`${baseUrl}/quote?symbol=${encodeURIComponent(formattedSymbol)}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`BSE provider error HTTP ${response.status}`);
      }
      const data = await response.json();
      return {
        symbol: formattedSymbol.toUpperCase(),
        bid: Number(data.bid || 0),
        ask: Number(data.ask || 0),
        lastPrice: Number(data.lastPrice || 0),
        volume24h: Number(data.volume24h || 0),
        timestamp: new Date(data.timestamp || Date.now())
      };
    } catch (err: any) {
      logger.error({ symbol, err: err.message }, 'BSE real market quote fetch failed');
      throw err;
    }
  }

  async getHistoricalCandles(symbol: string, timeframe: string, start: Date, end: Date): Promise<Candle[]> {
    if (!this.isConfigured()) {
      // Return empty array when feed is not configured. NEVER generate synthetic candles.
      return [];
    }

    const apiKey = process.env.BSE_MARKET_DATA_API_KEY;
    const baseUrl = process.env.BSE_MARKET_DATA_BASE_URL || "https://api.bseindia.com/v1";
    const formattedSymbol = symbol.endsWith('.BO') ? symbol : `${symbol}.BO`;

    try {
      const url = `${baseUrl}/candles?symbol=${encodeURIComponent(formattedSymbol)}&timeframe=${encodeURIComponent(timeframe)}&from=${start.toISOString()}&to=${end.toISOString()}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`BSE provider error HTTP ${response.status}`);
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
      logger.error({ symbol, err: err.message }, 'BSE historical candles fetch failed');
      return [];
    }
  }

  async getOrderBook(symbol: string, depth = 5) {
    if (!this.isConfigured()) {
      throw new Error("MARKET_DATA_NOT_CONFIGURED: Authorized BSE market data credentials missing.");
    }
    const quote = await this.getQuote(symbol);
    return { symbol: quote.symbol, bids: [], asks: [], timestamp: new Date() };
  }

  subscribeQuotes(symbols: string[], callback: (quote: Quote) => void): () => void {
    if (!this.isConfigured()) {
      return () => {};
    }
    const unsubscribers: Array<() => void> = [];
    for (const sym of symbols) {
      const symbol = sym.toUpperCase();
      if (!this.activeSubscriptions.has(symbol)) {
        this.activeSubscriptions.set(symbol, new Set());
        const timer = setInterval(async () => {
          try {
            const q = await this.getQuote(symbol);
            const listeners = this.activeSubscriptions.get(symbol);
            if (listeners) {
              listeners.forEach(cb => cb(q));
            }
          } catch (err: any) {
            logger.error({ symbol, err: err.message }, 'BSE Feed stream tick error');
          }
        }, 1000);
        this.timers.set(symbol, timer);
      }
      this.activeSubscriptions.get(symbol)!.add(callback);
      unsubscribers.push(() => {
        const listeners = this.activeSubscriptions.get(symbol);
        if (listeners) {
          listeners.delete(callback);
          if (listeners.size === 0) {
            this.activeSubscriptions.delete(symbol);
            const t = this.timers.get(symbol);
            if (t) {
              clearInterval(t);
              this.timers.delete(symbol);
            }
          }
        }
      });
    }
    return () => unsubscribers.forEach(u => u());
  }

  async healthCheck(): Promise<{ isHealthy: boolean; latencyMs: number; status: string }> {
    if (!this.isConfigured()) {
      return { isHealthy: false, latencyMs: 0, status: 'NOT_CONFIGURED' };
    }
    const start = Date.now();
    try {
      await this.getQuote('SENSEX');
      return { isHealthy: true, latencyMs: Date.now() - start, status: 'CONNECTED' };
    } catch {
      return { isHealthy: false, latencyMs: Date.now() - start, status: 'PROVIDER_ERROR' };
    }
  }
}

