import React, { useState } from 'react';
import { Calendar, Plus, Lock, Unlock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { SectionHeader } from '../ui/Base';
import { Button } from '../ui/Button';
import { AccountingPeriod, PeriodType } from '../../modules/accounting/types';

interface PeriodsViewProps {
  periods: AccountingPeriod[];
  loading: boolean;
  onCreatePeriod: (req: { periodName: string; periodType: PeriodType; startDate: string; endDate: string }) => Promise<void>;
  onClosePeriod: (periodId: number) => Promise<void>;
}

export const PeriodsView: React.FC<PeriodsViewProps> = ({
  periods,
  loading,
  onCreatePeriod,
  onClosePeriod
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [periodName, setPeriodName] = useState('');
  const [periodType, setPeriodType] = useState<PeriodType>('QUARTERLY');
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [submitting, setSubmitting] = useState(false);
  const [closingId, setClosingId] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await onCreatePeriod({ periodName, periodType, startDate, endDate });
      setIsModalOpen(false);
      setPeriodName('');
    } catch (err: any) {
      alert(`Error creating period: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = async (periodId: number) => {
    if (!confirm('Are you sure you want to close this accounting period? This will verify the Trial Balance and issue a Cryptographic Period Close Certificate.')) return;

    try {
      setClosingId(periodId);
      await onClosePeriod(periodId);
      alert('Accounting Period successfully closed and certificate issued!');
    } catch (err: any) {
      alert(`Period Close Failed: ${err.message}`);
    } finally {
      setClosingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionHeader title="Accounting Fiscal Periods" icon={Calendar} />
        <Button size="sm" onClick={() => setIsModalOpen(true)} className="bg-terminal-amber text-black font-bold hover:bg-terminal-amber/80 flex items-center gap-1.5">
          <Plus className="w-4 h-4" />
          Create Period
        </Button>
      </div>

      {/* Periods Table */}
      <div className="bg-terminal-panel border border-terminal-border rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-black/40 border-b border-terminal-border text-terminal-muted text-[10px] uppercase">
                <th className="p-3">Period Name</th>
                <th className="p-3">Type</th>
                <th className="p-3">Start Date</th>
                <th className="p-3">End Date</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3">Closed Date</th>
                <th className="p-3 text-center">Period Close</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-terminal-border/50">
              {periods.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-terminal-muted">No accounting periods defined.</td>
                </tr>
              ) : (
                periods.map(period => (
                  <tr key={period.id} className="hover:bg-white/5 transition">
                    <td className="p-3 font-bold text-terminal-amber">{period.periodName}</td>
                    <td className="p-3 text-terminal-muted uppercase">{period.periodType}</td>
                    <td className="p-3 text-white">{new Date(period.startDate).toLocaleDateString()}</td>
                    <td className="p-3 text-white">{new Date(period.endDate).toLocaleDateString()}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                        period.status === 'OPEN' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-gray-500/10 text-gray-400 border-gray-500/30'
                      }`}>
                        {period.status}
                      </span>
                    </td>
                    <td className="p-3 text-terminal-muted">
                      {period.closedAt ? new Date(period.closedAt).toLocaleString() : '-'}
                    </td>
                    <td className="p-3 text-center">
                      {period.status === 'OPEN' ? (
                        <Button
                          size="sm"
                          onClick={() => handleClose(period.id)}
                          disabled={closingId === period.id}
                          className="bg-rose-500/20 border border-rose-500/50 text-rose-300 hover:bg-rose-500/30 text-[10px] h-6 px-2 flex items-center gap-1 mx-auto"
                        >
                          <Lock className="w-3 h-3" />
                          {closingId === period.id ? 'Closing...' : 'Close Period'}
                        </Button>
                      ) : (
                        <span className="text-[10px] text-terminal-muted inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-terminal-green" /> Certified
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Period Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-terminal-panel border border-terminal-border rounded-lg max-w-md w-full p-6 space-y-4 text-white font-mono">
            <div className="flex items-center justify-between border-b border-terminal-border pb-3">
              <h3 className="text-sm font-bold uppercase text-terminal-amber flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Create Accounting Period
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-terminal-muted hover:text-white">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs font-sans">
              <div>
                <label className="block text-terminal-muted text-[10px] font-mono uppercase font-bold mb-1">Period Name</label>
                <input 
                  type="text"
                  placeholder="e.g. 2026-Q4"
                  value={periodName}
                  onChange={(e) => setPeriodName(e.target.value)}
                  className="w-full bg-black/60 border border-terminal-border rounded p-2 text-white font-mono focus:border-terminal-amber focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-terminal-muted text-[10px] font-mono uppercase font-bold mb-1">Period Type</label>
                <select 
                  value={periodType}
                  onChange={(e) => setPeriodType(e.target.value as PeriodType)}
                  className="w-full bg-black/60 border border-terminal-border rounded p-2 text-white font-mono focus:border-terminal-amber focus:outline-none"
                >
                  <option value="DAILY">DAILY</option>
                  <option value="MONTHLY">MONTHLY</option>
                  <option value="QUARTERLY">QUARTERLY</option>
                  <option value="YEARLY">YEARLY</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-terminal-muted text-[10px] font-mono uppercase font-bold mb-1">Start Date</label>
                  <input 
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-black/60 border border-terminal-border rounded p-2 text-white font-mono focus:border-terminal-amber focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-terminal-muted text-[10px] font-mono uppercase font-bold mb-1">End Date</label>
                  <input 
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-black/60 border border-terminal-border rounded p-2 text-white font-mono focus:border-terminal-amber focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-terminal-border">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" size="sm" disabled={submitting} className="bg-terminal-amber text-black font-bold hover:bg-terminal-amber/80 font-mono">
                  {submitting ? 'Creating...' : 'Create Period'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
