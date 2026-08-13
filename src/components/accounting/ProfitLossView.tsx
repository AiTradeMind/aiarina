import React from 'react';
import { PieChart, TrendingUp, TrendingDown, DollarSign, Download } from 'lucide-react';
import { SectionHeader } from '../ui/Base';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../lib/utils';
import { ProfitLossStatement } from '../../modules/accounting/types';

interface ProfitLossViewProps {
  statement: ProfitLossStatement | null;
  loading: boolean;
  onRefresh: () => void;
}

export const ProfitLossView: React.FC<ProfitLossViewProps> = ({
  statement,
  loading,
  onRefresh
}) => {
  const totalRevenue = statement?.totalRevenue || 0;
  const totalExpense = statement?.totalExpense || 0;
  const netIncome = statement?.netIncome || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeader title="Profit & Loss Statement (Income Statement)" icon={PieChart} />
        <Button size="sm" variant="outline" onClick={() => window.print()} className="text-xs flex items-center gap-1.5">
          <Download className="w-3.5 h-3.5" />
          Export Statement
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-terminal-panel border border-terminal-border rounded p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-terminal-muted uppercase font-mono block">Total Trading Revenue</span>
            <span className="text-xl font-mono font-bold text-terminal-green mt-1 block">{formatCurrency(totalRevenue)}</span>
          </div>
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-terminal-panel border border-terminal-border rounded p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-terminal-muted uppercase font-mono block">Total Operating Expenses</span>
            <span className="text-xl font-mono font-bold text-terminal-red mt-1 block">{formatCurrency(totalExpense)}</span>
          </div>
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded text-rose-400">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-terminal-panel border border-terminal-border rounded p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-terminal-muted uppercase font-mono block">Fiscal Period Net Income</span>
            <span className={`text-xl font-mono font-bold mt-1 block ${netIncome >= 0 ? 'text-terminal-green' : 'text-terminal-red'}`}>
              {formatCurrency(netIncome)}
            </span>
          </div>
          <div className="p-2.5 bg-terminal-amber/10 border border-terminal-amber/30 rounded text-terminal-amber">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Detailed Revenue & Expense Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Accounts */}
        <div className="bg-terminal-panel border border-terminal-border rounded p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-terminal-border pb-2">
            <span className="text-xs font-bold uppercase text-terminal-green font-mono tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              1. Trading Revenues & Income
            </span>
            <span className="text-xs font-mono font-bold text-terminal-green">{formatCurrency(totalRevenue)}</span>
          </div>

          <div className="space-y-2">
            {(!statement?.revenues || statement.revenues.length === 0) ? (
              <div className="text-xs text-terminal-muted p-4 text-center">No revenue items recorded.</div>
            ) : (
              statement.revenues.map(rev => (
                <div key={rev.accountId} className="flex items-center justify-between p-2.5 bg-black/30 rounded border border-white/5 text-xs">
                  <div>
                    <span className="text-terminal-amber font-mono font-bold mr-2">{rev.accountCode}</span>
                    <span className="text-white font-sans">{rev.accountName}</span>
                  </div>
                  <span className="font-mono font-bold text-terminal-green">{formatCurrency(rev.amount)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Expense Accounts */}
        <div className="bg-terminal-panel border border-terminal-border rounded p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-terminal-border pb-2">
            <span className="text-xs font-bold uppercase text-terminal-red font-mono tracking-wider flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              2. Operating & Clearing Expenses
            </span>
            <span className="text-xs font-mono font-bold text-terminal-red">{formatCurrency(totalExpense)}</span>
          </div>

          <div className="space-y-2">
            {(!statement?.expenses || statement.expenses.length === 0) ? (
              <div className="text-xs text-terminal-muted p-4 text-center">No expense items recorded.</div>
            ) : (
              statement.expenses.map(exp => (
                <div key={exp.accountId} className="flex items-center justify-between p-2.5 bg-black/30 rounded border border-white/5 text-xs">
                  <div>
                    <span className="text-terminal-amber font-mono font-bold mr-2">{exp.accountCode}</span>
                    <span className="text-white font-sans">{exp.accountName}</span>
                  </div>
                  <span className="font-mono font-bold text-terminal-red">{formatCurrency(exp.amount)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Net Income Summary Block */}
      <div className="bg-terminal-panel border border-terminal-border rounded p-4 flex items-center justify-between font-mono">
        <div>
          <span className="text-xs uppercase font-bold text-terminal-amber block">Net Profit / (Loss) Transferred to Retained Earnings</span>
          <span className="text-[10px] text-terminal-muted">Calculated as Total Trading Revenue minus Total Operating Expenses</span>
        </div>
        <div className={`text-2xl font-bold ${netIncome >= 0 ? 'text-terminal-green' : 'text-terminal-red'}`}>
          {formatCurrency(netIncome)}
        </div>
      </div>
    </div>
  );
};
