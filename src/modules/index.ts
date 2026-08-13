// Identity & Enterprise Administration
export * from "./identity/types/index.ts";
export * from "./identity/repositories/index.ts";
export * from "./identity/services/index.ts";
export * from "./identity/controllers/index.ts";
export { identityRouter } from "./identity/routes/index.ts";
export { adminRouter } from "./identity/routes/admin.routes.ts";
export { orgRouter } from "./org/routes/org.routes.ts";
export { OrganizationService as OrgEngineOrganizationService } from "./org/services/OrganizationService.ts";
export { WorkspaceService as OrgEngineWorkspaceService } from "./org/services/WorkspaceService.ts";
export { OrganizationRepository as OrgEngineOrganizationRepository } from "./org/repositories/OrganizationRepository.ts";
export { WorkspaceRepository as OrgEngineWorkspaceRepository } from "./org/repositories/WorkspaceRepository.ts";
export { OrganizationValidator as OrgEngineOrganizationValidator } from "./org/services/OrganizationValidator.ts";
export { OrganizationEngine as OrgEngineOrganizationEngine } from "./org/services/OrganizationEngine.ts";
export { WorkspaceEngine as OrgEngineWorkspaceEngine } from "./org/services/WorkspaceEngine.ts";

// Enterprise RBAC & Permission Engine
export * from "./rbac/index.ts";

// Market
export { marketRouter } from "./market/routes/index.ts";
export * from "./market/types/index.ts";

// Trading
export { tradingRouter } from "./trading/routes/index.ts";
export * from "./trading/types/index.ts";

// Risk
export { riskRouter } from "./risk/routes/index.ts";
export * from "./risk/types/index.ts";

// Paper Trading
export { paperTradingRouter } from "./paperTrading/routes/index.ts";
export * from "./paperTrading/types/index.ts";

// Events
export { eventRouter } from "./events/routes/index.ts";
export { telegramRouter } from "./events/telegram.routes.ts";
export * from "./events/types/index.ts";

// Research
export { researchRouter } from "./research/routes/index.ts";
export * from "./research/types/index.ts";

// Strategy
export { strategyRouter } from "./strategy/routes/index.ts";
export { strategyFoundationRouter } from "./strategy/foundation/index.ts";
export { strategyLibraryRouter } from "./strategy/library/routes/strategy-library.routes.ts";
export { strategyParametersRouter } from "./strategy/parameters/routes/strategy-parameters.routes.ts";
export { strategyCandidatesRouter } from "./strategy/candidates/routes/strategy-candidates.routes.ts";
export { strategyRankingRouter } from "./strategy/ranking/routes/strategy-ranking.routes.ts";
export { strategyRuntimeRouter } from "./strategy/runtime/routes/strategy-runtime.routes.ts";
export * from "./strategy/parameters/types/index.ts";
export * from "./strategy/candidates/types/index.ts";
export * from "./strategy/ranking/types/index.ts";
export * from "./strategy/runtime/types/index.ts";
export * from "./strategy/foundation/index.ts";
export * from "./strategy/types/index.ts";

// AI
export { aiRouter } from "./ai/routes/index.ts";
export * from "./ai/types/index.ts";

// Analytics
export {
  analyticsRouter,
  AnalyticsRepository,
  analyticsRepo,
  ensureAnalyticsTables,
  analyticsService,
  AnalyticsService,
  AnalyticsRegistry,
  AnalyticsLifecycle,
  AnalyticsHealth,
  EnterpriseAnalyticsEngine,
  analyticsController,
  AnalyticsController
} from "./analytics/index.ts";
export * from "./analytics/types/index.ts";

// Platform / Operations EP20
export { operationsRouter } from "./platform/routes/index.ts";
export * from "./platform/types/index.ts";
export * from "./platform/services/operations.service.ts";

// Reporting & Business Intelligence EP21
export { reportingRouter } from "./reporting/routes/ReportingRouter.ts";
export { studioRouter } from "./studio/routes/StudioRouter.ts";
export * from "./reporting/types/index.ts";
export * from "./reporting/services/ReportingService";

// AI Governance & Model Lifecycle EP22
export { governanceRouter as aiGovernanceRouter } from "./ai/governance/routes/index.ts";
export * from "./ai/governance/types/ep22.types";
export * from "./ai/governance/services/governance.service";

// AI Brain
export { brainRouter } from "./ai/brain/routes/index.ts";
export * from "./ai/brain/types/index.ts";

// Phase 2.3 AI Brain Foundation
export { brainFoundationRouter } from "./brain/index.ts";
export * from "./brain/types/index.ts";
export * from "./brain/services/index.ts";

// Phase 2.4 AI Decision Engine Foundation
export { decisionFoundationRouter } from "./decision/index.ts";
export * from "./decision/types/index.ts";
export * from "./decision/services/index.ts";



// AI Leaderboard
export { leaderboardRouter } from "./ai/leaderboard/routes/index.ts";
export * from "./ai/leaderboard/types/index.ts";

// AI Performance Lab
export { performanceRouter } from "./ai/performance/routes/index.ts";
export * from "./ai/performance/types/index.ts";

// AI Fund Manager
export { fundRouter } from "./ai/fund/routes/index.ts";
export * from "./ai/fund/types/index.ts";

// Phase 2.7 Fund Manager Foundation
export { fundFoundationRouter } from "./fund/index.ts";
export * from "./fund/index.ts";

// Phase 2.8 Wallet Foundation
export { walletRouter } from "./wallet/index.ts";
export {
  WalletService,
  WalletRepository,
  LedgerEngineService,
  BalanceEngineService,
  TransactionEngineService,
  TransferEngineService,
  WalletHealthService,
  WalletPipelineService,
  WalletRegistryService,
  WalletMetadataService,
  WalletLifecycleService,
  WalletValidator,
} from "./wallet/index.ts";

// AI Tournament Arena
export { tournamentRouter } from "./ai/tournament/routes/index.ts";
export * from "./ai/tournament/types/index.ts";

// AI Evolution Engine
export { evolutionRouter } from "./ai/evolution/routes/index.ts";
export * from "./ai/evolution/types/index.ts";

// AI Knowledge Graph Engine
export { knowledgeRouter } from "./ai/knowledge/routes/index.ts";
export * from "./ai/knowledge/types/index.ts";

// AI Collaboration Engine
export { collaborationRouter } from "./ai/collaboration/routes/index.ts";
export * from "./ai/collaboration/types/index.ts";

// Strategy Registry Engine
export { strategyRegistryRouter } from "./strategy/registry/routes/index.ts";
export * from "./strategy/registry/types/index.ts";

// Strategy Lifecycle Engine
export { strategyLifecycleRouter } from "./strategy/lifecycle/routes/index.ts";
export * from "./strategy/lifecycle/types/index.ts";

// Strategy Builder Engine
export { strategyBuilderRouter } from "./strategy/builder/routes/index.ts";
export * from "./strategy/builder/types/index.ts";

// Strategy Versioning Engine
export { strategyVersioningRouter } from "./strategy/versioning/routes/index.ts";


// Strategy Optimizer Engine
export { strategyOptimizerRouter } from "./strategy/optimizer/routes/index.ts";
export * from "./strategy/optimizer/types/index.ts";

// Strategy Backtesting Engine
export { strategyBacktestingRouter } from "./strategy/backtesting/routes/index.ts";
export * from "./strategy/backtesting/types/index.ts";

// Strategy Leaderboard
export { strategyLeaderboardRouter } from "./strategy/leaderboard/routes/index.ts";
export * from "./strategy/leaderboard/types/index.ts";

// Strategy Marketplace
export { strategyMarketplaceRouter } from "./strategy/marketplace/routes/index.ts";
export * from "./strategy/marketplace/types/index.ts";

// Strategy Governance
export { strategyGovernanceRouter } from "./strategy/governance/routes/index.ts";
export * from "./strategy/governance/types/index.ts";

// Strategy Analytics
export { strategyAnalyticsRouter } from "./strategy/analytics/routes/index.ts";
export * from "./strategy/analytics/types/index.ts";

// Notifications & Workflow Engine (ENWE)
export { default as notificationRouter, workflowRouter } from "./notifications/api/notification.routes.ts";
export { notificationRouter as enterpriseNotificationRouter } from "./notifications/routes/notification.routes.ts";
export { workflowRouter as enterpriseWorkflowRouter } from "./workflows/index.ts";
export * from "./notifications/types/index.ts";

// Enterprise Audit Center
export { auditRouter as enterpriseAuditRouter } from "./audit/index.ts";
export * from "./audit/types/index.ts";

// Enterprise Order Management
export { enterpriseOrderRouter } from "./orders/index.ts";
export * from "./orders/types/index.ts";

// Enterprise QA
export { qaRouter } from "./qa/routes/index.ts";

export * from "./qa/types/index.ts";

// EP01 Enterprise Genesis & Zero State Engine
export { genesisRouter } from "./genesis/routes/genesis.routes.ts";
export * from "./genesis/types/index.ts";

// EP02 Enterprise ATM Currency & Treasury Engine
export { treasuryRouter } from "./treasury/routes/index.ts";
export * from "./treasury/types/index.ts";

// EP03 Enterprise AI Activation & Runtime Management Engine
export { aiActivationRouter } from "./aiActivation/routes/aiActivation.routes.ts";
export * from "./aiActivation/types/index.ts";

// EP05 Enterprise Indian Market Operating System
export { indianMarketRouter } from "./indianMarket/routes/index.ts";
export * from "./indianMarket/types/index.ts";

// EP07 Enterprise AI Intelligence Workspace
// export { intelligenceRouter } from "./intelligence/routes/index.ts";
export * from "./intelligence/types/index.ts";

// EP09 Enterprise Committee Workspace
export { committeeRouter } from "./committee/routes/committee.routes.ts";
export * from "./committee/types/index.ts";

// EP10 Enterprise Decision Authorization & Execution Control Workspace
export { executionRouter } from "./execution/routes/execution.routes.ts";
export * from "./execution/types/index.ts";
export * from "./execution/services/execution.service.ts";







// Enterprise Settings Manager
export { settingsRouter } from "./settings/routes/settings.routes.ts";

// EP23: Enterprise Compliance & Regulatory Engine (ECRE)
export { complianceRouter } from "./compliance/routes/index.ts";
export * from "./compliance/types/ep23.types";
export * from "./compliance/services/compliance.service";

// EP24: Enterprise Observability & Performance Analytics (EOPA)
export { observabilityRouter } from "./observability/routes/index.ts";
export * from "./observability/types/ep24.types";
export * from "./observability/services/observability.service";

// EP25: Enterprise Backup & Disaster Recovery (EBDR)
export { backupRouter } from "./backup/routes/index.ts";
export * from "./backup/types/ep25.types";
export * from "./backup/services/backup.service";

// EP26: Enterprise Scheduler & Automation Engine (ESAE)
export { schedulerRouter } from "./scheduler/routes/index.ts";
export * from "./scheduler/types/ep26.types";
export * from "./scheduler/services/scheduler.service";

// EP27: Enterprise API Gateway & External Integrations (EAGI)
export { gatewayRouter } from "./gateway/routes/index.ts";
export * from "./gateway/types/ep27.types";
export * from "./gateway/services/gateway.service";

// EP28: Enterprise Security Operations Center (SOC)
export { securityRouter } from "./security/routes/index.ts";
export * from "./security/types/ep28.types";
export * from "./security/services/security.service";

// EP29: Enterprise Release & Environment Management (EREM)
export { releasesRouter } from "./releases/routes/index.ts";
export * from "./releases/types/ep29.types";
export * from "./releases/services/releases.service";

// EP30: Enterprise Certification & Production Readiness (ECPR)
export { certificationRouter } from "./certification/routes/index.ts";
export * from "./certification/types/ep30.types";
export * from "./certification/services/certification.service";


// Phase 2.10 Enterprise Order Management System (OMS) Foundation
export { omsRouter } from "./oms/routes/index.ts";
export {
  OMSService,
  OMSRepository,
  OrderStateMachine,
  OrderLifecycleManager,
  OrderValidator,
  ExecutionValidator,
  OMSRegistryService,
  OMSHealthService,
  OMSMetadataService,
} from "./oms/index.ts";
export type {
  OMSOrder,
  CreateOrderRequest as OMSCreateOrderRequest,
  OrderType as OMSOrderType,
  OrderSide as OMSOrderSide,
  OrderStatus as OMSOrderStatus,
  OMSPipelineStage,
  OMSPipelineResult,
  OMSPipelineStageLog,
  OMSOrderHistoryRecord,
  OMSExecutionQueueItem,
  OMSOrderMetadataRecord,
  OMSOrderEventRecord,
  OMSStateTransitionRecord,
  OMSHealthReport,
} from "./oms/types/index.ts";
export { CreateOrderDTO, CancelOrderDTO, RetryOrderDTO } from "./oms/dtos/oms.dto.ts";

// Phase 2.11 Enterprise Portfolio Foundation
export { portfolioRouter } from "./portfolio/routes/index.ts";
export {
  PortfolioService,
  PortfolioRepository,
  PositionStateMachine,
  PortfolioLifecycleManager,
  PortfolioValidator,
  PositionEngine,
  HoldingEngine,
  MTMEngine,
  PnLEngine,
  ExposureEngine,
  SnapshotEngine,
  PortfolioRegistryService,
  PortfolioHealthService,
  PortfolioMetadataService,
} from "./portfolio/index.ts";
export type {
  PortfolioAccount,
  PortfolioPosition,
  PortfolioHolding,
  PortfolioSnapshot,
  PortfolioPnLRecord,
  PortfolioEventRecord,
  PortfolioMetadataRecord,
  OMSExecutionUpdate,
  PortfolioPipelineResult,
  PortfolioExposureMetrics,
  PortfolioHealthReport,
} from "./portfolio/types/index.ts";
export { OMSExecutionDTO } from "./portfolio/dtos/portfolio.dto.ts";



// PMS Module
export { pmsRouter } from "./pms/routes/index.ts";
export * from "./pms/types/index.ts";

// RMS Module
export { rmsRouter } from "./rms/routes/index.ts";
export * from "./rms/types/index.ts";

// EP14: Enterprise Paper Trading Execution Engine
export { paperExecutionEngineRouter } from "./paperExecution/routes/index.ts";
export * from "./paperExecution/types/index.ts";

// EP15: Enterprise Trade Lifecycle & Journal (TLJMS)
export { tradeJournalRouter } from "./tradeJournal/routes/index.ts";
export * from "./tradeJournal/types/index.ts";

// EP16: Enterprise Accounting & General Ledger (EGLS)
export { accountingRouter } from "./accounting/routes/index.ts";
export type { AccountType as AccountingAccountType } from "./accounting/types/index.ts";
export {
  type TransactionType,
  type JournalEntryStatus,
  type PeriodType,
  type PeriodStatus,
  type StatementType,
  type ChartOfAccount,
  type CreateAccountRequest,
  type JournalEntryLine,
  type PostJournalEntryRequest,
  type LedgerTransaction,
  type JournalEntry,
  type GeneralLedgerAccount,
  type TrialBalanceAccount,
  type TrialBalanceResult,
  type FinancialStatementLine,
  type ProfitLossStatement,
  type BalanceSheetStatement,
  type AccountingPeriod,
  type AccountingCertificate,
  type AccountingAuditLog,
  type AccountingPeriodFilter
} from "./accounting/types/index.ts";

// Phase 2.1A: Constitution Engine Foundation
export { constitutionRouter } from "./constitution/index.ts";
export type {
  ConstitutionVersion,
  ConstitutionRegistryEntry,
  ConstitutionModuleRegistration,
  ConstitutionMetadataEntry,
  ConstitutionRule,
  ConstitutionPolicy,
  ConstitutionSnapshot,
  ConstitutionAuditLog,
  RegisterModuleDTO,
  RegisterPolicyDTO,
  KernelLifecycleRecord,
  ValidationPhaseResult,
  StructuredValidationDiagnostics,
  BootPipelineStep,
  BootPipelineResult,
  VersionCompatibilityMetadata,
  ConstitutionMetrics,
  GranularCacheStatus,
  ConstitutionHealthStatus,
  ConstitutionFoundationSummary,
  KernelLifecycleState,
  EmergencyMode,
  GovernanceRole,
  GovernanceAction,
  ValidationPhase,
  ConstitutionVersionStatus,
  ConstitutionModuleStatus
} from "./constitution/types/index.ts";
export type { PolicyCategory as ConstitutionPolicyCategory } from "./constitution/types/index.ts";

// Runtime Governance
export { runtimeGovernanceRouter } from "./runtime-governance/index.ts";
export * from "./runtime-governance/index.ts";

export { brainHardeningRouter } from "./brain/routes/hardening.routes.ts";
export { walletHardeningRouter } from "./wallet/routes/hardening.routes.ts";

// Phase 3: Technical Indicator & Signal Engine
export { indicatorsRouter } from "./indicators/index.ts";
export * from "./indicators/index.ts";

// Phase 3: News Intelligence, Corporate Actions, and Economic Calendar
export {
  newsRouter,
  newsRepo,
  NewsRepository,
  newsService,
  NewsService,
  NewsRegistry,
  NewsHealth,
  NewsLifecycle,
  newsController,
  NewsController
} from "./news/index.ts";
export type {
  NewsCategory,
  CorporateActionType,
  CorporateActionStatus,
  EconomicCategory,
  NewsArticle,
  NewsSource,
  NewsCategoryDef,
  NewsTag,
  NewsSymbolMapping,
  CorporateAction,
  EconomicCalendarEvent,
  EconomicEventDef,
  NewsHistoryEntry,
  NewsMetadata,
  RawNewsInput,
  NewsProvider
} from "./news/types/index.ts";

// Enterprise Team Collaboration & Workspace Sharing
export { collabRouter } from "./collab/index.ts";
export * from "./collab/index.ts";




export { enterpriseExecutionRouter } from "./executions/routes/execution.routes.ts";
export { enterprisePortfolioRouter } from "./portfolios/routes/portfolio.routes.ts";
export { enterprisePositionRouter } from "./portfolios/routes/position.routes.ts";
export { ep05TradesRouter, ep05PnlRouter } from "./tradeJournal/routes/ep05.routes.ts";
export { orchestratorRouter } from "./orchestrator/routes/OrchestratorRouter.ts";
export { ep07PerformanceRouter } from "./performance/routes/PerformanceRouter.ts";
export { ep07bLearningRouter } from "./learning/routes/LearningRouter.ts";
export { evaluationRouter as ep07eEvaluationRouter } from "./evaluation/routes/EvaluationRouter.ts";
export { intelligenceRouter } from "./intelligence/routes/index.ts";
export { forecastRouter } from "./forecast/routes/ForecastRouter.ts";
export { explainabilityRouter } from "./explainability/routes/ExplainabilityRouter.ts";
export { recommendationRouter } from "./recommendation/routes/RecommendationRouter.ts";
export { notificationCenterRouter } from "./notification/routes/NotificationRouter.ts";
export { monitoringRouter } from "./monitoring/routes/MonitoringRouter.ts";
export { auditRouter } from "./audit/routes/AuditRouter.ts";
export { operationsConsoleRouter } from "./operations/routes/OperationsRouter.ts";
export { alertRouter } from "./notifications/routes/alert.routes.ts";


// Phase 10D Secrets & Key Management
export { secretsRouter } from "./secrets/index.ts";
export * from "./secrets/types/secrets.types.ts";

