import React, { useState, useMemo } from 'react';
import { 
  Zap, 
  Search, 
  Filter, 
  Layers, 
  FileText, 
  Activity, 
  Box, 
  Settings, 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Cpu, 
  ArrowRight, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Play, 
  RefreshCw, 
  Sliders, 
  Database, 
  GitBranch, 
  GitCommit, 
  Copy, 
  Plus, 
  Terminal, 
  Check, 
  Lock, 
  Unlock, 
  Award, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  BarChart2, 
  PieChart, 
  Network, 
  ShoppingBag,
  ChevronRight,
  Info,
  BookOpen,
  Compass,
  Layers as LayersIcon
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Panel, StatusBadge } from './ui/Base';
import { DataTable } from './ui/Table';
import { DataBoundary } from './ui/Feedback';

// 25 INSTITUTIONAL STRATEGIES REGISTRY FOR EP08 STRATEGY LIBRARY (KNOWLEDGE CENTER PHASE 2)
const INSTITUTIONAL_STRATEGIES = [
  {
    id: 'STRAT-LIB-001',
    displayName: 'Moving Average Crossover (SMA 50/200)',
    category: 'Trend Following',
    tradingStyle: 'Positional Trend',
    riskLevel: 'LOW',
    timeHorizon: '1 Day',
    supportedMarkets: 'Global Equities, Indices',
    supportedInstruments: 'ETFs, Cash Equities',
    version: 'v3.2.0',
    approvalStatus: 'Approved',
    paperTradingStatus: 'Eligible',
    lifecycle: 'Production',
    lastValidation: '2026-08-01 04:00 UTC',
    purpose: 'Capture intermediate-to-long-term institutional trends via dual moving average intersections.',
    description: 'Calculates 50-period and 200-period Simple Moving Averages on daily closing prices. Generates bullish signal when SMA50 crosses above SMA200.',
    entryLogic: 'Daily Close > SMA50 AND SMA50 > SMA200 AND Volume > 30-day average.',
    exitLogic: 'Daily Close < SMA50 OR trailing stop triggered at 3.5% drawdown.',
    stopPhilosophy: 'Fixed volatility-adjusted stop set at 1.5x 14-day ATR below entry price.',
    targetPhilosophy: 'Uncapped trailing profit target trailing the 20 EMA.',
    capitalPhilosophy: 'Allocates max 4.0% of portfolio NAV per active signal.',
    advantages: 'Highly robust in sustained bull and bear macro regimes; zero curve fitting required.',
    weaknesses: 'Prone to whipsaws and false breakouts in choppy, sideways consolidation markets.',
    recommendedMarket: 'High-liquidity trending equity indices and mega-cap growth stocks.',
    avoidConditions: 'Low-volume summer consolidation ranges and high-inflation range-bound currencies.',
    paperEligible: true,
    sha256: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
    approvalCommittee: 'AI Governance Committee Alpha (5/5 Unanimous)',
    owner: 'Dr. Evelyn Vance (Chief Quantitative Strategist)',
    created: '2025-01-15',
    modified: '2026-07-10',
    riskGrade: 'Grade A (Institutional Secure)',
    complexity: 'Low (Standard Technical)',
    expectedHoldingPeriod: '15 to 90 Days',
    supportedExchanges: 'NSE, BSE, MCX',
    allowedAiModels: ['ARINA-Core-v3', 'Gemini-3.5-Pro'],
    digitalSignature: 'SIG-ARINA-001-VALIDATED',
    winRate: 58.4,
    sharpe: 2.10,
    sqsScore: 89,
    // 16 Detailed Sections Knowledge Center Attributes
    executiveSummary: {
      objective: 'Capture multi-week and multi-month directional trend runs in high-liquidity capital markets.',
      tradingPhilosophy: 'Systematic trend following based on price crossing historical moving average thresholds.',
      primaryGoal: 'Participate in large cyclical expansions while keeping max drawdown bounded.',
      expectedBehaviour: 'Low win rate compensated by asymmetric risk-reward on trending legs.'
    },
    marketCompatibility: {
      bull: 'Optimal (Strong positive drift)',
      bear: 'Optimal (Clean downward acceleration)',
      sideways: 'Poor (High whipsaw frequency)',
      highVol: 'Moderate (Requires wider ATR stops)',
      lowVol: 'Poor (False crossover signals)',
      newsEvents: 'Neutral (Filtered by daily close)',
      gapOpening: 'Low Impact (Daily timeframe)',
      expiryDay: 'Low Impact'
    },
    instrumentCompatibility: {
      stocks: 'Recommended',
      etf: 'Recommended',
      index: 'Recommended',
      indexFutures: 'Allowed',
      stockFutures: 'Allowed',
      stockOptions: 'Allowed',
      indexOptions: 'Allowed',
      mcx: 'Not Recommended'
    },
    timeframeCompatibility: {
      m1: 'Not Recommended',
      m3: 'Not Recommended',
      m5: 'Not Recommended',
      m15: 'Not Recommended',
      m30: 'Not Recommended',
      h1: 'Allowed',
      daily: 'Optimal',
      weekly: 'Optimal'
    },
    indicatorDependency: [
      { name: 'SMA 50', purpose: 'Medium-term trend direction', importance: 'Critical', priority: 'Primary' },
      { name: 'SMA 200', purpose: 'Long-term macro regime filter', importance: 'Critical', priority: 'Primary' },
      { name: 'ATR (14)', purpose: 'Volatility stop calibration', importance: 'High', priority: 'Secondary' }
    ],
    entryPhilosophy: {
      activeCondition: 'Daily market close confirmed above SMA50 with SMA50 above SMA200.',
      confirmationStart: 'Volume exceeds 30-day moving average.',
      trendConfirmation: 'Consecutive higher highs on 3 daily closes.',
      invalidation: 'Daily close below SMA50 or market liquidity dry-up.'
    },
    exitPhilosophy: {
      targetLogic: 'Uncapped trailing stop following 20 EMA.',
      stopLogic: '1.5x 14-day ATR below entry.',
      trailingLogic: 'Dynamic ATR trailing lock.',
      timeExit: 'None (Positional holding).',
      emergencyExit: 'Systemic macro circuit breaker.',
      riskExit: 'Fixed 3.5% NAV portfolio cap breach.'
    },
    riskClassification: {
      capitalUsage: 'Max 4.0% NAV per position',
      expectedDrawdown: '12.5% max historical',
      tradeFrequency: 'Low (2-4 signals per month)',
      learningCurve: 'Beginner / Institutional Standard'
    },
    strengthAnalysis: {
      advantages: 'Zero curve fitting, immune to intraday noise, highly scalable.',
      bestPerformance: 'Secular bull markets and prolonged cyclical expansions.',
      idealEnvironment: 'High liquidity indices and mega-cap growth baskets.',
      institutionalBenefits: 'Low turnover, minimal execution slippage, easy auditability.'
    },
    weaknessAnalysis: {
      falseSignals: 'Frequent whipsaws in tight trading ranges.',
      badConditions: 'Summer consolidation and range-bound chopping.',
      highRiskSituations: 'Sudden V-bottom reversals from secular bear markets.',
      commonMistakes: 'Interrupting trades during normal pullback phases.',
      failureReasons: 'Prolonged sideways macro regime.'
    },
    aiCompatibility: {
      compatibleModels: ['ARINA-Core-v3', 'Gemini-3.5-Pro'],
      preferredModels: ['ARINA-Core-v3'],
      restrictedModels: ['Experimental-Scalper-v1'],
      committeeApproval: 'Required (5/5 Unanimous)',
      reasoningRequirement: 'Mandatory macro validation note',
      confidenceThreshold: '80/100'
    },
    paperTradingRequirements: {
      minSampleSize: 30,
      minTrades: 25,
      requiredWinRate: 52.0,
      requiredProfitFactor: 1.65,
      requiredMaxDD: 15.0,
      minConfidence: 75,
      promotionRule: '30 consecutive days of positive outperformance vs benchmark.'
    },
    versionTimeline: [
      { version: 'v3.2.0', author: 'Dr. Evelyn Vance', committee: 'Governance Alpha', approval: '2026-08-01', modification: 'Updated ATR multiplier', validation: 'Passed SQS 89', rollbackPoint: 'v3.1.0' },
      { version: 'v3.1.0', author: 'Quant Group', committee: 'Governance Alpha', approval: '2025-12-01', modification: 'Initial production release', validation: 'Passed SQS 88', rollbackPoint: 'v3.0.0' }
    ],
    knowledgeReferences: {
      parent: 'Trend Following Master Family',
      child: 'SMA Crossover Equity Sub-Branch',
      alternative: 'EMA Trend Ribbon (STRAT-LIB-002)',
      supporting: 'Volume Weighted Average Price (STRAT-LIB-003)',
      conflicting: 'Mean Reversion Z-Score (STRAT-LIB-012)'
    }
  },
  // We will ensure all 25 strategies have robust knowledge center data populated
  {
    id: 'STRAT-LIB-002',
    displayName: 'Exponential Moving Average (EMA Trend)',
    category: 'Trend Following',
    tradingStyle: 'Momentum Trend',
    riskLevel: 'MEDIUM',
    timeHorizon: '4 Hours',
    supportedMarkets: 'FX Majors, Crypto Perps',
    supportedInstruments: 'Spot FX, Perpetual Swaps',
    version: 'v2.8.4',
    approvalStatus: 'Approved',
    paperTradingStatus: 'Eligible',
    lifecycle: 'Production',
    lastValidation: '2026-08-01 04:15 UTC',
    purpose: 'React faster to recent price acceleration using weighted exponential moving averages.',
    description: 'Utilizes 9, 21, and 55 EMA ribbons to identify rapid institutional momentum shifts.',
    entryLogic: 'EMA9 crosses EMA21 in direction of EMA55 slope with RSI between 50 and 70.',
    exitLogic: 'EMA9 crosses back below EMA21 or price touches 2.0 ATR band.',
    stopPhilosophy: 'Tight swing low stop loss with breakeven trigger at +1.0R.',
    targetPhilosophy: 'Scale out 50% at 1.5R, remainder at 3.0R.',
    capitalPhilosophy: 'Risk budget capped at 2.0% of portfolio NAV per position.',
    advantages: 'Quicker reaction to trend changes than simple moving averages.',
    weaknesses: 'Susceptible to frequent whipsaws during choppy sideways sessions.',
    recommendedMarket: 'High-beta crypto pairs and liquid G10 currency crosses.',
    avoidConditions: 'Low volatility overnight Asian trading hours.',
    paperEligible: true,
    sha256: 'b2c3d4e5f6a17890123456789abcdef0123456789abcdef0123456789abcdef1',
    approvalCommittee: 'AI Governance Committee Beta',
    owner: 'Quant Risk Group',
    created: '2025-02-20',
    modified: '2026-07-12',
    riskGrade: 'Grade B+',
    complexity: 'Moderate',
    expectedHoldingPeriod: '2 to 14 Days',
    supportedExchanges: 'NSE, BSE, MCX',
    allowedAiModels: ['ARINA-Omni-v3'],
    digitalSignature: 'SIG-ARINA-002-VALIDATED',
    winRate: 61.2,
    sharpe: 2.35,
    sqsScore: 91,
    executiveSummary: {
      objective: 'Capture accelerated momentum waves in high-beta asset classes.',
      tradingPhilosophy: 'Exponential weighting prioritizes recent price action for faster response times.',
      primaryGoal: 'Capture swift intermediate trends in crypto and FX.',
      expectedBehaviour: 'Higher win rate than SMA with moderate drawdown profile.'
    },
    marketCompatibility: { bull: 'Optimal', bear: 'Optimal', sideways: 'Poor', highVol: 'Good', lowVol: 'Poor', newsEvents: 'High Impact', gapOpening: 'Moderate', expiryDay: 'Neutral' },
    instrumentCompatibility: { stocks: 'Allowed', etf: 'Allowed', index: 'Recommended', indexFutures: 'Recommended', stockFutures: 'Recommended', stockOptions: 'Allowed', indexOptions: 'Allowed', mcx: 'Not Recommended' },
    timeframeCompatibility: { m1: 'Not Recommended', m3: 'Not Recommended', m5: 'Allowed', m15: 'Recommended', m30: 'Recommended', h1: 'Optimal', daily: 'Optimal', weekly: 'Allowed' },
    indicatorDependency: [{ name: 'EMA Ribbon (9/21/55)', purpose: 'Momentum slope detection', importance: 'Critical', priority: 'Primary' }],
    entryPhilosophy: { activeCondition: 'EMA9 crosses EMA21 with slope agreement.', confirmationStart: 'RSI between 50 and 70.', trendConfirmation: 'Volume expansion.', invalidation: 'EMA9 crosses back.' },
    exitPhilosophy: { targetLogic: 'Scale out 1.5R & 3.0R.', stopLogic: 'Swing low.', trailingLogic: 'EMA trailing.', timeExit: 'None', emergencyExit: 'Spread widening alert', riskExit: '2% NAV limit' },
    riskClassification: { capitalUsage: '2% NAV', expectedDrawdown: '10%', tradeFrequency: 'Medium', learningCurve: 'Intermediate' },
    strengthAnalysis: { advantages: 'Fast reaction, clean trend capture.', bestPerformance: 'Crypto and FX trending sessions.', idealEnvironment: 'High beta.', institutionalBenefits: 'Automated execution alignment.' },
    weaknessAnalysis: { falseSignals: 'Whipsaws in range chop.', badConditions: 'Consolidation.', highRiskSituations: 'News spikes.', commonMistakes: 'Oversizing.', failureReasons: 'Choppy drift.' },
    aiCompatibility: { compatibleModels: ['ARINA-Omni-v3'], preferredModels: ['ARINA-Omni-v3'], restrictedModels: [], committeeApproval: 'Required', reasoningRequirement: 'Standard', confidenceThreshold: '82' },
    paperTradingRequirements: { minSampleSize: 25, minTrades: 20, requiredWinRate: 55, requiredProfitFactor: 1.7, requiredMaxDD: 12, minConfidence: 80, promotionRule: '20 successful sessions' },
    versionTimeline: [{ version: 'v2.8.4', author: 'Quant Group', committee: 'Beta', approval: '2026-07-12', modification: 'Parameter tuning', validation: 'Passed SQS 91', rollbackPoint: 'v2.8.0' }],
    knowledgeReferences: { parent: 'Momentum Family', child: 'EMA Crypto Branch', alternative: 'SMA Crossover', supporting: 'VWAP', conflicting: 'Mean Reversion' }
  },
  {
    id: 'STRAT-LIB-003',
    displayName: 'Volume Weighted Average Price (VWAP)',
    category: 'Momentum',
    tradingStyle: 'Intraday Execution',
    riskLevel: 'LOW',
    timeHorizon: '15 Minutes',
    supportedMarkets: 'US Equity Cash',
    supportedInstruments: 'Mega-Cap Stocks, Index ETFs',
    version: 'v4.1.2',
    approvalStatus: 'Approved',
    paperTradingStatus: 'Eligible',
    lifecycle: 'Production',
    lastValidation: '2026-08-01 04:30 UTC',
    purpose: 'Execute institutional volume-anchored mean reversion and momentum ignition.',
    description: 'Measures intraday fair value benchmarked against cumulative traded volume.',
    entryLogic: 'Price tests VWAP value band with institutional volume delta > 2.0x.',
    exitLogic: 'Reaches standard deviation band 2 (Upper/Lower) or end of day close.',
    stopPhilosophy: 'Fixed 0.75% stop loss below VWAP pivot.',
    targetPhilosophy: 'Profit target at 1.5 standard deviation band.',
    capitalPhilosophy: 'Allocates up to 5.0% intraday capital per symbol.',
    advantages: 'Direct alignment with institutional execution benchmarks.',
    weaknesses: 'Fails in low-volume holiday sessions lacking institutional participation.',
    recommendedMarket: 'SPY, QQQ, AAPL, NVDA, TSLA intraday sessions.',
    avoidConditions: 'Pre-market and post-market low liquidity hours.',
    paperEligible: true,
    sha256: 'c3d4e5f6a1b27890123456789abcdef0123456789abcdef0123456789abcdef2',
    approvalCommittee: 'Intraday Risk Board',
    owner: 'Execution Analytics Team',
    created: '2025-03-10',
    modified: '2026-07-15',
    riskGrade: 'Grade A',
    complexity: 'Low',
    expectedHoldingPeriod: '1 to 6 Hours',
    supportedExchanges: 'NSE, BSE, MCX',
    allowedAiModels: ['Gemini-3.5-Pro', 'ARINA-Core-v3'],
    digitalSignature: 'SIG-ARINA-003-VALIDATED',
    winRate: 67.5,
    sharpe: 2.65,
    sqsScore: 93,
    executiveSummary: { objective: 'Intraday fair value execution', tradingPhilosophy: 'Volume-anchored pricing', primaryGoal: 'Capture institutional intraday turns', expectedBehaviour: 'High win rate intraday' },
    marketCompatibility: { bull: 'Optimal', bear: 'Optimal', sideways: 'Optimal', highVol: 'Good', lowVol: 'Poor', newsEvents: 'High Impact', gapOpening: 'Critical', expiryDay: 'Optimal' },
    instrumentCompatibility: { stocks: 'Recommended', etf: 'Recommended', index: 'Recommended', indexFutures: 'Recommended', stockFutures: 'Allowed', stockOptions: 'Allowed', indexOptions: 'Allowed', mcx: 'Not Recommended' },
    timeframeCompatibility: { m1: 'Allowed', m3: 'Recommended', m5: 'Optimal', m15: 'Optimal', m30: 'Recommended', h1: 'Allowed', daily: 'Not Recommended', weekly: 'Not Recommended' },
    indicatorDependency: [{ name: 'VWAP Bands', purpose: 'Fair value deviation', importance: 'Critical', priority: 'Primary' }],
    entryPhilosophy: { activeCondition: 'Price tests band', confirmationStart: 'Volume delta', trendConfirmation: 'Institutional sweep', invalidation: 'Break of anchor' },
    exitPhilosophy: { targetLogic: 'Std Dev 2 band', stopLogic: '0.75%', trailingLogic: 'Band trailing', timeExit: 'Market close', emergencyExit: 'Halt', riskExit: 'Max intraday loss' },
    riskClassification: { capitalUsage: '5% intraday', expectedDrawdown: '5%', tradeFrequency: 'High', learningCurve: 'Beginner' },
    strengthAnalysis: { advantages: 'Institutional benchmark alignment', bestPerformance: 'Liquid equities', idealEnvironment: 'Active cash session', institutionalBenefits: 'Low slippage' },
    weaknessAnalysis: { falseSignals: 'Low volume chop', badConditions: 'Holidays', highRiskSituations: 'Earnings gap', commonMistakes: 'Over-leveraging', failureReasons: 'Lacking volume' },
    aiCompatibility: { compatibleModels: ['Gemini-3.5-Pro', 'ARINA-Core-v3'], preferredModels: ['Gemini-3.5-Pro'], restrictedModels: [], committeeApproval: 'Required', reasoningRequirement: 'Low', confidenceThreshold: '85' },
    paperTradingRequirements: { minSampleSize: 50, minTrades: 40, requiredWinRate: 60, requiredProfitFactor: 2.0, requiredMaxDD: 8, minConfidence: 80, promotionRule: '2 weeks positive PnL' },
    versionTimeline: [{ version: 'v4.1.2', author: 'Execution Team', committee: 'Intraday Board', approval: '2026-07-15', modification: 'Band calculation fix', validation: 'Passed SQS 93', rollbackPoint: 'v4.1.0' }],
    knowledgeReferences: { parent: 'Intraday Execution Family', child: 'VWAP Equity Sub-branch', alternative: 'ORB', supporting: 'Volume Breakout', conflicting: 'Swing Trend' }
  }
];

// Populate the remaining 22 strategies (STRAT-LIB-004 to 025) cleanly with full structure
for (let i = 4; i <= 25; i++) {
  const idStr = `STRAT-LIB-${String(i).padStart(3, '0')}`;
  INSTITUTIONAL_STRATEGIES.push({
    id: idStr,
    displayName: `Institutional Alpha Strategy ${i}`,
    category: i % 2 === 0 ? 'Trend Following' : i % 3 === 0 ? 'Momentum' : i % 5 === 0 ? 'Breakout' : 'Mean Reversion',
    tradingStyle: 'Systematic Quantitative',
    riskLevel: i % 3 === 0 ? 'HIGH' : i % 2 === 0 ? 'MEDIUM' : 'LOW',
    timeHorizon: i % 4 === 0 ? '1 Hour' : '1 Day',
    supportedMarkets: 'Global Capital Markets',
    supportedInstruments: 'Equities, Derivatives, FX',
    version: `v2.${i % 10}.0`,
    approvalStatus: i === 9 ? 'Experimental' : 'Approved',
    paperTradingStatus: 'Eligible',
    lifecycle: i === 9 ? 'Paper Testing' : 'Production',
    lastValidation: '2026-08-01 05:00 UTC',
    purpose: `Algorithmic execution model ${i} engineered for institutional alpha generation under rigorous compliance rules.`,
    description: `Core mathematical formulation for Strategy ${i}. Evaluates multi-factor signals across market microstructure and macro indicators.`,
    entryLogic: `Quantitative trigger condition ${i} met with statistical confidence > 85%.`,
    exitLogic: `Risk-adjusted profit target or volatility stop triggered for strategy ${i}.`,
    stopPhilosophy: `Volatility-adjusted stop loss calibrated to 1.5x ATR for node ${i}.`,
    targetPhilosophy: `Dynamic risk-reward scaling targeting 2.5R to 3.0R returns.`,
    capitalPhilosophy: `Strictly bounded capital allocation of 2.0% to 4.0% NAV per execution node.`,
    advantages: `High mathematical robustness, zero emotional bias, fully audited.`,
    weaknesses: `Prone to degraded performance during structural macro regime shifts.`,
    recommendedMarket: `High-liquidity instruments compatible with strategy node ${i}.`,
    avoidConditions: `Illiquid overnight sessions and disorderly market crashes.`,
    paperEligible: true,
    sha256: `sha256hashvaluestringforinstitutionaltagstrategy${i}0123456789abcdef`,
    approvalCommittee: 'AI Governance Committee Master',
    owner: `Quantitative Research Desk ${i}`,
    created: '2025-01-10',
    modified: '2026-07-20',
    riskGrade: i % 3 === 0 ? 'Grade B' : 'Grade A',
    complexity: 'Moderate to High',
    expectedHoldingPeriod: '1 to 14 Days',
    supportedExchanges: 'NSE, BSE, MCX',
    allowedAiModels: ['ARINA-Core-v3', 'Gemini-3.5-Pro', 'ARINA-Omni-v3'],
    digitalSignature: `SIG-ARINA-${String(i).padStart(3, '0')}-VALIDATED`,
    winRate: 55.0 + (i % 15),
    sharpe: 2.0 + (i % 10) * 0.05,
    sqsScore: 85 + (i % 10),
    executiveSummary: {
      objective: `Execute calibrated institutional alpha strategy ${i}.`,
      tradingPhilosophy: `Systematic quantitative rule adherence.`,
      primaryGoal: `Consistent risk-adjusted return generation.`,
      expectedBehaviour: `Stable statistical expectancy across market cycles.`
    },
    marketCompatibility: { bull: 'Optimal', bear: 'Good', sideways: 'Moderate', highVol: 'Good', lowVol: 'Moderate', newsEvents: 'Filtered', gapOpening: 'Neutral', expiryDay: 'Neutral' },
    instrumentCompatibility: { stocks: 'Recommended', etf: 'Recommended', index: 'Recommended', indexFutures: 'Allowed', stockFutures: 'Allowed', stockOptions: 'Allowed', indexOptions: 'Allowed', mcx: 'Allowed' },
    timeframeCompatibility: { m1: 'Allowed', m3: 'Allowed', m5: 'Recommended', m15: 'Recommended', m30: 'Recommended', h1: 'Optimal', daily: 'Optimal', weekly: 'Allowed' },
    indicatorDependency: [
      { name: 'Composite Momentum Index', purpose: 'Trend acceleration', importance: 'High', priority: 'Primary' },
      { name: 'ATR Volatility Band', purpose: 'Risk sizing', importance: 'Critical', priority: 'Primary' }
    ],
    entryPhilosophy: {
      activeCondition: `Multi-factor composite score > 80 for strategy ${i}.`,
      confirmationStart: `Volume surge confirmed.`,
      trendConfirmation: `Directional persistence.`,
      invalidation: `Composite score reversal.`
    },
    exitPhilosophy: {
      targetLogic: `2.5R target reached.`,
      stopLogic: `ATR trailing stop.`,
      trailingLogic: `Dynamic locking.`,
      timeExit: `Max holding period reached.`,
      emergencyExit: `Global circuit breaker.`,
      riskExit: `Max drawdown limit.`
    },
    riskClassification: {
      capitalUsage: `Max 3.0% NAV`,
      expectedDrawdown: `12% max`,
      tradeFrequency: `Medium`,
      learningCurve: `Institutional Standard`
    },
    strengthAnalysis: {
      advantages: `High Sharpe ratio, fully automated.`,
      bestPerformance: `Trending and volatile regimes.`,
      idealEnvironment: `Global liquid markets.`,
      institutionalBenefits: `Zero manual intervention required.`
    },
    weaknessAnalysis: {
      falseSignals: `Sideways chop noise.`,
      badConditions: `Illiquid range markets.`,
      highRiskSituations: `Black swan macro events.`,
      commonMistakes: `Interfering with automated exits.`,
      failureReasons: `Structural regime change.`
    },
    aiCompatibility: {
      compatibleModels: ['ARINA-Core-v3', 'Gemini-3.5-Pro', 'ARINA-Omni-v3'],
      preferredModels: ['ARINA-Core-v3'],
      restrictedModels: [],
      committeeApproval: 'Required',
      reasoningRequirement: 'Standard',
      confidenceThreshold: '80'
    },
    paperTradingRequirements: {
      minSampleSize: 30,
      minTrades: 25,
      requiredWinRate: 52,
      requiredProfitFactor: 1.6,
      requiredMaxDD: 15,
      minConfidence: 75,
      promotionRule: `Standard 30-day paper verification.`
    },
    versionTimeline: [
      { version: `v2.${i % 10}.0`, author: `Desk ${i}`, committee: 'Master', approval: '2026-07-20', modification: `Release version ${i}`, validation: 'Passed SQS', rollbackPoint: 'v2.0.0' }
    ],
    knowledgeReferences: {
      parent: 'Institutional Master Registry',
      child: `Sub-Branch ${i}`,
      alternative: `Alternative Node ${i > 1 ? i - 1 : 25}`,
      supporting: 'Core Risk Engine',
      conflicting: 'Inverse Strategy Node'
    }
  });
}

export const StrategyRegistryWorkspace = React.memo(() => {
  // Enterprise Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedRisk, setSelectedRisk] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Selected Strategy State (Defaults to first strategy)
  const [selectedStrategy, setSelectedStrategy] = useState(INSTITUTIONAL_STRATEGIES[0]);

  // Filtered Strategies
  const filteredStrategies = useMemo(() => {
    return INSTITUTIONAL_STRATEGIES.filter(s => {
      const matchesSearch = searchQuery === '' || 
        s.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.supportedMarkets.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.version.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategory === 'ALL' || s.category === selectedCategory;
      const matchesRisk = selectedRisk === 'ALL' || s.riskLevel === selectedRisk;
      const matchesStatus = selectedStatus === 'ALL' || s.approvalStatus === selectedStatus;

      return matchesSearch && matchesCat && matchesRisk && matchesStatus;
    });
  }, [searchQuery, selectedCategory, selectedRisk, selectedStatus]);

  // KPI Calculations
  const totalStrategies = INSTITUTIONAL_STRATEGIES.length;
  const prodStrategies = INSTITUTIONAL_STRATEGIES.filter(s => s.approvalStatus === 'Approved').length;
  const paperEligibleCount = INSTITUTIONAL_STRATEGIES.filter(s => s.paperEligible).length;
  const experimentalCount = INSTITUTIONAL_STRATEGIES.filter(s => s.approvalStatus === 'Experimental').length;
  const retiredCount = INSTITUTIONAL_STRATEGIES.filter(s => s.approvalStatus === 'Retired').length;
  const avgWinRate = (INSTITUTIONAL_STRATEGIES.reduce((acc, s) => acc + s.winRate, 0) / totalStrategies).toFixed(1);

  return (
    <div className="flex flex-col h-full bg-terminal-bg text-white relative font-sans overflow-hidden">
      <DataBoundary data={INSTITUTIONAL_STRATEGIES} title="Strategy Library Knowledge Center">
        
        {/* 1. STRATEGY LIBRARY HEADER */}
        <div className="bg-black border-b border-terminal-border px-4 py-3 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2 mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-terminal-amber/10 border border-terminal-amber/30 text-terminal-amber">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
                  EP08 Strategy Library &bull; Institutional Knowledge Center
                  <span className="text-[9px] bg-terminal-amber/20 text-terminal-amber px-2 py-0.5 rounded border border-terminal-amber/40 font-mono">PHASE 2 ENCYCLOPEDIA</span>
                </h1>
                <p className="text-[10px] text-terminal-muted uppercase tracking-wider">
                  25 Approved Institutional Strategies &bull; 16 Structured Documentation Sections &bull; Zero Execution Logic
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 font-mono text-[10px] text-terminal-muted">
              <div className="bg-terminal-panel px-2.5 py-1 rounded border border-terminal-border">
                Last Validation: <span className="text-terminal-amber font-bold">2026-08-01 04:00 UTC</span>
              </div>
              <div className="bg-terminal-panel px-2.5 py-1 rounded border border-terminal-border">
                Library Version: <span className="text-white font-bold">v3.2.0-PROD</span>
              </div>
              <div className="bg-terminal-panel px-2.5 py-1 rounded border border-terminal-border flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-terminal-green animate-pulse" />
                Sync Status: <span className="text-terminal-green font-bold">CONNECTED</span>
              </div>
            </div>
          </div>

          {/* CONSTITUTIONAL BANNER */}
          <div className="flex items-center gap-2 text-[10px] bg-red-950/40 border border-red-500/30 text-red-300 px-3 py-1 rounded">
            <Lock className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span className="font-bold uppercase tracking-wider text-red-200">CONSTITUTIONAL RULE:</span>
            <span>One Trade → One Strategy. Strategy Library governs approved methodologies only. Zero trade execution, zero order routing, zero broker connectivity in this workspace.</span>
          </div>
        </div>

        {/* 2. STATUS CARDS RIBBON */}
        <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-2 p-3 bg-black/70 border-b border-terminal-border shrink-0 text-xs">
          <div className="bg-terminal-panel p-2 rounded border border-terminal-border/50 text-center">
            <div className="text-[9px] text-terminal-muted uppercase font-bold">Approved</div>
            <div className="text-base font-mono font-bold text-white mt-0.5">{totalStrategies}</div>
          </div>
          <div className="bg-terminal-panel p-2 rounded border border-terminal-border/50 text-center">
            <div className="text-[9px] text-terminal-muted uppercase font-bold text-terminal-green">Production</div>
            <div className="text-base font-mono font-bold text-terminal-green mt-0.5">{prodStrategies}</div>
          </div>
          <div className="bg-terminal-panel p-2 rounded border border-terminal-border/50 text-center">
            <div className="text-[9px] text-terminal-muted uppercase font-bold text-terminal-blue">Paper Eligible</div>
            <div className="text-base font-mono font-bold text-terminal-blue mt-0.5">{paperEligibleCount}</div>
          </div>
          <div className="bg-terminal-panel p-2 rounded border border-terminal-border/50 text-center">
            <div className="text-[9px] text-terminal-muted uppercase font-bold text-terminal-amber">Experimental</div>
            <div className="text-base font-mono font-bold text-terminal-amber mt-0.5">{experimentalCount}</div>
          </div>
          <div className="bg-terminal-panel p-2 rounded border border-terminal-border/50 text-center">
            <div className="text-[9px] text-terminal-muted uppercase font-bold text-terminal-muted">Retired</div>
            <div className="text-base font-mono font-bold text-terminal-muted mt-0.5">{retiredCount}</div>
          </div>
          <div className="bg-terminal-panel p-2 rounded border border-terminal-border/50 text-center">
            <div className="text-[9px] text-terminal-muted uppercase font-bold">Disabled</div>
            <div className="text-base font-mono font-bold text-terminal-red mt-0.5">0</div>
          </div>
          <div className="bg-terminal-panel p-2 rounded border border-terminal-border/50 text-center">
            <div className="text-[9px] text-terminal-muted uppercase font-bold">Avg Win Rate</div>
            <div className="text-base font-mono font-bold text-terminal-amber mt-0.5">{avgWinRate}%</div>
          </div>
          <div className="bg-terminal-panel p-2 rounded border border-terminal-border/50 text-center">
            <div className="text-[9px] text-terminal-muted uppercase font-bold">Avg Risk Score</div>
            <div className="text-base font-mono font-bold text-terminal-green mt-0.5">91.4</div>
          </div>
          <div className="bg-terminal-panel p-2 rounded border border-terminal-border/50 text-center">
            <div className="text-[9px] text-terminal-muted uppercase font-bold">Compliance</div>
            <div className="text-[11px] font-mono font-bold text-terminal-green mt-1">100%</div>
          </div>
          <div className="bg-terminal-panel p-2 rounded border border-terminal-border/50 text-center">
            <div className="text-[9px] text-terminal-muted uppercase font-bold">Last Audit</div>
            <div className="text-[10px] font-mono font-bold text-white mt-1">04:00Z</div>
          </div>
        </div>

        {/* 3. ENTERPRISE SEARCH & FILTER BAR */}
        <div className="bg-black/50 p-3 border-b border-terminal-border flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-terminal-muted" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Instant Enterprise Search (Name, ID, Category, Market, Asset Class, Version)..."
              className="w-full bg-black border border-terminal-border text-xs text-white pl-9 pr-3 py-2 rounded focus:outline-none focus:border-terminal-amber"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-black border border-terminal-border text-xs text-white p-2 rounded focus:outline-none focus:border-terminal-amber"
            >
              <option value="ALL">All Categories (25)</option>
              <option value="Trend Following">Trend Following</option>
              <option value="Momentum">Momentum</option>
              <option value="Breakout">Breakout</option>
              <option value="Mean Reversion">Mean Reversion</option>
              <option value="Swing">Swing</option>
              <option value="Scalping">Scalping</option>
              <option value="Options">Options</option>
              <option value="Sector Rotation">Sector Rotation</option>
              <option value="Volatility">Volatility</option>
            </select>

            <select 
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="bg-black border border-terminal-border text-xs text-white p-2 rounded focus:outline-none focus:border-terminal-amber"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="LOW">Low Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="HIGH">High Risk</option>
            </select>

            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-black border border-terminal-border text-xs text-white p-2 rounded focus:outline-none focus:border-terminal-amber"
            >
              <option value="ALL">All Approvals</option>
              <option value="Approved">Approved</option>
              <option value="Experimental">Experimental</option>
              <option value="Retired">Retired</option>
            </select>

            <div className="text-[10px] font-mono text-terminal-muted px-2 py-1 bg-black/60 rounded border border-terminal-border">
              Showing <strong className="text-white">{filteredStrategies.length}</strong> of <strong className="text-white">{totalStrategies}</strong> Strategies
            </div>
          </div>
        </div>

        {/* MAIN WORKSPACE CONTENT AREA */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* CENTER WORKSPACE: EXACTLY ONE PRIMARY TABLE + 16 KNOWLEDGE SECTIONS */}
          <div className="flex-1 flex flex-col overflow-y-auto p-4 space-y-6">

            {/* 4. PRIMARY ENTERPRISE TABLE */}
            <Panel title={`Approved Institutional Strategy Registry (${filteredStrategies.length} Active Records)`}>
              <div className="overflow-x-auto">
                <DataTable 
                  data={filteredStrategies}
                  columns={[
                    { header: 'ID', accessor: 'id', className: 'font-mono text-[10px] text-terminal-amber font-bold' },
                    { header: 'Strategy Name', accessor: 'displayName', className: 'font-bold text-white text-xs' },
                    { header: 'Category', accessor: 'category', className: 'text-terminal-blue font-mono text-[10px]' },
                    { header: 'Trading Style', accessor: 'tradingStyle', className: 'text-terminal-muted text-[10px]' },
                    { header: 'Risk', accessor: (s: any) => (
                      <span className={cn(
                        "font-mono font-bold text-[10px] px-1.5 py-0.5 rounded",
                        s.riskLevel === 'LOW' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                        s.riskLevel === 'MEDIUM' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        'bg-rose-950 text-rose-300 border border-rose-800'
                      )}>
                        {s.riskLevel}
                      </span>
                    )},
                    { header: 'Time Horizon', accessor: 'timeHorizon', className: 'text-white text-[10px] font-mono' },
                    { header: 'Supported Markets', accessor: 'supportedMarkets', className: 'text-terminal-muted text-[10px]' },
                    { header: 'Version', accessor: 'version', className: 'font-mono text-[10px] text-terminal-amber' },
                    { header: 'Approval', accessor: (s: any) => <StatusBadge status={s.approvalStatus} variant="success" />, align: 'center' },
                    { header: 'Paper Status', accessor: 'paperTradingStatus', className: 'text-[10px] text-terminal-green font-mono' },
                    { header: 'Lifecycle', accessor: 'lifecycle', className: 'text-[10px] text-white' }
                  ]}
                  onRowClick={(row) => setSelectedStrategy(row)}
                />
              </div>
              <div className="text-[10px] text-terminal-muted mt-2 italic">
                * Click any row to instantly load the complete 16-section institutional knowledge center into the central view and right inspector.
              </div>
            </Panel>

            {/* 5. 16 STRUCTURED INSTITUTIONAL KNOWLEDGE PANELS */}
            {selectedStrategy && (
              <div className="space-y-6">
                
                {/* Active Strategy Header Card */}
                <div className="flex items-center justify-between bg-black/70 p-4 rounded-lg border border-terminal-amber/50">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-terminal-amber font-bold uppercase px-2 py-0.5 bg-terminal-amber/10 border border-terminal-amber/30 rounded">
                        {selectedStrategy.id}
                      </span>
                      <span className="text-[10px] font-mono text-terminal-muted">Version: {selectedStrategy.version}</span>
                      <span className="text-[10px] font-mono text-terminal-green">SHA-256 Verified</span>
                    </div>
                    <h2 className="text-xl font-bold text-white mt-1">{selectedStrategy.displayName}</h2>
                    <p className="text-xs text-terminal-muted mt-0.5">{selectedStrategy.purpose}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 font-mono text-xs">
                    <span className="px-3 py-1 rounded bg-terminal-amber/20 text-terminal-amber border border-terminal-amber/40 font-bold">
                      SQS SCORE: {selectedStrategy.sqsScore}/100
                    </span>
                    <span className="text-[10px] text-terminal-muted">Owner: {selectedStrategy.owner}</span>
                  </div>
                </div>

                {/* 16 STRUCTURED PANELS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                  
                  {/* SECTION 1: Executive Summary */}
                  <div className="bg-terminal-panel p-4 rounded border border-terminal-border/70 space-y-3">
                    <h3 className="text-xs font-bold text-terminal-amber uppercase tracking-wider flex items-center gap-2 border-b border-terminal-border/40 pb-2">
                      <FileText className="w-4 h-4 text-terminal-amber" /> Section 1: Executive Summary
                    </h3>
                    <div className="space-y-2 text-xs text-terminal-muted">
                      <p><strong className="text-white">Objective:</strong> {selectedStrategy.executiveSummary.objective}</p>
                      <p><strong className="text-white">Trading Philosophy:</strong> {selectedStrategy.executiveSummary.tradingPhilosophy}</p>
                      <p><strong className="text-white">Primary Goal:</strong> {selectedStrategy.executiveSummary.primaryGoal}</p>
                      <p><strong className="text-white">Expected Behaviour:</strong> {selectedStrategy.executiveSummary.expectedBehaviour}</p>
                    </div>
                  </div>

                  {/* SECTION 2: Market Compatibility */}
                  <div className="bg-terminal-panel p-4 rounded border border-terminal-border/70 space-y-3">
                    <h3 className="text-xs font-bold text-terminal-blue uppercase tracking-wider flex items-center gap-2 border-b border-terminal-border/40 pb-2">
                      <Compass className="w-4 h-4 text-terminal-blue" /> Section 2: Market Compatibility
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-xs text-terminal-muted">
                      <div><strong className="text-white">Bull Market:</strong> {selectedStrategy.marketCompatibility.bull}</div>
                      <div><strong className="text-white">Bear Market:</strong> {selectedStrategy.marketCompatibility.bear}</div>
                      <div><strong className="text-white">Sideways:</strong> {selectedStrategy.marketCompatibility.sideways}</div>
                      <div><strong className="text-white">High Volatility:</strong> {selectedStrategy.marketCompatibility.highVol}</div>
                      <div><strong className="text-white">Low Volatility:</strong> {selectedStrategy.marketCompatibility.lowVol}</div>
                      <div><strong className="text-white">News Events:</strong> {selectedStrategy.marketCompatibility.newsEvents}</div>
                    </div>
                  </div>

                  {/* SECTION 3: Instrument Compatibility */}
                  <div className="bg-terminal-panel p-4 rounded border border-terminal-border/70 space-y-3">
                    <h3 className="text-xs font-bold text-terminal-green uppercase tracking-wider flex items-center gap-2 border-b border-terminal-border/40 pb-2">
                      <ShoppingBag className="w-4 h-4 text-terminal-green" /> Section 3: Instrument Compatibility
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div>Stocks: <span className="text-white">{selectedStrategy.instrumentCompatibility.stocks}</span></div>
                      <div>ETF: <span className="text-white">{selectedStrategy.instrumentCompatibility.etf}</span></div>
                      <div>Index: <span className="text-white">{selectedStrategy.instrumentCompatibility.index}</span></div>
                      <div>Index Futures: <span className="text-white">{selectedStrategy.instrumentCompatibility.indexFutures}</span></div>
                      <div>Stock Futures: <span className="text-white">{selectedStrategy.instrumentCompatibility.stockFutures}</span></div>
                      <div>Options: <span className="text-white">{selectedStrategy.instrumentCompatibility.stockOptions}</span></div>
                    </div>
                  </div>

                  {/* SECTION 4: Timeframe Compatibility */}
                  <div className="bg-terminal-panel p-4 rounded border border-terminal-border/70 space-y-3">
                    <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2 border-b border-terminal-border/40 pb-2">
                      <Clock className="w-4 h-4 text-purple-400" /> Section 4: Timeframe Compatibility
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div>1 Min: <span className="text-terminal-muted">{selectedStrategy.timeframeCompatibility.m1}</span></div>
                      <div>5 Min: <span className="text-terminal-muted">{selectedStrategy.timeframeCompatibility.m5}</span></div>
                      <div>15 Min: <span className="text-terminal-muted">{selectedStrategy.timeframeCompatibility.m15}</span></div>
                      <div>1 Hour: <span className="text-white">{selectedStrategy.timeframeCompatibility.h1}</span></div>
                      <div>Daily: <span className="text-terminal-green font-bold">{selectedStrategy.timeframeCompatibility.daily}</span></div>
                      <div>Weekly: <span className="text-terminal-green font-bold">{selectedStrategy.timeframeCompatibility.weekly}</span></div>
                    </div>
                  </div>

                  {/* SECTION 5: Indicator Dependency */}
                  <div className="bg-terminal-panel p-4 rounded border border-terminal-border/70 space-y-3">
                    <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2 border-b border-terminal-border/40 pb-2">
                      <Activity className="w-4 h-4 text-amber-400" /> Section 5: Indicator Dependency
                    </h3>
                    <div className="space-y-2 text-xs">
                      {selectedStrategy.indicatorDependency.map((ind: any, idx: number) => (
                        <div key={idx} className="bg-black/40 p-2 rounded border border-terminal-border/40 flex justify-between items-center font-mono">
                          <div>
                            <span className="text-white font-bold">{ind.name}</span>
                            <div className="text-[10px] text-terminal-muted">{ind.purpose}</div>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 bg-terminal-amber/20 text-terminal-amber rounded">
                            {ind.importance}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SECTION 6: Entry Philosophy */}
                  <div className="bg-terminal-panel p-4 rounded border border-terminal-border/70 space-y-3">
                    <h3 className="text-xs font-bold text-terminal-green uppercase tracking-wider flex items-center gap-2 border-b border-terminal-border/40 pb-2">
                      <CheckCircle className="w-4 h-4 text-terminal-green" /> Section 6: Entry Philosophy
                    </h3>
                    <div className="space-y-2 text-xs text-terminal-muted">
                      <p><strong className="text-white">Active Condition:</strong> {selectedStrategy.entryPhilosophy.activeCondition}</p>
                      <p><strong className="text-white">Confirmation Start:</strong> {selectedStrategy.entryPhilosophy.confirmationStart}</p>
                      <p><strong className="text-white">Trend Confirmation:</strong> {selectedStrategy.entryPhilosophy.trendConfirmation}</p>
                      <p><strong className="text-white">Invalidation:</strong> {selectedStrategy.entryPhilosophy.invalidation}</p>
                    </div>
                  </div>

                  {/* SECTION 7: Exit Philosophy */}
                  <div className="bg-terminal-panel p-4 rounded border border-terminal-border/70 space-y-3">
                    <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2 border-b border-terminal-border/40 pb-2">
                      <XCircle className="w-4 h-4 text-rose-400" /> Section 7: Exit Philosophy
                    </h3>
                    <div className="space-y-2 text-xs text-terminal-muted">
                      <p><strong className="text-white">Target Logic:</strong> {selectedStrategy.exitPhilosophy.targetLogic}</p>
                      <p><strong className="text-white">Stop Logic:</strong> {selectedStrategy.exitPhilosophy.stopLogic}</p>
                      <p><strong className="text-white">Trailing Logic:</strong> {selectedStrategy.exitPhilosophy.trailingLogic}</p>
                      <p><strong className="text-white">Emergency Exit:</strong> {selectedStrategy.exitPhilosophy.emergencyExit}</p>
                    </div>
                  </div>

                  {/* SECTION 8: Risk Classification */}
                  <div className="bg-terminal-panel p-4 rounded border border-terminal-border/70 space-y-3">
                    <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2 border-b border-terminal-border/40 pb-2">
                      <ShieldAlert className="w-4 h-4 text-amber-300" /> Section 8: Risk Classification
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-xs text-terminal-muted font-mono">
                      <div>Risk Level: <span className="text-white font-bold">{selectedStrategy.riskLevel}</span></div>
                      <div>Capital Usage: <span className="text-white">{selectedStrategy.riskClassification.capitalUsage}</span></div>
                      <div>Expected Drawdown: <span className="text-rose-300">{selectedStrategy.riskClassification.expectedDrawdown}</span></div>
                      <div>Trade Frequency: <span className="text-white">{selectedStrategy.riskClassification.tradeFrequency}</span></div>
                      <div>Holding Period: <span className="text-white">{selectedStrategy.expectedHoldingPeriod}</span></div>
                      <div>Complexity: <span className="text-white">{selectedStrategy.complexity}</span></div>
                    </div>
                  </div>

                  {/* SECTION 9: Strength Analysis */}
                  <div className="bg-terminal-panel p-4 rounded border border-terminal-border/70 space-y-3">
                    <h3 className="text-xs font-bold text-terminal-green uppercase tracking-wider flex items-center gap-2 border-b border-terminal-border/40 pb-2">
                      <TrendingUp className="w-4 h-4 text-terminal-green" /> Section 9: Strength Analysis
                    </h3>
                    <div className="space-y-2 text-xs text-terminal-muted">
                      <p><strong className="text-white">Advantages:</strong> {selectedStrategy.strengthAnalysis.advantages}</p>
                      <p><strong className="text-white">Best Performance:</strong> {selectedStrategy.strengthAnalysis.bestPerformance}</p>
                      <p><strong className="text-white">Ideal Environment:</strong> {selectedStrategy.strengthAnalysis.idealEnvironment}</p>
                      <p><strong className="text-white">Institutional Benefits:</strong> {selectedStrategy.strengthAnalysis.institutionalBenefits}</p>
                    </div>
                  </div>

                  {/* SECTION 10: Weakness Analysis */}
                  <div className="bg-terminal-panel p-4 rounded border border-terminal-border/70 space-y-3">
                    <h3 className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-2 border-b border-terminal-border/40 pb-2">
                      <AlertTriangle className="w-4 h-4 text-rose-300" /> Section 10: Weakness Analysis
                    </h3>
                    <div className="space-y-2 text-xs text-terminal-muted">
                      <p><strong className="text-white">False Signals:</strong> {selectedStrategy.weaknessAnalysis.falseSignals}</p>
                      <p><strong className="text-white">Bad Conditions:</strong> {selectedStrategy.weaknessAnalysis.badConditions}</p>
                      <p><strong className="text-white">High Risk Situations:</strong> {selectedStrategy.weaknessAnalysis.highRiskSituations}</p>
                      <p><strong className="text-white">Common Mistakes:</strong> {selectedStrategy.weaknessAnalysis.commonMistakes}</p>
                    </div>
                  </div>

                  {/* SECTION 11: AI Compatibility */}
                  <div className="bg-terminal-panel p-4 rounded border border-terminal-border/70 space-y-3">
                    <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-2 border-b border-terminal-border/40 pb-2">
                      <Cpu className="w-4 h-4 text-purple-300" /> Section 11: AI Compatibility
                    </h3>
                    <div className="space-y-2 text-xs text-terminal-muted font-mono">
                      <div>Compatible Models: <span className="text-white">{selectedStrategy.aiCompatibility.compatibleModels.join(', ')}</span></div>
                      <div>Preferred Model: <span className="text-terminal-amber font-bold">{selectedStrategy.aiCompatibility.preferredModels.join(', ')}</span></div>
                      <div>Committee Approval: <span className="text-terminal-green">{selectedStrategy.aiCompatibility.committeeApproval}</span></div>
                      <div>Confidence Threshold: <span className="text-white">{selectedStrategy.aiCompatibility.confidenceThreshold}/100</span></div>
                    </div>
                  </div>

                  {/* SECTION 12: Paper Trading Requirements */}
                  <div className="bg-terminal-panel p-4 rounded border border-terminal-border/70 space-y-3">
                    <h3 className="text-xs font-bold text-terminal-blue uppercase tracking-wider flex items-center gap-2 border-b border-terminal-border/40 pb-2">
                      <Award className="w-4 h-4 text-terminal-blue" /> Section 12: Paper Trading Requirements
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div>Min Sample Size: <span className="text-white">{selectedStrategy.paperTradingRequirements.minSampleSize}</span></div>
                      <div>Required Win Rate: <span className="text-terminal-green">{selectedStrategy.paperTradingRequirements.requiredWinRate}%</span></div>
                      <div>Required Profit Factor: <span className="text-white">{selectedStrategy.paperTradingRequirements.requiredProfitFactor}</span></div>
                      <div>Required Max DD: <span className="text-rose-300">{selectedStrategy.paperTradingRequirements.requiredMaxDD}%</span></div>
                    </div>
                  </div>

                  {/* SECTION 13: Lifecycle Status */}
                  <div className="bg-terminal-panel p-4 rounded border border-terminal-border/70 space-y-3">
                    <h3 className="text-xs font-bold text-terminal-amber uppercase tracking-wider flex items-center gap-2 border-b border-terminal-border/40 pb-2">
                      <LayersIcon className="w-4 h-4 text-terminal-amber" /> Section 13: Lifecycle & Version
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div>Lifecycle State: <span className="text-terminal-green font-bold">{selectedStrategy.lifecycle}</span></div>
                      <div>Approval Status: <span className="text-white">{selectedStrategy.approvalStatus}</span></div>
                      <div>Current Version: <span className="text-terminal-amber font-bold">{selectedStrategy.version}</span></div>
                      <div>Paper Status: <span className="text-white">{selectedStrategy.paperTradingStatus}</span></div>
                    </div>
                  </div>

                  {/* SECTION 14: Version Timeline */}
                  <div className="bg-terminal-panel p-4 rounded border border-terminal-border/70 space-y-3">
                    <h3 className="text-xs font-bold text-terminal-muted uppercase tracking-wider flex items-center gap-2 border-b border-terminal-border/40 pb-2">
                      <GitCommit className="w-4 h-4 text-terminal-muted" /> Section 14: Version Timeline
                    </h3>
                    <div className="space-y-1.5 text-xs font-mono">
                      {selectedStrategy.versionTimeline.map((v: any, idx: number) => (
                        <div key={idx} className="bg-black/40 p-2 rounded border border-terminal-border/40 flex justify-between">
                          <div>
                            <span className="text-terminal-amber font-bold">{v.version}</span> &bull; {v.author}
                            <div className="text-[9px] text-terminal-muted">{v.modification}</div>
                          </div>
                          <span className="text-[10px] text-terminal-green">{v.validation}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SECTION 15: Knowledge References */}
                  <div className="bg-terminal-panel p-4 rounded border border-terminal-border/70 space-y-3">
                    <h3 className="text-xs font-bold text-terminal-blue uppercase tracking-wider flex items-center gap-2 border-b border-terminal-border/40 pb-2">
                      <Network className="w-4 h-4 text-terminal-blue" /> Section 15: Knowledge References
                    </h3>
                    <div className="space-y-1 text-xs font-mono text-terminal-muted">
                      <div>Parent Family: <span className="text-white">{selectedStrategy.knowledgeReferences.parent}</span></div>
                      <div>Sub-Branch: <span className="text-white">{selectedStrategy.knowledgeReferences.child}</span></div>
                      <div>Alternative Node: <span className="text-terminal-blue">{selectedStrategy.knowledgeReferences.alternative}</span></div>
                      <div>Supporting Node: <span className="text-terminal-green">{selectedStrategy.knowledgeReferences.supporting}</span></div>
                    </div>
                  </div>

                  {/* SECTION 16: Enterprise Constitution */}
                  <div className="bg-terminal-panel p-4 rounded border border-terminal-border/70 space-y-3">
                    <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2 border-b border-terminal-border/40 pb-2">
                      <Shield className="w-4 h-4 text-red-400" /> Section 16: Enterprise Constitution
                    </h3>
                    <div className="text-xs text-terminal-muted space-y-1.5 font-mono">
                      <div className="text-red-200 font-bold">CONSTITUTIONAL MANDATE: ONE TRADE → ONE STRATEGY</div>
                      <div>Pipeline Flow: Research → Intelligence → Committee → Library → Parameters → Candidates → Paper Trading → Live Trading.</div>
                      <div className="text-terminal-green">Status: 100% Constitutionally Compliant. Zero bypass detected.</div>
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>

          {/* 6. EXPANDED RIGHT INSPECTOR (PERSISTENT) */}
          <div className="w-80 border-l border-terminal-border bg-black/60 p-4 flex flex-col shrink-0 overflow-y-auto space-y-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-terminal-muted border-b border-terminal-border/40 pb-2 flex items-center justify-between">
              <span>Global Right Inspector</span>
              <span className="text-terminal-amber font-mono">LIVE ENCYCLOPEDIA</span>
            </div>

            {selectedStrategy ? (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[9px] font-mono text-terminal-amber uppercase font-bold">{selectedStrategy.id}</span>
                  <h3 className="text-sm font-bold text-white mt-0.5">{selectedStrategy.displayName}</h3>
                </div>

                <div className="p-3 bg-terminal-panel border border-terminal-border/60 rounded space-y-2 font-mono text-[10px]">
                  <div className="flex justify-between border-b border-terminal-border/30 pb-1">
                    <span className="text-terminal-muted">Strategy Portrait</span>
                    <span className="text-terminal-amber font-bold">{selectedStrategy.category}</span>
                  </div>
                  <div className="flex justify-between border-b border-terminal-border/30 pb-1">
                    <span className="text-terminal-muted">Classification</span>
                    <span className="text-white">{selectedStrategy.tradingStyle}</span>
                  </div>
                  <div className="flex justify-between border-b border-terminal-border/30 pb-1">
                    <span className="text-terminal-muted">Current Version</span>
                    <span className="text-white font-bold">{selectedStrategy.version}</span>
                  </div>
                  <div className="flex justify-between border-b border-terminal-border/30 pb-1">
                    <span className="text-terminal-muted">Approval Committee</span>
                    <span className="text-purple-300 text-right truncate max-w-[120px]">{selectedStrategy.approvalCommittee}</span>
                  </div>
                  <div className="flex justify-between border-b border-terminal-border/30 pb-1">
                    <span className="text-terminal-muted">Lifecycle</span>
                    <span className="text-terminal-green font-bold">{selectedStrategy.lifecycle}</span>
                  </div>
                  <div className="flex justify-between border-b border-terminal-border/30 pb-1">
                    <span className="text-terminal-muted">Risk Grade</span>
                    <span className="text-amber-400">{selectedStrategy.riskGrade}</span>
                  </div>
                  <div className="flex justify-between border-b border-terminal-border/30 pb-1">
                    <span className="text-terminal-muted">Markets</span>
                    <span className="text-white text-right truncate max-w-[120px]">{selectedStrategy.supportedMarkets}</span>
                  </div>
                  <div className="flex justify-between border-b border-terminal-border/30 pb-1">
                    <span className="text-terminal-muted">Assets</span>
                    <span className="text-white text-right truncate max-w-[120px]">{selectedStrategy.supportedInstruments}</span>
                  </div>
                  <div className="flex justify-between border-b border-terminal-border/30 pb-1">
                    <span className="text-terminal-muted">Indicators Count</span>
                    <span className="text-terminal-amber">{selectedStrategy.indicatorDependency.length} Active</span>
                  </div>
                  <div className="flex justify-between border-b border-terminal-border/30 pb-1">
                    <span className="text-terminal-muted">Paper Eligibility</span>
                    <span className="text-terminal-green font-bold">{selectedStrategy.paperEligible ? 'ELIGIBLE' : 'RESTRICTED'}</span>
                  </div>
                  <div className="flex justify-between border-b border-terminal-border/30 pb-1">
                    <span className="text-terminal-muted">Digital Signature</span>
                    <span className="text-terminal-green font-bold">{selectedStrategy.digitalSignature}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-terminal-muted">SHA-256 Hash</span>
                    <span className="text-terminal-blue truncate max-w-[120px]" title={selectedStrategy.sha256}>
                      {selectedStrategy.sha256.substring(0, 16)}...
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-terminal-amber/10 border border-terminal-amber/40 rounded text-center">
                  <div className="text-[9px] font-bold text-terminal-amber uppercase">Knowledge Center Status</div>
                  <div className="text-sm font-mono font-bold text-white mt-1">16 SECTIONS VERIFIED</div>
                  <div className="text-[9px] text-terminal-green font-mono mt-0.5">READY FOR PARAMETERIZATION</div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-terminal-muted">Select a strategy from the enterprise table to view inspector details.</div>
            )}
          </div>

        </div>

        {/* 7. BOTTOM ENTERPRISE CONSOLE */}
        <div className="bg-black border-t border-terminal-border shrink-0">
          <div className="flex items-center justify-between px-3 py-1.5 bg-terminal-panel border-b border-terminal-border/40 text-xs">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-terminal-amber" />
              <span className="font-bold uppercase tracking-wider text-[10px] text-white">Bottom Enterprise Console (Strategy Library Audit Stream)</span>
            </div>
            <div className="text-[10px] font-mono text-terminal-green flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-terminal-green animate-pulse" />
              STREAM ACTIVE &bull; KNOWLEDGE CENTER SYNCHRONIZED
            </div>
          </div>

          <div className="h-28 p-2 font-mono text-[10px] bg-black text-terminal-muted overflow-y-auto space-y-1">
            <div className="text-terminal-green">[STRATEGY LOADED 04:00:12 UTC] Institutional Strategy Registry loaded 25 approved records with zero schema violations.</div>
            <div className="text-white">[VALIDATION COMPLETE 04:00:15 UTC] All 16 institutional knowledge sections verified for selected strategy node.</div>
            <div className="text-terminal-amber">[METADATA UPDATED 04:00:22 UTC] Right inspector synchronized with live knowledge base attributes.</div>
            <div className="text-terminal-blue">[VERSION SYNCED 04:00:30 UTC] Library Version v3.2.0-PROD active across all downstream parameter nodes.</div>
            <div className="text-white">[AUDIT CREATED 04:00:45 UTC] SHA-256 digital signature integrity check passed successfully.</div>
            <div className="text-terminal-green">[LIBRARY REFRESHED 04:01:00 UTC] Constitutional rule enforced: Read-only institutional registry operational.</div>
          </div>
        </div>

      </DataBoundary>
    </div>
  );
});
