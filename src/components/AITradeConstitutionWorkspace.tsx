import React, { useState, useMemo } from 'react';
import { 
  Scale, 
  ShieldCheck, 
  ShieldAlert, 
  Shield, 
  BookOpen, 
  Cpu, 
  Workflow, 
  Zap, 
  Users, 
  AlertTriangle, 
  Flame, 
  Key, 
  Activity, 
  BarChart3, 
  Filter, 
  Search, 
  RefreshCcw, 
  Download, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  Sliders, 
  SlidersHorizontal, 
  GitBranch, 
  Layers, 
  Clock, 
  Play, 
  RotateCcw, 
  FileText, 
  Award, 
  Database, 
  Eye, 
  Terminal, 
  Lock, 
  Unlock, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  X, 
  Check, 
  AlertCircle, 
  Network, 
  FileCheck, 
  PieChart, 
  History, 
  Crosshair, 
  HelpCircle, 
  DollarSign, 
  ArrowRight, 
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// ==========================================
// INTERFACES FOR CONSTITUTION OPERATING SYSTEM
// ==========================================

export interface ArticleItem {
  id: string; // e.g., "ARTICLE_I"
  title: string;
  name: string;
  description: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  rulesCount: number;
  compliancePct: number;
  dependencies: string[];
  historyCount: number;
  invariants: string[];
}

export interface RuleItem {
  id: string;
  articleId: string;
  name: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  condition: string;
  currentValue: string;
  allowedValue: string;
  action: 'HARD_VETO' | 'AUTO_REBALANCE' | 'HALT_EXECUTION' | 'THROTTLE' | 'LOG_WARNING';
  violationCount: number;
  status: 'ACTIVE' | 'WARNING' | 'PAUSED';
  autoEnforcement: boolean;
  category: 'Capital' | 'Risk' | 'Margin' | 'Position' | 'Sector' | 'Correlation' | 'AI Ethics';
}

export interface ValidationStep {
  id: number;
  name: string;
  category: string;
  status: 'PASSED' | 'RUNNING' | 'FAILED' | 'SKIPPED';
  latencyMs: number;
  passRatePct: number;
}

export interface TradeValidationRecord {
  id: string;
  decisionId: string;
  validatedBy: string;
  validationTime: string;
  passedRulesCount: number;
  failedRulesCount: number;
  blockedRuleId?: string;
  executionStatus: 'APPROVED_FOR_COMMITTEE' | 'BLOCKED_BY_CONSTITUTION' | 'WARNING_OVERRIDDEN';
  auditTrailHash: string;
}

export interface ViolationRecord {
  id: string;
  timestamp: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  ruleId: string;
  ruleName: string;
  aiModel: string;
  category: string;
  recoveryAction: string;
  repeatedCount: number;
}

export interface AIComplianceRecord {
  modelId: string;
  modelName: string;
  provider: string;
  complianceScore: number; // 0-100
  warningsCount: number;
  violationsCount: number;
  blockedTradesCount: number;
  successRatePct: number;
  lastValidation: string;
}

export interface EventStreamLog {
  id: string;
  timestamp: string;
  ruleId: string;
  severity: 'INFO' | 'WARN' | 'VETO' | 'CRITICAL' | 'AMENDMENT' | 'SUCCESS';
  aiModel: string;
  decisionId: string;
  action: string;
  details: string;
}

export interface VersionRecord {
  version: string;
  releaseDate: string;
  author: string;
  summary: string;
  status: 'ACTIVE_PRODUCTION' | 'SUPERSEDED' | 'DRAFT';
  committeeSignatures: string[];
}

// ==========================================
// MOCK DATASETS FOR SUPREME CONSTITUTION
// ==========================================

const INITIAL_ARTICLES: ArticleItem[] = [
  { id: 'ARTICLE_I', title: 'Article I', name: 'Market Eligibility & Qualification', description: 'Defines eligible asset classes, liquidity minimums, exchange operating hours, and ticker verification.', priority: 'CRITICAL', rulesCount: 4, compliancePct: 100.0, dependencies: ['Exchange L2 Feed', 'Security Master'], historyCount: 142, invariants: ['Asset must have 20-day avg volume > $10M', 'Trading restricted to official exchange hours', 'No illiquid penny stock derivatives'] },
  { id: 'ARTICLE_II', title: 'Article II', name: 'Capital Allocation & Cash Preservation', description: 'Enforces non-negotiable floor limits on portfolio equity and mandates minimum liquid cash reserves.', priority: 'CRITICAL', rulesCount: 5, compliancePct: 99.8, dependencies: ['General Ledger', 'Treasury Core'], historyCount: 218, invariants: ['Unallocated cash reserve must remain >= 20.0% NAV', 'Max single-trade capital commitment capped at $500,000', 'Maximum 80% portfolio equity utilization'] },
  { id: 'ARTICLE_III', title: 'Article III', name: 'Risk Management & VaR Ceilings', description: 'Governs real-time Value-at-Risk limits, intraday volatility envelopes, and stop-loss bounds.', priority: 'CRITICAL', rulesCount: 6, compliancePct: 99.4, dependencies: ['Risk Engine', 'VaR Calculator'], historyCount: 310, invariants: ['Aggregate 99% 1-day VaR capped at 2.0% NAV', 'Stop-loss envelope auto-scaled via 1.2x ATR', 'Max allowable drawdown in 4 hours capped at 3.5%'] },
  { id: 'ARTICLE_IV', title: 'Article IV', name: 'Margin & Leverage Governance', description: 'Controls collateral utilization, initial margin requirements, and derivative leverage limits.', priority: 'CRITICAL', rulesCount: 4, compliancePct: 100.0, dependencies: ['OMS Margin Service', 'Exchange RMS'], historyCount: 185, invariants: ['Aggregate margin utilization must not exceed 60.0%', 'Futures leverage capped at 4x for index, 2x for stock', 'Zero uncollateralized short position creation'] },
  { id: 'ARTICLE_V', title: 'Article V', name: 'Position Limits & Instrument Caps', description: 'Restricts single stock allocation caps, contract volume ceilings, and portfolio concentration.', priority: 'HIGH', rulesCount: 5, compliancePct: 98.9, dependencies: ['Position Tracker', 'Portfolio Service'], historyCount: 260, invariants: ['Single security cap strictly <= 5.0% NAV', 'Max options open interest <= 2.5% of market OI', 'Single order block <= 10.0% of 5m volume'] },
  { id: 'ARTICLE_VI', title: 'Article VI', name: 'Sector & Industry Exposure', description: 'Prevents sector clustering and limits cross-sector correlation spikes.', priority: 'HIGH', rulesCount: 4, compliancePct: 99.2, dependencies: ['Sector Classifier', 'Correlation Matrix'], historyCount: 198, invariants: ['Single sector allocation <= 20.0% NAV', 'Rebalance trigger armed at 18.5% sector weight', 'Banking + Finance combined weight <= 30.0% NAV'] },
  { id: 'ARTICLE_VII', title: 'Article VII', name: 'Correlation & Overlap Safeguards', description: 'Monitors cross-asset correlation matrices to prevent hidden systemic concentration.', priority: 'HIGH', rulesCount: 3, compliancePct: 99.5, dependencies: ['Matrix Analytics', 'Quant Synthesizer'], historyCount: 154, invariants: ['Cross-position correlation index must remain < 0.85', 'Duplicate directional AI bets automatically merged', 'Beta-adjusted market exposure capped at 1.25'] },
  { id: 'ARTICLE_VIII', title: 'Article VIII', name: 'Options & Derivatives Restrictions', description: 'Defines volatility skew boundaries, gamma exposure caps, and theta decay thresholds.', priority: 'HIGH', rulesCount: 4, compliancePct: 98.6, dependencies: ['Greeks Engine', 'Option Chain Feed'], historyCount: 172, invariants: ['Unhedged option writing strictly prohibited', 'Portfolio Net Gamma capped within +/- 0.05 bounds', 'Theta decay contribution capped at 0.5% NAV/day'] },
  { id: 'ARTICLE_IX', title: 'Article IX', name: 'Intraday Execution & Time Rules', description: 'Controls execution speed, order cancellation ratios, and session-specific rules.', priority: 'MEDIUM', rulesCount: 3, compliancePct: 99.1, dependencies: ['Execution Router', 'Exchange Adapter'], historyCount: 110, invariants: ['Order-to-trade message ratio capped at 50:1', 'Slippage tolerance <= 0.25% (0.15% in open/close wicks)', 'No speculative entries in final 15 minutes of session'] },
  { id: 'ARTICLE_X', title: 'Article X', name: 'AI Ethics & Hallucination Defense', description: 'Mandates strict prompt isolation, parameter sanitization, and output bound checks.', priority: 'CRITICAL', rulesCount: 4, compliancePct: 100.0, dependencies: ['Prompt Sanitizer', 'LLM Guardrail'], historyCount: 88, invariants: ['LLM order limit prices must stay within +/- 2% L2 Mid', 'Zero cross-lab state leakage between Paper/Production', 'Malformed JSON payload triggers instant model quarantine'] },
  { id: 'ARTICLE_XI', title: 'Article XI', name: 'Emergency Rules & Crash Intercepts', description: 'Establishes multi-level circuit breakers, crash detection, and global kill switches.', priority: 'CRITICAL', rulesCount: 3, compliancePct: 100.0, dependencies: ['Circuit Guard', 'Global Kill Switch'], historyCount: 45, invariants: ['Level 1: AI Model Halt after 2 consecutive stop-outs in 1hr', 'Level 3: Sector Halt if sector drawdown > 2.5%', 'Level 5: Global Arena Lock if NAV loss > 3.5%'] },
  { id: 'ARTICLE_XII', title: 'Article XII', name: 'Learning Restrictions & Model Drift', description: 'Governs post-trade learning attribution, weight evolution caps, and rollback thresholds.', priority: 'MEDIUM', rulesCount: 3, compliancePct: 99.7, dependencies: ['Learning OS', 'Evolution Engine'], historyCount: 62, invariants: ['Model weight adjustments capped at max 5.0% per epoch', 'Negative drift > 3.0% causes instant model demotion', 'Retraining datasets require cryptographic audit signature'] }
];

const INITIAL_RULES: RuleItem[] = [
  { id: 'RULE-VAR-01', articleId: 'ARTICLE_III', name: 'Intraday VaR Ceiling (2.0%)', priority: 'CRITICAL', condition: 'Aggregate VaR99 > 2.0% NAV', currentValue: '0.038%', allowedValue: '<= 2.000%', action: 'HARD_VETO', violationCount: 12, status: 'ACTIVE', autoEnforcement: true, category: 'Risk' },
  { id: 'RULE-POS-02', articleId: 'ARTICLE_V', name: 'Single Stock NAV Cap (5.0%)', priority: 'CRITICAL', condition: 'Asset Weight > 5.0% NAV', currentValue: '3.600%', allowedValue: '<= 5.000%', action: 'HARD_VETO', violationCount: 8, status: 'ACTIVE', autoEnforcement: true, category: 'Position' },
  { id: 'RULE-SEC-03', articleId: 'ARTICLE_VI', name: 'Sector Weight Ceiling (20.0%)', priority: 'HIGH', condition: 'Sector Weight > 20.0% NAV', currentValue: '14.200%', allowedValue: '<= 20.000%', action: 'AUTO_REBALANCE', violationCount: 4, status: 'ACTIVE', autoEnforcement: true, category: 'Sector' },
  { id: 'RULE-CAS-04', articleId: 'ARTICLE_II', name: 'Minimum Cash Reserve (20.0%)', priority: 'CRITICAL', condition: 'Unallocated Cash < 20.0% NAV', currentValue: '22.500%', allowedValue: '>= 20.000%', action: 'HALT_EXECUTION', violationCount: 2, status: 'ACTIVE', autoEnforcement: true, category: 'Capital' },
  { id: 'RULE-RR-05', articleId: 'ARTICLE_III', name: 'Minimum Risk-Reward Ratio (2.5:1)', priority: 'HIGH', condition: 'Proposal R:R < 2.50:1', currentValue: '3.79 : 1', allowedValue: '>= 2.50 : 1', action: 'HARD_VETO', violationCount: 19, status: 'ACTIVE', autoEnforcement: true, category: 'Risk' },
  { id: 'RULE-AIG-06', articleId: 'ARTICLE_X', name: 'LLM Price Band Guard (+/- 2.0%)', priority: 'CRITICAL', condition: 'Proposed Price Deviation > 2.0%', currentValue: '0.120%', allowedValue: '<= 2.000%', action: 'HARD_VETO', violationCount: 3, status: 'ACTIVE', autoEnforcement: true, category: 'AI Ethics' },
  { id: 'RULE-MAR-07', articleId: 'ARTICLE_IV', name: 'Margin Utilization Ceiling (60.0%)', priority: 'CRITICAL', condition: 'Used Margin > 60.0% NAV', currentValue: '34.500%', allowedValue: '<= 60.000%', action: 'HALT_EXECUTION', violationCount: 1, status: 'ACTIVE', autoEnforcement: true, category: 'Margin' },
  { id: 'RULE-COR-08', articleId: 'ARTICLE_VII', name: 'Cross-Asset Correlation Cap (0.85)', priority: 'HIGH', condition: 'Position Correlation >= 0.85', currentValue: '0.180', allowedValue: '< 0.850', action: 'AUTO_REBALANCE', violationCount: 5, status: 'ACTIVE', autoEnforcement: true, category: 'Correlation' }
];

const VALIDATION_PIPELINE_STAGES: ValidationStep[] = [
  { id: 1, name: 'Capital Validation', category: 'Capital & Cash Reserves', status: 'PASSED', latencyMs: 0.4, passRatePct: 99.8 },
  { id: 2, name: 'Risk Validation', category: 'VaR & Drawdown Bounds', status: 'PASSED', latencyMs: 0.8, passRatePct: 98.4 },
  { id: 3, name: 'Exposure Validation', category: 'Portfolio NAV & Leverage', status: 'PASSED', latencyMs: 0.6, passRatePct: 99.1 },
  { id: 4, name: 'Sector Validation', category: 'Sector Weight & Concentration', status: 'PASSED', latencyMs: 0.5, passRatePct: 97.9 },
  { id: 5, name: 'Position Validation', category: 'Single Asset 5% NAV Cap', status: 'PASSED', latencyMs: 0.7, passRatePct: 98.9 },
  { id: 6, name: 'Margin Validation', category: 'Collateral & Exchange Buffer', status: 'PASSED', latencyMs: 0.9, passRatePct: 99.5 },
  { id: 7, name: 'Constitution Validation', category: 'AI Ethics & Hard Invariants', status: 'PASSED', latencyMs: 0.3, passRatePct: 99.9 },
  { id: 8, name: 'Committee Ready', category: 'Consensus Dispatch Token', status: 'PASSED', latencyMs: 0.2, passRatePct: 100.0 }
];

const TRADE_VALIDATION_LOGS: TradeValidationRecord[] = [
  { id: 'VAL-2026-901', decisionId: 'DEC-2026-901 (RELIANCE)', validatedBy: 'Trade Constitution Core v3.2', validationTime: '2026-08-01 10:45:00', passedRulesCount: 42, failedRulesCount: 0, executionStatus: 'APPROVED_FOR_COMMITTEE', auditTrailHash: '0x9f8b7a6c5d4e3f2a' },
  { id: 'VAL-2026-902', decisionId: 'DEC-2026-902 (TCS)', validatedBy: 'Trade Constitution Core v3.2', validationTime: '2026-08-01 10:44:12', passedRulesCount: 42, failedRulesCount: 0, executionStatus: 'APPROVED_FOR_COMMITTEE', auditTrailHash: '0x1a2b3c4d5e6f7a8b' },
  { id: 'VAL-2026-903', decisionId: 'DEC-2026-903 (NIFTY CE)', validatedBy: 'Trade Constitution Core v3.2', validationTime: '2026-08-01 10:46:30', passedRulesCount: 42, failedRulesCount: 0, executionStatus: 'APPROVED_FOR_COMMITTEE', auditTrailHash: '0x8c7b6a5d4e3f2a1b' },
  { id: 'VAL-2026-904', decisionId: 'DEC-2026-904 (BANKNIFTY)', validatedBy: 'Trade Constitution Core v3.2', validationTime: '2026-08-01 09:15:10', passedRulesCount: 40, failedRulesCount: 2, blockedRuleId: 'RULE-RR-05', executionStatus: 'BLOCKED_BY_CONSTITUTION', auditTrailHash: '0x3f2a1b0c9d8e7f6a' },
  { id: 'VAL-2026-900', decisionId: 'DEC-2026-900 (INFY)', validatedBy: 'Trade Constitution Core v3.2', validationTime: '2026-08-01 08:32:00', passedRulesCount: 42, failedRulesCount: 0, executionStatus: 'APPROVED_FOR_COMMITTEE', auditTrailHash: '0x5e6f7a8b9c0d1e2f' }
];

const VIOLATION_AUDIT_LOG: ViolationRecord[] = [
  { id: 'VIOL-9012', timestamp: '2026-08-01 09:15:10', severity: 'CRITICAL', ruleId: 'RULE-RR-05', ruleName: 'Minimum Risk-Reward Ratio', aiModel: 'Failed Alpha Challenger', category: 'Risk', recoveryAction: 'Trade Proposal HARD_VETOED and returned to Strategy Pool', repeatedCount: 1 },
  { id: 'VIOL-8984', timestamp: '2026-08-01 08:12:04', severity: 'MEDIUM', ruleId: 'RULE-IX-01', ruleName: 'Order Message Rate Limit', aiModel: 'Scalper AI Engine', category: 'Execution', recoveryAction: 'Model throttled for 15 minutes to reduce exchange message load', repeatedCount: 3 },
  { id: 'VIOL-8850', timestamp: '2026-07-31 15:20:00', severity: 'HIGH', ruleId: 'RULE-AIG-06', ruleName: 'LLM Price Band Guard', aiModel: 'Grok 2 Financial', category: 'AI Ethics', recoveryAction: 'Hallucinated limit price rejected; prompt context auto-sanitized', repeatedCount: 2 }
];

const AI_COMPLIANCE_SCORECARD: AIComplianceRecord[] = [
  { modelId: 'MOD-001', modelName: 'OpenAI GPT-4o (v4.0)', provider: 'OpenAI', complianceScore: 100.0, warningsCount: 0, violationsCount: 0, blockedTradesCount: 0, successRatePct: 100.0, lastValidation: '0.2s ago' },
  { modelId: 'MOD-002', modelName: 'Anthropic Claude 3.5 Sonnet (v3.5)', provider: 'Anthropic', complianceScore: 99.8, warningsCount: 1, violationsCount: 0, blockedTradesCount: 0, successRatePct: 99.8, lastValidation: '1.4s ago' },
  { modelId: 'MOD-003', modelName: 'Google Gemini 2.5 Pro (v2.5)', provider: 'Google AI', complianceScore: 100.0, warningsCount: 0, violationsCount: 0, blockedTradesCount: 0, successRatePct: 100.0, lastValidation: '0.8s ago' },
  { modelId: 'MOD-005', modelName: 'Meta Llama 3.3 70B (v3.3)', provider: 'Meta AI', complianceScore: 100.0, warningsCount: 0, violationsCount: 0, blockedTradesCount: 0, successRatePct: 100.0, lastValidation: '0.1s ago' },
  { modelId: 'MOD-004', modelName: 'DeepSeek V3 (v3.0)', provider: 'DeepSeek', complianceScore: 98.2, warningsCount: 4, violationsCount: 1, blockedTradesCount: 1, successRatePct: 98.2, lastValidation: '2.1s ago' },
  { modelId: 'MOD-011', modelName: 'Alibaba Qwen 2.5 72B (v2.5)', provider: 'Alibaba AI', complianceScore: 84.5, warningsCount: 6, violationsCount: 3, blockedTradesCount: 3, successRatePct: 84.5, lastValidation: '10m ago' }
];

const EVENT_STREAM_LOGS: EventStreamLog[] = [
  { id: 'EV-401', timestamp: '10:48:12', ruleId: 'RULE-VAR-01', severity: 'INFO', aiModel: 'Meta Llama 3.3 70B (v3.3)', decisionId: 'DEC-2026-901', action: 'PASS', details: 'Intraday VaR 0.038% verified well inside 2.0% constitutional ceiling.' },
  { id: 'EV-402', timestamp: '10:45:00', ruleId: 'RULE-POS-02', severity: 'SUCCESS', aiModel: 'OpenAI GPT-4o (v4.0)', decisionId: 'DEC-2026-901', action: 'PASS', details: 'RELIANCE single position weight 3.6% NAV cleared 5.0% cap.' },
  { id: 'EV-403', timestamp: '09:15:10', ruleId: 'RULE-RR-05', severity: 'VETO', aiModel: 'Meta Llama 3.3 70B (v3.3)', decisionId: 'DEC-2026-904', action: 'HARD_VETO', details: 'BANKNIFTY short decision blocked: R:R ratio 1.08:1 failed required 2.50:1 threshold.' },
  { id: 'EV-404', timestamp: '08:32:00', ruleId: 'RULE-CAS-04', severity: 'SUCCESS', aiModel: 'DeepSeek V3 (v3.0)', decisionId: 'DEC-2026-900', action: 'PASS', details: 'INFY order allocation cleared. Cash reserve buffer 22.5% maintained.' },
  { id: 'EV-405', timestamp: '08:00:00', ruleId: 'SYSTEM', severity: 'AMENDMENT', aiModel: 'Governance System', decisionId: 'N/A', action: 'POLICY_UPDATE', details: 'Trade Constitution Enterprise v3.2 active. 42 rules verified healthy.' }
];

const VERSION_HISTORY: VersionRecord[] = [
  { version: 'v3.2 Enterprise', releaseDate: '2026-08-01', author: 'AI Governance Board', summary: 'Added market-adaptive VIX auto-tightener and sub-5ms pre-execution validation gate.', status: 'ACTIVE_PRODUCTION', committeeSignatures: ['Risk Governance Key #1', 'Lead Quant Key #2', 'AI Safety Key #3'] },
  { version: 'v3.1 Production', releaseDate: '2026-06-15', author: 'Quantitative Risk Committee', summary: 'Expanded Article IV options gamma boundaries and sector concentration limit to 20%.', status: 'SUPERSEDED', committeeSignatures: ['Risk Governance Key #1', 'Lead Quant Key #2'] },
  { version: 'v3.0 Baseline', releaseDate: '2026-01-10', author: 'AI ARINA Architecture Board', summary: 'Initial launch of Supreme Trade Constitution operating system.', status: 'SUPERSEDED', committeeSignatures: ['System Architect Key #1'] }
];

// ==========================================
// MAIN COMPONENT: TRADE CONSTITUTION WORKSPACE
// ==========================================

export const AITradeConstitutionWorkspace: React.FC<{ showToast?: (msg: string) => void }> = ({ showToast }) => {
  // Navigation Tabs for 20 Structured Sections
  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'ARTICLES' | 'PIPELINE' | 'RULES' | 'DYNAMIC_LIMITS' | 'HISTORY' | 
    'VIOLATIONS' | 'ENFORCEMENT' | 'MARKET_ADAPTIVE' | 'COMPLIANCE' | 'ANALYTICS' | 
    'EVENT_STREAM' | 'HIERARCHY' | 'DEPENDENCIES' | 'SANDBOX' | 'VERSIONS' | 
    'SIMULATOR' | 'LIVE_INSPECTOR' | 'EMERGENCY' | 'KNOWLEDGE_GRAPH'
  >('OVERVIEW');

  // State
  const [articles] = useState<ArticleItem[]>(INITIAL_ARTICLES);
  const [selectedArticleId, setSelectedArticleId] = useState<string>('ARTICLE_I');
  const [rules, setRules] = useState<RuleItem[]>(INITIAL_RULES);
  const [selectedRuleId, setSelectedRuleId] = useState<string>('RULE-VAR-01');
  const [eventLogs] = useState<EventStreamLog[]>(EVENT_STREAM_LOGS);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Market Adaptive Regime Toggle
  const [activeRegime, setActiveRegime] = useState<
    'NORMAL' | 'HIGH_VOLATILITY' | 'EXTREME_VOLATILITY' | 'BUDGET_DAY' | 'ELECTION' | 'WAR' | 'CIRCUIT' | 'HOLIDAY' | 'EXPIRY' | 'FED_EVENT' | 'RBI_EVENT'
  >('HIGH_VOLATILITY');

  // Interactive controls
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [emergencyMode, setEmergencyMode] = useState(false);

  // Simulator controls
  const [simVarCap, setSimVarCap] = useState(2.0); // %
  const [simPosCap, setSimPosCap] = useState(5.0); // %

  // Sandbox draft form state
  const [draftRuleName, setDraftRuleName] = useState('Dynamic Liquidity Threshold Cap');
  const [draftCategory, setDraftCategory] = useState('Position');
  const [draftCondition, setDraftCondition] = useState('Order Volume > 15% 5m Volume');
  const [draftStatus, setDraftStatus] = useState<'DRAFT' | 'SIMULATING' | 'APPROVED'>('DRAFT');

  const notify = (msg: string) => {
    if (showToast) showToast(msg);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      notify('Enterprise Trade Constitution invariants re-verified. 42 Rules 100% Operational.');
    }, 500);
  };

  const toggleEmergencyMode = () => {
    if (!emergencyMode) {
      setEmergencyMode(true);
      notify('EMERGENCY CONSTITUTION ACTIVATED! All new trade submissions blocked. Capital locked.');
    } else {
      setEmergencyMode(false);
      notify('Emergency Constitution disarmed. Restored to NORMAL governance operating state.');
    }
  };

  const selectedArticle = useMemo(() => {
    return articles.find(a => a.id === selectedArticleId) || articles[0];
  }, [articles, selectedArticleId]);

  const selectedRule = useMemo(() => {
    return rules.find(r => r.id === selectedRuleId) || rules[0];
  }, [rules, selectedRuleId]);

  const filteredRules = useMemo(() => {
    return rules.filter(r => {
      const matchSearch = r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.condition.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = categoryFilter === 'ALL' || r.category === categoryFilter;
      const matchPrio = priorityFilter === 'ALL' || r.priority === priorityFilter;
      return matchSearch && matchCat && matchPrio;
    });
  }, [rules, searchQuery, categoryFilter, priorityFilter]);

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-slate-950 text-slate-100 p-4 lg:p-6 space-y-6 font-mono text-xs">
      
      {/* ========================================================== */}
      {/* HEADER: ENTERPRISE TRADE CONSTITUTION OPERATING SYSTEM     */}
      {/* ========================================================== */}
      <div className={`border p-4 rounded-lg flex flex-col xl:flex-row xl:items-center justify-between gap-4 shadow-2xl transition-colors ${
        emergencyMode ? 'bg-rose-950/80 border-rose-500 animate-pulse' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-emerald-400" /> AI ARINA GOVERNANCE CORE
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-white font-bold uppercase tracking-wider">Trade Constitution & Dynamic Governance Engine</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-lg lg:text-xl font-bold font-mono tracking-tight text-white uppercase flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Pre-Execution Constitutional Validation System
            </h1>
            <span className={`px-2.5 py-0.5 border rounded text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 ${
              emergencyMode 
                ? 'bg-rose-500/30 text-rose-200 border-rose-400' 
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${emergencyMode ? 'bg-rose-400 animate-ping' : 'bg-emerald-400 animate-ping'}`} />
              {emergencyMode ? 'EMERGENCY LOCKDOWN ACTIVE' : 'CONSTITUTIONAL SAFETY INDEX: 99.8% (OPTIMAL)'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Supreme Constitutional Law Layer validating all AI trade proposals before Committee Voting, OMS dispatch, and execution.
          </p>
        </div>

        {/* TOP ACTIONS */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={toggleEmergencyMode}
            className={`px-3 py-1.5 font-bold rounded flex items-center gap-1.5 transition-all text-xs border ${
              emergencyMode 
                ? 'bg-rose-600 text-white border-rose-400 animate-bounce' 
                : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/40'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{emergencyMode ? 'DISARM EMERGENCY LOCK' : 'TRIGGER EMERGENCY CONSTITUTION'}</span>
          </button>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded font-bold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCcw className={`w-3.5 h-3.5 text-emerald-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync Rules</span>
          </button>
          <button
            onClick={() => notify('Exporting Enterprise Trade Constitution Policy Charter v3.2 (PDF/JSON)...')}
            className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold rounded flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Policy Charter</span>
          </button>
        </div>
      </div>

      {/* ========================================================== */}
      {/* MASTER SECTION NAVIGATION (20 SECTIONS)                    */}
      {/* ========================================================== */}
      <div className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border border-slate-800 p-2 rounded-lg flex flex-wrap gap-1.5 overflow-x-auto text-[10px] font-bold shadow-xl shrink-0 min-h-[50px] items-center">
        {[
          { id: 'OVERVIEW', label: '1. Dashboard', icon: BarChart3 },
          { id: 'ARTICLES', label: '2. Articles (I-XII)', icon: BookOpen },
          { id: 'PIPELINE', label: '3. Validation Pipeline', icon: Workflow },
          { id: 'RULES', label: '4. Rule Engine', icon: Cpu },
          { id: 'DYNAMIC_LIMITS', label: '5. Dynamic Limits', icon: Sliders },
          { id: 'HISTORY', label: '6. Trade History', icon: History },
          { id: 'VIOLATIONS', label: '7. Violations', icon: ShieldAlert },
          { id: 'ENFORCEMENT', label: '8. Auto Enforcement', icon: Flame },
          { id: 'MARKET_ADAPTIVE', label: '9. Market Adaptive', icon: Zap },
          { id: 'COMPLIANCE', label: '10. AI Compliance', icon: Users },
          { id: 'ANALYTICS', label: '11. Analytics', icon: PieChart },
          { id: 'EVENT_STREAM', label: '12. Event Stream', icon: Terminal },
          { id: 'HIERARCHY', label: '13. Hierarchy', icon: Layers },
          { id: 'DEPENDENCIES', label: '14. Dependency Graph', icon: Network },
          { id: 'SANDBOX', label: '15. Sandbox', icon: FileCheck },
          { id: 'VERSIONS', label: '16. Version Control', icon: GitBranch },
          { id: 'SIMULATOR', label: '17. Impact Simulator', icon: SlidersHorizontal },
          { id: 'LIVE_INSPECTOR', label: '18. Decision vs Constitution', icon: Crosshair },
          { id: 'EMERGENCY', label: '19. Emergency Protocol', icon: Lock },
          { id: 'KNOWLEDGE_GRAPH', label: '20. Knowledge Graph', icon: Sparkles }
        ].map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`px-2.5 py-1.5 rounded font-bold uppercase transition-all flex items-center gap-1.5 whitespace-nowrap ${
                isActive 
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-md' 
                  : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================== */}
      {/* SECTION 1: ENTERPRISE CONSTITUTION DASHBOARD              */}
      {/* ========================================================== */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-emerald-400" /> Section 1: Enterprise Constitution Dashboard
            </span>
            <span className="text-[10px] text-emerald-400 font-bold">Charter Version v3.2 Enterprise</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-3">
            {[
              { label: 'Constitution Ver.', val: 'v3.2 Ent', status: 'ACTIVE', color: 'text-white' },
              { label: 'Active Articles', val: '12 Articles', status: 'ENFORCED', color: 'text-emerald-400' },
              { label: 'Loaded Rules', val: '42 Rules', status: '100% OPERATIONAL', color: 'text-emerald-300' },
              { label: 'Dynamic Rules', val: '14 Active', status: 'AUTO-ADAPTIVE', color: 'text-amber-400' },
              { label: 'Compliance %', val: '99.8%', status: 'ZERO LEAKS', color: 'text-emerald-400' },
              { label: 'Blocked Today', val: '3 Trades', status: 'RISK PREVENTED', color: 'text-rose-400' },
              { label: 'Health Index', val: '100% HEALTHY', status: 'SUB-1MS GATE', color: 'text-blue-400' },
              { label: 'Last Amendment', val: '2026-08-01', status: 'CRO SIGNED', color: 'text-purple-400' },
              { label: 'Emergency Mode', val: emergencyMode ? 'ACTIVE' : 'STANDBY', status: '5 HALT LEVELS', color: emergencyMode ? 'text-rose-400' : 'text-slate-400' },
              { label: 'Governance State', val: 'PRE-COMMITTEE', status: 'MANDATORY GATE', color: 'text-emerald-300' }
            ].map((metric, idx) => (
              <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex flex-col justify-between space-y-1 shadow-md">
                <span className="text-[9px] text-slate-400 font-bold uppercase truncate">{metric.label}</span>
                <div className={`text-sm lg:text-base font-bold font-mono ${metric.color}`}>{metric.val}</div>
                <span className="text-[8px] text-slate-500 uppercase tracking-wider truncate">{metric.status}</span>
              </div>
            ))}
          </div>

          {/* SYSTEM ARCHITECTURE & PURPOSE SUMMARY */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-3">
            <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Role of Trade Constitution in the AI ARINA Pipeline
            </h3>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              The Trade Constitution is the supreme pre-execution law layer. It intercepts every candidate trade generated by the AI Decision Engine and validates it against 42 deterministic hard invariants before allowing dispatch to the AI Committee or Order Management System (OMS). It does not generate signals or vote—it strictly enforces capital, risk, sector, position, margin, and ethics boundaries.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* SECTION 2: CONSTITUTION ARTICLES (ARTICLES I TO XII)       */}
      {/* ========================================================== */}
      {activeTab === 'ARTICLES' && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Section 2: Articles of the Trade Constitution (Articles I - XII)</h2>
            </div>
            <span className="text-[10px] text-slate-400">Click any article to inspect its description, rules, priority & invariants</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {articles.map(art => {
              const isSelected = art.id === selectedArticleId;
              return (
                <div
                  key={art.id}
                  onClick={() => setSelectedArticleId(art.id)}
                  className={`p-3 rounded border cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                    isSelected 
                      ? 'bg-emerald-500/10 border-emerald-400 shadow-lg ring-1 ring-emerald-400' 
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-emerald-400 font-mono">{art.title}</span>
                    <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[8px] uppercase">
                      {art.priority}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-white leading-tight">{art.name}</h3>
                    <p className="text-[10px] text-slate-400 line-clamp-2">{art.description}</p>
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-slate-500 border-t border-slate-800/80 pt-2 font-mono">
                    <span>{art.rulesCount} Rules • {art.compliancePct}% Pass</span>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'rotate-90 text-emerald-400' : ''}`} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* DETAILED EXPANDED VIEW OF SELECTED ARTICLE */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {selectedArticle.title}: {selectedArticle.name} — Full Charter Specification
              </span>
              <span className="text-[10px] text-slate-400">Dependencies: <strong className="text-white">{selectedArticle.dependencies.join(', ')}</strong></span>
            </div>
            <p className="text-[11px] text-slate-300">{selectedArticle.description}</p>
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Non-Negotiable Invariants:</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px]">
                {selectedArticle.invariants.map((inv, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-900 border border-slate-800 rounded flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-slate-200 leading-snug">{inv}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* SECTION 3: RULE VALIDATION PIPELINE                        */}
      {/* ========================================================== */}
      {activeTab === 'PIPELINE' && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Workflow className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Section 3: Pre-Execution Rule Validation Pipeline</h2>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">Average Latency: 0.8ms • 100% Interception</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {VALIDATION_PIPELINE_STAGES.map(stage => (
              <div key={stage.id} className="p-3 bg-slate-950 border border-slate-800 rounded flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-bold flex items-center justify-center text-[10px]">
                    #{stage.id}
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[9px] font-bold uppercase">
                    {stage.status}
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">{stage.name}</h3>
                  <p className="text-[10px] text-slate-400">{stage.category}</p>
                </div>
                <div className="flex items-center justify-between text-[9px] text-slate-500 border-t border-slate-800/80 pt-2 font-mono">
                  <span>Latency: {stage.latencyMs}ms</span>
                  <span className="text-emerald-400 font-bold">{stage.passRatePct}% Pass Rate</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* SECTION 4: ENTERPRISE RULE ENGINE                          */}
      {/* ========================================================== */}
      {activeTab === 'RULES' && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Section 4: Enterprise Rule Engine</h2>
            </div>
            <span className="text-[10px] text-slate-400">Deterministic Parameters & Enforcers</span>
          </div>

          {/* SEARCH & FILTERS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-2.5 rounded border border-slate-800">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search Rule ID / Name / Condition..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1 bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-[11px] rounded focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 text-[10px] uppercase font-bold">Category:</span>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 text-white text-[11px] py-1 px-2 rounded focus:outline-none focus:border-emerald-400"
              >
                <option value="ALL">ALL CATEGORIES</option>
                <option value="Capital">Capital</option>
                <option value="Risk">Risk</option>
                <option value="Margin">Margin</option>
                <option value="Position">Position</option>
                <option value="Sector">Sector</option>
                <option value="Correlation">Correlation</option>
                <option value="AI Ethics">AI Ethics</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 text-[10px] uppercase font-bold">Priority:</span>
              <select
                value={priorityFilter}
                onChange={e => setPriorityFilter(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 text-white text-[11px] py-1 px-2 rounded focus:outline-none focus:border-emerald-400"
              >
                <option value="ALL">ALL PRIORITIES</option>
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>
          </div>

          {/* LARGE READABLE RULE ENGINE TABLE */}
          <div className="overflow-x-auto border border-slate-800 rounded">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800 text-[10px]">
                <tr>
                  <th className="p-2.5">Rule ID</th>
                  <th className="p-2.5">Article</th>
                  <th className="p-2.5">Rule Name</th>
                  <th className="p-2.5">Priority</th>
                  <th className="p-2.5">Condition</th>
                  <th className="p-2.5">Current Value</th>
                  <th className="p-2.5">Allowed Value</th>
                  <th className="p-2.5">Action</th>
                  <th className="p-2.5">Violations</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5 text-right">Auto Enforce</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredRules.map(r => (
                  <tr key={r.id} className="hover:bg-slate-800/50 cursor-pointer">
                    <td className="p-2.5 font-bold text-emerald-400 font-mono whitespace-nowrap">{r.id}</td>
                    <td className="p-2.5 text-slate-400 font-mono">{r.articleId}</td>
                    <td className="p-2.5 font-bold text-white font-mono">{r.name}</td>
                    <td className="p-2.5">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${
                        r.priority === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                        r.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                        'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      }`}>
                        {r.priority}
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-300 font-mono">{r.condition}</td>
                    <td className="p-2.5 text-emerald-400 font-bold whitespace-nowrap">{r.currentValue}</td>
                    <td className="p-2.5 text-amber-300 font-bold whitespace-nowrap">{r.allowedValue}</td>
                    <td className="p-2.5 font-bold text-slate-200 whitespace-nowrap">{r.action}</td>
                    <td className="p-2.5 font-bold text-rose-400">{r.violationCount}</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[9px] font-bold uppercase">
                        {r.status}
                      </span>
                    </td>
                    <td className="p-2.5 text-right font-bold text-emerald-400 whitespace-nowrap">
                      {r.autoEnforcement ? 'ENABLED (100%)' : 'MANUAL'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* SECTION 5: DYNAMIC LIMIT ENGINE (INTERACTIVE GAUGES)      */}
      {/* ========================================================== */}
      {activeTab === 'DYNAMIC_LIMITS' && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Section 5: Dynamic Limit Engine (Real-Time Gauges)</h2>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">Auto-Adjusts to Volatility & Liquidity</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'Capital Allocation', curr: '$654,000', max: '$1,000,000', pct: 65.4, status: 'NORMAL' },
              { label: 'Sector Limit (Energy)', curr: '14.2%', max: '20.0%', pct: 71.0, status: 'NORMAL' },
              { label: 'Stock Limit (Single Asset)', curr: '3.6%', max: '5.0%', pct: 72.0, status: 'NORMAL' },
              { label: 'Cash Buffer Limit', curr: '22.5%', max: '20.0% Min', pct: 88.0, status: 'HEALTHY' },
              { label: 'Single Position Size', curr: '$450,000', max: '$500,000', pct: 90.0, status: 'NEAR_CAP' },
              { label: 'Portfolio Net Exposure', curr: '78.2%', max: '80.0%', pct: 97.75, status: 'NEAR_CAP' },
              { label: 'Margin Usage', curr: '34.5%', max: '60.0%', pct: 57.5, status: 'NORMAL' },
              { label: 'Derivative Exposure', curr: '12.4%', max: '15.0%', pct: 82.6, status: 'NORMAL' },
              { label: 'Intraday Allocation', curr: '$2.5M', max: '$5.0M', pct: 50.0, status: 'NORMAL' },
              { label: 'Swing Allocation', curr: '$1.8M', max: '$3.0M', pct: 60.0, status: 'NORMAL' }
            ].map((meter, idx) => (
              <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-white">{meter.label}</span>
                  <span className={`text-[10px] ${meter.pct > 90 ? 'text-amber-400' : 'text-emerald-400'}`}>{meter.curr} / {meter.max}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${meter.pct > 90 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                    style={{ width: `${Math.min(meter.pct, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                  <span>Utilization: {meter.pct.toFixed(1)}%</span>
                  <span className="uppercase font-bold">{meter.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* SECTION 6: TRADE VALIDATION HISTORY                        */}
      {/* ========================================================== */}
      {activeTab === 'HISTORY' && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Section 6: Trade Validation History & Audit Log</h2>
            </div>
            <span className="text-[10px] text-slate-400">100% Cryptographically Hash Signed Ledger</span>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800 text-[10px]">
                <tr>
                  <th className="p-2.5">Validation ID</th>
                  <th className="p-2.5">Decision ID</th>
                  <th className="p-2.5">Validated By</th>
                  <th className="p-2.5">Timestamp</th>
                  <th className="p-2.5">Passed Rules</th>
                  <th className="p-2.5">Failed Rules</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5 text-right">Audit Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {TRADE_VALIDATION_LOGS.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/50 font-mono">
                    <td className="p-2.5 font-bold text-amber-400">{log.id}</td>
                    <td className="p-2.5 font-bold text-white">{log.decisionId}</td>
                    <td className="p-2.5 text-slate-400">{log.validatedBy}</td>
                    <td className="p-2.5 text-slate-400">{log.validationTime}</td>
                    <td className="p-2.5 font-bold text-emerald-400">{log.passedRulesCount} / 42</td>
                    <td className="p-2.5 font-bold text-rose-400">{log.failedRulesCount}</td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                        log.executionStatus === 'APPROVED_FOR_COMMITTEE' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      }`}>
                        {log.executionStatus}
                      </span>
                    </td>
                    <td className="p-2.5 text-right text-slate-500 text-[10px]">{log.auditTrailHash}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* SECTION 7: CONSTITUTION VIOLATIONS                         */}
      {/* ========================================================== */}
      {activeTab === 'VIOLATIONS' && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Section 7: Intercepted Violations & Trap Log</h2>
            </div>
            <span className="text-[10px] text-rose-400 font-bold">100% Interception Rate • Zero Execution Leaks</span>
          </div>

          <div className="space-y-3">
            {VIOLATION_AUDIT_LOG.map(v => (
              <div key={v.id} className="p-3 bg-slate-950 border border-rose-500/30 rounded space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-rose-400 font-mono">{v.id} • {v.ruleName} ({v.ruleId})</span>
                  <span className="text-[10px] text-slate-400">{v.timestamp}</span>
                </div>
                <div className="text-[11px] text-slate-300">
                  AI Model: <strong className="text-white">{v.aiModel}</strong> | Category: <span className="text-amber-300 font-mono">{v.category}</span> | Repeated Count: <span className="text-rose-400 font-bold">{v.repeatedCount}</span>
                </div>
                <div className="p-2 bg-slate-900 border border-slate-800 rounded text-[10px] text-emerald-300 font-mono">
                  Recovery Action: {v.recoveryAction}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* SECTION 8: AUTO ENFORCEMENT ENGINE                         */}
      {/* ========================================================== */}
      {activeTab === 'ENFORCEMENT' && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Section 8: Automated Enforcement & Circuit Locks</h2>
            </div>
            <span className="text-[10px] text-slate-400">Deterministic Intercept Protocols</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
            {[
              { action: 'Trade Block', trigger: 'Any Hard Invariant Breach', status: 'ACTIVE (100%)', desc: 'Instantly rejects trade proposal before committee dispatch.' },
              { action: 'Capital Reduction', trigger: 'Drawdown > 2.0%', status: 'ACTIVE (100%)', desc: 'Auto-scales position size down by 50%.' },
              { action: 'Risk Lock', trigger: 'VaR99 > 2.0%', status: 'ACTIVE (100%)', desc: 'Prevents new exposure additions.' },
              { action: 'AI Suspension', trigger: '3 Consecutive Violations', status: 'ACTIVE (100%)', desc: 'Quarantines model for 30 minutes.' },
              { action: 'Committee Escalation', trigger: 'Conflicting High-Alpha Proposal', status: 'ACTIVE (100%)', desc: 'Escalates to human CRO review.' },
              { action: 'Emergency Stop', trigger: 'Portfolio Drawdown > 3.5%', status: 'ACTIVE (100%)', desc: 'Global execution pause across all models.' },
              { action: 'Position Auto-Reduction', trigger: 'Sector Weight > 18.5%', status: 'ACTIVE (100%)', desc: 'Trimmers sell excess position tranches.' },
              { action: 'Circuit Lock', trigger: 'Exchange Market Halt', status: 'ACTIVE (100%)', desc: 'Locks OMS order gateway.' }
            ].map((enf, idx) => (
              <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded space-y-1.5">
                <div className="flex items-center justify-between font-bold text-white">
                  <span>{enf.action}</span>
                  <span className="text-emerald-400 text-[9px]">{enf.status}</span>
                </div>
                <div className="text-[10px] text-amber-300 font-mono">Trigger: {enf.trigger}</div>
                <p className="text-[9px] text-slate-400">{enf.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* SECTION 9: MARKET ADAPTIVE CONSTITUTION                    */}
      {/* ========================================================== */}
      {activeTab === 'MARKET_ADAPTIVE' && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Section 9: Market Adaptive Constitution</h2>
            </div>
            <span className="text-[10px] text-amber-400 font-bold">Active Regime: {activeRegime}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              'NORMAL', 'HIGH_VOLATILITY', 'EXTREME_VOLATILITY', 'BUDGET_DAY', 'ELECTION', 'WAR', 'CIRCUIT', 'HOLIDAY', 'EXPIRY', 'FED_EVENT', 'RBI_EVENT'
            ].map(regime => (
              <button
                key={regime}
                onClick={() => {
                  setActiveRegime(regime as any);
                  notify(`Market Regime switched to ${regime}. Constitution parameters auto-adjusted.`);
                }}
                className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase border transition-all ${
                  activeRegime === regime
                    ? 'bg-amber-500 text-black border-amber-400 font-black'
                    : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'
                }`}
              >
                {regime}
              </button>
            ))}
          </div>

          <div className="p-4 bg-slate-950 border border-amber-500/40 rounded space-y-3">
            <h3 className="text-xs font-bold text-amber-300 uppercase">
              Adaptive Rule Profile for [{activeRegime}] Regime
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] font-mono">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded">
                <span className="text-slate-400 text-[10px] block">Single Stock Allocation Cap</span>
                <span className="text-emerald-400 font-bold text-sm">
                  {activeRegime === 'EXTREME_VOLATILITY' || activeRegime === 'WAR' ? '2.0% NAV' : activeRegime === 'HIGH_VOLATILITY' ? '3.5% NAV' : '5.0% NAV'}
                </span>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded">
                <span className="text-slate-400 text-[10px] block">Slippage Tolerance Ceiling</span>
                <span className="text-emerald-400 font-bold text-sm">
                  {activeRegime === 'EXTREME_VOLATILITY' ? '0.10%' : activeRegime === 'HIGH_VOLATILITY' ? '0.15%' : '0.25%'}
                </span>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded">
                <span className="text-slate-400 text-[10px] block">Required Minimum R:R Threshold</span>
                <span className="text-emerald-400 font-bold text-sm">
                  {activeRegime === 'EXTREME_VOLATILITY' ? '3.50 : 1' : '2.50 : 1'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* SECTION 10: AI CONSTITUTION COMPLIANCE                     */}
      {/* ========================================================== */}
      {activeTab === 'COMPLIANCE' && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Section 10: AI Model Constitution Compliance Scorecard</h2>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">Fleet Isolation Verified</span>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800 text-[10px]">
                <tr>
                  <th className="p-2.5">Model Name</th>
                  <th className="p-2.5">Provider</th>
                  <th className="p-2.5">Compliance Score</th>
                  <th className="p-2.5">Warnings</th>
                  <th className="p-2.5">Violations</th>
                  <th className="p-2.5">Blocked Trades</th>
                  <th className="p-2.5">Success Rate</th>
                  <th className="p-2.5 text-right">Last Validation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {AI_COMPLIANCE_SCORECARD.map(m => (
                  <tr key={m.modelId} className="hover:bg-slate-800/50">
                    <td className="p-2.5 font-bold text-white">{m.modelName}</td>
                    <td className="p-2.5 text-slate-400">{m.provider}</td>
                    <td className="p-2.5 font-bold text-emerald-400">{m.complianceScore}%</td>
                    <td className="p-2.5 text-amber-300 font-bold">{m.warningsCount}</td>
                    <td className="p-2.5 text-rose-400 font-bold">{m.violationsCount}</td>
                    <td className="p-2.5 text-rose-400 font-bold">{m.blockedTradesCount}</td>
                    <td className="p-2.5 text-emerald-300 font-bold">{m.successRatePct}%</td>
                    <td className="p-2.5 text-right text-slate-500">{m.lastValidation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* SECTION 11: CONSTITUTION ANALYTICS                         */}
      {/* ========================================================== */}
      {activeTab === 'ANALYTICS' && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Section 11: Constitution Analytics & Risk Protection Metrics</h2>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">Audit Period: Today</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Rules Triggered Today</span>
              <div className="text-2xl font-bold font-mono text-emerald-400">1,428 Evaluated</div>
              <span className="text-[9px] text-slate-500">100% Interception Rate</span>
            </div>
            <div className="p-4 bg-slate-950 border border-slate-800 rounded space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Validation Pass Rate</span>
              <div className="text-2xl font-bold font-mono text-emerald-300">99.8% Passed</div>
              <span className="text-[9px] text-slate-500">0.2% Blocked (3 Trades)</span>
            </div>
            <div className="p-4 bg-slate-950 border border-slate-800 rounded space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Capital Protected</span>
              <div className="text-2xl font-bold font-mono text-amber-300">$3,850,000</div>
              <span className="text-[9px] text-slate-500">Prevented Tail Exposure</span>
            </div>
            <div className="p-4 bg-slate-950 border border-slate-800 rounded space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Constitution Efficiency</span>
              <div className="text-2xl font-bold font-mono text-emerald-400">0.8ms Avg Latency</div>
              <span className="text-[9px] text-slate-500">Zero Execution Bottleneck</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* SECTION 12: CONSTITUTION EVENT STREAM                       */}
      {/* ========================================================== */}
      {activeTab === 'EVENT_STREAM' && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Section 12: Real-Time Constitution Event Stream</h2>
            </div>
            <span className="text-[10px] text-slate-400">Live Telemetry Ledger</span>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded font-mono text-[11px] space-y-2">
            {eventLogs.map(log => (
              <div key={log.id} className="flex items-start gap-2 border-b border-slate-900 pb-1.5">
                <span className="text-slate-500 font-bold">[{log.timestamp}]</span>
                <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold uppercase border ${
                  log.severity === 'VETO' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                  log.severity === 'AMENDMENT' ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' :
                  'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                  {log.severity}
                </span>
                <span className="text-amber-400 font-bold">{log.ruleId}</span>
                <span className="text-slate-300">{log.details}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* SECTION 13: CONSTITUTION HIERARCHY                        */}
      {/* ========================================================== */}
      {activeTab === 'HIERARCHY' && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Section 13: Constitution Visual Hierarchy</h2>
            </div>
            <span className="text-[10px] text-slate-400">Supreme Governance Stack</span>
          </div>

          <div className="flex flex-col items-center space-y-2 py-4">
            {[
              { level: '1. Supreme Trade Constitution', desc: 'Non-negotiable Articles & Board Governance Rules', color: 'bg-emerald-500/20 border-emerald-400 text-emerald-300' },
              { level: '2. Enterprise Policy Layer', desc: 'Institutional Asset Eligibility & Capital Preservation Rules', color: 'bg-slate-900 border-slate-700 text-white' },
              { level: '3. Risk Policy Layer', desc: 'VaR 2.0% Cap, Drawdown Circuit Breakers & Leverage Limits', color: 'bg-slate-900 border-slate-700 text-white' },
              { level: '4. Trading Rules Layer', desc: 'Single Asset 5% NAV Cap, Sector 20% Cap & Correlation Matrix', color: 'bg-slate-900 border-slate-700 text-white' },
              { level: '5. Dynamic Rules Layer', desc: 'VIX Auto-Tighteners & Adaptive Stop Envelopes', color: 'bg-amber-500/20 border-amber-400 text-amber-300' },
              { level: '6. Pre-Trade Validation Gate', desc: 'Sub-1ms Deterministic Interceptor', color: 'bg-emerald-500/20 border-emerald-400 text-emerald-300' },
              { level: '7. Order Execution / OMS Dispatch', desc: 'Cleared for Committee Voting & Exchange Router', color: 'bg-blue-500/20 border-blue-400 text-blue-300' }
            ].map((node, idx) => (
              <React.Fragment key={idx}>
                <div className={`p-3 rounded border text-center max-w-xl w-full ${node.color}`}>
                  <div className="text-xs font-bold uppercase">{node.level}</div>
                  <div className="text-[10px] opacity-80">{node.desc}</div>
                </div>
                {idx < 6 && <div className="w-0.5 h-3 bg-slate-700" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* SECTION 14: RULE DEPENDENCY GRAPH                          */}
      {/* ========================================================== */}
      {activeTab === 'DEPENDENCIES' && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Section 14: Rule Dependency Graph</h2>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">100% Inter-System Connectivity</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-[11px]">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-2">
              <span className="text-emerald-400 font-bold uppercase block border-b border-slate-800 pb-1">Capital Dependencies</span>
              <ul className="space-y-1 text-slate-300">
                <li>• Cash Reserve Engine (Min 20% NAV)</li>
                <li>• Unallocated Liquidity Buffer</li>
                <li>• Treasury Collateral Vault</li>
              </ul>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-2">
              <span className="text-emerald-400 font-bold uppercase block border-b border-slate-800 pb-1">Risk & Margin Dependencies</span>
              <ul className="space-y-1 text-slate-300">
                <li>• Intraday VaR 99% Engine</li>
                <li>• Drawdown Circuit Breaker</li>
                <li>• Exchange RMS Margin Buffer</li>
              </ul>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-2">
              <span className="text-emerald-400 font-bold uppercase block border-b border-slate-800 pb-1">Committee & OMS Dependencies</span>
              <ul className="space-y-1 text-slate-300">
                <li>• 85% Committee Quorum Dispatch</li>
                <li>• Order Message Rate Limiter</li>
                <li>• Cryptographic Audit Ledger</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* SECTION 15: CONSTITUTION SANDBOX                           */}
      {/* ========================================================== */}
      {activeTab === 'SANDBOX' && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Section 15: Constitution Rule Draft Sandbox</h2>
            </div>
            <span className="text-[10px] text-amber-400 font-bold">Status: {draftStatus}</span>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded space-y-3">
            <h3 className="text-xs font-bold text-white uppercase">Draft & Simulate New Constitutional Rule</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Rule Name</label>
                <input
                  type="text"
                  value={draftRuleName}
                  onChange={e => setDraftRuleName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-white p-2 text-[11px] rounded"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Category</label>
                <select
                  value={draftCategory}
                  onChange={e => setDraftCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-white p-2 text-[11px] rounded"
                >
                  <option value="Position">Position</option>
                  <option value="Capital">Capital</option>
                  <option value="Risk">Risk</option>
                  <option value="Sector">Sector</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Condition</label>
                <input
                  type="text"
                  value={draftCondition}
                  onChange={e => setDraftCondition(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-white p-2 text-[11px] rounded"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setDraftStatus('SIMULATING');
                  notify('Running Sandbox Simulation against historical 1,428 trades...');
                  setTimeout(() => {
                    setDraftStatus('APPROVED');
                    notify('Simulation Passed! Zero unexpected false positives.');
                  }, 800);
                }}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded text-[11px]"
              >
                Run Simulation
              </button>
              <button
                onClick={() => {
                  notify('Draft Rule submitted to AI Governance Board for Committee Approval.');
                }}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded text-[11px]"
              >
                Submit to Committee
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* SECTION 16: RULE VERSION CONTROL                           */}
      {/* ========================================================== */}
      {activeTab === 'VERSIONS' && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Section 16: Constitution Version Control & Audit Ledger</h2>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">Active: v3.2 Enterprise</span>
          </div>

          <div className="space-y-3">
            {VERSION_HISTORY.map(ver => (
              <div key={ver.version} className="p-3 bg-slate-950 border border-slate-800 rounded space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white font-mono">{ver.version}</span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[9px] font-bold uppercase">
                    {ver.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">{ver.summary}</p>
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-900">
                  <span>Author: {ver.author} ({ver.releaseDate})</span>
                  <span>Signatures: {ver.committeeSignatures.join(', ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* SECTION 17: CONSTITUTION IMPACT SIMULATOR                  */}
      {/* ========================================================== */}
      {activeTab === 'SIMULATOR' && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Section 17: Rule Change Impact Simulator</h2>
            </div>
            <span className="text-[10px] text-amber-400 font-bold">Simulated Policy Shift</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded space-y-3">
              <h3 className="text-xs font-bold text-white uppercase">Adjust Policy Parameters</h3>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Max Allowable VaR Cap ({simVarCap}%)</label>
                <input
                  type="range"
                  min="0.5"
                  max="5.0"
                  step="0.1"
                  value={simVarCap}
                  onChange={e => setSimVarCap(parseFloat(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Single Asset Position Cap ({simPosCap}%)</label>
                <input
                  type="range"
                  min="1.0"
                  max="10.0"
                  step="0.5"
                  value={simPosCap}
                  onChange={e => setSimPosCap(parseFloat(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-950 border border-amber-500/40 rounded space-y-2 text-[11px] font-mono">
              <h3 className="text-xs font-bold text-amber-300 uppercase">Forecasted Impact</h3>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">Capital Impact:</span>
                <span className="text-emerald-400 font-bold">{simPosCap > 5 ? '+$250,000 Risk Capital' : '-$150,000 Risk Capital'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">Blocked Trades Forecast:</span>
                <span className="text-rose-400 font-bold">{simVarCap < 2 ? '14 Trades Blocked' : '2 Trades Blocked'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">Portfolio Exposure Shift:</span>
                <span className="text-white font-bold">{simPosCap * 12.5}% Max Capacity</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* SECTION 18: DECISION VS CONSTITUTION LIVE INSPECTOR        */}
      {/* ========================================================== */}
      {activeTab === 'LIVE_INSPECTOR' && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Section 18: Decision vs Constitution Live Interceptor</h2>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">Line-by-Line Inspection</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px]">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-2">
              <span className="text-amber-400 font-bold uppercase">Candidate Decision [DEC-2026-904]</span>
              <pre className="p-2 bg-slate-900 rounded text-slate-300 font-mono text-[10px] overflow-x-auto">
{`{
  "symbol": "BANKNIFTY",
  "direction": "SHORT",
  "confidence": 64.2,
  "proposedRisk": "1.9%",
  "proposedReward": "2.1%",
  "calculatedRR": "1.08:1",
  "targetMargin": "$300,000"
}`}
              </pre>
            </div>

            <div className="p-3 bg-slate-950 border border-rose-500/40 rounded space-y-2 font-mono">
              <span className="text-rose-400 font-bold uppercase">Constitutional Verification Results</span>
              <div className="space-y-1">
                <div className="text-emerald-400">✓ Rule 12 (Capital Check): PASSED</div>
                <div className="text-emerald-400">✓ Rule 21 (Single Stock Cap): PASSED</div>
                <div className="text-rose-400 font-bold">✗ Rule 05 (Min R:R &gt;= 2.5:1): FAILED (1.08:1)</div>
                <div className="p-2 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded text-[10px] font-bold mt-2">
                  FINAL OUTCOME: EXECUTION HARD_BLOCKED BY CONSTITUTION
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* SECTION 19: EMERGENCY CONSTITUTION                        */}
      {/* ========================================================== */}
      {activeTab === 'EMERGENCY' && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Section 19: Emergency Constitution Protocol</h2>
            </div>
            <span className="text-[10px] text-rose-400 font-bold">Market Crash Intercept Mode</span>
          </div>

          <div className="p-4 bg-slate-950 border border-rose-500/40 rounded space-y-3 text-[11px] font-mono">
            <div className="flex items-center justify-between">
              <span className="text-white font-bold">Emergency Protocol Sequence</span>
              <button
                onClick={toggleEmergencyMode}
                className={`px-3 py-1 bg-rose-600 text-white font-bold rounded text-[10px] ${emergencyMode ? 'animate-pulse' : ''}`}
              >
                {emergencyMode ? 'LOCKDOWN ACTIVE (RESET)' : 'ENGAGE EMERGENCY PROTOCOL'}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-center text-[10px]">
              {['Market Crash', 'Emergency Mode', 'Capital Lock', 'Risk Freeze', 'Execution Block'].map((step, i) => (
                <div key={i} className="p-2 bg-slate-900 border border-slate-800 rounded font-bold text-slate-300">
                  #{i + 1} {step}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* SECTION 20: CONSTITUTION KNOWLEDGE GRAPH                   */}
      {/* ========================================================== */}
      {activeTab === 'KNOWLEDGE_GRAPH' && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Section 20: Constitution Knowledge & Invariant Graph</h2>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">Integrated Semantic Topology</span>
          </div>

          <div className="p-6 bg-slate-950 border border-slate-800 rounded flex flex-wrap justify-center items-center gap-4 text-center font-mono text-[11px]">
            <div className="p-3 bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-bold rounded shadow-lg">
              Articles (I-XII)
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600" />
            <div className="p-3 bg-amber-500/20 border border-amber-400 text-amber-300 font-bold rounded shadow-lg">
              Rules Engine (42 Rules)
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600" />
            <div className="p-3 bg-blue-500/20 border border-blue-400 text-blue-300 font-bold rounded shadow-lg">
              Pre-Trade Interceptor
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600" />
            <div className="p-3 bg-purple-500/20 border border-purple-400 text-purple-300 font-bold rounded shadow-lg">
              Committee Quorum
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600" />
            <div className="p-3 bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-bold rounded shadow-lg">
              Execution / OMS Dispatch
            </div>
          </div>
        </div>
      )}

      {/* FOOTER AUDIT BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 border-t border-slate-800/80 pt-3 font-mono gap-2">
        <span>AI ARINA V3.2 Trade Constitution & Dynamic Governance Operating System</span>
        <span className="text-emerald-400 font-bold">100% Invariants Verified • Sub-1ms Interception Active</span>
      </div>
    </div>
  );
};
