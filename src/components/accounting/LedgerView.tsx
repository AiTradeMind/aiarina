import React, { useState, useEffect } from 'react';
import { Book, Search, Filter } from 'lucide-react';
import { SectionHeader } from '../ui/Base';
import { formatCurrency } from '../../lib/utils';
import { GeneralLedgerAccount, ChartOfAccount } from '../../modules/accounting/types';

interface LedgerViewProps {
  ledgerAccounts: GeneralLedgerAccount[];
  accounts: ChartOfAccount[];
  loading: boolean;
  onFetchAccountLedger: (accountId: number) => Promise<any>;
}

export const LedgerView: React.FC<LedgerViewProps> = ({
  ledgerAccounts,
  accounts,
  loading,
  onFetchAccountLedger
}) => {
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [accountDetails, setAccountDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (selectedAccountId) {
      setLoadingDetails(true);
      onFetchAccountLedger(selectedAccountId)
        .then(res => setAccountDetails(res))
        .catch(err => console.error('Failed to load ledger details:', err))
        .finally(() => setLoadingDetails(false));
    } else {
      setAccountDetails(null);
    }
  }, [selectedAccountId]);

  const filtered = ledgerAccounts.filter(gl => {
    const s = search.toLowerCase();
    return gl.accountCode.toLowerCase().includes(s) || gl.accountName.toLowerCase().includes(s);
  });

  return (
    <div className="space-y-4">
      <SectionHeader title="General Ledger Accounts & Running Balances" icon={Book} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Accounts List */}
        <div className="space-y-3">
          <div className="bg-terminal-panel border border-terminal-border p-2.5 rounded flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-terminal-muted" />
            <input 
              type="text"
              placeholder="Filter account code/name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-xs text-white placeholder-terminal-muted focus:outline-none font-mono"
            />
          </div>

          <div className="bg-terminal-panel border border-terminal-border rounded overflow-y-auto max-h-[600px] divide-y divide-terminal-border/50">
            {filtered.length === 0 ? (
              <div className="p-4 text-center text-terminal-muted text-xs">No general ledger accounts found.</div>
            ) : (
              filtered.map(gl => {
                const isSelected = selectedAccountId === gl.accountId;
                return (
                  <button
                    key={gl.id}
                    onClick={() => setSelectedAccountId(gl.accountId)}
                    className={`w-full p-3 text-left transition flex items-center justify-between ${
                      isSelected ? 'bg-terminal-amber/10 border-l-2 border-terminal-amber font-bold' : 'hover:bg-white/5'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-terminal-amber font-mono">{gl.accountCode}</div>
                      <div className="text-xs text-white font-sans">{gl.accountName}</div>
                      <div className="text-[9px] text-terminal-muted uppercase">{gl.accountType}</div>
                    </div>
                    <div className="text-right font-mono text-xs font-bold text-white">
                      {formatCurrency(gl.currentBalance)}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detailed Account Ledger Transactions */}
        <div className="lg:col-span-2">
          {selectedAccountId ? (
            <div className="bg-terminal-panel border border-terminal-border rounded p-4 space-y-4">
              {loadingDetails ? (
                <div className="p-8 text-center text-terminal-muted text-xs animate-pulse">Loading General Ledger transaction history...</div>
              ) : accountDetails ? (
                <>
                  <div className="flex items-center justify-between border-b border-terminal-border pb-3">
                    <div>
                      <span className="text-xs font-bold text-terminal-amber font-mono">{accountDetails.account?.accountCode}</span>
                      <h3 className="text-sm font-bold text-white">{accountDetails.account?.accountName}</h3>
                      <span className="text-[10px] text-terminal-muted uppercase">{accountDetails.account?.accountType} Account</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-terminal-muted uppercase block">Current Running GL Balance</span>
                      <span className="text-lg font-mono font-bold text-terminal-green">
                        {formatCurrency(accountDetails.currentBalance || 0)}
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs font-mono">
                      <thead>
                        <tr className="bg-black/40 border-b border-terminal-border text-terminal-muted text-[10px] uppercase">
                          <th className="p-2">Date</th>
                          <th className="p-2">Journal Ref</th>
                          <th className="p-2">Type</th>
                          <th className="p-2 text-right">Amount</th>
                          <th className="p-2 text-right">Balance After</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-terminal-border/40">
                        {(!accountDetails.transactions || accountDetails.transactions.length === 0) ? (
                          <tr>
                            <td colSpan={5} className="p-6 text-center text-terminal-muted">No transaction history recorded for this account.</td>
                          </tr>
                        ) : (
                          accountDetails.transactions.map((tx: any) => (
                            <tr key={tx.id} className="hover:bg-white/5">
                              <td className="p-2 text-terminal-muted">{new Date(tx.transactionDate).toLocaleDateString()}</td>
                              <td className="p-2">
                                <div className="text-terminal-amber font-bold">{tx.journalEntryNumber}</div>
                                <div className="text-[10px] text-gray-400 font-sans truncate max-w-xs">{tx.journalDescription}</div>
                              </td>
                              <td className="p-2">
                                <span className={tx.transactionType === 'DEBIT' ? 'text-terminal-green font-bold' : 'text-terminal-blue font-bold'}>
                                  {tx.transactionType}
                                </span>
                              </td>
                              <td className="p-2 text-right font-bold text-white">{formatCurrency(tx.amount)}</td>
                              <td className="p-2 text-right font-bold text-terminal-green">
                                {tx.balanceAfter !== null ? formatCurrency(tx.balanceAfter) : '-'}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : null}
            </div>
          ) : (
            <div className="bg-terminal-panel border border-terminal-border rounded p-12 text-center text-terminal-muted text-xs">
              Select a General Ledger account on the left to inspect detailed transaction lines and running balance progression.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
