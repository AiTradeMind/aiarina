export interface StrategyMarketplace {
  id: string;
  name: string;
  description: string | null;
  createdTime: string;
}

export interface StrategyPublication {
  id: string;
  strategyId: string;
  versionId: string;
  publisher: string;
  visibility: string;
  category: string | null;
  tags: any;
  description: string | null;
  releaseNotes: string | null;
  publicationDate: string;
}

export interface StrategyTemplateLibrary {
  id: string;
  name: string;
  category: string;
  snapshot: any;
  createdTime: string;
}

export interface StrategyDownloadHistory {
  id: string;
  publicationId: string;
  userId: string;
  downloadDate: string;
}

export interface StrategyInstallation {
  id: string;
  publicationId: string;
  userId: string;
  installedStrategyId: string;
  installationDate: string;
}

export interface StrategyReview {
  id: string;
  publicationId: string;
  rating: number;
  reviewNotes: string | null;
  reviewer: string;
  approvalStatus: string;
  reviewDate: string;
}

export interface StrategyUsageStatistic {
  id: string;
  publicationId: string;
  installCount: number | null;
  cloneCount: number | null;
  usageCount: number | null;
  backtestCount: number | null;
  paperTradingCount: number | null;
  popularityScore: number | null;
  updatedTime: string;
}

export interface StrategyFeatured {
  id: string;
  publicationId: string;
  featuredStartDate: string;
  featuredEndDate: string | null;
  priority: number | null;
}
