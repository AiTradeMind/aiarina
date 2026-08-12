import React, { useRef, useEffect, useState } from 'react';
import { GlobalResetControlModal } from '../common/GlobalResetControlModal';
import { 
  Zap, 
  Award, 
  CheckCircle, 
  Sliders, 
  Layers, 
  Sparkles, 
  TrendingUp, 
  Terminal, 
  Lock, 
  ShieldCheck, 
  Eye, 
  BookOpen, 
  Wrench,
  ChevronRight,
  Database,
  LayoutDashboard,
  ChevronLeft,
  RefreshCcw,
  Play,
  Pause
} from 'lucide-react';
import { useStrategyContext, StrategyStage } from '../../contexts/StrategyContext';

interface ActiveStrategyHeaderProps {
  activeTab: string;
  onSelectTab: (tab: any) => void;
}

export const ActiveStrategyHeader: React.FC<ActiveStrategyHeaderProps> = ({ activeTab, onSelectTab }) => {
  const { activeStrategy, activeStrategyId, setStage, updateStrategyStatus } = useStrategyContext();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [strategyRuntimeState, setStrategyRuntimeState] = useState<'ACTIVE' | 'PAUSED'>('ACTIVE');
  const [showResetModal, setShowResetModal] = useState(false);

  if (!activeStrategy) return null;

  const isCertified = activeStrategy.isCertified;
  const currentStage = activeStrategy.currentStage || 'DASHBOARD';
  const currentStatus = activeStrategy.currentStatus || 'ENABLED';

  const stages: { id: string; tabId: string; label: string; icon: any }[] = [
    { id: 'DASHBOARD', tabId: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'LIBRARY', tabId: 'LIBRARY', label: 'Library', icon: BookOpen },
    { id: 'BUILDER', tabId: 'BUILDER', label: 'Builder', icon: Wrench },
    { id: 'PARAMETERS', tabId: 'PARAMETERS', label: 'Parameters', icon: Sliders },
    { id: 'CANDIDATES', tabId: 'CANDIDATES', label: 'Candidates', icon: Sparkles },
    { id: 'RANKING', tabId: 'RANKING', label: 'Ranking', icon: TrendingUp },
    { id: 'RUNTIME', tabId: 'RUNTIME', label: 'Runtime', icon: Terminal },
    { id: 'VERSION', tabId: 'VERSION', label: 'Version', icon: Lock },
    { id: 'AUDIT', tabId: 'AUDIT', label: 'SHA256 Audit', icon: ShieldCheck },
    { id: 'INSPECTOR', tabId: 'INSPECTOR', label: 'Pipeline Inspector', icon: Eye },
  ];

  // Scroll active tab into view automatically
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeEl = scrollContainerRef.current.querySelector(`[data-tab="${activeTab}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [activeTab]);

  const handleStageClick = (tabId: string, stageId: any) => {
    setStage(stageId);
    onSelectTab(tabId);
  };

  const scrollBy = (offset: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-slate-900 text-white border-b border-slate-800 px-4 py-2 flex flex-col xl:flex-row xl:items-center justify-between gap-2 shadow-sm shrink-0 max-h-[140px] overflow-hidden">
      {/* Active Strategy Identifiers & Name */}
      <div className="flex items-center gap-3 flex-wrap shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-bold bg-slate-800 text-teal-300 border border-slate-700 px-2 py-0.5 rounded">
            {activeStrategy.id || activeStrategy.strategyId || 'STRAT-001'}
          </span>
          <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5" title={`Category: ${activeStrategy.category}`}>
            {activeStrategy.name}
            <span className="text-[10px] text-slate-400 font-mono">({activeStrategy.category})</span>
          </h2>
          <span className="font-mono text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700 px-1.5 py-0.5 rounded">
            v{activeStrategy.version || '1.0.0'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {isCertified ? (
            <span className="bg-emerald-950/80 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/40 uppercase flex items-center gap-1">
              <Award className="w-3 h-3 text-emerald-400" /> Certified
            </span>
          ) : (
            <span className="bg-amber-950/80 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/40 uppercase flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" /> Working Copy
            </span>
          )}

          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase border ${
            strategyRuntimeState === 'ACTIVE'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
          }`}>
            {strategyRuntimeState === 'ACTIVE' ? 'RUNNING' : 'PAUSED'}
          </span>

          {/* MODULE-LOCAL STRATEGY CONTROLS: 01 RESET, 02 ON, 03 OFF */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded p-0.5 ml-2">
            <button
              onClick={() => setShowResetModal(true)}
              className="px-2 py-0.5 text-[10px] font-bold uppercase rounded flex items-center gap-1 bg-slate-900 border border-amber-500/40 text-amber-300 hover:bg-slate-800 transition-all cursor-pointer"
              title="Module-Local Control: Reset Strategy Test State"
            >
              <RefreshCcw className="w-3 h-3 text-amber-400" />
              <span>01 RESET</span>
            </button>

            <button
              onClick={() => {
                setStrategyRuntimeState('ACTIVE');
                if (updateStrategyStatus) updateStrategyStatus(activeStrategy.id, 'ENABLED');
              }}
              disabled={strategyRuntimeState === 'ACTIVE'}
              className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 uppercase transition-all cursor-pointer ${
                strategyRuntimeState === 'ACTIVE'
                  ? 'bg-emerald-500 text-slate-950 font-black'
                  : 'text-emerald-400 hover:bg-emerald-500/20'
              }`}
              title="Module-Local Control: Start Strategy Runtime"
            >
              <Play className="w-3 h-3" /> 02 ON
            </button>

            <button
              onClick={() => {
                setStrategyRuntimeState('PAUSED');
                if (updateStrategyStatus) updateStrategyStatus(activeStrategy.id, 'DISABLED');
              }}
              disabled={strategyRuntimeState === 'PAUSED'}
              className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 uppercase transition-all cursor-pointer ${
                strategyRuntimeState === 'PAUSED'
                  ? 'bg-rose-500 text-slate-950 font-black'
                  : 'text-rose-400 hover:bg-rose-500/20'
              }`}
              title="Module-Local Control: Stop Strategy Runtime"
            >
              <Pause className="w-3 h-3" /> 03 OFF
            </button>
          </div>
        </div>
      </div>

      {/* Unified Horizontal Workflow Navigation with Horizontal Scrolling & Fade Indicators */}
      <div className="relative flex items-center gap-1 shrink-0 max-w-full">
        <button 
          onClick={() => scrollBy(-200)}
          className="hidden sm:flex items-center justify-center w-6 h-6 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 shrink-0 z-10 text-xs"
          title="Scroll Left"
        >
          ‹
        </button>

        <div 
          ref={scrollContainerRef}
          className="flex items-center gap-1.5 overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar-none py-1 px-1 relative flex-nowrap"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onWheel={(e) => {
            if (e.deltaY !== 0 && scrollContainerRef.current) {
              scrollContainerRef.current.scrollLeft += e.deltaY;
              e.preventDefault();
            }
          }}
        >
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            const isActive = activeTab === stage.tabId;
            const isCurrentStage = currentStage === stage.id;

            return (
              <React.Fragment key={stage.id}>
                {idx > 0 && <span className="text-slate-700 text-xs shrink-0">›</span>}
                <button
                  data-tab={stage.tabId}
                  onClick={() => handleStageClick(stage.tabId, stage.id as any)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono font-semibold transition-all border shrink-0 ${
                    isActive
                      ? 'bg-teal-500 text-slate-950 border-teal-400 font-bold shadow-sm'
                      : isCurrentStage
                      ? 'bg-slate-800 text-teal-300 border-teal-500/50'
                      : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border-slate-800'
                  }`}
                  title={`Stage: ${stage.label}`}
                >
                  <Icon className="w-3 h-3 shrink-0" />
                  <span className="whitespace-nowrap">{stage.label}</span>
                </button>
              </React.Fragment>
            );
          })}
        </div>

        <button 
          onClick={() => scrollBy(200)}
          className="hidden sm:flex items-center justify-center w-6 h-6 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 shrink-0 z-10 text-xs"
          title="Scroll Right"
        >
          ›
        </button>
      </div>

      <GlobalResetControlModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        moduleTitle="Strategy Engine & Runtime"
        moduleKey="STRATEGY"
        resetApiEndpoint="/api/strategy/runtime/reset"
        protectedAssetsNotice="Purges volatile strategy test executions and evaluation buffers. Certified strategy versions, registry entries, and SHA256 audit logs remain protected."
        onSuccess={(data) => {
          alert(`Strategy Reset executed cleanly. RunID: ${data.resetRunId} (${data.recordsCleared ?? 0} execution records cleared).`);
        }}
        onError={(err) => {
          alert(`Strategy Reset Failed: ${err}`);
        }}
      />
    </div>
  );
};
