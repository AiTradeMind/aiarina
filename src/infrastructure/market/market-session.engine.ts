import EventEmitter from 'events';
import logger from '../../lib/logger';

export enum MarketSessionState {
  PRE_OPEN = 'PRE_OPEN',
  OPEN = 'OPEN',
  POST_CLOSE = 'POST_CLOSE',
  HOLIDAY = 'HOLIDAY',
  WEEKEND = 'WEEKEND'
}

export interface MarketSessionInfo {
  exchange: string;
  state: MarketSessionState;
  nextStateChange: Date;
  isTradingAllowed: boolean;
  timeZone: string;
}

export class MarketSessionEngine extends EventEmitter {
  private static instance: MarketSessionEngine;
  private sessionMap: Map<string, MarketSessionInfo> = new Map();
  private checkInterval: NodeJS.Timeout | null = null;

  private constructor() {
    super();
    this.initDefaultExchanges();
    this.startMonitoring();
  }

  public static getInstance(): MarketSessionEngine {
    if (!MarketSessionEngine.instance) {
      MarketSessionEngine.instance = new MarketSessionEngine();
    }
    return MarketSessionEngine.instance;
  }

  public getSessionInfo(exchange: string = 'NSE'): MarketSessionInfo {
    const info = this.sessionMap.get(exchange.toUpperCase());
    if (!info) {
      return this.calculateCurrentSession(exchange.toUpperCase());
    }
    return info;
  }

  public isMarketOpen(exchange: string = 'NSE'): boolean {
    const session = this.getSessionInfo(exchange);
    return session.isTradingAllowed;
  }

  private initDefaultExchanges(): void {
    const exchanges = ['NSE', 'BSE', 'MCX'];
    for (const ex of exchanges) {
      this.updateExchangeState(ex);
    }
  }

  private updateExchangeState(exchange: string): void {
    const newSession = this.calculateCurrentSession(exchange);
    const existing = this.sessionMap.get(exchange);

    if (!existing || existing.state !== newSession.state) {
      this.sessionMap.set(exchange, newSession);
      logger.info(
        { exchange, previousState: existing?.state, newState: newSession.state },
        'Market session state transition'
      );
      this.emit('session_change', { exchange, session: newSession });
    }
  }

  private calculateCurrentSession(exchange: string): MarketSessionInfo {
    const now = new Date();
    const day = now.getUTCDay();

    // 24/7 Crypto Market
    if (exchange === 'CRYPTO') {
      return {
        exchange: 'CRYPTO',
        state: MarketSessionState.OPEN,
        nextStateChange: new Date(now.getTime() + 86400000),
        isTradingAllowed: true,
        timeZone: 'UTC'
      };
    }

    // Weekend Check (Saturday = 6, Sunday = 0)
    if (day === 0 || day === 6) {
      return {
        exchange,
        state: MarketSessionState.WEEKEND,
        nextStateChange: new Date(now.getTime() + 3600000),
        isTradingAllowed: false,
        timeZone: 'Asia/Kolkata'
      };
    }

    const hours = now.getUTCHours();
    const minutes = now.getUTCMinutes();
    const timeValue = hours * 60 + minutes; // UTC time in minutes

    // Indian Markets (NSE/BSE) trading hours in UTC (03:45 UTC to 10:00 UTC)
    if (exchange === 'NSE' || exchange === 'BSE') {
      const preOpenStart = 3 * 60 + 30; // 03:30 UTC
      const openStart = 3 * 60 + 45;    // 03:45 UTC
      const closeTime = 10 * 60;        // 10:00 UTC

      if (timeValue >= preOpenStart && timeValue < openStart) {
        return {
          exchange,
          state: MarketSessionState.PRE_OPEN,
          nextStateChange: new Date(now.setMinutes(45)),
          isTradingAllowed: false,
          timeZone: 'Asia/Kolkata'
        };
      } else if (timeValue >= openStart && timeValue < closeTime) {
        return {
          exchange,
          state: MarketSessionState.OPEN,
          nextStateChange: new Date(now.setHours(10, 0, 0, 0)),
          isTradingAllowed: true,
          timeZone: 'Asia/Kolkata'
        };
      } else {
        return {
          exchange,
          state: MarketSessionState.POST_CLOSE,
          nextStateChange: new Date(now.getTime() + 18000000),
          isTradingAllowed: false,
          timeZone: 'Asia/Kolkata'
        };
      }
    }

    // Default Fallback
    return {
      exchange,
      state: MarketSessionState.OPEN,
      nextStateChange: new Date(now.getTime() + 3600000),
      isTradingAllowed: true,
      timeZone: 'UTC'
    };
  }

  private startMonitoring(): void {
    if (!this.checkInterval) {
      this.checkInterval = setInterval(() => {
        for (const exchange of this.sessionMap.keys()) {
          this.updateExchangeState(exchange);
        }
      }, 30000); // Check session transitions every 30s
    }
  }

  public stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}
