import {
  IMarketDataProvider,
  Quote,
  Candle,
  OrderBook
} from '../abstractions';
import logger from '../../lib/logger';

export class EnterpriseMarketDataProvider implements IMarketDataProvider {
  readonly providerId = 'enterprise-market-data-default';
  readonly name = 'Enterprise Multi-Source Market Data Provider';

  private isConfigured(): boolean {
    return Boolean(
      (process.env.NSE_MARKET_DATA_API_KEY && process.env.NSE_MARKET_DATA_API_KEY.trim() !== '') ||
      (process.env.BSE_MARKET_DATA_API_KEY && process.env.BSE_MARKET_DATA_API_KEY.trim() !== '')
    );
  }

  async getQuote(symbol: string): Promise<Quote> {
    if (!this.isConfigured()) {
      throw new Error("MARKET_DATA_NOT_CONFIGURED: Authorized market feed credentials are not set in the backend environment.");
    }
    // If configured, delegate to backend feed API
    throw new Error("PROVIDER_ERROR: Unable to connect to authorized market feed endpoint.");
  }

  async getHistoricalCandles(
    symbol: string,
    timeframe: string,
    start: Date,
    end: Date
  ): Promise<Candle[]> {
    if (!this.isConfigured()) {
      // NEVER generate synthetic candles. Return empty array when not configured.
      return [];
    }
    return [];
  }

  async getOrderBook(symbol: string, depth: number = 10): Promise<OrderBook> {
    if (!this.isConfigured()) {
      throw new Error("MARKET_DATA_NOT_CONFIGURED: Authorized market feed credentials are missing.");
    }
    return {
      symbol: symbol.toUpperCase(),
      bids: [],
      asks: [],
      timestamp: new Date()
    };
  }

  subscribeQuotes(symbols: string[], callback: (quote: Quote) => void): () => void {
    return () => {};
  }

  async healthCheck(): Promise<{ isHealthy: boolean; latencyMs: number; status: string }> {
    if (!this.isConfigured()) {
      return { isHealthy: false, latencyMs: 0, status: 'NOT_CONFIGURED' };
    }
    return { isHealthy: false, latencyMs: 0, status: 'PROVIDER_ERROR' };
  }
}

