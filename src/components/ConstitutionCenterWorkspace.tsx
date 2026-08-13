import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Target, 
  BookOpen, 
  BarChart2, 
  Cpu, 
  Sparkles, 
  Lock, 
  TrendingUp, 
  AlertTriangle, 
  Wallet, 
  Zap, 
  Server, 
  FileText, 
  Dna, 
  Shield, 
  Globe, 
  Search, 
  Terminal, 
  Info, 
  Layers, 
  Database, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Filter,
  Check,
  FileCode,
  X,
  Scale
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { 
  ArinaConstitutionEngine, 
  ConstitutionChapter, 
  ConstitutionRule, 
  GovernanceLog 
} from '../modules/platform/services/ArinaConstitutionEngine';

const CHAPTER_ICONS: Record<string, React.ElementType> = {
  Target,
  Shield,
  Globe,
  BookOpen,
  BarChart2,
  Cpu,
  Sparkles,
  Lock,
  TrendingUp,
  AlertTriangle,
  Wallet,
  Zap,
  Server,
  FileText,
  Dna,
  ShieldCheck
};

export const ConstitutionCenterWorkspace: React.FC = () => {
  const engine = ArinaConstitutionEngine.getInstance();
  const overview = engine.getOverview();
  const chapters = engine.getChapters();

  const [selectedChapterId, setSelectedChapterId] = useState<string>('MISSION');
  const [selectedRule, setSelectedRule] = useState<ConstitutionRule | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [logFilter, setLogFilter] = useState<string>('ALL');

  // Active chapter
  const activeChapter = useMemo(() => {
    return engine.getChapterById(selectedChapterId) || chapters[0];
  }, [selectedChapterId, chapters]);

  // Filtered rules when searching globally
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return engine.searchRules(searchQuery);
  }, [searchQuery]);

  // Default select first rule of active chapter if none selected
  React.useEffect(() => {
    if (activeChapter && activeChapter.sections.length > 0 && activeChapter.sections[0].rules.length > 0) {
      if (!selectedRule || selectedRule.chapterId !== activeChapter.id) {
        setSelectedRule(activeChapter.sections[0].rules[0]);
      }
    }
  }, [activeChapter]);

  // Governance logs
  const logs = engine.getLogs(logFilter);

  return (
    <div className="flex flex-col h-full bg-[#080b11] text-white font-mono text-xs overflow-hidden select-none relative">
      
      {/* 1. TOP AUTHORITATIVE HEADER */}
      <div className="bg-[#0f1524] border-b border-terminal-border/80 px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-terminal-amber/20 border border-terminal-amber/60 rounded">
            <Scale className="w-5 h-5 text-terminal-amber animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs uppercase tracking-wider text-terminal-amber font-mono">
                AI ARINA CONSTITUTION CENTER ● Enterprise Governance Operating System
              </span>
              <span className="px-2 py-0.5 bg-terminal-green/20 border border-terminal-green text-terminal-green text-[9px] font-bold">
                MASTER RULEBOOK (READ-ONLY)
              </span>
            </div>
            <p className="text-[10px] text-terminal-muted hidden sm:block">
              19 Governance Chapters ● Universal OS Invariants ● Strict Read-Only Authority
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* SEARCH INPUT */}
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-terminal-muted absolute left-2.5 top-2" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Global Search Rule ID, keyword, module..."
              className="w-full bg-black/60 border border-terminal-border/80 rounded pl-8 pr-3 py-1 text-[10px] text-white focus:outline-none focus:border-terminal-amber font-mono"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2 top-2 text-terminal-muted hover:text-white">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. OVERVIEW METRICS STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 p-3 bg-black/50 border-b border-terminal-border/60 shrink-0 text-[10px]">
        <div className="p-2 bg-[#0d121f] border border-terminal-amber/60 rounded">
          <div className="text-terminal-muted text-[9px] uppercase font-bold">System Version</div>
          <div className="text-white font-bold text-xs font-mono mt-0.5">{overview.systemVersion}</div>
        </div>
        <div className="p-2 bg-[#0d121f] border border-terminal-border rounded">
          <div className="text-terminal-muted text-[9px] uppercase font-bold">Constitution Version</div>
          <div className="text-terminal-amber font-bold text-xs font-mono mt-0.5">{overview.constitutionVersion}</div>
        </div>
        <div className="p-2 bg-[#0d121f] border border-terminal-border rounded">
          <div className="text-terminal-muted text-[9px] uppercase font-bold">Total Chapters</div>
          <div className="text-terminal-blue font-bold text-xs font-mono mt-0.5">19 Chapters</div>
        </div>
        <div className="p-2 bg-[#0d121f] border border-terminal-border rounded">
          <div className="text-terminal-muted text-[9px] uppercase font-bold">Enforced Rule Count</div>
          <div className="text-terminal-green font-bold text-xs font-mono mt-0.5">{overview.totalRules} Rules Active</div>
        </div>
        <div className="p-2 bg-[#0d121f] border border-terminal-border rounded">
          <div className="text-terminal-muted text-[9px] uppercase font-bold">Last Revision</div>
          <div className="text-white font-bold text-xs font-mono mt-0.5">{overview.lastRevisionDate}</div>
        </div>
        <div className="p-2 bg-[#0d121f] border border-terminal-border rounded">
          <div className="text-terminal-muted text-[9px] uppercase font-bold">Approval Status</div>
          <div className="text-terminal-green font-bold text-[10px] mt-0.5">BOARD APPROVED ✓</div>
        </div>
        <div className="p-2 bg-[#0d121f] border border-terminal-border rounded">
          <div className="text-terminal-muted text-[9px] uppercase font-bold">Read-Only Safety</div>
          <div className="text-purple-400 font-bold text-[10px] mt-0.5">ENFORCED (NO EDIT)</div>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE WITH CHAPTER NAVIGATION, READER, AND RIGHT INSPECTOR */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT CHAPTER NAVIGATOR */}
        <div className="w-64 bg-[#0a0d16] border-r border-terminal-border/80 flex flex-col overflow-y-auto shrink-0 p-2 space-y-1">
          <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-terminal-amber border-b border-terminal-border/60 flex items-center justify-between">
            <span>Constitution Chapters</span>
            <span className="text-terminal-muted text-[9px]">19 Total</span>
          </div>

          {chapters.map((ch) => {
            const IconComponent = CHAPTER_ICONS[ch.iconName] || BookOpen;
            const isSelected = selectedChapterId === ch.id && !searchQuery;

            return (
              <button
                key={ch.id}
                onClick={() => {
                  setSelectedChapterId(ch.id);
                  setSearchQuery('');
                }}
                className={cn(
                  "w-full text-left p-2 rounded text-[11px] font-mono transition-all flex items-center justify-between gap-2 border",
                  isSelected
                    ? "bg-terminal-amber/15 text-terminal-amber border-terminal-amber font-bold shadow"
                    : "bg-black/30 text-terminal-muted border-terminal-border/40 hover:text-white hover:bg-white/5"
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  <IconComponent className="w-3.5 h-3.5 shrink-0 text-terminal-amber" />
                  <span className="truncate">{ch.title}</span>
                </div>
                <span className="text-[9px] px-1 bg-black/60 border border-terminal-border rounded text-terminal-muted">
                  {ch.rulesCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* CENTER CONSTITUTION READER */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* GLOBAL SEARCH RESULTS MODE */}
          {searchQuery.trim() ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-terminal-border pb-2">
                <span className="font-bold text-terminal-amber uppercase text-xs">
                  Global Rule Search Results ({searchResults.length} Match{searchResults.length === 1 ? '' : 'es'})
                </span>
                <span className="text-[10px] text-terminal-muted">Query: "{searchQuery}"</span>
              </div>

              {searchResults.length === 0 ? (
                <div className="p-8 text-center text-terminal-muted">
                  No Constitution Rules matching "{searchQuery}" found. Try another keyword or Rule ID.
                </div>
              ) : (
                <div className="space-y-3">
                  {searchResults.map((rule) => (
                    <div 
                      key={rule.id}
                      onClick={() => setSelectedRule(rule)}
                      className={cn(
                        "p-3 bg-[#0d121e] border rounded cursor-pointer transition-all space-y-2",
                        selectedRule?.id === rule.id ? "border-terminal-amber bg-terminal-amber/10" : "border-terminal-border hover:border-terminal-muted"
                      )}
                    >
                      <div className="flex justify-between items-center text-[10px]">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-terminal-amber">{rule.id}</span>
                          <span className="text-terminal-muted font-bold">[{rule.sectionNumber}]</span>
                          <span className="text-white font-bold">{rule.title}</span>
                        </div>
                        <span className="px-1.5 py-0.5 bg-terminal-green/20 border border-terminal-green text-terminal-green text-[9px] font-bold">
                          MANDATORY
                        </span>
                      </div>
                      <p className="text-xs text-white leading-relaxed font-sans">{rule.statement}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* CHAPTER READER MODE */
            <div className="space-y-4">
              
              {/* CHAPTER HEADER */}
              <div className="p-4 bg-[#0d121e] border border-terminal-border rounded space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-terminal-amber" />
                    <h1 className="text-sm font-bold text-terminal-amber uppercase tracking-wider">{activeChapter.title}</h1>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span className="px-2 py-0.5 bg-black/60 border border-terminal-border text-terminal-muted rounded">
                      {activeChapter.rulesCount} Rules Enforced
                    </span>
                    <button 
                      onClick={() => alert(`Chapter ${activeChapter.id} bookmarked in local session.`)}
                      className="px-2 py-0.5 bg-terminal-amber/20 border border-terminal-amber/60 text-terminal-amber hover:bg-terminal-amber/30 rounded font-bold"
                    >
                      Bookmark
                    </button>
                    <button 
                      onClick={() => window.print()}
                      className="px-2 py-0.5 bg-black/60 border border-terminal-border text-terminal-muted hover:text-white rounded"
                    >
                      Print View
                    </button>
                  </div>
                </div>
                <p className="text-xs text-terminal-muted">{activeChapter.summary}</p>
              </div>

              {/* SPECIAL MISSION PHILOSOPHY CARD FOR MISSION CHAPTER */}
              {activeChapter.id === 'MISSION' && (
                <div className="p-3 bg-terminal-amber/10 border border-terminal-amber/60 rounded space-y-2">
                  <div className="font-bold text-terminal-amber text-xs uppercase tracking-wider">
                    The AI ARINA Iron Triangle of Enterprise Capital Philosophy
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-center text-[11px] font-mono">
                    <div className="p-2 bg-black/60 border border-terminal-amber/40 rounded">
                      <div className="text-terminal-amber font-bold">1. CAPITAL PROTECTION FIRST</div>
                      <p className="text-[10px] text-terminal-muted mt-1">Preservation of capital overrides trade aggression under all regimes.</p>
                    </div>
                    <div className="p-2 bg-black/60 border border-terminal-border rounded">
                      <div className="text-terminal-blue font-bold">2. CONSISTENCY SECOND</div>
                      <p className="text-[10px] text-terminal-muted mt-1">Sharpe &gt; 2.0 required over 90-day rolling backtest windows.</p>
                    </div>
                    <div className="p-2 bg-black/60 border border-terminal-border rounded">
                      <div className="text-terminal-green font-bold">3. PROFIT THIRD</div>
                      <p className="text-[10px] text-terminal-muted mt-1">Yield is a natural byproduct of strict risk & execution discipline.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTIONS & RULES LIST */}
              {activeChapter.sections.map((sec, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="text-xs font-bold text-terminal-blue uppercase border-b border-terminal-border/60 pb-1 flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-terminal-blue" />
                    <span>{sec.title}</span>
                  </div>

                  <div className="space-y-3">
                    {sec.rules.map((rule) => (
                      <div 
                        key={rule.id}
                        onClick={() => setSelectedRule(rule)}
                        className={cn(
                          "p-4 bg-[#0d121e] border rounded cursor-pointer transition-all space-y-2",
                          selectedRule?.id === rule.id ? "border-terminal-amber bg-terminal-amber/10" : "border-terminal-border hover:border-terminal-muted"
                        )}
                      >
                        <div className="flex justify-between items-center text-[10px]">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-terminal-amber font-mono">{rule.id}</span>
                            <span className="text-terminal-muted font-bold font-mono">[{rule.sectionNumber}]</span>
                            <span className="text-white font-bold text-xs">{rule.title}</span>
                          </div>
                          <span className="px-1.5 py-0.5 bg-terminal-green/20 border border-terminal-green text-terminal-green text-[9px] font-bold">
                            IMMUTABLE MANDATE
                          </span>
                        </div>

                        <div className="p-3 bg-black/50 border border-terminal-border/60 rounded text-xs text-white leading-relaxed font-mono">
                          "{rule.statement}"
                        </div>

                        <div className="flex justify-between items-center text-[10px] text-terminal-muted pt-1">
                          <div>
                            <strong>Purpose:</strong> {rule.purpose}
                          </div>
                          <div className="text-terminal-amber font-mono font-bold">
                            Inspect Impact →
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

            </div>
          )}

        </div>

        {/* RIGHT INSPECTOR - RULE IMPACT VIEW & DEPENDENCIES */}
        <div className="w-80 bg-[#0a0d16] border-l border-terminal-border/80 p-3 flex flex-col gap-3 font-mono text-xs overflow-y-auto shrink-0 hidden lg:flex">
          <div className="flex items-center justify-between border-b border-terminal-border pb-2 text-terminal-amber font-bold">
            <div className="flex items-center gap-1.5">
              <Info className="w-4 h-4" />
              <span>Right Inspector: Rule Impact</span>
            </div>
            <span className="text-[9px] text-terminal-muted">Read-Only</span>
          </div>

          {selectedRule ? (
            <div className="space-y-3">
              
              {/* RULE SUMMARY */}
              <div className="p-2.5 bg-black/50 border border-terminal-amber/50 rounded space-y-1">
                <div className="text-[10px] text-terminal-muted uppercase">Selected Mandate</div>
                <div className="font-bold text-terminal-amber text-xs">{selectedRule.id}</div>
                <div className="text-white font-bold">{selectedRule.title}</div>
                <div className="text-[10px] text-terminal-muted">Version: {selectedRule.version}</div>
              </div>

              {/* PURPOSE */}
              <div className="p-2.5 bg-black/50 border border-terminal-border rounded space-y-1">
                <div className="text-[10px] text-terminal-muted uppercase">Governance Rationale & Purpose</div>
                <p className="text-[10px] text-white leading-relaxed">{selectedRule.purpose}</p>
              </div>

              {/* RULE IMPACT MAPPING */}
              <div className="p-2.5 bg-black/50 border border-terminal-border rounded space-y-2">
                <div className="text-[10px] text-terminal-amber font-bold uppercase border-b border-terminal-border/60 pb-1">
                  Rule Impact Mapping
                </div>

                <div className="space-y-1.5 text-[10px]">
                  <div>
                    <span className="text-terminal-muted block">Affected Workspaces:</span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {selectedRule.impact.workspaces.map(w => (
                        <span key={w} className="px-1.5 py-0.5 bg-terminal-blue/20 border border-terminal-blue/60 text-terminal-blue rounded text-[9px] font-bold">
                          {w}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-terminal-muted block">Affected AI Models:</span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {selectedRule.impact.aiModels.length > 0 ? selectedRule.impact.aiModels.map(m => (
                        <span key={m} className="px-1.5 py-0.5 bg-purple-500/20 border border-purple-500/60 text-purple-300 rounded text-[9px]">
                          {m}
                        </span>
                      )) : <span className="text-terminal-muted text-[9px]">None</span>}
                    </div>
                  </div>

                  <div>
                    <span className="text-terminal-muted block">Affected Backend Services:</span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {selectedRule.impact.services.map(s => (
                        <span key={s} className="px-1.5 py-0.5 bg-terminal-amber/20 border border-terminal-amber/60 text-terminal-amber rounded text-[9px]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-terminal-muted block">Affected API Routes:</span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {selectedRule.impact.apis.map(a => (
                        <span key={a} className="px-1.5 py-0.5 bg-terminal-green/20 border border-terminal-green/60 text-terminal-green rounded text-[9px]">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-terminal-muted block">Affected Database Tables:</span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {selectedRule.impact.databaseTables.map(t => (
                        <span key={t} className="px-1.5 py-0.5 bg-black border border-terminal-border text-terminal-muted rounded text-[9px]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* DEPENDENCIES */}
              <div className="p-2.5 bg-black/50 border border-terminal-border rounded space-y-1">
                <div className="text-[10px] text-terminal-muted uppercase">Rule Dependencies</div>
                <div className="text-[10px] text-white">
                  {selectedRule.dependencies.join(', ') || 'Root System Rule'}
                </div>
              </div>

              {/* REVISION HISTORY */}
              <div className="p-2.5 bg-black/50 border border-terminal-border rounded space-y-1">
                <div className="text-[10px] text-terminal-muted uppercase">Revision History & Approval</div>
                <div className="space-y-1 text-[9px] text-terminal-muted">
                  {selectedRule.revisionHistory.map((h, i) => (
                    <div key={i} className="border-b border-terminal-border/40 pb-1">
                      <span className="text-terminal-amber font-bold">{h.version}</span> ({h.date}) by <strong className="text-white">{h.author}</strong>: {h.note}
                    </div>
                  ))}
                  <div className="pt-1 text-terminal-green">Approved By: {selectedRule.approvedBy}</div>
                </div>
              </div>

            </div>
          ) : (
            <div className="text-terminal-muted text-[10px] text-center py-6">
              Select a Rule from the central reader to inspect affected workspaces, backend services, and database tables.
            </div>
          )}
        </div>

      </div>

      {/* 4. BOTTOM GOVERNANCE TERMINAL */}
      <div className="bg-[#06080d] border-t border-terminal-border p-2 space-y-1.5 shrink-0 font-mono text-[10px]">
        <div className="flex justify-between items-center border-b border-terminal-border/60 pb-1">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-terminal-amber" />
            <span className="font-bold text-terminal-amber uppercase">Bottom Governance Terminal Logs</span>
          </div>

          <div className="flex gap-1 text-[9px]">
            {['ALL', 'GOVERNANCE', 'CONSTITUTION', 'REVISION', 'VALIDATION'].map(cat => (
              <button
                key={cat}
                onClick={() => setLogFilter(cat)}
                className={cn(
                  "px-2 py-0.5 border rounded transition-colors",
                  logFilter === cat ? "bg-terminal-amber text-black font-bold border-terminal-amber" : "text-terminal-muted border-terminal-border/60"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="h-20 overflow-y-auto space-y-1 text-terminal-muted">
          {logs.map(log => (
            <div key={log.id} className="flex gap-2">
              <span className="text-terminal-muted shrink-0">[{log.timestamp}]</span>
              <span className={cn(
                "font-bold shrink-0",
                log.level === 'SUCCESS' ? 'text-terminal-green' : log.level === 'AUDIT' ? 'text-terminal-amber' : 'text-terminal-blue'
              )}>
                [{log.category}]
              </span>
              {log.ruleId && <span className="text-terminal-amber font-bold shrink-0">[{log.ruleId}]</span>}
              <span className="text-white truncate">{log.message}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
