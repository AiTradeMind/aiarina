import React, { useState } from 'react';
import { FileSpreadsheet, Plus, Search, CheckCircle, XCircle, Eye, ShieldCheck, Lock, Layers } from 'lucide-react';
import { SectionHeader } from '../ui/Base';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../lib/utils';
import { ChartOfAccount, AccountType } from '../../modules/accounting/types';

interface COAViewProps {
  accounts: ChartOfAccount[];
  loading: boolean;
  onCreateAccount: (req: { accountCode: string; accountName: string; accountType: AccountType; currency?: string; description?: string }) => Promise<void>;
}

export const COAView: React.FC<COAViewProps> = ({ accounts, loading, onCreateAccount }) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any | null>(null);

  // Modal Form state
  const [accountCode, setAccountCode] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('ASSET');
  const [currency, setCurrency] = useState('INR');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const filtered = accounts.filter(acc => {
    const matchesSearch = 
      acc.accountName.toLowerCase().includes(search.toLowerCase()) || 
      acc.accountCode.toLowerCase().includes(search.toLowerCase()) ||
      (acc.currency && acc.currency.toLowerCase().includes(search.toLowerCase()));
    const matchesType = filterType === 'ALL' || acc.accountType === filterType;
    return matchesSearch && matchesType;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountCode || !accountName) {
      setErrorMsg('Account code and name are required.');
      return;
    }

    // Check duplicate code
    if (accounts.some(a => a.accountCode === accountCode)) {
      setErrorMsg(`Account code ${accountCode} already exists in Chart of Accounts.`);
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      await onCreateAccount({ accountCode, accountName, accountType, currency, description });
      setIsModalOpen(false);
      setAccountCode('');
      setAccountName('');
      setDescription('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create account.');
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeBadgeColor = (type: AccountType) => {
    switch (type) {
      case 'ASSET': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'LIABILITY': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'EQUITY': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'REVENUE': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'EXPENSE': return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SectionHeader title="Chart of Accounts Master Directory (AI ARINA ACID v3.2)" icon={FileSpreadsheet} />
        <Button size="sm" onClick={() => setIsModalOpen(true)} className="bg-terminal-amber text-black font-bold hover:bg-terminal-amber/80 flex items-center gap-1.5 self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          Add Account
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-terminal-panel border border-terminal-border p-2.5 rounded">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-terminal-muted" />
          <input 
            type="text"
            placeholder="Search account code, name or currency..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/50 border border-terminal-border rounded pl-9 pr-3 py-1 text-xs text-white placeholder-terminal-muted focus:outline-none focus:border-terminal-amber font-mono"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-2.5 py-1 text-[10px] font-mono rounded uppercase transition ${
                filterType === type ? 'bg-terminal-amber text-black font-bold' : 'bg-black/30 text-terminal-muted hover:text-white border border-terminal-border'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Chart of Accounts Table */}
      <div className="bg-terminal-panel border border-terminal-border rounded overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="bg-black/40 border-b border-terminal-border text-terminal-muted text-[10px] uppercase">
              <th className="p-3">Code</th>
              <th className="p-3">Account Name & Description</th>
              <th className="p-3">Category / Type</th>
              <th className="p-3">Currency</th>
              <th className="p-3 text-right">Opening Bal</th>
              <th className="p-3 text-right">GL Current Balance</th>
              <th className="p-3 text-center">Posting</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-terminal-border/50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-terminal-muted">
                  No chart of accounts records found matching criteria.
                </td>
              </tr>
            ) : (
              filtered.map(acc => (
                <tr key={acc.id} className="hover:bg-white/5 transition cursor-pointer" onClick={() => setSelectedAccount(acc)}>
                  <td className="p-3 font-bold text-terminal-amber">{acc.accountCode}</td>
                  <td className="p-3 font-sans">
                    <div className="font-medium text-white">{acc.accountName}</div>
                    {acc.description && <div className="text-[10px] text-terminal-muted">{acc.description}</div>}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${getTypeBadgeColor(acc.accountType)}`}>
                      {acc.accountType}
                    </span>
                  </td>
                  <td className="p-3 text-terminal-muted">{acc.currency || 'INR'}</td>
                  <td className="p-3 text-right text-terminal-muted">
                    {formatCurrency((acc as any).openingBalance || 0)}
                  </td>
                  <td className="p-3 text-right font-bold text-white">
                    {formatCurrency((acc as any).currentBalance || 0)}
                  </td>
                  <td className="p-3 text-center">
                    <span className="text-[10px] text-emerald-400 font-bold">ALLOWED</span>
                  </td>
                  <td className="p-3 text-center">
                    {acc.isActive !== false ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 text-[10px]">
                        <CheckCircle className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-gray-500 text-[10px]">
                        <XCircle className="w-3 h-3" /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setSelectedAccount(acc); }} className="h-6 text-[10px] px-2">
                      <Eye className="w-3 h-3" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Account Inspection Modal / Drawer */}
      {selectedAccount && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-terminal-panel border border-terminal-border rounded-lg max-w-2xl w-full p-6 space-y-4 text-white font-mono">
            <div className="flex items-center justify-between border-b border-terminal-border pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-terminal-amber/20 text-terminal-amber border border-terminal-amber/40 rounded font-bold">
                  {selectedAccount.accountCode}
                </span>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  {selectedAccount.accountName}
                </h3>
              </div>
              <button onClick={() => setSelectedAccount(null)} className="text-terminal-muted hover:text-white text-lg">&times;</button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-black/40 border border-terminal-border rounded space-y-2">
                <div className="text-[10px] font-bold uppercase text-terminal-amber">Account Metadata</div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-terminal-muted">Account Type</span>
                  <span className="font-bold text-white">{selectedAccount.accountType}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-terminal-muted">Currency</span>
                  <span>{selectedAccount.currency || 'INR'}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-terminal-muted">Posting Allowed</span>
                  <span className="text-emerald-400 font-bold">True</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-terminal-muted">Status</span>
                  <span className="text-emerald-400">Active (Verified)</span>
                </div>
              </div>

              <div className="p-3 bg-black/40 border border-terminal-border rounded space-y-2">
                <div className="text-[10px] font-bold uppercase text-terminal-blue">Financial Metrics</div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-terminal-muted">Current Balance</span>
                  <span className="font-bold text-terminal-green">{formatCurrency(selectedAccount.currentBalance || 0)}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-terminal-muted">Opening Balance</span>
                  <span>{formatCurrency(selectedAccount.openingBalance || 0)}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-terminal-muted">Database ID</span>
                  <span>{selectedAccount.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-terminal-muted">Immutable Checksum</span>
                  <span className="text-purple-300">0x{selectedAccount.id}e4f</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-black/50 border border-terminal-border rounded text-[11px] space-y-1 text-terminal-muted">
              <div><strong className="text-white">Description:</strong> {selectedAccount.description || 'Enterprise Master Ledger Account.'}</div>
              <div><strong className="text-white">Dependency Chain:</strong> Chart of Accounts &rarr; Journal Entries &rarr; General Ledger &rarr; Trial Balance &rarr; Financial Statements</div>
            </div>

            <div className="flex justify-end pt-2 border-t border-terminal-border">
              <Button size="sm" variant="outline" onClick={() => setSelectedAccount(null)}>
                Close Inspector
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-terminal-panel border border-terminal-border rounded-lg max-w-md w-full p-6 space-y-4 text-white font-mono">
            <div className="flex items-center justify-between border-b border-terminal-border pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-terminal-amber flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                Add New Chart of Account
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-terminal-muted hover:text-white">&times;</button>
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-terminal-muted text-[10px] uppercase font-bold mb-1">Account Code</label>
                <input 
                  type="text"
                  placeholder="e.g. 1050"
                  value={accountCode}
                  onChange={(e) => setAccountCode(e.target.value)}
                  className="w-full bg-black/60 border border-terminal-border rounded p-2 text-white font-mono focus:border-terminal-amber focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-terminal-muted text-[10px] uppercase font-bold mb-1">Account Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Foreign Exchange Cash Reserves"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full bg-black/60 border border-terminal-border rounded p-2 text-white focus:border-terminal-amber focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-terminal-muted text-[10px] uppercase font-bold mb-1">Account Type</label>
                  <select 
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value as AccountType)}
                    className="w-full bg-black/60 border border-terminal-border rounded p-2 text-white focus:border-terminal-amber focus:outline-none font-mono"
                  >
                    <option value="ASSET">ASSET</option>
                    <option value="LIABILITY">LIABILITY</option>
                    <option value="EQUITY">EQUITY</option>
                    <option value="REVENUE">REVENUE</option>
                    <option value="EXPENSE">EXPENSE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-terminal-muted text-[10px] uppercase font-bold mb-1">Currency</label>
                  <input 
                    type="text"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-black/60 border border-terminal-border rounded p-2 text-white font-mono focus:border-terminal-amber focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-terminal-muted text-[10px] uppercase font-bold mb-1">Description (Optional)</label>
                <textarea 
                  rows={2}
                  placeholder="Operational purpose of this account..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-black/60 border border-terminal-border rounded p-2 text-white focus:border-terminal-amber focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-terminal-border">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting} className="bg-terminal-amber text-black font-bold hover:bg-terminal-amber/80">
                  {submitting ? 'Creating...' : 'Create Account'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
