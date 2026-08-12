/**
 * ============================================================================
 * AI ARINA V3.2 — PHASE F1 ENTERPRISE WORKSPACE OWNERSHIP MATRIX (FROZEN)
 * ============================================================================
 * Strict Architecture Rule: ONE BUSINESS DOMAIN = ONE MODULE.
 * Every workspace belongs to exactly ONE parent module with zero orphan, 
 * duplicate, cyclic, or cross-domain ownership conflicts.
 */

export interface WorkspaceOwnershipRecord {
  workspaceId: string;
  workspaceName: string;
  parentModuleId: string;
  parentModuleName: string;
  backendOwner: string;
  databaseOwner: string;
  apiOwner: string;
  eventOwner: string;
  webSocketOwner: string;
  routeOwner: string;
  permissionOwner: string;
  isSidebarModule: boolean;
}

export const ENTERPRISE_WORKSPACE_OWNERSHIP_MATRIX: WorkspaceOwnershipRecord[] = [
  // --------------------------------------------------------------------------
  // MODULE 1: AI INTELLIGENCE (Parent: AI)
  // --------------------------------------------------------------------------
  {
    workspaceId: 'AI_MODELS',
    workspaceName: 'AI Models Hub',
    parentModuleId: 'AI',
    parentModuleName: 'AI Intelligence',
    backendOwner: 'src/modules/ai',
    databaseOwner: 'ai_models_table',
    apiOwner: '/api/v1/ai/models',
    eventOwner: 'ai.model.updated',
    webSocketOwner: 'ws://ai-models-feed',
    routeOwner: '/ai?tab=MODELS',
    permissionOwner: 'PERM_AI_MODELS_READ',
    isSidebarModule: false
  },
  {
    workspaceId: 'AI_BRAIN',
    workspaceName: 'Neural Brain Core',
    parentModuleId: 'AI',
    parentModuleName: 'AI Intelligence',
    backendOwner: 'src/modules/brain',
    databaseOwner: 'brain_state_table',
    apiOwner: '/api/v1/ai/brain',
    eventOwner: 'brain.state.changed',
    webSocketOwner: 'ws://brain-telemetry',
    routeOwner: '/ai?tab=BRAIN',
    permissionOwner: 'PERM_BRAIN_READ',
    isSidebarModule: false
  },
  {
    workspaceId: 'COMMITTEE',
    workspaceName: 'AI Committee & Governance',
    parentModuleId: 'AI',
    parentModuleName: 'AI Intelligence',
    backendOwner: 'src/modules/committee',
    databaseOwner: 'ai_committee_votes',
    apiOwner: '/api/v1/ai/committee',
    eventOwner: 'committee.vote.cast',
    webSocketOwner: 'ws://committee-live',
    routeOwner: '/ai?tab=GOVERNANCE',
    permissionOwner: 'PERM_AI_GOVERNANCE_MANAGE',
    isSidebarModule: false
  },
  {
    workspaceId: 'EXECUTION',
    workspaceName: 'Decision Engine',
    parentModuleId: 'AI',
    parentModuleName: 'AI Intelligence',
    backendOwner: 'src/modules/decision',
    databaseOwner: 'ai_decisions_table',
    apiOwner: '/api/v1/ai/decisions',
    eventOwner: 'decision.generated',
    webSocketOwner: 'ws://decision-engine-stream',
    routeOwner: '/ai?tab=DECISION',
    permissionOwner: 'PERM_DECISION_EXECUTE',
    isSidebarModule: false
  },
  {
    workspaceId: 'CONSTITUTION',
    workspaceName: 'AI ARINA Constitution',
    parentModuleId: 'AI',
    parentModuleName: 'AI Intelligence',
    backendOwner: 'src/modules/constitution',
    databaseOwner: 'constitution_rules',
    apiOwner: '/api/v1/ai/constitution',
    eventOwner: 'constitution.rule.evaluated',
    webSocketOwner: 'ws://constitution-audit',
    routeOwner: '/ai?tab=CONSTITUTION',
    permissionOwner: 'PERM_CONSTITUTION_VIEW',
    isSidebarModule: false
  },
  {
    workspaceId: 'AI_MEMORY',
    workspaceName: 'Vector & Episodic Memory',
    parentModuleId: 'AI',
    parentModuleName: 'AI Intelligence',
    backendOwner: 'src/modules/ai/memory',
    databaseOwner: 'vector_store_table',
    apiOwner: '/api/v1/ai/memory',
    eventOwner: 'memory.indexed',
    webSocketOwner: 'ws://ai-memory-stream',
    routeOwner: '/ai?tab=MEMORY',
    permissionOwner: 'PERM_AI_MEMORY_READ',
    isSidebarModule: false
  },

  // --------------------------------------------------------------------------
  // MODULE 2: TRADING EXECUTION (Parent: TRADING)
  // --------------------------------------------------------------------------
  {
    workspaceId: 'TRADING_HUB',
    workspaceName: 'Trading Execution Hub',
    parentModuleId: 'TRADING',
    parentModuleName: 'Trading',
    backendOwner: 'src/modules/trading',
    databaseOwner: 'trades_table',
    apiOwner: '/api/v1/trading/execute',
    eventOwner: 'trade.executed',
    webSocketOwner: 'ws://trading-execution-feed',
    routeOwner: '/trading?tab=EXECUTION',
    permissionOwner: 'PERM_TRADING_EXECUTE',
    isSidebarModule: false
  },
  {
    workspaceId: 'OMS',
    workspaceName: 'Enterprise OMS (Order Management System)',
    parentModuleId: 'TRADING',
    parentModuleName: 'Trading',
    backendOwner: 'src/modules/oms',
    databaseOwner: 'oms_orders_table',
    apiOwner: '/api/v1/oms/orders',
    eventOwner: 'oms.order.placed',
    webSocketOwner: 'ws://oms-order-depth',
    routeOwner: '/trading?tab=OMS',
    permissionOwner: 'PERM_OMS_MANAGE',
    isSidebarModule: false
  },
  {
    workspaceId: 'PMS',
    workspaceName: 'Enterprise PMS (Portfolio Management System)',
    parentModuleId: 'TRADING',
    parentModuleName: 'Trading',
    backendOwner: 'src/modules/pms',
    databaseOwner: 'pms_portfolios_table',
    apiOwner: '/api/v1/pms/portfolios',
    eventOwner: 'pms.rebalanced',
    webSocketOwner: 'ws://pms-valuation-stream',
    routeOwner: '/trading?tab=PMS',
    permissionOwner: 'PERM_PMS_READ',
    isSidebarModule: false
  },
  {
    workspaceId: 'RMS',
    workspaceName: 'Enterprise RMS (Risk Management System)',
    parentModuleId: 'TRADING',
    parentModuleName: 'Trading',
    backendOwner: 'src/modules/rms',
    databaseOwner: 'rms_limits_table',
    apiOwner: '/api/v1/rms/risk',
    eventOwner: 'rms.breach.detected',
    webSocketOwner: 'ws://rms-risk-telemetry',
    routeOwner: '/trading?tab=RMS',
    permissionOwner: 'PERM_RMS_VIEW',
    isSidebarModule: false
  },

  // --------------------------------------------------------------------------
  // MODULE 3: FUND MANAGER (Parent: FUND_MANAGER)
  // --------------------------------------------------------------------------
  {
    workspaceId: 'FUND_DASHBOARD',
    workspaceName: 'Fund Management Dashboard',
    parentModuleId: 'FUND_MANAGER',
    parentModuleName: 'Fund Manager',
    backendOwner: 'src/modules/fund',
    databaseOwner: 'funds_master_table',
    apiOwner: '/api/v1/funds/summary',
    eventOwner: 'fund.metrics.updated',
    webSocketOwner: 'ws://funds-summary-feed',
    routeOwner: '/fund-manager?tab=DASHBOARD',
    permissionOwner: 'PERM_FUND_VIEW',
    isSidebarModule: false
  },
  {
    workspaceId: 'TREASURY',
    workspaceName: 'Treasury & Liquidity Reserves',
    parentModuleId: 'FUND_MANAGER',
    parentModuleName: 'Fund Manager',
    backendOwner: 'src/modules/treasury',
    databaseOwner: 'treasury_balances_table',
    apiOwner: '/api/v1/treasury/reserves',
    eventOwner: 'treasury.rebalance.requested',
    webSocketOwner: 'ws://treasury-liquidity-stream',
    routeOwner: '/fund-manager?tab=TREASURY',
    permissionOwner: 'PERM_TREASURY_MANAGE',
    isSidebarModule: false
  },

  // --------------------------------------------------------------------------
  // MODULE 4: MARKET INTELLIGENCE (Parent: MARKET)
  // --------------------------------------------------------------------------
  {
    workspaceId: 'MARKET_DASHBOARD',
    workspaceName: 'Enterprise Market Dashboard',
    parentModuleId: 'MARKET',
    parentModuleName: 'Market',
    backendOwner: 'src/modules/market',
    databaseOwner: 'market_feed_table',
    apiOwner: '/api/v1/market/prices',
    eventOwner: 'market.tick.received',
    webSocketOwner: 'ws://market-ticks-stream',
    routeOwner: '/market?tab=DASHBOARD',
    permissionOwner: 'PERM_MARKET_VIEW',
    isSidebarModule: false
  },
  {
    workspaceId: 'INDIAN_MARKET',
    workspaceName: 'Indian Market OS (NSE/BSE)',
    parentModuleId: 'MARKET',
    parentModuleName: 'Market',
    backendOwner: 'src/modules/indianMarket',
    databaseOwner: 'indian_market_data',
    apiOwner: '/api/v1/market/india',
    eventOwner: 'indian.market.updated',
    webSocketOwner: 'ws://nse-bse-orderbook',
    routeOwner: '/market?tab=INDIAN_MARKET',
    permissionOwner: 'PERM_INDIAN_MARKET_READ',
    isSidebarModule: false
  },

  // --------------------------------------------------------------------------
  // MODULE 5: ENTERPRISE ADMINISTRATION (Parent: ADMINISTRATION)
  // --------------------------------------------------------------------------
  {
    workspaceId: 'ADMIN_DASHBOARD',
    workspaceName: 'Administration Control Center',
    parentModuleId: 'ADMINISTRATION',
    parentModuleName: 'Administration',
    backendOwner: 'src/modules/identity',
    databaseOwner: 'users_and_roles_table',
    apiOwner: '/api/v1/admin/summary',
    eventOwner: 'admin.user.updated',
    webSocketOwner: 'ws://admin-events',
    routeOwner: '/admin?tab=DASHBOARD',
    permissionOwner: 'PERM_ADMIN_ACCESS',
    isSidebarModule: false
  },
  {
    workspaceId: 'GENESIS',
    workspaceName: 'Genesis Engine',
    parentModuleId: 'ADMINISTRATION',
    parentModuleName: 'Administration',
    backendOwner: 'src/modules/genesis',
    databaseOwner: 'genesis_bootstrap_logs',
    apiOwner: '/api/v1/genesis/bootstrap',
    eventOwner: 'genesis.initialized',
    webSocketOwner: 'ws://genesis-log-stream',
    routeOwner: '/admin?tab=GENESIS',
    permissionOwner: 'PERM_GENESIS_EXECUTE',
    isSidebarModule: false
  },
  {
    workspaceId: 'BACKUP',
    workspaceName: 'Backup & Disaster Recovery',
    parentModuleId: 'ADMINISTRATION',
    parentModuleName: 'Administration',
    backendOwner: 'src/modules/backup',
    databaseOwner: 'system_snapshots_table',
    apiOwner: '/api/v1/backup/status',
    eventOwner: 'backup.snapshot.created',
    webSocketOwner: 'ws://backup-progress-stream',
    routeOwner: '/admin?tab=BACKUP',
    permissionOwner: 'PERM_BACKUP_MANAGE',
    isSidebarModule: false
  },

  // --------------------------------------------------------------------------
  // MODULE 6: AI LIFECYCLE (Parent: LIFECYCLE)
  // --------------------------------------------------------------------------
  {
    workspaceId: 'LIFECYCLE_OVERVIEW',
    workspaceName: 'AI Model Lifecycle Overview',
    parentModuleId: 'LIFECYCLE',
    parentModuleName: 'AI Lifecycle',
    backendOwner: 'src/modules/aiActivation',
    databaseOwner: 'model_lifecycle_states',
    apiOwner: '/api/v1/lifecycle/models',
    eventOwner: 'lifecycle.model.promoted',
    webSocketOwner: 'ws://lifecycle-monitor',
    routeOwner: '/lifecycle?tab=OVERVIEW',
    permissionOwner: 'PERM_LIFECYCLE_VIEW',
    isSidebarModule: false
  },
  {
    workspaceId: 'AI_ACTIVATION',
    workspaceName: 'AI Activation Engine',
    parentModuleId: 'LIFECYCLE',
    parentModuleName: 'AI Lifecycle',
    backendOwner: 'src/modules/aiActivation',
    databaseOwner: 'ai_activation_logs',
    apiOwner: '/api/v1/lifecycle/activation',
    eventOwner: 'ai.activation.triggered',
    webSocketOwner: 'ws://activation-telemetry',
    routeOwner: '/lifecycle?tab=ACTIVATION',
    permissionOwner: 'PERM_ACTIVATION_MANAGE',
    isSidebarModule: false
  },

  // --------------------------------------------------------------------------
  // MODULE 7: CONTROL PLANE (Parent: CONTROL_PLANE)
  // --------------------------------------------------------------------------
  {
    workspaceId: 'CONTROL_DASHBOARD',
    workspaceName: 'Control Plane Master Dashboard',
    parentModuleId: 'CONTROL_PLANE',
    parentModuleName: 'Control Plane',
    backendOwner: 'src/modules/orchestrator',
    databaseOwner: 'system_switches_table',
    apiOwner: '/api/v1/control/status',
    eventOwner: 'control.switch.toggled',
    webSocketOwner: 'ws://control-plane-events',
    routeOwner: '/control-plane?tab=DASHBOARD',
    permissionOwner: 'PERM_CONTROL_MANAGE',
    isSidebarModule: false
  },
  {
    workspaceId: 'OBSERVABILITY',
    workspaceName: 'Observability & Telemetry',
    parentModuleId: 'CONTROL_PLANE',
    parentModuleName: 'Control Plane',
    backendOwner: 'src/modules/observability',
    databaseOwner: 'telemetry_metrics_table',
    apiOwner: '/api/v1/observability/metrics',
    eventOwner: 'observability.alert.raised',
    webSocketOwner: 'ws://observability-live',
    routeOwner: '/control-plane?tab=OBSERVABILITY',
    permissionOwner: 'PERM_OBSERVABILITY_VIEW',
    isSidebarModule: false
  },

  // --------------------------------------------------------------------------
  // MODULE 8: CERTIFICATION & QA (Parent: CERTIFICATION)
  // --------------------------------------------------------------------------
  {
    workspaceId: 'CERTIFICATION_ENGINE',
    workspaceName: 'System Certification Hub',
    parentModuleId: 'CERTIFICATION',
    parentModuleName: 'Certification & QA',
    backendOwner: 'src/modules/certification',
    databaseOwner: 'certification_tests_table',
    apiOwner: '/api/v1/certification/run',
    eventOwner: 'certification.completed',
    webSocketOwner: 'ws://certification-stream',
    routeOwner: '/certification?tab=ENGINE',
    permissionOwner: 'PERM_CERTIFICATION_RUN',
    isSidebarModule: false
  },
  {
    workspaceId: 'QA_SUITE',
    workspaceName: 'QA Test & Validation Suite',
    parentModuleId: 'CERTIFICATION',
    parentModuleName: 'Certification & QA',
    backendOwner: 'src/modules/qa',
    databaseOwner: 'qa_results_table',
    apiOwner: '/api/v1/qa/tests',
    eventOwner: 'qa.suite.executed',
    webSocketOwner: 'ws://qa-results-stream',
    routeOwner: '/certification?tab=QA',
    permissionOwner: 'PERM_QA_EXECUTE',
    isSidebarModule: false
  }
];

export function verifyWorkspaceOwnership(workspaceId: string): WorkspaceOwnershipRecord | undefined {
  const matches = ENTERPRISE_WORKSPACE_OWNERSHIP_MATRIX.filter(w => w.workspaceId === workspaceId);
  if (matches.length > 1) {
    throw new Error(`CRITICAL DUPLICATE WORKSPACE DETECTED: Workspace ID ${workspaceId} has multiple parent ownership entries!`);
  }
  return matches[0];
}
