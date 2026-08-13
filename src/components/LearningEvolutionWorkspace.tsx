import React, { useState, useEffect } from 'react';
import { 
  Dna, 
  Brain, 
  ShieldCheck, 
  TrendingUp, 
  Activity, 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCcw, 
  FileText, 
  Layers, 
  Trophy, 
  Zap, 
  BookOpen, 
  Database, 
  Sparkles, 
  ArrowRight, 
  Network, 
  Filter, 
  Sliders, 
  Info,
  ChevronRight,
  Terminal,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LearningMemoryEvolutionEngine, 
  PostTradeAnalysisRecord, 
  MemoryItem, 
  KnowledgeItem, 
  PatternDiscoveryRecord, 
  SelfImprovementRecommendation, 
  ModelEvolutionLineage,
  LMEOSLog
} from '../modules/ai/services/LearningMemoryEvolutionEngine';
import { AIMemoryWorkspace } from './AIMemoryWorkspace';

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

interface LearningEvolutionWorkspaceProps {
  initialTab?: 'DASHBOARD' | 'POST_TRADE' | 'MEMORY' | 'KNOWLEDGE' | 'PATTERNS' | 'IMPROVEMENT' | 'EVOLUTION' | 'GRAPH';
}

export const LearningEvolutionWorkspace: React.FC<LearningEvolutionWorkspaceProps> = ({ initialTab = 'DASHBOARD' }) => {
  const engine = LearningMemoryEvolutionEngine.getInstance();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [postTradeFilter, setPostTradeFilter] = useState<'ALL' | 'WINNING' | 'LOSING' | 'MISSED' | 'REJECTED' | 'CANCELLED' | 'RISK_EVENT'>('ALL');
  const [memoryFilter, setMemoryFilter] = useState<'ALL' | 'WORKING' | 'SHORT' | 'LONG' | 'PATTERN' | 'DECISION' | 'EXECUTION' | 'RISK'>('ALL');
  const [knowledgeFilter, setKnowledgeFilter] = useState<'ALL' | 'TRADE' | 'PATTERN' | 'RISK' | 'MARKET' | 'STRATEGY' | 'EXECUTION' | 'FINANCIAL'>('ALL');
  const [logFilter, setLogFilter] = useState<'ALL' | 'LEARNING' | 'MEMORY' | 'KNOWLEDGE' | 'EVOLUTION'>('ALL');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrade, setSelectedTrade] = useState<PostTradeAnalysisRecord | null>(null);

  const [isConsoleExpanded, setIsConsoleExpanded] = useState(true);

  // Re-fetch data on state updates
  const lqs = engine.calculateLQS();
  const evqs = engine.calculateEVQS();
  const metrics = engine.getDashboardMetrics();

  const postTrades = engine.getPostTradeAnalyses(postTradeFilter);
  const memories = engine.getMemories(memoryFilter);
  const knowledge = engine.getKnowledge(knowledgeFilter);
  const patterns = engine.getPatterns();
  const recommendations = engine.getRecommendations();
  const evolution = engine.getEvolutionLineages();
  const knowledgeGraph = engine.getKnowledgeGraph();
  const logs = engine.getLogs(logFilter);

  // Set default selected trade for Right Inspector
  useEffect(() => {
    if (postTrades.length > 0 && !selectedTrade) {
      setSelectedTrade(postTrades[0]);
    }
  }, [postTrades]);

  const searchResults = searchQuery.trim() ? engine.searchMemory(searchQuery) : null;

  return (
    <div className="flex flex-col h-full bg-[#0a0d14] text-white font-mono text-xs overflow-hidden select-none relative">
      
      {/* 1. TOP PIPELINE WORKFLOW BANNER */}
      <div className="bg-[#0f1422] border-b border-terminal-border/80 px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Dna className="w-5 h-5 text-terminal-amber animate-pulse" />
            <span className="font-bold text-xs uppercase tracking-wider text-terminal-amber font-mono">
              LMEOS v3.2 ● Learning Memory Evolution Operating System
            </span>
          </div>
          <span className="text-[10px] text-terminal-muted border-l border-terminal-border pl-3 hidden lg:inline">
            Execution Intelligence Pipeline
          </span>
        </div>

        {/* AUTHORITATIVE PIPELINE STEPS */}
        <div className="hidden xl:flex items-center gap-1 text-[10px] font-mono">
          {[
            { label: 'Execution', icon: Zap, color: 'text-terminal-blue' },
            { label: 'Trade Journal', icon: FileText, color: 'text-terminal-muted' },
            { label: 'Learning Engine', icon: Dna, color: 'text-terminal-green font-bold' },
            { label: 'Memory Engine', icon: Database, color: 'text-purple-400 font-bold' },
            { label: 'Knowledge Engine', icon: BookOpen, color: 'text-terminal-amber font-bold' },
            { label: 'Evolution Engine', icon: Sparkles, color: 'text-cyan-400 font-bold' },
            { label: 'AI Models', icon: Brain, color: 'text-terminal-green font-bold' }
          ].map((step, idx, arr) => (
            <React.Fragment key={idx}>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-black/40 border border-terminal-border/60 rounded">
                <step.icon className={cn("w-3 h-3", step.color)} />
                <span className={step.color}>{step.label}</span>
              </div>
              {idx < arr.length - 1 && <ChevronRight className="w-3 h-3 text-terminal-muted/60" />}
            </React.Fragment>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-terminal-amber/20 border border-terminal-amber text-terminal-amber text-[10px] font-bold">
            IMMUTABLE RECORDS: ACTIVE
          </span>
        </div>
      </div>

      {/* 2. TOP SCORES & METRICS SUMMARY STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 p-3 bg-black/40 border-b border-terminal-border/60 shrink-0">
        
        {/* LQS CARD */}
        <div className="p-2.5 bg-[#0e1320] border border-terminal-green/40 rounded flex flex-col justify-between">
          <div className="flex justify-between items-center text-[10px] text-terminal-muted">
            <span className="uppercase font-bold">LQS Score</span>
            <span className="text-terminal-green text-[9px]">{lqs.status}</span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold font-mono text-terminal-green">{lqs.lqsScore} / 100</span>
            <Dna className="w-4 h-4 text-terminal-green" />
          </div>
          <div className="text-[9px] text-terminal-muted mt-1">
            Learning Quality Score
          </div>
        </div>

        {/* EVQS CARD */}
        <div className="p-2.5 bg-[#0e1320] border border-terminal-amber/40 rounded flex flex-col justify-between">
          <div className="flex justify-between items-center text-[10px] text-terminal-muted">
            <span className="uppercase font-bold">EVQS Score</span>
            <span className="text-terminal-amber text-[9px]">{evqs.status}</span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold font-mono text-terminal-amber">{evqs.evqsScore} / 100</span>
            <Sparkles className="w-4 h-4 text-terminal-amber" />
          </div>
          <div className="text-[9px] text-terminal-muted mt-1">
            Evolution Quality Score
          </div>
        </div>

        {/* LEARNING QUEUE */}
        <div className="p-2.5 bg-[#0e1320] border border-terminal-border rounded flex flex-col justify-between">
          <div className="text-[10px] text-terminal-muted uppercase font-bold">Learning Queue</div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold font-mono text-terminal-blue">{metrics.learningQueue} Tasks</span>
            <Activity className="w-4 h-4 text-terminal-blue" />
          </div>
          <div className="text-[9px] text-terminal-muted mt-1">
            Completed: <strong className="text-terminal-green">{metrics.completedLearning}</strong>
          </div>
        </div>

        {/* KNOWLEDGE GROWTH */}
        <div className="p-2.5 bg-[#0e1320] border border-terminal-border rounded flex flex-col justify-between">
          <div className="text-[10px] text-terminal-muted uppercase font-bold">Knowledge Growth</div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold font-mono text-terminal-green">{metrics.knowledgeGrowthPct}</span>
            <BookOpen className="w-4 h-4 text-terminal-green" />
          </div>
          <div className="text-[9px] text-terminal-muted mt-1">
            Verified: 100% Immutable
          </div>
        </div>

        {/* MEMORY USAGE */}
        <div className="p-2.5 bg-[#0e1320] border border-terminal-border rounded flex flex-col justify-between">
          <div className="text-[10px] text-terminal-muted uppercase font-bold">Memory Capacity</div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-lg font-bold font-mono text-purple-400">{metrics.memoryUsageMb}</span>
            <Database className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-[9px] text-terminal-muted mt-1">
            7 Tier Memory Active
          </div>
        </div>

        {/* ACTIVE MUTATIONS */}
        <div className="p-2.5 bg-[#0e1320] border border-terminal-border rounded flex flex-col justify-between">
          <div className="text-[10px] text-terminal-muted uppercase font-bold">Active Mutations</div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold font-mono text-cyan-400">{metrics.activeMutations} Gen</span>
            <Dna className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-[9px] text-terminal-muted mt-1">
            Gen 14 Active
          </div>
        </div>

        {/* MODEL LINEAGE */}
        <div className="p-2.5 bg-[#0e1320] border border-terminal-border rounded flex flex-col justify-between">
          <div className="text-[10px] text-terminal-muted uppercase font-bold">AI Model Roster</div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold font-mono text-white">{metrics.championsCount} Champ / {metrics.challengersCount} Paper</span>
            <Trophy className="w-4 h-4 text-terminal-amber" />
          </div>
          <div className="text-[9px] text-terminal-muted mt-1">
            Quarantined: {metrics.retiredCount}
          </div>
        </div>

      </div>

      {/* 3. NAVIGATION MODULE BAR & GLOBAL MEMORY SEARCH */}
      <div className="px-4 py-2 bg-[#0c101a] border-b border-terminal-border/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
        
        {/* TABS */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {[
            { id: 'DASHBOARD', label: 'LMEOS Dashboard', icon: Dna },
            { id: 'POST_TRADE', label: 'Post-Trade Learning', icon: FileText },
            { id: 'MEMORY', label: '7-Tier Memory', icon: Database },
            { id: 'KNOWLEDGE', label: '7-Domain Knowledge', icon: BookOpen },
            { id: 'PATTERNS', label: 'Pattern Discovery', icon: Network },
            { id: 'IMPROVEMENT', label: 'Self-Improvement', icon: TrendingUp },
            { id: 'EVOLUTION', label: 'Model Evolution', icon: Sparkles },
            { id: 'GRAPH', label: 'Knowledge Graph', icon: Layers }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all",
                activeTab === tab.id
                  ? "bg-terminal-amber text-black border border-terminal-amber font-bold shadow-md"
                  : "bg-black/40 text-terminal-muted border border-terminal-border/60 hover:text-white hover:bg-white/5"
              )}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* AI MEMORY SEARCH INPUT */}
        <div className="relative w-64 md:w-80">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-terminal-muted" />
          <input 
            type="text"
            placeholder="AI Memory Search (Trades, Patterns, Knowledge)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/60 border border-terminal-border/80 rounded pl-8 pr-3 py-1.5 text-[11px] text-white placeholder-terminal-muted focus:outline-none focus:border-terminal-amber"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-2 text-[10px] text-terminal-muted hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

      </div>

      {/* SEARCH OVERLAY RESULTS IF SEARCHING */}
      {searchResults && (
        <div className="p-4 bg-[#0d121f] border-b border-terminal-amber/50 space-y-3 shrink-0 max-h-60 overflow-y-auto font-mono text-xs">
          <div className="flex items-center justify-between text-terminal-amber font-bold">
            <span>AI Memory Search Results for "{searchQuery}"</span>
            <span className="text-[10px] text-terminal-muted">
              Matched {searchResults.trades.length} Trades, {searchResults.patterns.length} Patterns, {searchResults.knowledge.length} Knowledge Items
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-2 border border-terminal-border rounded bg-black/40">
              <div className="font-bold text-terminal-blue mb-1">Trades Matched ({searchResults.trades.length})</div>
              {searchResults.trades.map(t => (
                <div key={t.tradeId} onClick={() => setSelectedTrade(t)} className="text-[10px] text-terminal-muted hover:text-white cursor-pointer truncate py-0.5">
                  • [{t.tradeId}] {t.symbol} - {t.type} ({t.pnlPct}%)
                </div>
              ))}
            </div>

            <div className="p-2 border border-terminal-border rounded bg-black/40">
              <div className="font-bold text-terminal-green mb-1">Patterns Matched ({searchResults.patterns.length})</div>
              {searchResults.patterns.map(p => (
                <div key={p.id} className="text-[10px] text-terminal-muted truncate py-0.5">
                  • {p.title} ({p.winRateImpact})
                </div>
              ))}
            </div>

            <div className="p-2 border border-terminal-border rounded bg-black/40">
              <div className="font-bold text-terminal-amber mb-1">Knowledge Matched ({searchResults.knowledge.length})</div>
              {searchResults.knowledge.map(k => (
                <div key={k.id} className="text-[10px] text-terminal-muted truncate py-0.5">
                  • {k.title} [{k.domain}]
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. MAIN WORKSPACE VIEW & RIGHT INSPECTOR */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* MAIN CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          <AnimatePresence mode="wait">
            
            {/* VIEW 1: LMEOS DASHBOARD */}
            {activeTab === 'DASHBOARD' && (
              <motion.div key="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                
                {/* QUALITY GATE RULES BANNER */}
                <div className="p-3 bg-terminal-amber/10 border border-terminal-amber/40 rounded flex items-center justify-between text-terminal-amber font-mono text-[11px]">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-terminal-amber shrink-0" />
                    <div>
                      <span className="font-bold uppercase">MANDATORY LMEOS QUALITY GATE PROTOCOL</span>
                      <p className="text-[10px] text-terminal-muted">
                        Learning Accepted ONLY IF: Trade Verified ✓ | Execution Verified ✓ | Accounting Verified ✓ | Knowledge Generated ✓ | Memory Updated ✓ | Evolution Reviewed ✓
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-terminal-amber/20 border border-terminal-amber font-bold text-[10px]">
                    100% IMMUTABLE
                  </span>
                </div>

                {/* TWO-COLUMN GRID: POST TRADE SUMMARY & PATTERNS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  
                  {/* RECENT POST TRADE LEARNING */}
                  <div className="p-3 bg-[#0d121e] border border-terminal-border rounded space-y-3">
                    <div className="flex items-center justify-between border-b border-terminal-border pb-2">
                      <div className="flex items-center gap-2 font-bold text-terminal-blue">
                        <FileText className="w-4 h-4" />
                        <span>Recent Post-Trade Learning Entries</span>
                      </div>
                      <span className="text-[10px] text-terminal-muted">{postTrades.length} Total Logs</span>
                    </div>

                    <div className="space-y-2">
                      {postTrades.slice(0, 4).map(trade => (
                        <div 
                          key={trade.tradeId}
                          onClick={() => setSelectedTrade(trade)}
                          className={cn(
                            "p-2.5 rounded border transition-all cursor-pointer flex flex-col gap-1",
                            selectedTrade?.tradeId === trade.tradeId
                              ? "bg-terminal-blue/10 border-terminal-blue"
                              : "bg-black/40 border-terminal-border/60 hover:border-terminal-border"
                          )}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-white">{trade.symbol}</span>
                            <span className={cn(
                              "px-1.5 py-0.5 text-[9px] font-bold border",
                              trade.type === 'WINNING' ? 'bg-terminal-green/20 text-terminal-green border-terminal-green' :
                              trade.type === 'LOSING' ? 'bg-terminal-red/20 text-terminal-red border-terminal-red' :
                              'bg-terminal-amber/20 text-terminal-amber border-terminal-amber'
                            )}>
                              {trade.type} ({trade.pnlPct > 0 ? `+${trade.pnlPct}%` : `${trade.pnlPct}%`})
                            </span>
                          </div>
                          <p className="text-[10px] text-terminal-muted line-clamp-2">
                            {trade.learningSummary}
                          </p>
                          <div className="flex justify-between items-center text-[9px] text-terminal-muted pt-1 border-t border-terminal-border/40">
                            <span>Model: <strong className="text-white">{trade.modelName}</strong></span>
                            <span>{trade.timestamp}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ACTIVE PATTERN DISCOVERY */}
                  <div className="p-3 bg-[#0d121e] border border-terminal-border rounded space-y-3">
                    <div className="flex items-center justify-between border-b border-terminal-border pb-2">
                      <div className="flex items-center gap-2 font-bold text-terminal-green">
                        <Network className="w-4 h-4" />
                        <span>Pattern Discovery Engine Highlights</span>
                      </div>
                      <span className="text-[10px] text-terminal-muted">{patterns.length} Active Patterns</span>
                    </div>

                    <div className="space-y-2">
                      {patterns.slice(0, 4).map(pattern => (
                        <div key={pattern.id} className="p-2.5 bg-black/40 border border-terminal-border/60 rounded flex flex-col gap-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-white text-[11px]">{pattern.title}</span>
                            <span className={cn(
                              "font-mono font-bold text-[10px]",
                              pattern.winRateImpact.startsWith('+') ? 'text-terminal-green' : 'text-terminal-red'
                            )}>
                              {pattern.winRateImpact}
                            </span>
                          </div>
                          <p className="text-[10px] text-terminal-muted">
                            {pattern.description}
                          </p>
                          <div className="flex justify-between text-[9px] text-terminal-muted pt-1 border-t border-terminal-border/40">
                            <span>Category: <strong className="text-terminal-amber">{pattern.category}</strong></span>
                            <span>Occurrences: <strong className="text-white">{pattern.frequency}x</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* SELF IMPROVEMENT & MODEL EVOLUTION HIGHLIGHTS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  
                  {/* SELF IMPROVEMENT RECOMMENDATIONS */}
                  <div className="p-3 bg-[#0d121e] border border-terminal-border rounded space-y-3">
                    <div className="flex items-center justify-between border-b border-terminal-border pb-2">
                      <div className="flex items-center gap-2 font-bold text-terminal-amber">
                        <TrendingUp className="w-4 h-4" />
                        <span>Self-Improvement Engine Recommendations</span>
                      </div>
                      <span className="text-[10px] text-terminal-muted">{recommendations.length} Recommendations</span>
                    </div>

                    <div className="space-y-2">
                      {recommendations.slice(0, 3).map(rec => (
                        <div key={rec.id} className="p-2.5 bg-black/40 border border-terminal-border/60 rounded flex justify-between items-center">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">{rec.title}</span>
                              <span className="px-1.5 py-0.5 bg-terminal-amber/20 text-terminal-amber text-[9px] font-bold border border-terminal-amber/40">
                                {rec.type}
                              </span>
                            </div>
                            <p className="text-[10px] text-terminal-muted">{rec.recommendation}</p>
                            <span className="text-[9px] text-terminal-green font-bold">Expected Gain: {rec.expectedGain}</span>
                          </div>

                          <button 
                            onClick={() => engine.applyRecommendation(rec.id)}
                            disabled={rec.status === 'APPLIED'}
                            className={cn(
                              "px-2.5 py-1 text-[10px] font-bold border transition-colors shrink-0",
                              rec.status === 'APPLIED' 
                                ? "bg-terminal-green/20 border-terminal-green text-terminal-green" 
                                : "bg-terminal-amber/20 border-terminal-amber text-terminal-amber hover:bg-terminal-amber hover:text-black"
                            )}
                          >
                            {rec.status === 'APPLIED' ? 'APPLIED ✓' : 'APPLY RECOMMENDATION'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* MODEL EVOLUTION ROSTER */}
                  <div className="p-3 bg-[#0d121e] border border-terminal-border rounded space-y-3">
                    <div className="flex items-center justify-between border-b border-terminal-border pb-2">
                      <div className="flex items-center gap-2 font-bold text-purple-400">
                        <Sparkles className="w-4 h-4" />
                        <span>Model Evolution Lineage & Status</span>
                      </div>
                      <span className="text-[10px] text-terminal-muted">Gen 14 Active</span>
                    </div>

                    <div className="space-y-2">
                      {evolution.slice(0, 3).map(m => (
                        <div key={m.modelId} className="p-2.5 bg-black/40 border border-terminal-border/60 rounded flex justify-between items-center">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">{m.modelName}</span>
                              <span className={cn(
                                "px-1.5 py-0.5 text-[9px] font-bold border",
                                m.role === 'CHAMPION' ? 'bg-terminal-green/20 text-terminal-green border-terminal-green' : 'bg-purple-500/20 text-purple-400 border-purple-500'
                              )}>
                                {m.role}
                              </span>
                            </div>
                            <p className="text-[10px] text-terminal-muted mt-0.5">{m.mutation}</p>
                            <span className="text-[9px] text-terminal-amber font-mono">CSI: {m.csiScore} • Win Rate: {m.winRate}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            {m.role === 'CHALLENGER' && (
                              <button 
                                onClick={() => engine.promoteModel(m.modelId)}
                                className="px-2 py-1 bg-terminal-green/20 border border-terminal-green text-terminal-green text-[9px] font-bold hover:bg-terminal-green hover:text-black"
                              >
                                PROMOTE
                              </button>
                            )}
                            <button 
                              onClick={() => engine.rollbackModel(m.modelId)}
                              className="px-2 py-1 bg-terminal-red/20 border border-terminal-red text-terminal-red text-[9px] font-bold hover:bg-terminal-red hover:text-white"
                            >
                              ROLLBACK
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </motion.div>
            )}

            {/* VIEW 2: POST-TRADE LEARNING & ROOT CAUSE ENGINE */}
            {activeTab === 'POST_TRADE' && (
              <motion.div key="post" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                
                {/* FILTER BAR */}
                <div className="flex items-center justify-between pb-2 border-b border-terminal-border">
                  <div className="flex items-center gap-2 font-bold text-terminal-amber">
                    <FileText className="w-4 h-4" />
                    <span>Post-Trade Learning & Root Cause Engine (6 Categories)</span>
                  </div>

                  <div className="flex gap-1 font-mono text-[10px]">
                    {(['ALL', 'WINNING', 'LOSING', 'MISSED', 'REJECTED', 'CANCELLED', 'RISK_EVENT'] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => setPostTradeFilter(type)}
                        className={cn(
                          "px-2.5 py-1 border transition-all font-bold",
                          postTradeFilter === type
                            ? "bg-terminal-amber text-black border-terminal-amber"
                            : "border-terminal-border/80 text-terminal-muted hover:text-white"
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* TRADE LIST TABLE */}
                <div className="bg-[#0d121e] border border-terminal-border rounded p-3 space-y-2">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-terminal-border text-terminal-muted text-[10px]">
                        <th className="p-2">Trade ID</th>
                        <th className="p-2">Symbol</th>
                        <th className="p-2">Category</th>
                        <th className="p-2">Model</th>
                        <th className="p-2">PnL ($)</th>
                        <th className="p-2">PnL %</th>
                        <th className="p-2">Holding</th>
                        <th className="p-2">Quality Gate</th>
                        <th className="p-2 text-right">Inspect</th>
                      </tr>
                    </thead>
                    <tbody>
                      {postTrades.map(trade => (
                        <tr 
                          key={trade.tradeId}
                          onClick={() => setSelectedTrade(trade)}
                          className={cn(
                            "border-b border-terminal-border/40 hover:bg-white/5 cursor-pointer transition-colors text-[11px]",
                            selectedTrade?.tradeId === trade.tradeId ? "bg-terminal-amber/10 text-white font-bold" : "text-terminal-muted"
                          )}
                        >
                          <td className="p-2 font-mono text-terminal-amber">{trade.tradeId}</td>
                          <td className="p-2 font-bold text-white">{trade.symbol}</td>
                          <td className="p-2">
                            <span className={cn(
                              "px-1.5 py-0.5 text-[9px] font-bold border",
                              trade.type === 'WINNING' ? 'bg-terminal-green/20 text-terminal-green border-terminal-green' :
                              trade.type === 'LOSING' ? 'bg-terminal-red/20 text-terminal-red border-terminal-red' :
                              'bg-terminal-amber/20 text-terminal-amber border-terminal-amber'
                            )}>
                              {trade.type}
                            </span>
                          </td>
                          <td className="p-2 text-white">{trade.modelName}</td>
                          <td className={cn("p-2 font-mono", trade.pnl >= 0 ? "text-terminal-green" : "text-terminal-red")}>
                            ${trade.pnl.toLocaleString()}
                          </td>
                          <td className={cn("p-2 font-mono", trade.pnlPct >= 0 ? "text-terminal-green" : "text-terminal-red")}>
                            {trade.pnlPct > 0 ? `+${trade.pnlPct}%` : `${trade.pnlPct}%`}
                          </td>
                          <td className="p-2 font-mono text-terminal-muted">{trade.holdingTimeMinutes}m</td>
                          <td className="p-2 font-mono">
                            {trade.verified ? (
                              <span className="text-terminal-green font-bold">VERIFIED ✓</span>
                            ) : (
                              <button 
                                onClick={(e) => { e.stopPropagation(); engine.verifyQualityGate(trade.tradeId); }}
                                className="px-1.5 py-0.5 bg-terminal-amber/20 border border-terminal-amber text-terminal-amber text-[9px] font-bold hover:bg-terminal-amber hover:text-black"
                              >
                                PASS GATE
                              </button>
                            )}
                          </td>
                          <td className="p-2 text-right">
                            <span className="text-terminal-amber text-[10px]">Select →</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 8-DIMENSION ROOT CAUSE BREAKDOWN FOR SELECTED TRADE */}
                {selectedTrade && (
                  <div className="p-4 bg-[#0d121e] border border-terminal-amber/60 rounded space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between border-b border-terminal-border pb-2">
                      <div className="flex items-center gap-2">
                        <Dna className="w-4 h-4 text-terminal-amber" />
                        <span className="font-bold text-terminal-amber uppercase">
                          8-Dimension Root Cause Analysis for Trade [{selectedTrade.tradeId} - {selectedTrade.symbol}]
                        </span>
                      </div>
                      <span className="text-[10px] text-terminal-muted">
                        Analysis Executed: {selectedTrade.timestamp}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      
                      <div className="p-2.5 bg-black/50 border border-terminal-border rounded space-y-1">
                        <div className="text-[10px] text-terminal-amber font-bold uppercase">1. Market Reason</div>
                        <p className="text-[10px] text-terminal-muted">{selectedTrade.rootCauses.marketReason}</p>
                      </div>

                      <div className="p-2.5 bg-black/50 border border-terminal-border rounded space-y-1">
                        <div className="text-[10px] text-terminal-amber font-bold uppercase">2. Strategy Reason</div>
                        <p className="text-[10px] text-terminal-muted">{selectedTrade.rootCauses.strategyReason}</p>
                      </div>

                      <div className="p-2.5 bg-black/50 border border-terminal-border rounded space-y-1">
                        <div className="text-[10px] text-terminal-amber font-bold uppercase">3. Execution Reason</div>
                        <p className="text-[10px] text-terminal-muted">{selectedTrade.rootCauses.executionReason}</p>
                      </div>

                      <div className="p-2.5 bg-black/50 border border-terminal-border rounded space-y-1">
                        <div className="text-[10px] text-terminal-amber font-bold uppercase">4. Risk Reason</div>
                        <p className="text-[10px] text-terminal-muted">{selectedTrade.rootCauses.riskReason}</p>
                      </div>

                      <div className="p-2.5 bg-black/50 border border-terminal-border rounded space-y-1">
                        <div className="text-[10px] text-terminal-amber font-bold uppercase">5. Timing Reason</div>
                        <p className="text-[10px] text-terminal-muted">{selectedTrade.rootCauses.timingReason}</p>
                      </div>

                      <div className="p-2.5 bg-black/50 border border-terminal-border rounded space-y-1">
                        <div className="text-[10px] text-terminal-amber font-bold uppercase">6. Committee Reason</div>
                        <p className="text-[10px] text-terminal-muted">{selectedTrade.rootCauses.committeeReason}</p>
                      </div>

                      <div className="p-2.5 bg-black/50 border border-terminal-border rounded space-y-1">
                        <div className="text-[10px] text-terminal-amber font-bold uppercase">7. Fund Reason</div>
                        <p className="text-[10px] text-terminal-muted">{selectedTrade.rootCauses.fundReason}</p>
                      </div>

                      <div className="p-2.5 bg-black/50 border border-terminal-border rounded space-y-1">
                        <div className="text-[10px] text-terminal-amber font-bold uppercase">8. Broker Reason</div>
                        <p className="text-[10px] text-terminal-muted">{selectedTrade.rootCauses.brokerReason}</p>
                      </div>

                    </div>
                  </div>
                )}

              </motion.div>
            )}

            {/* VIEW 3: 7-TIER MEMORY ENGINE */}
            {activeTab === 'MEMORY' && (
              <motion.div key="memory" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AIMemoryWorkspace />
              </motion.div>
            )}

            {/* VIEW 4: 7-DOMAIN KNOWLEDGE ENGINE */}
            {activeTab === 'KNOWLEDGE' && (
              <motion.div key="know" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-terminal-border">
                  <div className="flex items-center gap-2 font-bold text-terminal-amber">
                    <BookOpen className="w-4 h-4" />
                    <span>Knowledge Engine (7 Knowledge Domains)</span>
                  </div>

                  <div className="flex gap-1 font-mono text-[10px]">
                    {(['ALL', 'TRADE', 'PATTERN', 'RISK', 'MARKET', 'STRATEGY', 'EXECUTION', 'FINANCIAL'] as const).map(dom => (
                      <button
                        key={dom}
                        onClick={() => setKnowledgeFilter(dom)}
                        className={cn(
                          "px-2.5 py-1 border transition-all font-bold",
                          knowledgeFilter === dom
                            ? "bg-terminal-amber text-black border-terminal-amber"
                            : "border-terminal-border/80 text-terminal-muted hover:text-white"
                        )}
                      >
                        {dom}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {knowledge.map(k => (
                    <div key={k.id} className="p-3 bg-[#0d121e] border border-terminal-border rounded space-y-2">
                      <div className="flex justify-between items-center border-b border-terminal-border pb-1.5">
                        <span className="font-bold text-white text-xs">{k.title}</span>
                        <span className="px-1.5 py-0.5 bg-terminal-amber/20 border border-terminal-amber text-terminal-amber text-[9px] font-bold">
                          {k.domain}
                        </span>
                      </div>
                      <p className="text-[11px] text-terminal-muted leading-relaxed">{k.content}</p>
                      <div className="flex items-center justify-between text-[9px] text-terminal-muted pt-1 border-t border-terminal-border/40">
                        <div className="flex gap-1">
                          {k.tags.map(t => (
                            <span key={t} className="px-1 bg-black/60 border border-terminal-border/60 text-terminal-muted">
                              #{t}
                            </span>
                          ))}
                        </div>
                        <span>Verifications: <strong className="text-terminal-green">{k.verificationCount}x</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* VIEW 5: PATTERN DISCOVERY ENGINE */}
            {activeTab === 'PATTERNS' && (
              <motion.div key="pat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-terminal-border">
                  <div className="flex items-center gap-2 font-bold text-terminal-green">
                    <Network className="w-4 h-4" />
                    <span>Pattern Discovery Engine (6 Categories)</span>
                  </div>
                  <span className="text-[10px] text-terminal-muted">Automatic Detection Active</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {patterns.map(p => (
                    <div key={p.id} className="p-3 bg-[#0d121e] border border-terminal-border rounded space-y-2">
                      <div className="flex justify-between items-center border-b border-terminal-border pb-1.5">
                        <span className="font-bold text-white text-xs">{p.title}</span>
                        <span className="px-1.5 py-0.5 bg-terminal-green/20 border border-terminal-green text-terminal-green text-[9px] font-bold">
                          {p.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-terminal-muted">{p.description}</p>
                      <div className="flex justify-between items-center text-[10px] pt-1 border-t border-terminal-border/40">
                        <span className="text-terminal-muted">Occurrences: <strong className="text-white">{p.frequency}x</strong></span>
                        <span className={cn("font-bold font-mono", p.winRateImpact.startsWith('+') ? 'text-terminal-green' : 'text-terminal-red')}>
                          Impact: {p.winRateImpact}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* VIEW 6: SELF IMPROVEMENT ENGINE */}
            {activeTab === 'IMPROVEMENT' && (
              <motion.div key="imp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-terminal-border">
                  <div className="flex items-center gap-2 font-bold text-terminal-amber">
                    <TrendingUp className="w-4 h-4" />
                    <span>Self Improvement Engine (Automatic Recommendations)</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {recommendations.map(rec => (
                    <div key={rec.id} className="p-4 bg-[#0d121e] border border-terminal-border rounded flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{rec.title}</span>
                          <span className="px-2 py-0.5 bg-terminal-amber/20 border border-terminal-amber text-terminal-amber text-[10px] font-bold">
                            {rec.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-terminal-muted">{rec.recommendation}</p>
                        <div className="flex items-center gap-4 text-[10px] font-mono text-terminal-muted pt-1">
                          <span>Target Subsystem: <strong className="text-white">{rec.target}</strong></span>
                          <span>Expected Gain: <strong className="text-terminal-green">{rec.expectedGain}</strong></span>
                        </div>
                      </div>

                      <button 
                        onClick={() => engine.applyRecommendation(rec.id)}
                        disabled={rec.status === 'APPLIED'}
                        className={cn(
                          "px-4 py-2 text-xs font-bold border transition-colors shrink-0",
                          rec.status === 'APPLIED' 
                            ? "bg-terminal-green/20 border-terminal-green text-terminal-green" 
                            : "bg-terminal-amber text-black border-terminal-amber hover:bg-white"
                        )}
                      >
                        {rec.status === 'APPLIED' ? 'APPLIED TO SYSTEM ✓' : 'APPROVE & APPLY'}
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* VIEW 7: MODEL EVOLUTION & LINEAGE */}
            {activeTab === 'EVOLUTION' && (
              <motion.div key="evo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-terminal-border">
                  <div className="flex items-center gap-2 font-bold text-purple-400">
                    <Sparkles className="w-4 h-4" />
                    <span>Model Evolution & Lineage OS</span>
                  </div>
                  <span className="text-[10px] text-terminal-muted">Gen 14 Active</span>
                </div>

                <div className="bg-[#0d121e] border border-terminal-border rounded p-3">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-terminal-border text-terminal-muted text-[10px]">
                        <th className="p-2">Model Name</th>
                        <th className="p-2">Role</th>
                        <th className="p-2">Generation</th>
                        <th className="p-2">Mutation Details</th>
                        <th className="p-2">CSI Score</th>
                        <th className="p-2">Win Rate</th>
                        <th className="p-2">Status</th>
                        <th className="p-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {evolution.map(m => (
                        <tr key={m.modelId} className="border-b border-terminal-border/40 hover:bg-white/5 text-[11px]">
                          <td className="p-2 font-bold text-white">{m.modelName}</td>
                          <td className="p-2">
                            <span className={cn(
                              "px-1.5 py-0.5 text-[9px] font-bold border",
                              m.role === 'CHAMPION' ? 'bg-terminal-green/20 text-terminal-green border-terminal-green' : 'bg-purple-500/20 text-purple-400 border-purple-500'
                            )}>
                              {m.role}
                            </span>
                          </td>
                          <td className="p-2 font-mono text-terminal-amber">{m.generation}</td>
                          <td className="p-2 text-terminal-muted text-[10px]">{m.mutation}</td>
                          <td className="p-2 font-mono font-bold text-terminal-green">{m.csiScore}</td>
                          <td className="p-2 font-mono text-white">{m.winRate}</td>
                          <td className="p-2 font-mono text-terminal-amber">{m.status}</td>
                          <td className="p-2 text-right space-x-1">
                            {m.role === 'CHALLENGER' && (
                              <button 
                                onClick={() => engine.promoteModel(m.modelId)}
                                className="px-2 py-0.5 bg-terminal-green/20 border border-terminal-green text-terminal-green text-[9px] font-bold hover:bg-terminal-green hover:text-black"
                              >
                                PROMOTE
                              </button>
                            )}
                            <button 
                              onClick={() => engine.rollbackModel(m.modelId)}
                              className="px-2 py-0.5 bg-terminal-red/20 border border-terminal-red text-terminal-red text-[9px] font-bold hover:bg-terminal-red hover:text-white"
                            >
                              ROLLBACK
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* VIEW 8: KNOWLEDGE GRAPH */}
            {activeTab === 'GRAPH' && (
              <motion.div key="graph" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-terminal-border">
                  <div className="flex items-center gap-2 font-bold text-cyan-400">
                    <Layers className="w-4 h-4" />
                    <span>Knowledge Graph (7 Interconnected Enterprise Nodes)</span>
                  </div>
                  <span className="text-[10px] text-terminal-muted">Real-time Node Mesh</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {knowledgeGraph.map(node => (
                    <div key={node.id} className="p-4 bg-[#0d121e] border border-cyan-500/40 rounded space-y-2">
                      <div className="flex justify-between items-center border-b border-terminal-border pb-2">
                        <span className="font-bold text-white text-xs">{node.label}</span>
                        <span className="px-1.5 py-0.5 bg-cyan-500/20 border border-cyan-500 text-cyan-400 text-[9px] font-bold">
                          {node.type}
                        </span>
                      </div>
                      <div className="text-[10px] text-terminal-muted">
                        Connected Nodes:
                        <div className="flex flex-wrap gap-1 mt-1">
                          {node.connections.map(conn => (
                            <span key={conn} className="px-1.5 py-0.5 bg-black/60 border border-terminal-border/60 text-terminal-amber text-[9px] font-mono">
                              → {conn}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-[9px] text-terminal-muted pt-2 border-t border-terminal-border/40">
                        <span>Mesh Weight: <strong className="text-terminal-green">{(node.weight * 100).toFixed(0)}%</strong></span>
                        <span className="text-cyan-400 font-bold">CONNECTED ✓</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

          </AnimatePresence>

        </div>

        {/* RIGHT INSPECTOR PANEL */}
        <div className="w-80 border-l border-terminal-border/80 bg-[#0d111c] p-4 flex flex-col justify-between overflow-y-auto shrink-0 hidden lg:flex">
          
          {selectedTrade ? (
            <div className="space-y-4 font-mono text-xs">
              
              <div className="flex items-center justify-between border-b border-terminal-border pb-2">
                <div className="flex items-center gap-1.5">
                  <Dna className="w-4 h-4 text-terminal-amber" />
                  <span className="font-bold text-white uppercase text-[11px]">Trade Inspector</span>
                </div>
                <span className="text-[10px] text-terminal-muted">ID: {selectedTrade.tradeId}</span>
              </div>

              {/* SELECTED TRADE METRICS */}
              <div className="p-3 bg-black/40 border border-terminal-border rounded space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-terminal-amber text-sm">{selectedTrade.symbol}</span>
                  <span className={cn(
                    "px-1.5 py-0.5 text-[9px] font-bold border",
                    selectedTrade.type === 'WINNING' ? 'bg-terminal-green/20 text-terminal-green border-terminal-green' :
                    selectedTrade.type === 'LOSING' ? 'bg-terminal-red/20 text-terminal-red border-terminal-red' :
                    'bg-terminal-amber/20 text-terminal-amber border-terminal-amber'
                  )}>
                    {selectedTrade.type}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                  <div>
                    <span className="text-terminal-muted">Entry: </span>
                    <span className="text-white font-bold">${selectedTrade.entryPrice}</span>
                  </div>
                  <div>
                    <span className="text-terminal-muted">Exit: </span>
                    <span className="text-white font-bold">${selectedTrade.exitPrice}</span>
                  </div>
                  <div>
                    <span className="text-terminal-muted">PnL: </span>
                    <span className={selectedTrade.pnl >= 0 ? "text-terminal-green font-bold" : "text-terminal-red font-bold"}>
                      ${selectedTrade.pnl.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-terminal-muted">PnL %: </span>
                    <span className={selectedTrade.pnlPct >= 0 ? "text-terminal-green font-bold" : "text-terminal-red font-bold"}>
                      {selectedTrade.pnlPct}%
                    </span>
                  </div>
                </div>
              </div>

              {/* LEARNING SUMMARY */}
              <div className="p-3 bg-black/40 border border-terminal-border rounded space-y-1">
                <div className="font-bold text-terminal-blue text-[10px] uppercase">Learning Summary</div>
                <p className="text-[10px] text-terminal-muted leading-relaxed">
                  {selectedTrade.learningSummary}
                </p>
              </div>

              {/* KNOWLEDGE GENERATED */}
              <div className="p-3 bg-black/40 border border-terminal-border rounded space-y-1">
                <div className="font-bold text-terminal-green text-[10px] uppercase">Knowledge Generated</div>
                {selectedTrade.knowledgeGenerated.map((item, i) => (
                  <p key={i} className="text-[10px] text-terminal-green font-mono">• {item}</p>
                ))}
              </div>

              {/* MEMORY UPDATED */}
              <div className="p-3 bg-black/40 border border-terminal-border rounded space-y-1">
                <div className="font-bold text-purple-400 text-[10px] uppercase">Memory Updated</div>
                {selectedTrade.memoryUpdated.map((mem, i) => (
                  <p key={i} className="text-[10px] text-purple-300 font-mono">• {mem}</p>
                ))}
              </div>

              {/* EVOLUTION IMPACT */}
              <div className="p-3 bg-black/40 border border-terminal-border rounded space-y-1">
                <div className="font-bold text-cyan-400 text-[10px] uppercase">Evolution Impact</div>
                <p className="text-[10px] text-cyan-300 font-mono">• {selectedTrade.evolutionImpact}</p>
              </div>

              {/* QUALITY GATE ACTION */}
              <div className="pt-2">
                {selectedTrade.verified ? (
                  <div className="p-2.5 bg-terminal-green/10 border border-terminal-green text-terminal-green text-center font-bold text-[10px]">
                    QUALITY GATE PASSED ✓
                  </div>
                ) : (
                  <button 
                    onClick={() => engine.verifyQualityGate(selectedTrade.tradeId)}
                    className="w-full py-2 bg-terminal-amber text-black font-bold text-xs hover:bg-white transition-colors"
                  >
                    VERIFY & PASS QUALITY GATE
                  </button>
                )}
              </div>

            </div>
          ) : (
            <div className="text-terminal-muted text-[10px] text-center pt-20">
              Select a trade entry to inspect learning details, knowledge generated, and evolution impact.
            </div>
          )}

        </div>

      </div>

      {/* 5. FLOATING BOTTOM TERMINAL (LOGS STREAM) */}
      <div className={cn(
        "bg-[#090c13] border-t border-terminal-border/80 transition-all duration-200 shrink-0 flex flex-col overflow-hidden",
        isConsoleExpanded ? "h-36" : "h-8"
      )}>
        {/* STRIP HEADER */}
        <div 
          onClick={() => setIsConsoleExpanded(!isConsoleExpanded)}
          className="h-8 px-4 flex items-center justify-between cursor-pointer hover:bg-white/5 select-none shrink-0"
        >
          <div className="flex items-center gap-3 font-mono text-[10px]">
            <Terminal className="w-3.5 h-3.5 text-terminal-amber" />
            <span className="font-bold text-white uppercase">LMEOS System Terminal Logs</span>
            <span className="text-terminal-muted">● Live Audit Feed</span>
          </div>

          <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
            {(['ALL', 'LEARNING', 'MEMORY', 'KNOWLEDGE', 'EVOLUTION'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setLogFilter(cat)}
                className={cn(
                  "px-2 py-0.5 text-[9px] font-bold border transition-colors",
                  logFilter === cat ? "bg-terminal-amber text-black border-terminal-amber" : "text-terminal-muted border-transparent hover:text-white"
                )}
              >
                {cat}
              </button>
            ))}
            <button 
              onClick={() => setIsConsoleExpanded(!isConsoleExpanded)}
              className="text-[10px] text-terminal-amber px-2 py-0.5 border border-terminal-amber/40 rounded"
            >
              {isConsoleExpanded ? 'Collapse ↓' : 'Expand ↑'}
            </button>
          </div>
        </div>

        {/* LOG STREAM BODY */}
        {isConsoleExpanded && (
          <div className="flex-1 overflow-y-auto p-3 font-mono text-[10px] space-y-1 text-terminal-muted">
            {logs.map(log => (
              <div key={log.id} className="flex items-center gap-3 border-b border-terminal-border/30 pb-0.5">
                <span className="text-terminal-muted/60">[{log.timestamp}]</span>
                <span className={cn(
                  "px-1 py-0.2 font-bold text-[8px] border",
                  log.category === 'LEARNING' ? 'bg-terminal-blue/20 text-terminal-blue border-terminal-blue' :
                  log.category === 'MEMORY' ? 'bg-purple-500/20 text-purple-400 border-purple-500' :
                  log.category === 'KNOWLEDGE' ? 'bg-terminal-amber/20 text-terminal-amber border-terminal-amber' :
                  'bg-cyan-500/20 text-cyan-400 border-cyan-500'
                )}>
                  {log.category}
                </span>
                <span className="text-white">{log.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
