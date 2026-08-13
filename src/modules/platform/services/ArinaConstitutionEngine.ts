export interface ConstitutionRule {
  id: string; // e.g., 'CONST-MIS-001'
  chapterId: string;
  sectionNumber: string; // e.g., 'Art 1.1'
  title: string;
  statement: string;
  purpose: string;
  mandatory: boolean; // Immutable rule
  version: string;
  approvedBy: string;
  lastUpdated: string;
  impact: {
    workspaces: string[];
    aiModels: string[];
    services: string[];
    apis: string[];
    databaseTables: string[];
  };
  dependencies: string[];
  revisionHistory: {
    version: string;
    date: string;
    author: string;
    note: string;
  }[];
}

export interface ConstitutionChapter {
  id: string;
  title: string;
  iconName: string;
  summary: string;
  rulesCount: number;
  sections: {
    title: string;
    rules: ConstitutionRule[];
  }[];
}

export interface GovernanceLog {
  id: string;
  timestamp: string;
  category: 'GOVERNANCE' | 'CONSTITUTION' | 'REVISION' | 'VALIDATION';
  level: 'INFO' | 'SUCCESS' | 'AUDIT' | 'WARN';
  ruleId?: string;
  message: string;
}

export class ArinaConstitutionEngine {
  private static instance: ArinaConstitutionEngine;

  private chapters: ConstitutionChapter[] = [];
  private logs: GovernanceLog[] = [];

  private constructor() {
    this.seedChapters();
    this.seedLogs();
  }

  public static getInstance(): ArinaConstitutionEngine {
    if (!ArinaConstitutionEngine.instance) {
      ArinaConstitutionEngine.instance = new ArinaConstitutionEngine();
    }
    return ArinaConstitutionEngine.instance;
  }

  public getOverview() {
    let totalRules = 0;
    this.chapters.forEach(c => {
      c.sections.forEach(s => {
        totalRules += s.rules.length;
      });
    });

    return {
      systemVersion: 'AI ARINA Enterprise OS v3.2',
      constitutionVersion: 'v3.2.0-CONST (Master Rulebook)',
      totalChapters: this.chapters.length,
      totalRules,
      lastRevisionDate: '2026-07-24',
      approvalStatus: 'APPROVED (UNANIMOUS BOARD CONSENSUS)',
      releaseStatus: 'RELEASE CANDIDATE 1 (RC1)',
      architectureStatus: '100% OPERATIONAL & ENFORCED',
      readOnlyMode: true
    };
  }

  public getChapters(): ConstitutionChapter[] {
    return this.chapters;
  }

  public getChapterById(id: string): ConstitutionChapter | undefined {
    return this.chapters.find(c => c.id === id);
  }

  public getAllRules(): ConstitutionRule[] {
    const rules: ConstitutionRule[] = [];
    this.chapters.forEach(c => {
      c.sections.forEach(s => {
        rules.push(...s.rules);
      });
    });
    return rules;
  }

  public searchRules(query: string, chapterIdFilter?: string): ConstitutionRule[] {
    let all = this.getAllRules();
    if (chapterIdFilter && chapterIdFilter !== 'ALL') {
      all = all.filter(r => r.chapterId === chapterIdFilter);
    }

    if (!query.trim()) return all;

    const q = query.toLowerCase();
    return all.filter(r => 
      r.id.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      r.statement.toLowerCase().includes(q) ||
      r.purpose.toLowerCase().includes(q) ||
      r.impact.workspaces.some(w => w.toLowerCase().includes(q)) ||
      r.impact.services.some(s => s.toLowerCase().includes(q))
    );
  }

  public getLogs(categoryFilter?: string): GovernanceLog[] {
    if (!categoryFilter || categoryFilter === 'ALL') return this.logs;
    return this.logs.filter(l => l.category === categoryFilter);
  }

  // --- Seed Data ---
  private seedChapters() {
    this.chapters = [
      // 1. MISSION CHAPTER
      {
        id: 'MISSION',
        title: '01. Mission & Philosophy',
        iconName: 'Target',
        summary: 'Primary Purpose, Vision, Objectives, and the Iron Triangle of Enterprise Capital Philosophy.',
        rulesCount: 3,
        sections: [
          {
            title: 'Section 1: Enterprise Philosophy & Hierarchy of Priorities',
            rules: [
              {
                id: 'CONST-MIS-001',
                chapterId: 'MISSION',
                sectionNumber: 'Art 1.1',
                title: 'Capital Protection First',
                statement: 'The preservation of institutional capital shall take absolute precedence over trade volume, strategy aggression, or yield optimization under all market regimes.',
                purpose: 'Prevents catastrophic drawdowns by forcing strict risk filters prior to signal evaluation.',
                mandatory: true,
                version: 'v3.2.0',
                approvedBy: 'Investment Committee & Chief Risk Officer',
                lastUpdated: '2026-07-24',
                impact: {
                  workspaces: ['Fund Manager', 'Risk Workspace', 'Trading Workspace', 'AI Committee'],
                  aiModels: ['All Champion Models', 'DeepSeek R1', 'GPT-5 Execution Agent'],
                  services: ['RiskEngineService', 'CapitalAllocationService', 'OrderRouter'],
                  apis: ['/api/risk/evaluate', '/api/trading/order'],
                  databaseTables: ['risk_limits', 'capital_locks', 'orders']
                },
                dependencies: ['CONST-RSK-001', 'CONST-CAP-001'],
                revisionHistory: [
                  { version: 'v1.0.0', date: '2025-01-10', author: 'CRO', note: 'Initial creation.' },
                  { version: 'v3.2.0', date: '2026-07-24', author: 'ARINA Board', note: 'Ratified for v3.2 Release Candidate.' }
                ]
              },
              {
                id: 'CONST-MIS-002',
                chapterId: 'MISSION',
                sectionNumber: 'Art 1.2',
                title: 'Consistency Second',
                statement: 'Algorithmic signals and execution must exhibit statistically verifiable consistency (Sharpe > 2.0, Sortino > 2.8) across rolling 90-day backtests before live allocation.',
                purpose: 'Ensures repeatable performance metrics over random market luck.',
                mandatory: true,
                version: 'v3.2.0',
                approvedBy: 'Head of Quantitative Research',
                lastUpdated: '2026-07-24',
                impact: {
                  workspaces: ['Strategy Workspace', 'Analytics Workspace', 'AI Workspace'],
                  aiModels: ['Claude 3.5 Sonnet Analyst', 'DeepSeek R1'],
                  services: ['BacktestEngine', 'StrategyEvaluatorService'],
                  apis: ['/api/strategy/validate', '/api/analytics/backtest'],
                  databaseTables: ['strategies', 'backtest_runs']
                },
                dependencies: ['CONST-STR-001'],
                revisionHistory: [
                  { version: 'v3.2.0', date: '2026-07-24', author: 'Head Quant', note: 'Enforced Sharpe ratio threshold.' }
                ]
              },
              {
                id: 'CONST-MIS-003',
                chapterId: 'MISSION',
                sectionNumber: 'Art 1.3',
                title: 'Profit Third',
                statement: 'Profit generation is the tertiary objective, achieved solely as a byproduct of rigorous risk control and consistent strategy execution.',
                purpose: 'Prevents reckless gain-seeking behavior by AI decision engines.',
                mandatory: true,
                version: 'v3.2.0',
                approvedBy: 'Chief Investment Officer',
                lastUpdated: '2026-07-24',
                impact: {
                  workspaces: ['Fund Manager', 'Leaderboard', 'Trading Workspace'],
                  aiModels: ['AI Committee Agents'],
                  services: ['PortfolioOptimizationEngine'],
                  apis: ['/api/fund/performance'],
                  databaseTables: ['fund_metrics', 'positions']
                },
                dependencies: ['CONST-MIS-001'],
                revisionHistory: [
                  { version: 'v3.2.0', date: '2026-07-24', author: 'CIO', note: 'Ratified.' }
                ]
              }
            ]
          }
        ]
      },

      // 2. CORE PRINCIPLES
      {
        id: 'CORE_PRINCIPLES',
        title: '02. Core System Principles',
        iconName: 'Shield',
        summary: 'Non-negotiable architectural axioms governing the entire AI ARINA Operating System.',
        rulesCount: 2,
        sections: [
          {
            title: 'Section 1: Operating System Integrity',
            rules: [
              {
                id: 'CONST-COR-001',
                chapterId: 'CORE_PRINCIPLES',
                sectionNumber: 'Art 2.1',
                title: 'Full Pipeline Event Bus Invariance',
                statement: 'Every system state transition must propagate sequentially through the 12-stage event bus (Market -> Research -> Analytics -> Strategy -> Committee -> Fund Manager -> Execution -> Broker -> Accounting -> Finance -> Learning -> Admin).',
                purpose: 'Eliminates race conditions and guarantees complete state synchronization.',
                mandatory: true,
                version: 'v3.2.0',
                approvedBy: 'System Architect',
                lastUpdated: '2026-07-24',
                impact: {
                  workspaces: ['All Workspaces', 'Control Plane'],
                  aiModels: ['All AI Agents'],
                  services: ['EnterpriseEventBus', 'StateSyncEngine'],
                  apis: ['/api/eventbus/publish'],
                  databaseTables: ['event_logs', 'system_audit']
                },
                dependencies: ['CONST-EXC-001'],
                revisionHistory: [
                  { version: 'v3.2.0', date: '2026-07-24', author: 'Architect', note: 'Phase 14 validation certified.' }
                ]
              },
              {
                id: 'CONST-COR-002',
                chapterId: 'CORE_PRINCIPLES',
                sectionNumber: 'Art 2.2',
                title: 'Immutable Audit Trail',
                statement: 'No order, execution, allocation, or AI vote may be deleted or modified in memory or database without a corresponding compensating journal entry.',
                purpose: 'Guarantees regulatory compliance and zero-tampering auditability.',
                mandatory: true,
                version: 'v3.2.0',
                approvedBy: 'Chief Compliance Officer',
                lastUpdated: '2026-07-24',
                impact: {
                  workspaces: ['Accounting Workspace', 'Control Plane', 'Settings'],
                  aiModels: [],
                  services: ['DoubleEntryLedgerService', 'AuditLogger'],
                  apis: ['/api/accounting/ledger'],
                  databaseTables: ['ledger_entries', 'audit_records']
                },
                dependencies: ['CONST-ACC-001'],
                revisionHistory: [
                  { version: 'v3.2.0', date: '2026-07-24', author: 'CCO', note: 'Certified.' }
                ]
              }
            ]
          }
        ]
      },

      // 3. MARKET CONSTITUTION
      {
        id: 'MARKET',
        title: '03. Market Constitution',
        iconName: 'Globe',
        summary: 'Rules for Supported Markets, Instruments, Session Timing, Exchange Protocols, and Data Feeds.',
        rulesCount: 2,
        sections: [
          {
            title: 'Section 1: Market Access & Session Rules',
            rules: [
              {
                id: 'CONST-MKT-001',
                chapterId: 'MARKET',
                sectionNumber: 'Art 3.1',
                title: 'Supported Market Exchanges',
                statement: 'Orders are restricted to regulated exchanges (NSE, BSE, NASDAQ, NYSE, CME) with real-time L2 order book feeds and validated tick feeds.',
                purpose: 'Prevents execution in illiquid or unregulated dark pools.',
                mandatory: true,
                version: 'v3.2.0',
                approvedBy: 'Head of Market Data',
                lastUpdated: '2026-07-24',
                impact: {
                  workspaces: ['Market Intelligence', 'Broker Workspace'],
                  aiModels: [],
                  services: ['MarketFeedService', 'ExchangeAdapter'],
                  apis: ['/api/market/ticker', '/api/market/orderbook'],
                  databaseTables: ['market_symbols', 'exchange_schedules']
                },
                dependencies: [],
                revisionHistory: [
                  { version: 'v3.2.0', date: '2026-07-24', author: 'Market Head', note: 'Added L2 validation.' }
                ]
              },
              {
                id: 'CONST-MKT-002',
                chapterId: 'MARKET',
                sectionNumber: 'Art 3.2',
                title: 'Session Window Validation',
                statement: 'New positions cannot be initiated within 5 minutes of exchange opening or closing unless explicitly designated as an MOC/LOC order.',
                purpose: 'Avoids opening price volatility spikes and unexecuted closing imbalance orders.',
                mandatory: true,
                version: 'v3.2.0',
                approvedBy: 'Head Trading Operations',
                lastUpdated: '2026-07-24',
                impact: {
                  workspaces: ['Trading Workspace', 'Execution Workspace'],
                  aiModels: ['Execution Agents'],
                  services: ['OrderValidatorService'],
                  apis: ['/api/trading/validate-order'],
                  databaseTables: ['trading_sessions']
                },
                dependencies: ['CONST-MKT-001'],
                revisionHistory: [
                  { version: 'v3.2.0', date: '2026-07-24', author: 'Ops', note: '5-min window ratified.' }
                ]
              }
            ]
          }
        ]
      },

      // 4. RESEARCH CONSTITUTION
      {
        id: 'RESEARCH',
        title: '04. Research Constitution',
        iconName: 'BookOpen',
        summary: 'Rules governing Macro, News, Economic, Geopolitical, Corporate, Sector Research, and Evidence Reliability.',
        rulesCount: 2,
        sections: [
          {
            title: 'Section 1: Evidence & Source Verification',
            rules: [
              {
                id: 'CONST-RES-001',
                chapterId: 'RESEARCH',
                sectionNumber: 'Art 4.1',
                title: 'Multi-Source News Verification Requirement',
                statement: 'High-impact market headlines must be corroborated by at least two independent tier-1 financial news feeds (Bloomberg, Reuters, SEC Filings) before weighting in sentiment algorithms.',
                purpose: 'Eliminates algorithm manipulation from fake news or single-source tweets.',
                mandatory: true,
                version: 'v3.2.0',
                approvedBy: 'Head of AI Research',
                lastUpdated: '2026-07-24',
                impact: {
                  workspaces: ['Research Intelligence', 'AI Workspace'],
                  aiModels: ['Claude 3.5 Sonnet News Parser', 'Llama 3.3 Sentiment Model'],
                  services: ['NewsResearchService', 'SentimentAggregator'],
                  apis: ['/api/research/news'],
                  databaseTables: ['research_reports', 'sentiment_feed']
                },
                dependencies: [],
                revisionHistory: [
                  { version: 'v3.2.0', date: '2026-07-24', author: 'AI Research', note: 'Tier-1 sources mandatory.' }
                ]
              },
              {
                id: 'CONST-RES-002',
                chapterId: 'RESEARCH',
                sectionNumber: 'Art 4.2',
                title: 'Macro & Geopolitical Impact Masking',
                statement: 'During high-impact macroeconomic events (RBI Rate Decisions, US FOMC, GDP Releases), risk limits are automatically reduced by 50% across all strategies.',
                purpose: 'Protects fund capital against sudden central bank surprises.',
                mandatory: true,
                version: 'v3.2.0',
                approvedBy: 'Macro Chief Strategist',
                lastUpdated: '2026-07-24',
                impact: {
                  workspaces: ['Research Intelligence', 'Risk Workspace', 'Fund Manager'],
                  aiModels: ['Macro Intelligence Agent'],
                  services: ['MacroRiskFilterService'],
                  apis: ['/api/research/macro'],
                  databaseTables: ['economic_calendar']
                },
                dependencies: ['CONST-RSK-001'],
                revisionHistory: [
                  { version: 'v3.2.0', date: '2026-07-24', author: 'Macro Chief', note: 'Enforced 50% de-risk rule.' }
                ]
              }
            ]
          }
        ]
      },

      // 5. ANALYTICS CONSTITUTION
      {
        id: 'ANALYTICS',
        title: '05. Analytics Constitution',
        iconName: 'BarChart2',
        summary: 'Rules for Probability Estimation, Statistical Confidence, Monte Carlo Stress Testing, and Tail Risk.',
        rulesCount: 2,
        sections: [
          {
            title: 'Section 1: Quantitative Validation Standards',
            rules: [
              {
                id: 'CONST-ANA-001',
                chapterId: 'ANALYTICS',
                sectionNumber: 'Art 5.1',
                title: 'Monte Carlo 10,000 Iteration Stress Test',
                statement: 'Every portfolio allocation change must pass a 10,000-path Monte Carlo simulation with a 99% Value-at-Risk (VaR) bound not exceeding 2.5% daily drawdown.',
                purpose: 'Verifies resistance against non-normal fat-tail market events.',
                mandatory: true,
                version: 'v3.2.0',
                approvedBy: 'Head Quantitative Risk Analyst',
                lastUpdated: '2026-07-24',
                impact: {
                  workspaces: ['Quantitative Analytics', 'Risk Workspace'],
                  aiModels: [],
                  services: ['MonteCarloSimulationEngine', 'VaRCalculator'],
                  apis: ['/api/analytics/monte-carlo'],
                  databaseTables: ['analytics_simulations']
                },
                dependencies: ['CONST-RSK-002'],
                revisionHistory: [
                  { version: 'v3.2.0', date: '2026-07-24', author: 'Quant Analyst', note: '10,000 paths standardized.' }
                ]
              },
              {
                id: 'CONST-ANA-002',
                chapterId: 'ANALYTICS',
                sectionNumber: 'Art 5.2',
                title: 'Statistical Confidence Interval Threshold',
                statement: 'Predictive price direction models must maintain p-value < 0.01 and out-of-sample prediction accuracy > 58% over a rolling 1,000-candle window.',
                purpose: 'Prevents fitting over noise or overfitted sample periods.',
                mandatory: true,
                version: 'v3.2.0',
                approvedBy: 'Chief Data Scientist',
                lastUpdated: '2026-07-24',
                impact: {
                  workspaces: ['Quantitative Analytics', 'Strategy Workspace'],
                  aiModels: ['DeepSeek R1 Model'],
                  services: ['StatisticalValidationService'],
                  apis: ['/api/analytics/confidence'],
                  databaseTables: ['model_metrics']
                },
                dependencies: [],
                revisionHistory: [
                  { version: 'v3.2.0', date: '2026-07-24', author: 'Data Scientist', note: 'p < 0.01 rule.' }
                ]
              }
            ]
          }
        ]
      },

      // 6. STRATEGY CONSTITUTION
      {
        id: 'STRATEGY',
        title: '06. Strategy Constitution',
        iconName: 'Cpu',
        summary: 'Rules for Strategy Creation, Paper Sandbox Validation, Live Promotion, Version Control, and Retirement.',
        rulesCount: 2,
        sections: [
          {
            title: 'Section 1: Strategy Lifecycle Governance',
            rules: [
              {
                id: 'CONST-STR-001',
                chapterId: 'STRATEGY',
                sectionNumber: 'Art 6.1',
                title: 'Mandatory 30-Day Paper Trading Sandbox',
                statement: 'New trading strategies must complete a minimum of 30 consecutive trading days in the Paper Sandbox with zero critical risk violations before live promotion eligibility.',
                purpose: 'Ensures real-time execution capability and zero slippage anomalies prior to risking real capital.',
                mandatory: true,
                version: 'v3.2.0',
                approvedBy: 'Head of Strategy Lifecycle',
                lastUpdated: '2026-07-24',
                impact: {
                  workspaces: ['Strategy Workspace', 'Paper Trading Workspace', 'Control Plane'],
                  aiModels: ['AI Strategy Evaluator'],
                  services: ['StrategyLifecycleManager', 'PaperExecutionEngine'],
                  apis: ['/api/strategy/promote'],
                  databaseTables: ['strategies', 'paper_trades']
                },
                dependencies: ['CONST-MIS-002'],
                revisionHistory: [
                  { version: 'v3.2.0', date: '2026-07-24', author: 'Strategy Head', note: '30-day sandbox mandatory.' }
                ]
              },
              {
                id: 'CONST-STR-002',
                chapterId: 'STRATEGY',
                sectionNumber: 'Art 6.2',
                title: 'Automatic Strategy Retirement Threshold',
                statement: 'Any live strategy experiencing a peak-to-trough drawdown exceeding 12% or 5 consecutive negative expectation days is immediately deactivated and placed in quarantine.',
                purpose: 'Protects fund capital against strategy decay or regime shifts.',
                mandatory: true,
                version: 'v3.2.0',
                approvedBy: 'CRO & CIO',
                lastUpdated: '2026-07-24',
                impact: {
                  workspaces: ['Strategy Workspace', 'Control Plane', 'Trading Workspace'],
                  aiModels: [],
                  services: ['StrategyKillSwitchService'],
                  apis: ['/api/strategy/deactivate'],
                  databaseTables: ['strategies', 'quarantine_log']
                },
                dependencies: ['CONST-RSK-001'],
                revisionHistory: [
                  { version: 'v3.2.0', date: '2026-07-24', author: 'CRO', note: '12% drawdown threshold.' }
                ]
              }
            ]
          }
        ]
      },

      // 7. AI CONSTITUTION
      {
        id: 'AI',
        title: '07. AI Committee & Governance',
        iconName: 'Sparkles',
        summary: 'Champion / Challenger Rules, AI Committee Voting Protocol, Consensus Thresholds, Model Evolution & Quarantine.',
        rulesCount: 2,
        sections: [
          {
            title: 'Section 1: AI Committee Voting & Consensus',
            rules: [
              {
                id: 'CONST-AII-001',
                chapterId: 'AI',
                sectionNumber: 'Art 7.1',
                title: 'AI Committee 80% Consensus Requirement',
                statement: 'High-conviction capital execution requires an 80%+ weighted consensus vote across the 5 AI Committee agents (Macro Analyst, Quant Specialist, Sentiment Engine, Risk Officer, Execution Optimization Agent).',
                purpose: 'Prevents single-agent hallucination or bias from triggering trades.',
                mandatory: true,
                version: 'v3.2.0',
                approvedBy: 'AI Governance Board',
                lastUpdated: '2026-07-24',
                impact: {
                  workspaces: ['AI Committee', 'AI Workspace', 'Fund Manager'],
                  aiModels: ['GPT-5', 'DeepSeek R1', 'Claude 3.5 Sonnet', 'Llama 3.3', 'Qwen 2.5'],
                  services: ['AiCommitteeVotingService'],
                  apis: ['/api/ai/vote', '/api/ai/consensus'],
                  databaseTables: ['ai_votes', 'ai_consensus_records']
                },
                dependencies: ['CONST-COR-001'],
                revisionHistory: [
                  { version: 'v3.2.0', date: '2026-07-24', author: 'AI Board', note: '80% weighted threshold.' }
                ]
              },
              {
                id: 'CONST-AII-002',
                chapterId: 'AI',
                sectionNumber: 'Art 7.2',
                title: 'Champion vs Challenger Evolution Cycle',
                statement: 'Challenger models must outperform Champion models by at least 5% risk-adjusted return over 500 simulated scenarios before replacing the Champion.',
                purpose: 'Guarantees continuous model evolution while maintaining proven stability.',
                mandatory: true,
                version: 'v3.2.0',
                approvedBy: 'AI Research Director',
                lastUpdated: '2026-07-24',
                impact: {
                  workspaces: ['AI Workspace', 'Learning Workspace', 'Lifecycle Workspace'],
                  aiModels: ['All AI Models'],
                  services: ['ModelEvolutionService'],
                  apis: ['/api/ai/evolution'],
                  databaseTables: ['ai_models', 'model_mutations']
                },
                dependencies: [],
                revisionHistory: [
                  { version: 'v3.2.0', date: '2026-07-24', author: 'AI Research', note: '5% outperformance rule.' }
                ]
              }
            ]
          }
        ]
      },

      // 8. CAPITAL CONSTITUTION
      {
        id: 'CAPITAL',
        title: '08. Capital Constitution',
        iconName: 'Lock',
        summary: 'Maximum Single Trade Allocation, Capital Lock/Release Logic, Portfolio Drawdown Caps, and Reserve Requirements.',
        rulesCount: 2,
        sections: [
          {
            title: 'Section 1: Capital Allocation Limits',
            rules: [
              {
                id: 'CONST-CAP-001',
                chapterId: 'CAPITAL',
                sectionNumber: 'Art 8.1',
                title: 'Max Single Position Capital Cap (5%)',
                statement: 'No single trade position may exceed 5% of total AUM (Assets Under Management) under any market condition or conviction level.',
                purpose: 'Limits concentration risk across equity, options, or futures instruments.',
                mandatory: true,
                version: 'v3.2.0',
                approvedBy: 'Fund Treasurer',
                lastUpdated: '2026-07-24',
                impact: {
                  workspaces: ['Capital Management', 'Fund Manager', 'Risk Workspace'],
                  aiModels: ['Fund Allocation Agent'],
                  services: ['CapitalLockEngine'],
                  apis: ['/api/capital/allocate'],
                  databaseTables: ['capital_locks', 'fund_summary']
                },
                dependencies: ['CONST-MIS-001'],
                revisionHistory: [
                  { version: 'v3.2.0', date: '2026-07-24', author: 'Treasurer', note: '5% cap hardcoded.' }
                ]
              },
              {
                id: 'CONST-CAP-002',
                chapterId: 'CAPITAL',
                sectionNumber: 'Art 8.2',
                title: 'Mandatory 20% Unallocated Liquid Reserve',
                statement: 'A minimum of 20% of total fund capital must remain in unallocated liquid cash or overnight sovereign treasury equivalents as a safety buffer.',
                purpose: 'Ensures immediate liquidity for margin calls or extreme market opportunities.',
                mandatory: true,
                version: 'v3.2.0',
                approvedBy: 'Chief Investment Officer',
                lastUpdated: '2026-07-24',
                impact: {
                  workspaces: ['Fund Manager', 'Finance Workspace', 'Accounting Workspace'],
                  aiModels: [],
                  services: ['ReserveMonitorService'],
                  apis: ['/api/capital/reserves'],
                  databaseTables: ['fund_balances']
                },
                dependencies: [],
                revisionHistory: [
                  { version: 'v3.2.0', date: '2026-07-24', author: 'CIO', note: '20% buffer ratified.' }
                ]
              }
            ]
          }
        ]
      },

      // 9. TRADING CONSTITUTION
      {
        id: 'TRADING',
        title: '09. Trading Constitution',
        iconName: 'TrendingUp',
        summary: 'Rules for Trade Approval Logic, Holding Decisions, Trailing Stop Engine, Target Exits, and Journal Automation.',
        rulesCount: 2,
        sections: [
          {
            title: 'Section 1: Execution & Position Management',
            rules: [
              {
                id: 'CONST-TRD-001',
                chapterId: 'TRADING',
                sectionNumber: 'Art 9.1',
                title: 'Mandatory Stop-Loss Placement at Order Entry',
                statement: 'Every trade order submitted to the execution pipeline must include a hardware-enforced bracket stop-loss and profit target before submission.',
                purpose: 'Eliminates naked order exposure or unhedged position holding.',
                mandatory: true,
                version: 'v3.2.0',
                approvedBy: 'Head of Execution',
                lastUpdated: '2026-07-24',
                impact: {
                  workspaces: ['Trading Workspace', 'Execution Workspace', 'Paper Trading Workspace'],
                  aiModels: ['Execution Agents'],
                  services: ['BracketOrderService', 'OrderRouter'],
                  apis: ['/api/trading/order'],
                  databaseTables: ['orders', 'positions']
                },
                dependencies: ['CONST-EXC-001'],
                revisionHistory: [
                  { version: 'v3.2.0', date: '2026-07-24', author: 'Head Exec', note: 'Bracket mandatory.' }
                ]
              },
              {
                id: 'CONST-TRD-002',
                chapterId: 'TRADING',
                sectionNumber: 'Art 9.2',
                title: 'Automated Real-Time Trade Journaling',
                statement: 'All executed fills, timestamps, slippage metrics, and underlying AI rationale must be instantly logged into the immutable Trade Journal.',
                purpose: 'Provides full transparency for post-trade AI learning and performance audit.',
                mandatory: true,
                version: 'v3.2.0',
                approvedBy: 'Chief Trading Officer',
                lastUpdated: '2026-07-24',
                impact: {
                  workspaces: ['Trading Workspace', 'Learning Workspace', 'Accounting Workspace'],
                  aiModels: ['LMEOS Post-Trade Learning Agent'],
                  services: ['TradeJournalService'],
                  apis: ['/api/trading/journal'],
                  databaseTables: ['trade_journal', 'execution_fills']
                },
                dependencies: ['CONST-COR-002'],
                revisionHistory: [
                  { version: 'v3.2.0', date: '2026-07-24', author: 'CTO', note: 'Instant journaling enforced.' }
                ]
              }
            ]
          }
        ]
      },

      // 10. RISK CONSTITUTION
      {
        id: 'RISK',
        title: '10. Risk Constitution',
        iconName: 'AlertTriangle',
        summary: 'Risk Budgeting, Portfolio Correlation Caps, Sector Overlap Limits, and System-Wide Emergency Circuit Breakers.',
        rulesCount: 2,
        sections: [
          {
            title: 'Section 1: Emergency Controls & Correlation Caps',
            rules: [
              {
                id: 'CONST-RSK-001',
                chapterId: 'RISK',
                sectionNumber: 'Art 10.1',
                title: 'System Emergency Circuit Breaker (3% Daily Drawdown)',
                statement: 'If portfolio NAV declines by 3% within a single trading day, all open positions are immediately liquidated to cash and trading is halted for 24 hours.',
                purpose: 'Ultimate disaster prevention switch protecting firm survival.',
                mandatory: true,
                version: 'v3.2.0',
                approvedBy: 'Chief Risk Officer',
                lastUpdated: '2026-07-24',
                impact: {
                  workspaces: ['Risk Workspace', 'Control Plane', 'Trading Workspace', 'Fund Manager'],
                  aiModels: ['Risk Officer Agent'],
                  services: ['EmergencyCircuitBreaker', 'RiskEngineService'],
                  apis: ['/api/risk/circuit-breaker', '/api/control/panic-stop'],
                  databaseTables: ['risk_events', 'system_switches']
                },
                dependencies: ['CONST-MIS-001'],
                revisionHistory: [
                  { version: 'v3.2.0', date: '2026-07-24', author: 'CRO', note: '3% daily drawdown hard limit.' }
                ]
              },
              {
                id: 'CONST-RSK-002',
                chapterId: 'RISK',
                sectionNumber: 'Art 10.2',
                title: 'Max Sector Correlation Cap (0.70)',
                statement: 'The correlation coefficient between active positions across different strategy modules must remain below 0.70 to prevent hidden systemic exposure.',
                purpose: 'Avoids multi-strategy blowups during sector-wide selloffs.',
                mandatory: true,
                version: 'v3.2.0',
                approvedBy: 'Head Risk Quant',
                lastUpdated: '2026-07-24',
                impact: {
                  workspaces: ['Risk Workspace', 'Analytics Workspace'],
                  aiModels: [],
                  services: ['CorrelationMatrixEngine'],
                  apis: ['/api/risk/correlation'],
                  databaseTables: ['risk_matrices']
                },
                dependencies: [],
                revisionHistory: [
                  { version: 'v3.2.0', date: '2026-07-24', author: 'Risk Quant', note: '0.70 correlation cap.' }
                ]
              }
            ]
          }
        ]
      },

      // 11. FUND CONSTITUTION
      {
        id: 'FUND',
        title: '11. Fund Constitution',
        iconName: 'Wallet',
        summary: 'Fund Manager Allocation, Multi-Strategy Capital Partitioning, Benchmark Tracking, and Investor Mandate Rules.',
        rulesCount: 2,
        sections: [
          {
            title: 'Section 1: Multi-Strategy Capital Partitioning',
            rules: [
              {
                id: 'CONST-FND-001',
                chapterId: 'FUND',
                sectionNumber: 'Art 11.1',
                title: 'Dynamic Risk-Weighted Strategy Partitioning',
                statement: 'Capital distribution among strategies is dynamically rebalanced daily based on inverse volatility and 30-day Sharpe ratios.',
                purpose: 'Maximizes risk-adjusted return across diversified strategy allocations.',
                mandatory: true,
                version: 'v3.2.0',
                approvedBy: 'Fund Manager',
                lastUpdated: '2026-07-24',
                impact: {
                  workspaces: ['Fund Manager', 'Strategy Workspace'],
                  aiModels: ['Fund Allocation Agent'],
                  services: ['FundRebalancerService'],
                  apis: ['/api/fund/rebalance'],
                  databaseTables: ['fund_allocations']
                },
                dependencies: ['CONST-CAP-001'],
                revisionHistory: [
                  { version: 'v3.2.0', date: '2026-07-24', author: 'Fund Manager', note: 'Daily Sharpe rebalancing.' }
                ]
              },
              {
                id: 'CONST-FND-002',
                chapterId: 'FUND',
                sectionNumber: 'Art 11.2',
                title: 'Benchmark Alpha Verification',
                statement: 'A fund strategy must generate a minimum 4.0% annualized alpha over NIFTY 50 / S&P 500 benchmarks to justify capital maintenance.',
                purpose: 'Ensures active management outperforms passive index holding.',
                mandatory: true,
                version: 'v3.2.0',
                approvedBy: 'Chief Investment Officer',
                lastUpdated: '2026-07-24',
                impact: {
                  workspaces: ['Fund Manager', 'Leaderboard'],
                  aiModels: [],
                  services: ['BenchmarkComparisonService'],
                  apis: ['/api/fund/benchmark'],
                  databaseTables: ['benchmark_history']
                },
                dependencies: [],
                revisionHistory: [
                  { version: 'v3.2.0', date: '2026-07-24', author: 'CIO', note: '4.0% alpha requirement.' }
                ]
              }
            ]
          }
        ]
      },

      // 12. EXECUTION CONSTITUTION
      {
        id: 'EXECUTION',
        title: '12. Execution Constitution',
        iconName: 'Zap',
        summary: 'Smart Order Routing, Slippage Control Engine, Execution Quality Score (EQS), and TWAP/VWAP Slicing.',
        rulesCount: 2,
        sections: [
          {
            title: 'Section 1: Execution Optimization & Slippage Limits',
            rules: [
              {
                id: 'CONST-EXC-001',
                chapterId: 'EXECUTION',
                sectionNumber: 'Art 12.1',
                title: 'Maximum Allowed Slippage Cap (0.05%)',
                statement: 'Execution algorithms (TWAP/VWAP/Smart Router) must abort fills if market impact or slippage exceeds 0.05% of the midpoint quote.',
                purpose: 'Prevents execution loss in thin market order books.',
                mandatory: true,
                version: 'v3.2.0',
                approvedBy: 'Head of Execution Algorithms',
                lastUpdated: '2026-07-24',
                impact: {
                  workspaces: ['Execution Workspace', 'Broker Workspace'],
                  aiModels: ['Execution Optimization Agent'],
                  services: ['SmartOrderRouter', 'SlippageGuard'],
                  apis: ['/api/execution/slice'],
                  databaseTables: ['execution_fills', 'slippage_reports']
                },
                dependencies: ['CONST-MKT-001'],
                revisionHistory: [
                  { version: 'v3.2.0', date: '2026-07-24', author: 'Exec Head', note: '0.05% cap.' }
                ]
              },
              {
                id: 'CONST-EXC-002',
                chapterId: 'EXECUTION',
                sectionNumber: 'Art 12.2',
                title: 'Execution Quality Score (EQS) Audit',
                statement: 'Every executed order slice receives an Execution Quality Score (0-100) based on speed, price improvement, and spread capture.',
                purpose: 'Provides continuous feedback to refine Smart Order Routing logic.',
                mandatory: true,
                version: 'v3.2.0',
                approvedBy: 'Execution Quality Manager',
                lastUpdated: '2026-07-24',
                impact: {
                  workspaces: ['Execution Workspace', 'Broker Workspace'],
                  aiModels: [],
                  services: ['ExecutionQualityEngine'],
                  apis: ['/api/execution/eqs'],
                  databaseTables: ['eqs_audit_logs']
                },
                dependencies: [],
                revisionHistory: [
                  { version: 'v3.2.0', date: '2026-07-24', author: 'EQS Mgr', note: 'EQS tracking enabled.' }
                ]
              }
            ]
          }
        ]
      },

      // 13. BROKER CONSTITUTION
      {
        id: 'BROKER',
        title: '13. Broker Constitution',
        iconName: 'Server',
        summary: 'Broker Agnostic Protocol, Universal Adapters, Rate Limiting, Failover Routing, and Health Checks.',
        rulesCount: 2,
        sections: [
          {
            title: 'Section 1: Multi-Broker Redundancy',
            rules: [
              {
                id: 'CONST-BRK-001',
                chapterId: 'BROKER',
                sectionNumber: 'Art 13.1',
                title: 'Broker Agnostic Abstraction Layer',
                statement: 'All trading order interfaces must interact through the universal Broker Adapter layer, ensuring zero vendor lock-in to Indian brokers (Zerodha, AngelOne, Dhan, Upstox).',
                purpose: 'Enables instant seamless failover if a primary broker API fails.',
                mandatory: true,
                version: 'v3.2.0',
                approvedBy: 'Head of Infrastructure',
                lastUpdated: '2026-07-24',
                impact: {
                  workspaces: ['Broker Workspace', 'Control Plane'],
                  aiModels: [],
                  services: ['UniversalBrokerAdapterManager', 'ZerodhaAdapter', 'IBKRAdapter'],
                  apis: ['/api/broker/connect'],
                  databaseTables: ['broker_accounts', 'adapter_config']
                },
                dependencies: [],
                revisionHistory: [
                  { version: 'v3.2.0', date: '2026-07-24', author: 'Infra Head', note: 'Agnostic layer ratified.' }
                ]
              },
              {
                id: 'CONST-BRK-002',
                chapterId: 'BROKER',
                sectionNumber: 'Art 13.2',
                title: 'Sub-30ms Automatic Broker Failover',
                statement: 'If a broker endpoint fails to respond within 15ms or returns HTTP 5xx errors, active order routing automatically fails over to secondary backup brokers in < 30ms.',
                purpose: 'Zero execution loss during broker API outages.',
                mandatory: true,
                version: 'v3.2.0',
                approvedBy: 'DevOps Lead',
                lastUpdated: '2026-07-24',
                impact: {
                  workspaces: ['Broker Workspace', 'Execution Workspace'],
                  aiModels: [],
                  services: ['BrokerFailoverRouter'],
                  apis: ['/api/broker/health'],
                  databaseTables: ['broker_health_logs']
                },
                dependencies: ['CONST-BRK-001'],
                revisionHistory: [
                  { version: 'v3.2.0', date: '2026-07-24', author: 'DevOps', note: '<30ms failover verified in Phase 14.' }
                ]
              }
            ]
          }
        ]
      },

      // 14. ACCOUNTING CONSTITUTION
      {
        id: 'ACCOUNTING',
        title: '14. Accounting Constitution',
        iconName: 'FileText',
        summary: 'Double-Entry General Ledger Rules, Settlement Reconciliations, Corporate Action Adjustments, and Immutable Audit Logs.',
        rulesCount: 2,
        sections: [
          {
            title: 'Section 1: General Ledger & Double-Entry Integrity',
            rules: [
              {
                id: 'CONST-ACC-001',
                chapterId: 'ACCOUNTING',
                sectionNumber: 'Art 14.1',
                title: 'Strict Double-Entry Accounting Invariant',
                statement: 'Every monetary transaction must post balanced Debit and Credit entries across Cash, Asset, Liability, and Equity ledger accounts with zero rounding error.',
                purpose: 'Guarantees perfect financial balance sheet mathematical correctness.',
                mandatory: true,
                version: 'v3.2.0',
                approvedBy: 'Chief Accounting Officer',
                lastUpdated: '2026-07-24',
                impact: {
                  workspaces: ['Accounting Workspace', 'Finance Workspace'],
                  aiModels: [],
                  services: ['DoubleEntryLedgerService', 'JournalEntryEngine'],
                  apis: ['/api/accounting/post'],
                  databaseTables: ['journal_entries', 'general_ledger']
                },
                dependencies: ['CONST-COR-002'],
                revisionHistory: [
                  { version: 'v3.2.0', date: '2026-07-24', author: 'CAO', note: 'Double-entry mandatory.' }
                ]
              },
              {
                id: 'CONST-ACC-002',
                chapterId: 'ACCOUNTING',
                sectionNumber: 'Art 14.2',
                title: 'T+1 Exchange Settlement Reconciliation',
                statement: 'Daily trade settlements must undergo automated multi-way reconciliation against broker contract notes and exchange clearing houses.',
                purpose: 'Detects dividend, STT, exchange fee, or tax discrepancies instantly.',
                mandatory: true,
                version: 'v3.2.0',
                approvedBy: 'Lead Auditor',
                lastUpdated: '2026-07-24',
                impact: {
                  workspaces: ['Accounting Workspace', 'Finance Workspace'],
                  aiModels: [],
                  services: ['SettlementReconciliationService'],
                  apis: ['/api/accounting/settlement'],
                  databaseTables: ['settlement_records']
                },
                dependencies: ['CONST-ACC-001'],
                revisionHistory: [
                  { version: 'v3.2.0', date: '2026-07-24', author: 'Auditor', note: 'T+1 auto reconciliation.' }
                ]
              }
            ]
          }
        ]
      },

      // 15. FINANCE CONSTITUTION
      {
        id: 'FINANCE',
        title: '15. Finance Constitution',
        iconName: 'TrendingUp',
        summary: 'NAV Calculations, Capital Gains Tax Engines (STCG / LTCG), Cash Flow Forecasting, and Treasury Operations.',
        rulesCount: 2,
        sections: [
          {
            title: 'Section 1: Net Asset Value & Tax Rules',
            rules: [
              {
                id: 'CONST-FIN-001',
                chapterId: 'FINANCE',
                sectionNumber: 'Art 15.1',
                title: 'Real-Time Mark-to-Market Net Asset Value (NAV)',
                statement: 'Fund NAV must be recalculated continuously in real-time based on live bid/ask quotes, accrued interest, and tax provisions.',
                purpose: 'Provides exact true valuation for capital allocation and investor reporting.',
                mandatory: true,
                version: 'v3.2.0',
                approvedBy: 'Fund Treasurer',
                lastUpdated: '2026-07-24',
                impact: {
                  workspaces: ['Finance Workspace', 'Fund Manager', 'Leaderboard'],
                  aiModels: [],
                  services: ['NavCalculationEngine'],
                  apis: ['/api/finance/nav'],
                  databaseTables: ['nav_history', 'fund_summary']
                },
                dependencies: ['CONST-ACC-001'],
                revisionHistory: [
                  { version: 'v3.2.0', date: '2026-07-24', author: 'Treasurer', note: 'Real-time NAV.' }
                ]
              },
              {
                id: 'CONST-FIN-002',
                chapterId: 'FINANCE',
                sectionNumber: 'Art 15.2',
                title: 'Automated Capital Gains Tax Provisioning (STCG / LTCG)',
                statement: 'Short-Term Capital Gains Tax (20%) and Long-Term Capital Gains Tax (12.5%) liabilities must be automatically reserved at trade closure.',
                purpose: 'Prevents tax shortfalls during tax filing cycles.',
                mandatory: true,
                version: 'v3.2.0',
                approvedBy: 'Head Tax Counsel',
                lastUpdated: '2026-07-24',
                impact: {
                  workspaces: ['Finance Workspace', 'Accounting Workspace'],
                  aiModels: [],
                  services: ['TaxEngineService'],
                  apis: ['/api/finance/tax-summary'],
                  databaseTables: ['tax_provisions']
                },
                dependencies: ['CONST-ACC-001'],
                revisionHistory: [
                  { version: 'v3.2.0', date: '2026-07-24', author: 'Tax Counsel', note: 'Updated for 2026 tax rates.' }
                ]
              }
            ]
          }
        ]
      },

      // 16. LEARNING CONSTITUTION
      {
        id: 'LEARNING',
        title: '16. Learning & LMEOS Constitution',
        iconName: 'Dna',
        summary: 'LMEOS Memory Architecture, Knowledge Graph Ingestion, Post-Trade Failure Reflection, and Self-Improvement Bounds.',
        rulesCount: 2,
        sections: [
          {
            title: 'Section 1: Post-Trade Learning & Memory Ingest',
            rules: [
              {
                id: 'CONST-LRN-001',
                chapterId: 'LEARNING',
                sectionNumber: 'Art 16.1',
                title: 'Mandatory Post-Trade Failure Reflection Cycle',
                statement: 'Every losing trade execution (> 0.5% loss) triggers an automated diagnostic reflection cycle by LMEOS to update memory weights and prevent identical mistakes.',
                purpose: 'Ensures the AI Operating System continuously learns from negative outcomes.',
                mandatory: true,
                version: 'v3.2.0',
                approvedBy: 'Director of AI Learning',
                lastUpdated: '2026-07-24',
                impact: {
                  workspaces: ['Learning Workspace', 'AI Workspace', 'Lifecycle Workspace'],
                  aiModels: ['LMEOS Post-Trade Learning Agent'],
                  services: ['PostTradeLearningService', 'LmeosMemoryEngine'],
                  apis: ['/api/learning/reflect'],
                  databaseTables: ['learning_cycles', 'memory_nodes']
                },
                dependencies: ['CONST-TRD-002'],
                revisionHistory: [
                  { version: 'v3.2.0', date: '2026-07-24', author: 'AI Dir', note: 'Post-trade reflection mandatory.' }
                ]
              },
              {
                id: 'CONST-LRN-002',
                chapterId: 'LEARNING',
                sectionNumber: 'Art 16.2',
                title: 'Vector Knowledge Graph Memory Consolidation',
                statement: 'Short-term market observations must be consolidated into long-term vector embeddings nightly for multi-year pattern matching.',
                purpose: 'Maintains deep historical memory across macro cycles.',
                mandatory: true,
                version: 'v3.2.0',
                approvedBy: 'Head Knowledge Engineer',
                lastUpdated: '2026-07-24',
                impact: {
                  workspaces: ['Learning Workspace', 'Research Intelligence'],
                  aiModels: ['Vector Embedding Engine'],
                  services: ['KnowledgeGraphService'],
                  apis: ['/api/learning/knowledge-graph'],
                  databaseTables: ['knowledge_nodes', 'vector_embeddings']
                },
                dependencies: [],
                revisionHistory: [
                  { version: 'v3.2.0', date: '2026-07-24', author: 'Knowledge Eng', note: 'Nightly vector sync.' }
                ]
              }
            ]
          }
        ]
      },

      // 17. SECURITY CONSTITUTION
      {
        id: 'SECURITY',
        title: '17. Security & Governance',
        iconName: 'Lock',
        summary: 'Role-Based Access Control (RBAC), Multi-Factor Authentication, AES-256 API Key Encryption, and Session Leak Prevention.',
        rulesCount: 2,
        sections: [
          {
            title: 'Section 1: RBAC & Data Encryption Standards',
            rules: [
              {
                id: 'CONST-SEC-001',
                chapterId: 'SECURITY',
                sectionNumber: 'Art 17.1',
                title: 'Strict Role-Based Access Control (RBAC)',
                statement: 'User roles (Super Admin, Fund Manager, Trader, Analyst, Auditor) are enforced with zero permission leakage across workspace views and API routes.',
                purpose: 'Prevents unauthorized execution or capital modification.',
                mandatory: true,
                version: 'v3.2.0',
                approvedBy: 'Chief Information Security Officer',
                lastUpdated: '2026-07-24',
                impact: {
                  workspaces: ['All Workspaces', 'Control Plane', 'Settings'],
                  aiModels: [],
                  services: ['SecurityGuardService', 'RbacManager'],
                  apis: ['/api/security/authorize'],
                  databaseTables: ['user_roles', 'permission_matrix']
                },
                dependencies: [],
                revisionHistory: [
                  { version: 'v3.2.0', date: '2026-07-24', author: 'CISO', note: 'RBAC enforced across all 12 modules.' }
                ]
              },
              {
                id: 'CONST-SEC-002',
                chapterId: 'SECURITY',
                sectionNumber: 'Art 17.2',
                title: 'AES-256-GCM Hardware Secret Encryption',
                statement: 'All API keys, broker secrets, and private tokens must be encrypted at rest using AES-256-GCM and never exposed in client-side code.',
                purpose: 'Prevents credential leaks or man-in-the-middle key theft.',
                mandatory: true,
                version: 'v3.2.0',
                approvedBy: 'Lead Cryptographer',
                lastUpdated: '2026-07-24',
                impact: {
                  workspaces: ['Control Plane', 'Broker Workspace', 'Settings'],
                  aiModels: [],
                  services: ['KeyVaultService'],
                  apis: ['/api/security/vault'],
                  databaseTables: ['encrypted_credentials']
                },
                dependencies: [],
                revisionHistory: [
                  { version: 'v3.2.0', date: '2026-07-24', author: 'Cryptographer', note: 'AES-256-GCM hardware vault.' }
                ]
              }
            ]
          }
        ]
      },

      // 18. COMPLIANCE CONSTITUTION
      {
        id: 'COMPLIANCE',
        title: '18. Regulatory & Compliance',
        iconName: 'ShieldCheck',
        summary: 'SEBI Regulatory Mandates, Exchange Circular Compliance, Insider Trading Filters, and Anti-Money Laundering (AML).',
        rulesCount: 2,
        sections: [
          {
            title: 'Section 1: Regulatory Protocols & Market Fairness',
            rules: [
              {
                id: 'CONST-CMP-001',
                chapterId: 'COMPLIANCE',
                sectionNumber: 'Art 18.1',
                title: 'SEBI Algorithmic Trading Registration Compliance',
                statement: 'All automated order strategies deployed in live markets must maintain registered order-to-trade ratio (OTR) compliance (< 50:1).',
                purpose: 'Prevents regulatory fines or exchange API suspension due to order spamming.',
                mandatory: true,
                version: 'v3.2.0',
                approvedBy: 'Chief Compliance Officer',
                lastUpdated: '2026-07-24',
                impact: {
                  workspaces: ['Execution Workspace', 'Control Plane'],
                  aiModels: [],
                  services: ['OtrMonitorService'],
                  apis: ['/api/compliance/otr'],
                  databaseTables: ['compliance_logs']
                },
                dependencies: ['CONST-MKT-001'],
                revisionHistory: [
                  { version: 'v3.2.0', date: '2026-07-24', author: 'CCO', note: 'OTR < 50:1 limit enforced.' }
                ]
              },
              {
                id: 'CONST-CMP-002',
                chapterId: 'COMPLIANCE',
                sectionNumber: 'Art 18.2',
                title: 'Insider Trading & Restricted List Shield',
                statement: 'Orders for corporate entities on active restricted lists or pending earnings blackouts are automatically blocked.',
                purpose: 'Ensures strict adherence to insider trading regulations.',
                mandatory: true,
                version: 'v3.2.0',
                approvedBy: 'Legal Counsel',
                lastUpdated: '2026-07-24',
                impact: {
                  workspaces: ['Trading Workspace', 'Research Intelligence'],
                  aiModels: [],
                  services: ['RestrictedListFilterService'],
                  apis: ['/api/compliance/restricted-check'],
                  databaseTables: ['restricted_symbols']
                },
                dependencies: [],
                revisionHistory: [
                  { version: 'v3.2.0', date: '2026-07-24', author: 'Legal', note: 'Restricted list filter active.' }
                ]
              }
            ]
          }
        ]
      },

      // 19. DEPLOYMENT CONSTITUTION
      {
        id: 'DEPLOYMENT',
        title: '19. Deployment & Production Readiness',
        iconName: 'Server',
        summary: 'Cloud Run Container Protocols, Point-in-Time Recovery (PITR), Health Check Monitors, and Release Quality Score (RQS).',
        rulesCount: 2,
        sections: [
          {
            title: 'Section 1: Production Certification & Release Standards',
            rules: [
              {
                id: 'CONST-DEP-001',
                chapterId: 'DEPLOYMENT',
                sectionNumber: 'Art 19.1',
                title: 'Release Quality Score (RQS >= 90) Mandatory Gate',
                statement: 'A new release candidate may only be deployed to production if all 14 Quality Gates pass and the composite Release Quality Score (RQS) reaches 90+.',
                purpose: 'Guarantees zero defective code or unvalidated modules reach production environments.',
                mandatory: true,
                version: 'v3.2.0',
                approvedBy: 'Release Engineer Lead',
                lastUpdated: '2026-07-24',
                impact: {
                  workspaces: ['Control Plane', 'Integration Workspace'],
                  aiModels: [],
                  services: ['EnterpriseIntegrationValidationEngine'],
                  apis: ['/api/deployment/validate-rc'],
                  databaseTables: ['deployment_audit']
                },
                dependencies: ['CONST-COR-001'],
                revisionHistory: [
                  { version: 'v3.2.0', date: '2026-07-24', author: 'Release Lead', note: 'Phase 14 certified RQS 98.' }
                ]
              },
              {
                id: 'CONST-DEP-002',
                chapterId: 'DEPLOYMENT',
                sectionNumber: 'Art 19.2',
                title: 'Sub-30-Second Point-in-Time Recovery (PITR)',
                statement: 'Production database and state backups must support 30-second RPO (Recovery Point Objective) and sub-5-minute RTO (Recovery Time Objective).',
                purpose: 'Ensures immediate disaster recovery in case of cloud infrastructure outage.',
                mandatory: true,
                version: 'v3.2.0',
                approvedBy: 'DevOps Architect',
                lastUpdated: '2026-07-24',
                impact: {
                  workspaces: ['Control Plane', 'Settings'],
                  aiModels: [],
                  services: ['DisasterRecoveryManager'],
                  apis: ['/api/deployment/pitr'],
                  databaseTables: ['backup_snapshots']
                },
                dependencies: [],
                revisionHistory: [
                  { version: 'v3.2.0', date: '2026-07-24', author: 'DevOps', note: '30-sec RPO verified.' }
                ]
              }
            ]
          }
        ]
      }
    ];
  }

  private seedLogs() {
    this.logs = [
      { id: 'GOV-LOG-001', timestamp: '2026-07-24 14:00:00', category: 'CONSTITUTION', level: 'SUCCESS', ruleId: 'CONST-MIS-001', message: 'Ratified AI ARINA Constitution v3.2.0. All 19 Chapters active and immutable.' },
      { id: 'GOV-LOG-002', timestamp: '2026-07-24 13:45:00', category: 'GOVERNANCE', level: 'AUDIT', message: 'Board Unanimous Consensus achieved for Release Candidate 1 (RC1).' },
      { id: 'GOV-LOG-003', timestamp: '2026-07-24 12:30:00', category: 'VALIDATION', level: 'SUCCESS', ruleId: 'CONST-DEP-001', message: 'Release Quality Score (RQS) = 98/100. All 14 Quality Gates PASSED.' },
      { id: 'GOV-LOG-004', timestamp: '2026-07-24 11:15:00', category: 'REVISION', level: 'INFO', ruleId: 'CONST-AII-001', message: 'Updated AI Committee consensus threshold to 80%.' }
    ];
  }
}
