export type TimeframeType = 
  | '1m'  // 1 Minute
  | '3m'  // 3 Minute
  | '5m'  // 5 Minute
  | '15m' // 15 Minute
  | '30m' // 30 Minute
  | '1h'  // 1 Hour
  | '4h'  // 4 Hour
  | '1d'  // Daily
  | '1w'  // Weekly
  | '1mo'; // Monthly

export type IndicatorType =
  | 'SMA' | 'EMA' | 'WMA' | 'VWMA' | 'HMA' | 'KAMA' | 'AMA'
  | 'RSI' | 'MACD' | 'CCI' | 'ROC' | 'MOM' | 'AO' | 'TRIX' | 'TSI'
  | 'ADX' | 'DMI' | 'SUPERTREND' | 'ICHIMOKU' | 'PSAR' | 'AROON' | 'RIBBON'
  | 'ATR' | 'BB' | 'KC' | 'DONCHIAN' | 'HV' | 'STDDEV'
  | 'OBV' | 'VWAP' | 'CMF' | 'MFI' | 'VO' | 'AD';

export type SignalType = 'BULLISH' | 'BEARISH' | 'NEUTRAL';

export type SignalAction = 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';

export interface IndicatorDefinition {
  id?: number;
  indicatorId: string;
  name: string;
  type: 'TREND' | 'MOMENTUM' | 'VOLATILITY' | 'VOLUME' | 'PRICE_ACTION';
  parameters: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IndicatorValue {
  id?: number;
  indicatorId: string;
  symbol: string;
  timeframe: string;
  value: number;
  extraData: Record<string, any> | null;
  timestamp: Date | string;
  createdAt?: Date;
}

export interface IndicatorCache {
  id?: number;
  cacheKey: string;
  cacheValue: any;
  expiresAt: Date | string;
  createdAt?: Date;
}

export interface IndicatorHistory {
  id?: number;
  symbol: string;
  timeframe: string;
  indicatorType: string;
  values: Array<{ timestamp: string; value: number; extraData?: any }>;
  updatedAt?: Date;
}

export interface SignalEvent {
  id?: number;
  signalId: string;
  symbol: string;
  timeframe: string;
  type: SignalType;
  action: SignalAction;
  confidence: number; // 0.0 to 1.0
  reason: string;
  indicatorSource: string;
  timestamp: Date | string;
  createdAt?: Date;
}

export interface SignalHistory {
  id?: number;
  symbol: string;
  timeframe: string;
  action: SignalAction;
  confidence: number;
  reason: string;
  indicatorSource: string;
  timestamp: Date | string;
}

export interface SignalMetadata {
  id?: number;
  key: string;
  value: any;
  updatedAt?: Date;
}

// Normalized input bar data format for indicator consumption
export interface NormalizedBar {
  timestamp: Date | string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
