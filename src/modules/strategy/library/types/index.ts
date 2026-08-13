export type TemplateCategory = 
  | 'Trend Following' 
  | 'Mean Reversion' 
  | 'Volatility Breakout' 
  | 'Liquidity Arbitrage' 
  | 'Statistical Arbitrage' 
  | 'Market Making' 
  | 'Algorithmic Execution';

export type TemplateMarketType = 'EQUITY' | 'CRYPTO' | 'FOREX' | 'COMMODITY' | 'DERIVATIVES';
export type TemplateInstrumentType = 'SPOT' | 'FUTURES' | 'OPTIONS' | 'SWAP';
export type TemplateRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type TemplateTimeframe = '1M' | '5M' | '15M' | '1H' | '4H' | '1D';
export type TemplateDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'INSTITUTIONAL';
export type TemplateStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'DEPRECATED' | 'CERTIFIED';
export type TemplateApproval = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CERTIFIED';
export type TemplateTier = 'CORE' | 'INSTITUTIONAL';

export interface StrategyTemplateItem {
  id: string;
  templateId: string;
  name: string;
  description: string;
  category: string;
  marketType: TemplateMarketType;
  instrumentType: TemplateInstrumentType;
  riskLevel: TemplateRiskLevel;
  timeframe: TemplateTimeframe;
  difficulty: TemplateDifficulty;
  tier: TemplateTier;
  priority: string;
  isCertified: boolean;
  isTradeEnabled: boolean;
  isEditable: boolean;
  isSystemOwned: boolean;
  author: string;
  version: string;
  status: TemplateStatus;
  approvalStatus: TemplateApproval;
  isFavorite: boolean;
  tags: string[];
  rules: string[];
  ruleCount: number;
  usageCount: number;
  favoriteCount: number;
  rating: number;
  sha256Reference: string;
  entryPhilosophy: string;
  exitPhilosophy: string;
  riskPhilosophy: string;
  indicatorsUsed: string[];
  supportedMarkets: string[];
  suitableConditions: string;
  avoidConditions: string;
  winRate: number;
  profitFactor: number;
  maxDrawdown: number;
  sharpeRatio: number;
  aiCompatibilityScore: number;
  aiCompatibility: string;
  certificationDate: string;
  createdTime: string;
  updatedTime: string;
}

export interface FilterOptions {
  searchQuery?: string;
  category?: string;
  marketType?: string;
  riskLevel?: string;
  timeframe?: string;
  status?: string;
  approvalStatus?: string;
  author?: string;
  coreOnly?: boolean;
  institutionalOnly?: boolean;
  favoritesOnly?: boolean;
  sortKey?: 'NEWEST' | 'OLDEST' | 'MOST_USED' | 'HIGHEST_RATED' | 'ALPHABETICAL' | 'RECENTLY_UPDATED' | 'HIGHEST_WIN_RATE' | 'HIGHEST_PROFIT_FACTOR' | 'LOWEST_DRAWDOWN';
  sortDir?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export interface CreateTemplateInput {
  name: string;
  description: string;
  category: string;
  marketType?: TemplateMarketType;
  instrumentType?: TemplateInstrumentType;
  riskLevel?: TemplateRiskLevel;
  timeframe?: TemplateTimeframe;
  difficulty?: TemplateDifficulty;
  tier?: TemplateTier;
  priority?: string;
  isCertified?: boolean;
  isTradeEnabled?: boolean;
  isEditable?: boolean;
  isSystemOwned?: boolean;
  author?: string;
  version?: string;
  status?: TemplateStatus;
  approvalStatus?: TemplateApproval;
  tags?: string[];
  rules: string[];
  entryPhilosophy?: string;
  exitPhilosophy?: string;
  riskPhilosophy?: string;
  indicatorsUsed?: string[];
  supportedMarkets?: string[];
  suitableConditions?: string;
  avoidConditions?: string;
  winRate?: number;
  profitFactor?: number;
  maxDrawdown?: number;
  sharpeRatio?: number;
  aiCompatibilityScore?: number;
  aiCompatibility?: string;
}

export interface UpdateTemplateInput extends Partial<CreateTemplateInput> {
  isFavorite?: boolean;
}

