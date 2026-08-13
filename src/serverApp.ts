import express from 'express';
import { config } from './infrastructure/config/env';
import { securityMiddleware } from './middleware/security';
import { globalLimiter, authLimiter } from './middleware/rate-limit';
import { correlationMiddleware } from './middleware/correlation';
import { apiLoggerMiddleware } from './middleware/api-logger';
import { errorHandler } from './middleware/error';
import { globalAuthMiddleware } from './middleware/global-auth';
import { responseFormatter } from './middleware/response';
import { auditMiddleware } from './middleware/audit';
import { sql } from 'drizzle-orm';
import { healthRouter } from './infrastructure/health/health.routes';
import { getDb } from './db/client';
import { databaseRouter } from './modules/system/database/database.routes';
import { middlewareRouter } from './modules/system/middleware/middleware.routes';

export const app = express();

app.use(securityMiddleware);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting

app.use('/api/', globalLimiter);
app.use('/api/login', authLimiter);

// Enterprise Observability & Request Formatting
app.use(correlationMiddleware);
app.use(apiLoggerMiddleware);
app.use(responseFormatter);

// Global Authentication Middleware
app.use(globalAuthMiddleware);

// Audit Logger Middleware for specific high-value namespaces
app.use('/api/treasury', auditMiddleware('TREASURY_ACTION'));
app.use('/api/committee', auditMiddleware('COMMITTEE_ACTION'));
app.use('/api/execution', auditMiddleware('EXECUTION_ACTION'));
app.use('/api/system', auditMiddleware('ADMIN_ACTION'));
app.use('/api/identity', auditMiddleware('AUTH_ACTION'));
app.use('/api/strategy/governance', auditMiddleware('GOVERNANCE_ACTION'));

// Prevent HTTP 302 redirects for sub-router mount points by internally appending a trailing slash before routing
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    const pathsToRewrite = [
      '/api/brain',
      '/api/ai/brain',
      '/api/ai/decision',
      '/api/decision',
      '/api/ai/leaderboard',
      '/api/ai/performance',
      '/api/ai/fund',
      '/api/ai/tournament',
      '/api/ai/evolution',
      '/api/ai/knowledge',
      '/api/ai/collaboration',
      '/api/strategy/lifecycle',
      '/api/strategy/builder',
      '/api/strategy/library',
      '/api/strategy/parameters',
      '/api/strategy/candidates',
      '/api/strategy/leaderboard',
      '/api/strategy/marketplace',
      '/api/strategy/governance',
      '/api/strategy/analytics',
      '/api/operations',
      '/api/reporting',
      '/api/compliance',
      '/api/observability',
      '/api/backup',
      '/api/scheduler',
      '/api/gateway',
      '/api/security',
      '/api/secrets',
      '/api/releases',
      '/api/certification',
      '/api/constitution',
      '/api/wallet',
      '/api/oms',
      '/api/indicators',
      '/api/news',
      '/api/alerts'
    ];
    if (pathsToRewrite.includes(req.path)) {
      req.url = req.url.replace(req.path, req.path + '/');
    }
  }
  next();
});

// Health Checks
app.use('/api/health', healthRouter);

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'UP',
    timestamp: new Date().toISOString()
  });
});

app.get('/ready', async (req, res) => {
  try {
    // Check Database Connectivity
    const db = getDb();
    await db.execute(sql`SELECT 1`);
    
    res.status(200).json({ 
      status: 'READY',
      checks: {
        database: 'HEALTHY'
      }
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'NOT_READY',
      checks: {
        database: 'UNHEALTHY'
      }
    });
  }
});

app.get('/live', (req, res) => {
  res.status(200).json({ status: 'LIVE' });
});

// Identity & Trading Module Routes
import { collabRouter } from './modules/collab/index.ts';
import { notificationCenterRouter } from './modules/index.ts';
import { monitoringRouter } from './modules/index.ts';
import { auditRouter } from './modules/index.ts';
import { operationsConsoleRouter } from './modules/index.ts';
import { enterprisePortfolioRouter, enterprisePositionRouter, orgRouter, rbacRouter, newsRouter, indicatorsRouter, runtimeGovernanceRouter, brainHardeningRouter, walletHardeningRouter, constitutionRouter, certificationRouter, releasesRouter, securityRouter, secretsRouter, gatewayRouter, backupRouter, observabilityRouter, complianceRouter, aiGovernanceRouter, studioRouter, operationsRouter, adminRouter, settingsRouter, aiActivationRouter, treasuryRouter, genesisRouter, qaRouter, strategyGovernanceRouter, strategyAnalyticsRouter, strategyMarketplaceRouter, strategyLeaderboardRouter, strategyBacktestingRouter, strategyOptimizerRouter, strategyVersioningRouter, strategyBuilderRouter, strategyLibraryRouter, strategyParametersRouter, strategyCandidatesRouter, strategyRankingRouter, strategyRuntimeRouter, strategyLifecycleRouter, strategyRegistryRouter, strategyFoundationRouter, collaborationRouter, knowledgeRouter, evolutionRouter, tournamentRouter, fundRouter, fundFoundationRouter, walletRouter, performanceRouter, leaderboardRouter, brainRouter, brainFoundationRouter, decisionFoundationRouter, identityRouter, tradingRouter, marketRouter, riskRouter, paperTradingRouter, eventRouter, telegramRouter, aiRouter, strategyRouter, researchRouter, analyticsRouter, notificationRouter, workflowRouter, indianMarketRouter, intelligenceRouter, committeeRouter, executionRouter, omsRouter, portfolioRouter, pmsRouter, rmsRouter, paperExecutionEngineRouter, tradeJournalRouter, accountingRouter, enterpriseNotificationRouter, enterpriseWorkflowRouter, enterpriseAuditRouter, enterpriseOrderRouter, enterpriseExecutionRouter, orchestratorRouter, ep07eEvaluationRouter, forecastRouter, explainabilityRouter, recommendationRouter, reportingRouter, schedulerRouter, alertRouter } from './modules/index.ts';
app.use('/api/collab', collabRouter);
app.use('/api/rbac', rbacRouter);
app.use('/api/runtime-governance', runtimeGovernanceRouter);
app.use('/api/governance/runtime', runtimeGovernanceRouter);
app.use('/api/ai/brain/hardening', brainHardeningRouter);
app.use('/api/wallet/hardening', walletHardeningRouter);
app.use('/api/indicators', indicatorsRouter);
app.use('/api', newsRouter);
app.use('/api', orgRouter);

app.use('/api/constitution', constitutionRouter);
app.use('/api/admin', adminRouter);
app.use('/api', identityRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/decision', decisionFoundationRouter);
app.use('/api/ai/decision', decisionFoundationRouter);
app.use('/api/fund', fundFoundationRouter);
app.use('/fund', fundFoundationRouter);
app.use('/api/wallet', walletRouter);
app.use('/wallet', walletRouter);
app.use('/api', tradingRouter);
app.use('/api', marketRouter);
app.use('/api', indianMarketRouter);
app.use('/api', intelligenceRouter);
app.use('/api/committee', committeeRouter);
app.use('/api/execution', executionRouter);
app.use('/api/workspace', executionRouter);
app.use('/api', riskRouter);
app.use('/api', paperTradingRouter);
app.use('/api', eventRouter);
app.use('/api', telegramRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/notification-center', notificationCenterRouter);
app.use('/api/monitoring', monitoringRouter);
app.use('/api/audit', auditRouter);
app.use('/api/operations', operationsConsoleRouter);
app.use('/api', enterpriseNotificationRouter);
app.use('/api/workflows', enterpriseWorkflowRouter);
app.use('/api/audit', enterpriseAuditRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/forecast', forecastRouter);
app.use('/api/explainability', explainabilityRouter);
app.use('/api/recommendation', recommendationRouter);
app.use('/api/studio', studioRouter);
app.use('/api/evaluation', ep07eEvaluationRouter);
app.use('/api/orders', enterpriseOrderRouter);
app.use('/api/workflow', workflowRouter);
app.use('/api/qa', qaRouter);
app.use('/api/system', genesisRouter);
app.use('/api/system/database', databaseRouter);
app.use('/api/system/middleware', middlewareRouter);
app.use('/api/treasury', treasuryRouter);
app.use('/api', aiActivationRouter);
app.use('/api/ai', aiGovernanceRouter);
app.use('/api/ai/governance', aiGovernanceRouter);
app.use('/api', aiRouter);
app.use('/api/brain', brainFoundationRouter);
app.use('/api/ai/brain/foundation', brainFoundationRouter);
app.use('/api/ai/brain', brainRouter);
app.use('/api/ai/leaderboard', leaderboardRouter);
app.use('/api/ai/performance', performanceRouter);
app.use('/api/ai/fund', fundRouter);
app.use('/api/ai/tournament', tournamentRouter);
app.use('/api/ai/evolution', evolutionRouter);
app.use('/api/ai/knowledge', knowledgeRouter);
app.use('/api/ai/collaboration', collaborationRouter);
app.use('/api/strategy/library', strategyLibraryRouter);
app.use('/api/strategy/parameters', strategyParametersRouter);
app.use('/api/strategy/candidates', strategyCandidatesRouter);
app.use('/api/strategy/ranking', strategyRankingRouter);
app.use('/api/strategy/runtime', strategyRuntimeRouter);
app.use('/api/strategy', strategyFoundationRouter);
app.use('/api/ai/strategy', strategyFoundationRouter);
app.use('/api', strategyRouter);
app.use('/api/strategy', strategyRegistryRouter);
app.use('/api/strategy/lifecycle', strategyLifecycleRouter);
app.use('/api/strategy/builder', strategyBuilderRouter);
app.use('/api/strategy/versioning', strategyVersioningRouter);
app.use('/api/strategy/version', strategyVersioningRouter);
app.use('/api/strategy/optimizer', strategyOptimizerRouter);
app.use('/api/strategy/backtesting', strategyBacktestingRouter);
app.use('/api/strategy/leaderboard', strategyLeaderboardRouter);
app.use('/api/strategy/marketplace', strategyMarketplaceRouter);
app.use('/api/strategy/governance', strategyGovernanceRouter);
app.use('/api/strategy/analytics', strategyAnalyticsRouter);
app.use('/api', researchRouter);
app.use('/api', analyticsRouter);
app.use('/api', omsRouter);
app.use('/api', portfolioRouter);
app.use('/api', pmsRouter);
app.use('/api/risk', rmsRouter);
app.use('/api/execution', paperExecutionEngineRouter);
app.use('/api/trades', tradeJournalRouter);
app.use('/api/accounting', accountingRouter);
app.use('/api/operations', operationsRouter);
app.use('/api/reporting', reportingRouter);
app.use('/api/compliance', complianceRouter);
app.use('/api/observability', observabilityRouter);
app.use('/api/backup', backupRouter);
app.use('/api/scheduler', schedulerRouter);
app.use('/api/gateway', gatewayRouter);
app.use('/api/security', securityRouter);
app.use('/api/secrets', secretsRouter);
app.use('/api/releases', releasesRouter);
app.use('/api/certification', certificationRouter);
app.use('/api/alerts', alertRouter);

// Global Error Handler
app.use(errorHandler);
