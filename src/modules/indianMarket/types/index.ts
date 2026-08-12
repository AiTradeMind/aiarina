export type IndianDayType = 'WEEKDAY' | 'WEEKEND' | 'HOLIDAY' | 'SPECIAL_SESSION' | 'EMERGENCY_CLOSURE';

export interface IndianTradingCalendar {
  id: string;
  date: string; // YYYY-MM-DD
  dayType: IndianDayType;
  sessionName?: string | null;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type IndianSessionType = 
  | 'PRE_OPEN' 
  | 'NORMAL' 
  | 'PRE_CLOSE' 
  | 'POST_CLOSE' 
  | 'HOLIDAY' 
  | 'MAINTENANCE' 
  | 'EMERGENCY_STOP';

export interface IndianMarketSession {
  id: string;
  sessionType: IndianSessionType;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  isActive: boolean;
  updatedAt: Date;
}

export interface IndianMarketClock {
  id: string;
  exchangeTime: Date;
  serverTime: Date;
  systemTime: Date;
  timezone: string;
  driftMs: number;
  createdAt: Date;
}

export type IndianMarketStatusType = 'OPEN' | 'CLOSED' | 'HALTED' | 'HOLIDAY' | 'SPECIAL_SESSION' | 'MAINTENANCE';

export interface IndianMarketStatus {
  status: IndianMarketStatusType;
  session: IndianSessionType;
  clock: {
    exchangeTime: string;
    serverTime: string;
    driftMs: number;
    timezone: string;
  };
}

export interface SettlementQueueItem {
  tradeId: string;
  instrumentId: string;
  quantity: number;
  price: number;
  buyerId: string;
  sellerId: string;
  status: 'PENDING' | 'VALIDATED' | 'SETTLED' | 'REJECTED';
  reason?: string;
  timestamp: string;
}

export interface ExpiryDateInfo {
  instrumentId: string;
  symbol: string;
  type: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'COMMODITY';
  expiryDate: string; // YYYY-MM-DD
  daysRemaining: number;
}

export interface CircuitLimitInfo {
  instrumentId: string;
  symbol: string;
  lastPrice: number;
  upperCircuit: number;
  lowerCircuit: number;
  isTriggered: boolean;
  triggerType?: 'UPPER' | 'LOWER' | null;
  haltedUntil?: string | null;
}

export interface AuctionStatusInfo {
  id: string;
  auctionType: 'PRE_OPEN' | 'CLOSING' | 'SPECIAL';
  status: 'SCHEDULED' | 'OPEN' | 'CLOSED' | 'MATCHING';
  startTime: string;
  endTime: string;
  volumeTraded: number;
}

export interface CorporateActionRule {
  id: string;
  instrumentId: string;
  actionType: 'BONUS' | 'SPLIT' | 'DIVIDEND' | 'RIGHTS' | 'MERGER' | 'DELISTING' | 'SUSPENSION';
  ratioOrValue: string; // e.g. "1:2" (bonus/split) or "15.50" (dividend value)
  recordDate: string;
  appliedDate?: string;
  status: 'PENDING' | 'APPLIED' | 'REJECTED';
}

export interface IndianPolicyRules {
  tradingAllowed: boolean;
  maxLeverage: number;
  shortSellingEnabled: boolean;
  circuitBreakerPercentage: number;
  allowedSegments: string[];
}

export interface IndianMarketPolicy {
  id: string;
  policyName: 'NSE_POLICY' | 'BSE_POLICY' | 'MCX_POLICY' | 'PAPER_POLICY' | 'LIVE_POLICY' | 'EMERGENCY_POLICY';
  description?: string | null;
  rules: IndianPolicyRules;
  createdAt: Date;
  updatedAt: Date;
}

export interface IndianMarketValidation {
  id: string;
  moduleName: 'RESEARCH' | 'AI_INTELLIGENCE' | 'STRATEGY' | 'COMMITTEE' | 'LIFECYCLE' | 'PAPER_TRADING' | 'TRADING';
  isValid: boolean;
  checksRun: {
    calendarChecked: boolean;
    sessionChecked: boolean;
    clockChecked: boolean;
    settlementChecked: boolean;
    circuitChecked: boolean;
    auctionChecked: boolean;
  };
  errors: string[];
  verifiedAt: Date;
}

export interface IndianMarketEvent {
  id: string;
  eventType: 
    | 'TradingDayStarted' 
    | 'TradingDayEnded' 
    | 'MarketOpened' 
    | 'MarketClosed' 
    | 'SettlementStarted' 
    | 'SettlementCompleted' 
    | 'ExpiryStarted' 
    | 'ExpiryCompleted' 
    | 'AuctionStarted' 
    | 'AuctionEnded' 
    | 'CircuitTriggered' 
    | 'CorporateActionApplied';
  payload: Record<string, any>;
  createdAt: Date;
}
