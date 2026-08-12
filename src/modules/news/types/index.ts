export type NewsCategory =
  | "MARKET"
  | "COMPANY"
  | "ECONOMY"
  | "POLICY"
  | "RESULTS"
  | "CORPORATE_ACTIONS"
  | "GLOBAL"
  | "SECTOR"
  | "COMMODITY"
  | "CURRENCY"
  | "GENERAL";

export type EventPriority =
  | "CRITICAL"
  | "HIGH"
  | "MEDIUM"
  | "LOW"
  | "INFORMATIONAL";

export type CorporateActionType =
  | "BONUS"
  | "SPLIT"
  | "DIVIDEND"
  | "RIGHTS_ISSUE"
  | "MERGER"
  | "DEMERGER"
  | "NAME_CHANGE"
  | "DELISTING"
  | "SUSPENSION";

export type CorporateActionStatus =
  | "UPCOMING"
  | "EFFECTIVE"
  | "COMPLETED"
  | "CANCELLED";

export type EconomicCategory =
  | "GDP"
  | "INFLATION"
  | "INTEREST_RATE"
  | "LABOR"
  | "PRODUCTION"
  | "TRADE"
  | "GOVERNMENT"
  | "GLOBAL";

export interface NewsArticle {
  id?: number;
  newsId: string;
  headline: string;
  summary: string;
  body: string;
  category: NewsCategory;
  source: string;
  language: string;
  publishedAt: Date | string;
  importance: EventPriority;
  tags: string[];
  affectedSymbols: string[];
  sentimentScore: number; // -1.0 to +1.0
  sentimentLabel: "BULLISH" | "BEARISH" | "NEUTRAL";
  extraData: Record<string, any>;
  createdAt?: Date | string;
}

export interface NewsSource {
  id?: number;
  sourceId: string;
  name: string;
  type: string;
  url?: string;
  active: boolean;
  createdAt?: Date | string;
}

export interface NewsCategoryDef {
  id?: number;
  categoryId: string;
  name: string;
  description?: string;
  active: boolean;
}

export interface NewsTag {
  id?: number;
  tag: string;
  description?: string;
}

export interface NewsSymbolMapping {
  id?: number;
  newsId: string;
  symbol: string;
  exchange: string;
  sector?: string;
  industry?: string;
  company?: string;
  instrument?: string;
  createdAt?: Date | string;
}

export interface CorporateAction {
  id?: number;
  actionId: string;
  symbol: string;
  type: CorporateActionType;
  value?: number;
  ratio?: string;
  exDate?: Date | string;
  recordDate?: Date | string;
  paymentDate?: Date | string;
  announcementDate?: Date | string;
  currency?: string;
  description: string;
  status: CorporateActionStatus;
  extraData: Record<string, any>;
  createdAt?: Date | string;
}

export interface EconomicCalendarEvent {
  id?: number;
  eventId: string;
  country: string;
  eventName: string;
  actual?: number;
  forecast?: number;
  previous?: number;
  importance: EventPriority;
  timeframe?: string;
  publishedAt: Date | string;
  currency?: string;
  category: EconomicCategory;
  createdAt?: Date | string;
}

export interface EconomicEventDef {
  id?: number;
  eventId: string;
  eventName: string;
  type: string;
  description?: string;
  frequency?: string;
  country: string;
  importance: EventPriority;
  currency?: string;
}

export interface NewsHistoryEntry {
  id?: number;
  newsId: string;
  action: string;
  performedBy: string;
  timestamp?: Date | string;
  details: Record<string, any>;
}

export interface NewsMetadata {
  id?: number;
  key: string;
  value: any;
  updatedAt?: Date | string;
}

// Normalization interface for generic news sources
export interface RawNewsInput {
  title?: string;
  headline?: string;
  desc?: string;
  summary?: string;
  text?: string;
  body?: string;
  cat?: string;
  category?: string;
  src?: string;
  source?: string;
  lang?: string;
  language?: string;
  pubTime?: string | Date;
  publishedAt?: string | Date;
  importance?: string;
  priority?: string;
  tags?: string[] | string;
  symbols?: string[] | string;
  sentiment?: number;
  meta?: any;
}

export interface NewsProvider {
  providerId: string;
  name: string;
  fetchLatest(): Promise<RawNewsInput[]>;
}
