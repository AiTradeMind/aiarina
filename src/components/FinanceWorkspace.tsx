import React, { useState } from 'react';
import { FundManagerWorkspace } from './FundManagerWorkspace';
import { AccountingWorkspace } from './AccountingWorkspace';
import { Wallet, Scale, Landmark, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';

interface FinanceWorkspaceProps {
  funds?: any[];
  fundAllocations?: any[];
  fundHistory?: any[];
  balance?: number;
  trades?: any[];
  onRefresh?: () => void;
}

export const FinanceWorkspace: React.FC<FinanceWorkspaceProps> = React.memo(({
  funds,
  fundAllocations,
  fundHistory,
  balance,
  trades,
  onRefresh
}) => {
  const [activeFinanceTab, setActiveFinanceTab] = useState<'FUND_MANAGER' | 'FINANCIAL_ACCOUNTING'>('FUND_MANAGER');

  return (
    <div className="flex flex-col h-full w-full bg-terminal-bg text-white overflow-hidden">
      {/* Finance Parent Module Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-black/60 border-b border-terminal-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-terminal-amber/15 rounded border border-terminal-amber/30">
            <Landmark className="w-5 h-5 text-terminal-amber" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-white">Finance Domain</span>
              <span className="px-1.5 py-0.5 bg-terminal-amber/20 text-terminal-amber text-[9px] font-mono rounded">ENTERPRISE PARENT</span>
            </div>
            <p className="text-[11px] text-terminal-muted">Unified Capital Governance & Financial Accounting Bounded Contexts</p>
          </div>
        </div>

        {/* Independent Sub-Workspace Switcher */}
        <div className="flex items-center gap-1.5 bg-terminal-panel p-1 border border-terminal-border rounded-sm" role="tablist">
          <button
            role="tab"
            aria-selected={activeFinanceTab === 'FUND_MANAGER'}
            onClick={() => setActiveFinanceTab('FUND_MANAGER')}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-sm transition-all",
              activeFinanceTab === 'FUND_MANAGER'
                ? "bg-terminal-amber text-black shadow-md"
                : "text-terminal-muted hover:text-white hover:bg-white/5"
            )}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Fund Manager</span>
          </button>

          <button
            role="tab"
            aria-selected={activeFinanceTab === 'FINANCIAL_ACCOUNTING'}
            onClick={() => setActiveFinanceTab('FINANCIAL_ACCOUNTING')}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-sm transition-all",
              activeFinanceTab === 'FINANCIAL_ACCOUNTING'
                ? "bg-terminal-amber text-black shadow-md"
                : "text-terminal-muted hover:text-white hover:bg-white/5"
            )}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Financial Accounting</span>
          </button>
        </div>
      </div>

      {/* Workspace Content View */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {activeFinanceTab === 'FUND_MANAGER' && (
          <div className="absolute inset-0 flex flex-col">
            <FundManagerWorkspace
              funds={funds}
              fundAllocations={fundAllocations}
              fundHistory={fundHistory}
              balance={balance}
              onRefresh={onRefresh}
            />
          </div>
        )}

        {activeFinanceTab === 'FINANCIAL_ACCOUNTING' && (
          <div className="absolute inset-0 flex flex-col">
            <AccountingWorkspace
              balance={balance}
              trades={trades}
              onRefresh={onRefresh}
            />
          </div>
        )}
      </div>
    </div>
  );
});

FinanceWorkspace.displayName = 'FinanceWorkspace';
