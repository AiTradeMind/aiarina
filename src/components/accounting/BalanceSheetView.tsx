import React from 'react';
import { DollarSign, Scale, CheckCircle2, AlertTriangle, Download } from 'lucide-react';
import { SectionHeader } from '../ui/Base';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../lib/utils';
import { BalanceSheetStatement } from '../../modules/accounting/types';

interface BalanceSheetViewProps {
  statement: BalanceSheetStatement | null;
  loading: boolean;
  onRefresh: () => void;
}

export const BalanceSheetView: React.FC<BalanceSheetViewProps> = ({
  statement,
  loading,
  onRefresh
}) => {
  const totalAssets = statement?.totalAssets || 0;
  const totalLiabilities = statement?.totalLiabilities || 0;
  const totalEquity = statement?.totalEquity || 0;
  const isBalanced = statement?.isBalanced ?? true;
  const variance = statement?.variance || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeader title="Statement of Financial Position (Balance Sheet)" icon={DollarSign} />
        <Button size="sm" variant="outline" onClick={() => window.print()} className="text-xs flex items-center gap-1.5">
          <Download className="w-3.5 h-3.5" />
          Export Balance Sheet
        </Button>
      </div>

      {/* Accounting Equation Check Banner */}
      <div className={`p-4 rounded border flex items-center justify-between font-mono ${
        isBalanced ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
      }`}>
        <div className="flex items-center gap-3">
          {isBalanced ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
          <div>
            <span className="font-bold text-xs uppercase tracking-wider block">
              {isBalanced ? 'ACCOUNTING EQUATION VERIFIED: ASSETS = LIABILITIES + EQUITY' : 'BALANCE SHEET DISCREPANCY DETECTED'}
            </span>
            <span className="text-[10px] text-gray-300 font-sans">
              {isBalanced 
                ? `Assets (${formatCurrency(totalAssets)}) equal Liabilities + Equity (${formatCurrency(totalLiabilities + totalEquity)}).`
                : `Variance detected: ${formatCurrency(variance)}`}
            </span>
          </div>
        </div>
        <div className="text-right text-xs font-bold">
          <span className="text-terminal-amber block">Total Assets</span>
          <span className="text-white text-base">{formatCurrency(totalAssets)}</span>
        </div>
      </div>

      {/* Assets vs Liabilities & Equity Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assets Column */}
        <div className="bg-terminal-panel border border-terminal-border rounded p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-terminal-border pb-2">
            <span className="text-xs font-bold uppercase text-terminal-green font-mono tracking-wider">
              1. Total Capital Assets
            </span>
            <span className="text-sm font-mono font-bold text-terminal-green">{formatCurrency(totalAssets)}</span>
          </div>

          <div className="space-y-2">
            {(!statement?.assets || statement.assets.length === 0) ? (
              <div className="text-xs text-terminal-muted p-4 text-center">No asset accounts found.</div>
            ) : (
              statement.assets.map(asset => (
                <div key={asset.accountId} className="flex items-center justify-between p-2.5 bg-black/30 rounded border border-white/5 text-xs">
                  <div>
                    <span className="text-terminal-amber font-mono font-bold mr-2">{asset.accountCode}</span>
                    <span className="text-white font-sans">{asset.accountName}</span>
                  </div>
                  <span className="font-mono font-bold text-terminal-green">{formatCurrency(asset.amount)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Liabilities & Equity Column */}
        <div className="space-y-6">
          {/* Liabilities Block */}
          <div className="bg-terminal-panel border border-terminal-border rounded p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-terminal-border pb-2">
              <span className="text-xs font-bold uppercase text-terminal-red font-mono tracking-wider">
                2. Total Liabilities & Payables
              </span>
              <span className="text-sm font-mono font-bold text-terminal-red">{formatCurrency(totalLiabilities)}</span>
            </div>

            <div className="space-y-2">
              {(!statement?.liabilities || statement.liabilities.length === 0) ? (
                <div className="text-xs text-terminal-muted p-2 text-center">No liabilities recorded.</div>
              ) : (
                statement.liabilities.map(liab => (
                  <div key={liab.accountId} className="flex items-center justify-between p-2 bg-black/30 rounded border border-white/5 text-xs">
                    <div>
                      <span className="text-terminal-amber font-mono font-bold mr-2">{liab.accountCode}</span>
                      <span className="text-white font-sans">{liab.accountName}</span>
                    </div>
                    <span className="font-mono font-bold text-terminal-red">{formatCurrency(liab.amount)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Equity Block */}
          <div className="bg-terminal-panel border border-terminal-border rounded p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-terminal-border pb-2">
              <span className="text-xs font-bold uppercase text-terminal-amber font-mono tracking-wider">
                3. Partner Capital & Equity
              </span>
              <span className="text-sm font-mono font-bold text-terminal-amber">{formatCurrency(totalEquity)}</span>
            </div>

            <div className="space-y-2">
              {(!statement?.equity || statement.equity.length === 0) ? (
                <div className="text-xs text-terminal-muted p-2 text-center">No equity accounts recorded.</div>
              ) : (
                statement.equity.map(eqAcc => (
                  <div key={eqAcc.accountId} className="flex items-center justify-between p-2 bg-black/30 rounded border border-white/5 text-xs">
                    <div>
                      <span className="text-terminal-amber font-mono font-bold mr-2">{eqAcc.accountCode}</span>
                      <span className="text-white font-sans">{eqAcc.accountName}</span>
                    </div>
                    <span className="font-mono font-bold text-terminal-amber">{formatCurrency(eqAcc.amount)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
