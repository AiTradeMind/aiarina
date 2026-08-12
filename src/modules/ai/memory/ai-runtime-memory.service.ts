import logger from '../../../lib/logger';

export interface DecisionMemoryRecord {
  id: string;
  strategyId: string;
  symbol: string;
  signal: 'BUY' | 'SELL' | 'HOLD' | 'NEUTRAL';
  confidence: number;
  explanation: string;
  contextSnapshot: any;
  timestamp: Date;
  expiresAt: Date;
}

export interface TradeMemoryRecord {
  id: string;
  orderId: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  realizedPnL?: number;
  timestamp: Date;
}

export class AIRuntimeMemoryService {
  private static instance: AIRuntimeMemoryService;

  private decisionMemory: Map<string, DecisionMemoryRecord> = new Map();
  private tradeMemory: Map<string, TradeMemoryRecord> = new Map();
  private promptCache: Map<string, { result: any; expiresAt: number }> = new Map();
  private marketRegimeMemory: Map<string, { regime: string; updated: Date }> = new Map();

  private constructor() {
    this.startCleanupTimer();
  }

  public static getInstance(): AIRuntimeMemoryService {
    if (!AIRuntimeMemoryService.instance) {
      AIRuntimeMemoryService.instance = new AIRuntimeMemoryService();
    }
    return AIRuntimeMemoryService.instance;
  }

  public recordDecision(
    strategyId: string,
    symbol: string,
    signal: 'BUY' | 'SELL' | 'HOLD' | 'NEUTRAL',
    confidence: number,
    explanation: string,
    contextSnapshot: any,
    ttlHours: number = 24
  ): DecisionMemoryRecord {
    const id = `mem_dec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const timestamp = new Date();
    const expiresAt = new Date(timestamp.getTime() + ttlHours * 3600000);

    const record: DecisionMemoryRecord = {
      id,
      strategyId,
      symbol,
      signal,
      confidence,
      explanation,
      contextSnapshot,
      timestamp,
      expiresAt
    };

    this.decisionMemory.set(id, record);
    logger.debug({ memoryId: id, strategyId, symbol, signal }, 'Decision recorded in AI Memory');
    return record;
  }

  public getRecentDecisions(symbol?: string, limit: number = 10): DecisionMemoryRecord[] {
    const records = Array.from(this.decisionMemory.values())
      .filter(d => !symbol || d.symbol === symbol.toUpperCase())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return records.slice(0, limit);
  }

  public recordTrade(trade: Omit<TradeMemoryRecord, 'id' | 'timestamp'>): TradeMemoryRecord {
    const id = `mem_trd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const record: TradeMemoryRecord = {
      ...trade,
      id,
      timestamp: new Date()
    };
    this.tradeMemory.set(id, record);
    return record;
  }

  public getRecentTrades(symbol?: string, limit: number = 10): TradeMemoryRecord[] {
    const records = Array.from(this.tradeMemory.values())
      .filter(t => !symbol || t.symbol === symbol.toUpperCase())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return records.slice(0, limit);
  }

  public setPromptCache(key: string, result: any, ttlSeconds: number = 300): void {
    this.promptCache.set(key, {
      result,
      expiresAt: Date.now() + ttlSeconds * 1000
    });
  }

  public getPromptCache(key: string): any | null {
    const cached = this.promptCache.get(key);
    if (!cached) return null;
    if (Date.now() > cached.expiresAt) {
      this.promptCache.delete(key);
      return null;
    }
    return cached.result;
  }

  public setMarketRegime(symbol: string, regime: string): void {
    this.marketRegimeMemory.set(symbol.toUpperCase(), { regime, updated: new Date() });
  }

  public getMarketRegime(symbol: string): string {
    return this.marketRegimeMemory.get(symbol.toUpperCase())?.regime || 'NEUTRAL_RANGING';
  }

  private startCleanupTimer(): void {
    setInterval(() => {
      const now = new Date();
      for (const [id, record] of this.decisionMemory.entries()) {
        if (now > record.expiresAt) {
          this.decisionMemory.delete(id);
        }
      }
    }, 3600000); // Hourly memory purge
  }
}
