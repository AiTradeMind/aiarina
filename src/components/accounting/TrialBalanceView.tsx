import React from 'react';
import { Scale, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { SectionHeader } from '../ui/Base';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../lib/utils';
import { TrialBalanceResult } from '../../modules/accounting/types';

interface TrialBalanceViewProps {
  trialBalance: TrialBalanceResult | null;
  loading: boolean;
  onRefresh: () => void;
}

export const TrialBalanceView: React.FC<TrialBalanceViewProps> = ({
  trialBalance,
  loading,
  onRefresh
}) => {
  const isBalanced = trialBalance?.isBalanced ?? true;
  const totalDebit = trialBalance?.totalDebit ?? 0;
  const totalCredit = trialBalance?.totalCredit ?? 0;
  const variance = trialBalance?.variance ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionHeader title="Double Entry Trial Balance Engine" icon={Scale} />
        <Button variant="outline" size="sm" onClick={onRefresh} className="text-xs flex items-center gap-1">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Recalculate
        </Button>
      </div>

      {/* Trial Balance Status Banner */}
      <div className={`p-4 rounded border flex flex-col sm:flex-row items-center justify-between gap-4 font-mono ${
        isBalanced ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
      }`}>
        <div className="flex items-center gap-3">
          {isBalanced ? <CheckCircle2 className="w-6 h-6 shrink-0" /> : <AlertTriangle className="w-6 h-6 shrink-0" />}
          <div>
            <div className="font-bold text-sm tracking-wider uppercase">
              {isBalanced ? 'DOUBLE ENTRY STATUS: BALANCED' : 'DOUBLE ENTRY STATUS: UNBALANCED VIOLATION'}
            </div>
            <div className="text-xs text-gray-300 font-sans mt-0.5">
              {isBalanced 
                ? 'All General Ledger account debit balances perfectly equal credit balances.' 
                : `Variance detected between total debits and total credits: ${formatCurrency(variance)}`}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs font-mono text-right shrink-0">
          <div>
            <span className="text-[10px] text-terminal-muted block uppercase">Total Debit Balances</span>
            <span className="font-bold text-white text-sm">{formatCurrency(totalDebit)}</span>
          </div>
          <div>
            <span className="text-[10px] text-terminal-muted block uppercase">Total Credit Balances</span>
            <span className="font-bold text-white text-sm">{formatCurrency(totalCredit)}</span>
          </div>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-terminal-panel border border-terminal-border rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-black/40 border-b border-terminal-border text-terminal-muted text-[10px] uppercase">
                <th className="p-3">Account Code</th>
                <th className="p-3">Account Name</th>
                <th className="p-3">Account Type</th>
                <th className="p-3 text-right">Debit Balance ($)</th>
                <th className="p-3 text-right">Credit Balance ($)</th>
                <th className="p-3 text-right">Net Position</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-terminal-border/50">
              {(!trialBalance?.accounts || trialBalance.accounts.length === 0) ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-terminal-muted">No accounts available in trial balance.</td>
                </tr>
              ) : (
                trialBalance.accounts.map(acc => (
                  <tr key={acc.accountId} className="hover:bg-white/5 transition">
                    <td className="p-3 font-bold text-terminal-amber">{acc.accountCode}</td>
                    <td className="p-3 font-sans text-white font-medium">{acc.accountName}</td>
                    <td className="p-3 text-terminal-muted uppercase text-[10px]">{acc.accountType}</td>
                    <td className="p-3 text-right font-bold text-white">
                      {acc.debitBalance > 0 ? formatCurrency(acc.debitBalance) : '-'}
                    </td>
                    <td className="p-3 text-right font-bold text-white">
                      {acc.creditBalance > 0 ? formatCurrency(acc.creditBalance) : '-'}
                    </td>
                    <td className="p-3 text-right font-bold text-terminal-green">
                      {formatCurrency(acc.netBalance)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="bg-black/80 font-bold border-t-2 border-terminal-border text-white text-xs">
                <td colSpan={3} className="p-3 uppercase font-mono tracking-wider text-terminal-amber">
                  Grand Total
                </td>
                <td className="p-3 text-right font-mono text-terminal-green">
                  {formatCurrency(totalDebit)}
                </td>
                <td className="p-3 text-right font-mono text-terminal-green">
                  {formatCurrency(totalCredit)}
                </td>
                <td className="p-3 text-right font-mono text-terminal-amber">
                  {formatCurrency(0)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
