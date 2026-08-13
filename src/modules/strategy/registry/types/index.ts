export interface StrategyRegistry {
  id: string;
  name: string;
  displayName: string;
  category: string;
  description: string | null;
  version: string;
  status: string;
  owner: string;
  createdBy: string;
  riskLevel: string;
  complexity: number;
  supportedMarkets: any;
  supportedInstruments: any;
  minimumCapital: number | null;
  maximumCapital: number | null;
  preferredTimeframe: string | null;
  preferredSession: string | null;
  createdTime: Date;
  updatedTime: Date;
}

export interface StrategyCategory {
  id: string;
  name: string;
  description: string | null;
  createdTime: Date;
}

export interface StrategyTag {
  id: string;
  strategyId: string;
  tag: string;
  createdTime: Date;
}

export interface StrategyDependency {
  id: string;
  strategyId: string;
  dependencyType: string;
  dependencyId: string;
  isRequired: boolean;
  createdTime: Date;
}

export interface StrategyMetadata {
  id: string;
  strategyId: string;
  key: string;
  value: string;
  createdTime: Date;
}

export interface StrategyCapabilities {
  id: string;
  strategyId: string;
  supportsPaperTrading: boolean;
  supportsAi: boolean;
  supportsAutomation: boolean;
  supportsReplay: boolean;
  supportsBacktesting: boolean;
  supportsPortfolio: boolean;
  supportsMultiAsset: boolean;
  supportsMultiTimeframe: boolean;
  createdTime: Date;
  updatedTime: Date;
}

export interface StrategyTemplate {
  id: string;
  name: string;
  description: string | null;
  configTemplate: any;
  category: string;
  createdTime: Date;
  updatedTime: Date;
}
