import React, { useState } from 'react';
import { Book, Plus, Search, Scale, ChevronDown, ChevronRight, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { SectionHeader } from '../ui/Base';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../lib/utils';
import { JournalEntry, ChartOfAccount, TransactionType, PostJournalEntryRequest } from '../../modules/accounting/types';

interface JournalViewProps {
  entries: JournalEntry[];
  accounts: ChartOfAccount[];
  loading: boolean;
  onPostJournal: (req: PostJournalEntryRequest) => Promise<any>;
  onReverseJournal: (id: number, reason: string) => Promise<any>;
}

export const JournalView: React.FC<JournalViewProps> = ({
  entries,
  accounts,
  loading,
  onPostJournal,
  onReverseJournal
}) => {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Modal State for New Entry
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [tradeId, setTradeId] = useState<string>('');
  const [lines, setLines] = useState<Array<{ accountId: number; transactionType: TransactionType; amount: string }>>([
    { accountId: accounts[0]?.id || 1, transactionType: 'DEBIT', amount: '' },
    { accountId: accounts[1]?.id || 2, transactionType: 'CREDIT', amount: '' }
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Reversal Modal
  const [reverseId, setReverseId] = useState<number | null>(null);
  const [reversalReason, setReversalReason] = useState('');
  const [reversing, setReversing] = useState(false);

  const filtered = entries.filter(e => {
    const s = search.toLowerCase();
    return (
      (e.description && e.description.toLowerCase().includes(s)) ||
      (e.entryNumber && e.entryNumber.toLowerCase().includes(s))
    );
  });

  const totalDebitsNew = lines
    .filter(l => l.transactionType === 'DEBIT')
    .reduce((sum, l) => sum + (parseFloat(l.amount) || 0), 0);

  const totalCreditsNew = lines
    .filter(l => l.transactionType === 'CREDIT')
    .reduce((sum, l) => sum + (parseFloat(l.amount) || 0), 0);

  const isNewEntryBalanced = Math.abs(totalDebitsNew - totalCreditsNew) < 0.001 && totalDebitsNew > 0;

  const handleAddLine = () => {
    setLines([...lines, { accountId: accounts[0]?.id || 1, transactionType: 'DEBIT', amount: '' }]);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length <= 2) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleLineChange = (index: number, field: string, value: any) => {
    const updated = [...lines];
    updated[index] = { ...updated[index], [field]: value };
    setLines(updated);
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) {
      setErrorMsg('Description is required.');
      return;
    }
    if (!isNewEntryBalanced) {
      setErrorMsg('Double entry violation: Total Debits must equal Total Credits, and must be greater than zero.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      await onPostJournal({
        description,
        tradeId: tradeId ? parseInt(tradeId, 10) : undefined,
        entries: lines.map(l => ({
          accountId: l.accountId,
          transactionType: l.transactionType,
          amount: parseFloat(l.amount)
        }))
      });
      setIsPostModalOpen(false);
      setDescription('');
      setTradeId('');
      setLines([
        { accountId: accounts[0]?.id || 1, transactionType: 'DEBIT', amount: '' },
        { accountId: accounts[1]?.id || 2, transactionType: 'CREDIT', amount: '' }
      ]);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to post journal entry.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReverseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reverseId) return;

    try {
      setReversing(true);
      await onReverseJournal(reverseId, reversalReason || 'User triggered reversal');
      setReverseId(null);
      setReversalReason('');
    } catch (err: any) {
      alert(`Reversal failed: ${err.message}`);
    } finally {
      setReversing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SectionHeader title="Double Entry Journal Postings" icon={Book} />
        <Button size="sm" onClick={() => setIsPostModalOpen(true)} className="bg-terminal-amber text-black font-bold hover:bg-terminal-amber/80 flex items-center gap-1.5 self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          Post Journal Entry
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-terminal-panel border border-terminal-border p-2.5 rounded flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-terminal-muted" />
          <input 
            type="text"
            placeholder="Search journal entry number or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/50 border border-terminal-border rounded pl-9 pr-3 py-1 text-xs text-white placeholder-terminal-muted focus:outline-none focus:border-terminal-amber font-mono"
          />
        </div>
      </div>

      {/* Journal Entry List */}
      <div className="bg-terminal-panel border border-terminal-border rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-black/40 border-b border-terminal-border text-terminal-muted text-[10px] uppercase">
                <th className="p-3 w-8"></th>
                <th className="p-3">Entry Number</th>
                <th className="p-3">Posting Date</th>
                <th className="p-3">Description</th>
                <th className="p-3 text-right">Total Debit</th>
                <th className="p-3 text-right">Total Credit</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-terminal-border/50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-terminal-muted">
                    No journal entries found matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map(entry => {
                  const isExpanded = expandedId === entry.id;
                  return (
                    <React.Fragment key={entry.id}>
                      <tr className="hover:bg-white/5 transition cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : entry.id)}>
                        <td className="p-3 text-center text-terminal-muted">
                          {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-terminal-amber" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </td>
                        <td className="p-3 font-bold text-terminal-amber">{entry.entryNumber}</td>
                        <td className="p-3 text-terminal-muted">{new Date(entry.entryDate).toLocaleDateString()}</td>
                        <td className="p-3 font-sans text-white max-w-xs truncate">{entry.description}</td>
                        <td className="p-3 text-right font-bold text-terminal-green">{formatCurrency(entry.totalDebit)}</td>
                        <td className="p-3 text-right font-bold text-terminal-green">{formatCurrency(entry.totalCredit)}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                            entry.status === 'POSTED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                            entry.status === 'REVERSED' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                            'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}>
                            {entry.status}
                          </span>
                        </td>
                        <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                          {entry.status === 'POSTED' && (
                            <button
                              onClick={() => setReverseId(entry.id)}
                              title="Reverse Journal Entry"
                              className="px-2 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-[10px] rounded inline-flex items-center gap-1"
                            >
                              <RotateCcw className="w-3 h-3" /> Reversal
                            </button>
                          )}
                        </td>
                      </tr>

                      {/* Line Item Expansion */}
                      {isExpanded && entry.lines && (
                        <tr className="bg-black/60">
                          <td colSpan={8} className="p-4">
                            <div className="bg-terminal-panel border border-terminal-border/60 rounded p-3 space-y-2">
                              <span className="text-[10px] uppercase font-bold text-terminal-amber tracking-wider block">
                                Transaction Line Breakdown
                              </span>
                              <table className="w-full text-left text-xs font-mono border-collapse">
                                <thead>
                                  <tr className="border-b border-terminal-border/40 text-[9px] text-terminal-muted uppercase">
                                    <th className="py-1.5 px-2">Account Code</th>
                                    <th className="py-1.5 px-2">Account Name</th>
                                    <th className="py-1.5 px-2">Type</th>
                                    <th className="py-1.5 px-2 text-right">Debit</th>
                                    <th className="py-1.5 px-2 text-right">Credit</th>
                                    <th className="py-1.5 px-2 text-right">GL Balance After</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {entry.lines.map((line, idx) => (
                                    <tr key={idx} className="border-b border-terminal-border/20">
                                      <td className="py-1.5 px-2 text-terminal-amber">{line.accountCode}</td>
                                      <td className="py-1.5 px-2 text-white font-sans">{line.accountName}</td>
                                      <td className="py-1.5 px-2">
                                        <span className={line.transactionType === 'DEBIT' ? 'text-terminal-green font-bold' : 'text-terminal-blue font-bold'}>
                                          {line.transactionType}
                                        </span>
                                      </td>
                                      <td className="py-1.5 px-2 text-right font-bold">
                                        {line.transactionType === 'DEBIT' ? formatCurrency(line.amount) : '-'}
                                      </td>
                                      <td className="py-1.5 px-2 text-right font-bold">
                                        {line.transactionType === 'CREDIT' ? formatCurrency(line.amount) : '-'}
                                      </td>
                                      <td className="py-1.5 px-2 text-right text-terminal-muted">
                                        {line.balanceAfter !== null && line.balanceAfter !== undefined ? formatCurrency(line.balanceAfter) : '-'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Post Journal Entry Modal */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-terminal-panel border border-terminal-border rounded-lg max-w-2xl w-full p-6 space-y-4 text-white overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-terminal-border pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-terminal-amber flex items-center gap-2">
                <Book className="w-4 h-4" />
                Post New Double Entry Journal
              </h3>
              <button onClick={() => setIsPostModalOpen(false)} className="text-terminal-muted hover:text-white">&times;</button>
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handlePostSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-terminal-muted text-[10px] uppercase font-bold mb-1">Entry Description</label>
                  <input 
                    type="text"
                    placeholder="e.g. Portfolio Realized Profit Posting"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-black/60 border border-terminal-border rounded p-2 text-white focus:border-terminal-amber focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-terminal-muted text-[10px] uppercase font-bold mb-1">Ref Trade ID (Optional)</label>
                  <input 
                    type="text"
                    placeholder="e.g. 101"
                    value={tradeId}
                    onChange={(e) => setTradeId(e.target.value)}
                    className="w-full bg-black/60 border border-terminal-border rounded p-2 text-white font-mono focus:border-terminal-amber focus:outline-none"
                  />
                </div>
              </div>

              {/* Line Items Builder */}
              <div className="space-y-2 border border-terminal-border p-3 rounded bg-black/30">
                <div className="flex items-center justify-between border-b border-terminal-border/50 pb-2">
                  <span className="text-[10px] uppercase font-bold text-terminal-amber">Journal Line Items</span>
                  <button 
                    type="button" 
                    onClick={handleAddLine}
                    className="text-[10px] text-terminal-amber hover:underline flex items-center gap-1 font-mono"
                  >
                    + Add Line Item
                  </button>
                </div>

                {lines.map((line, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center text-xs">
                    <div className="col-span-5">
                      <select 
                        value={line.accountId}
                        onChange={(e) => handleLineChange(idx, 'accountId', parseInt(e.target.value, 10))}
                        className="w-full bg-black/60 border border-terminal-border rounded p-1.5 text-white font-mono text-[11px]"
                      >
                        {accounts.map(acc => (
                          <option key={acc.id} value={acc.id}>
                            {acc.accountCode} - {acc.accountName} ({acc.accountType})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-3">
                      <select 
                        value={line.transactionType}
                        onChange={(e) => handleLineChange(idx, 'transactionType', e.target.value as TransactionType)}
                        className="w-full bg-black/60 border border-terminal-border rounded p-1.5 text-white font-mono text-[11px]"
                      >
                        <option value="DEBIT">DEBIT</option>
                        <option value="CREDIT">CREDIT</option>
                      </select>
                    </div>

                    <div className="col-span-3">
                      <input 
                        type="number"
                        step="0.01"
                        placeholder="Amount"
                        value={line.amount}
                        onChange={(e) => handleLineChange(idx, 'amount', e.target.value)}
                        className="w-full bg-black/60 border border-terminal-border rounded p-1.5 text-white font-mono text-[11px]"
                        required
                      />
                    </div>

                    <div className="col-span-1 text-center">
                      {lines.length > 2 && (
                        <button type="button" onClick={() => handleRemoveLine(idx)} className="text-rose-400 hover:text-rose-300 font-bold text-sm">&times;</button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Double Entry Balance Verification Banner */}
                <div className={`p-2.5 rounded border mt-3 flex items-center justify-between text-xs font-mono ${
                  isNewEntryBalanced ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                }`}>
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4" />
                    <span>Debits: <strong>{formatCurrency(totalDebitsNew)}</strong> | Credits: <strong>{formatCurrency(totalCreditsNew)}</strong></span>
                  </div>
                  <div>
                    {isNewEntryBalanced ? (
                      <span className="flex items-center gap-1 font-bold text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" /> BALANCED
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 font-bold text-amber-400">
                        <AlertTriangle className="w-4 h-4" /> UNBALANCED (Diff: {formatCurrency(Math.abs(totalDebitsNew - totalCreditsNew))})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-terminal-border">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsPostModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting || !isNewEntryBalanced} className="bg-terminal-amber text-black font-bold hover:bg-terminal-amber/80">
                  {submitting ? 'Posting...' : 'Post Journal Entry'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reverse Entry Modal */}
      {reverseId && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-terminal-panel border border-terminal-border rounded-lg max-w-md w-full p-6 space-y-4 text-white">
            <h3 className="text-sm font-bold uppercase text-rose-400 flex items-center gap-2">
              <RotateCcw className="w-4 h-4" /> Reversal Confirmation
            </h3>
            <p className="text-xs text-gray-300">
              Reversing Journal Entry ID <strong>#{reverseId}</strong> will post a counter-balancing journal entry swapping all DEBITs and CREDITs.
            </p>
            <form onSubmit={handleReverseSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-terminal-muted text-[10px] uppercase font-bold mb-1">Reason for Reversal</label>
                <input 
                  type="text"
                  placeholder="e.g. Duplicate posting correction"
                  value={reversalReason}
                  onChange={(e) => setReversalReason(e.target.value)}
                  className="w-full bg-black/60 border border-terminal-border rounded p-2 text-white focus:border-terminal-amber focus:outline-none"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setReverseId(null)}>Cancel</Button>
                <Button type="submit" size="sm" disabled={reversing} className="bg-rose-500 text-white font-bold hover:bg-rose-600">
                  {reversing ? 'Reversing...' : 'Confirm Reversal'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
