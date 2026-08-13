import { ConstitutionVersion, ConstitutionPolicy, ConstitutionRule, ConstitutionModuleRegistration } from "../types/index.ts";

export interface GovernanceContext {
  activeVersion: ConstitutionVersion;
  policies: ConstitutionPolicy[];
  rules: ConstitutionRule[];
  registeredModules: ConstitutionModuleRegistration[];
}

export interface ResearchCenterExtension {
  onResearchCenterInitialize(context: GovernanceContext): Promise<void>;
  validateResearchStrategy(strategyId: string, context: GovernanceContext): Promise<boolean>;
}

export interface AIBrainExtension {
  onAIBrainInitialize(context: GovernanceContext): Promise<void>;
  verifyCognitiveBoundary(promptId: string, context: GovernanceContext): Promise<boolean>;
}

export interface AIDecisionExtension {
  onAIDecisionInitialize(context: GovernanceContext): Promise<void>;
  auditDecisionProposal(proposalId: string, context: GovernanceContext): Promise<boolean>;
}

export interface FundManagerExtension {
  onFundManagerInitialize(context: GovernanceContext): Promise<void>;
  verifyFundAllocation(fundId: string, amount: number, context: GovernanceContext): Promise<boolean>;
}

export interface WalletExtension {
  onWalletInitialize(context: GovernanceContext): Promise<void>;
  validateTransactionLimits(txId: string, context: GovernanceContext): Promise<boolean>;
}

export interface OMSExtension {
  onOMSInitialize(context: GovernanceContext): Promise<void>;
  checkOrderGovernance(orderId: string, context: GovernanceContext): Promise<boolean>;
}

export interface PortfolioExtension {
  onPortfolioInitialize(context: GovernanceContext): Promise<void>;
  verifyPortfolioRebalance(portfolioId: string, context: GovernanceContext): Promise<boolean>;
}

export interface AccountingExtension {
  onAccountingInitialize(context: GovernanceContext): Promise<void>;
  auditLedgerEntry(entryId: string, context: GovernanceContext): Promise<boolean>;
}

export interface LearningEngineExtension {
  onLearningEngineInitialize(context: GovernanceContext): Promise<void>;
  validateModelTrainingDataset(datasetId: string, context: GovernanceContext): Promise<boolean>;
}

export interface RiskEngineExtension {
  onRiskEngineInitialize(context: GovernanceContext): Promise<void>;
  evaluateSystemicRisk(context: GovernanceContext): Promise<{ riskScore: number; approved: boolean }>;
}
