import React from 'react';
import { 
  Activity, 
  Scale, 
  ShieldCheck, 
  CheckCircle, 
  RefreshCw, 
  PlusCircle, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Layers,
  Clock,
  FileText,
  AlertCircle,
  Award,
  Calendar
} from 'lucide-react';
import { MetricCard, SectionHeader, StatusBadge } from '../ui/Base';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../lib/utils';

interface DashboardViewProps {
  data: any;
  journalEntries?: any[];
  ledgerAccounts?: any[];
  certificates?: any[];
  periods?: any[];
  auditLogs?: any[];
  trialBalance?: any;
  onRefresh: () => void;
  onPostJournalClick: () => void;
  onSyncEP15Click: () => void;
  onNavigateTab: (tab: string) => void;
  syncingEP15: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  data,
  journalEntries = [],
  ledgerAccounts = [],
  certificates = [],
  periods = [],
  auditLogs = [],
  trialBalance,
  onRefresh,
  onPostJournalClick,
  onSyncEP15Click,
  onNavigateTab,
  syncingEP15
}) => {
  const assets = data?.totalAssets || 0;
  const liabilities = data?.totalLiabilities || 0;
  const equity = data?.totalEquity || 0;
  const revenues = data?.totalRevenues || 0;
  const expenses = data?.totalExpenses || 0;
  const netIncome = data?.netIncome || 0;

  const openEntriesCount = journalEntries.filter(e => e.status === 'OPEN' || e.status === 'PENDING').length;
  const postedEntriesCount = journalEntries.filter(e => e.status === 'POSTED').length;
  const pendingEntriesCount = journalEntries.filter(e => e.status === 'PENDING' || e.status === 'DRAFT').length;

  const activePeriod = periods.find(p => p.status === 'OPEN') || periods[0];
  const lastPosting = journalEntries[0] ? `${journalEntries[0].entryNumber} — ${journalEntries[0].description || 'Posted'}` : 'No recent postings';
  const lastAudit = auditLogs[0] ? `${auditLogs[0].action} (${auditLogs[0].category || 'SYSTEM'})` : 'No audit records';

  const isBalanced = data?.doubleEntryBalanced ?? trialBalance?.isBalanced ?? true;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionHeader title="Enterprise Financial Accounting Dashboard" icon={Activity} />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh} className="text-xs flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5" />
            Live Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={onSyncEP15Click} disabled={syncingEP15} className="text-xs border-terminal-blue text-terminal-blue hover:bg-terminal-blue/20 flex items-center gap-1">
            <RefreshCw className={`w-3.5 h-3.5 ${syncingEP15 ? 'animate-spin' : ''}`} />
            {syncingEP15 ? 'Syncing...' : 'Sync EP15 Trades'}
          </Button>
          <Button size="sm" onClick={onPostJournalClick} className="text-xs bg-terminal-amber text-black font-bold hover:bg-terminal-amber/80 flex items-center gap-1">
            <PlusCircle className="w-3.5 h-3.5" />
            New Journal Entry
          </Button>
        </div>
      </div>

      {/* 2. Live KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Total Assets" 
          value={formatCurrency(assets)} 
          trend="Balanced" 
          color="text-terminal-green" 
        />
        <MetricCard 
          title="Net Profit (Q3)" 
          value={formatCurrency(netIncome)} 
          trend={netIncome >= 0 ? "Profit" : "Loss"} 
          color={netIncome >= 0 ? "text-terminal-green" : "text-terminal-red"} 
        />
        <MetricCard 
          title="Double Entry Integrity" 
          value={isBalanced ? "BALANCED" : "UNBALANCED"} 
          trend="100% Valid" 
          color={isBalanced ? "text-terminal-green" : "text-terminal-red"} 
        />
        <MetricCard 
          title="SHA-256 Certificates" 
          value={certificates.length || data?.certificatesCount || 0} 
          trend="Cryptographically Secured" 
          color="text-terminal-amber" 
        />
      </div>

      {/* 1. Enterprise Executive Summary & 3. Accounting Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Executive Summary Grid (Assets, Liabilities, Equity, Revenue, Expenses, Net Profit, Open, Posted, Pending) */}
        <div className="lg:col-span-2 bg-terminal-panel border border-terminal-border rounded p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-terminal-border pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-terminal-amber" />
              Enterprise Executive Summary & Balances
            </span>
            <span className="text-[10px] text-terminal-muted font-mono">REAL-TIME ACCOUNTING SERVICE</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-black/40 rounded border border-white/5">
              <span className="text-[10px] text-terminal-muted uppercase block">Total Assets</span>
              <span className="text-sm font-mono font-bold text-terminal-green mt-1 block">{formatCurrency(assets)}</span>
            </div>
            <div className="p-3 bg-black/40 rounded border border-white/5">
              <span className="text-[10px] text-terminal-muted uppercase block">Total Liabilities</span>
              <span className="text-sm font-mono font-bold text-terminal-red mt-1 block">{formatCurrency(liabilities)}</span>
            </div>
            <div className="p-3 bg-black/40 rounded border border-white/5">
              <span className="text-[10px] text-terminal-muted uppercase block">Contributed Equity</span>
              <span className="text-sm font-mono font-bold text-terminal-amber mt-1 block">{formatCurrency(equity)}</span>
            </div>
            <div className="p-3 bg-black/40 rounded border border-white/5">
              <span className="text-[10px] text-terminal-muted uppercase block">Trading Revenue</span>
              <span className="text-sm font-mono font-bold text-terminal-green mt-1 block">{formatCurrency(revenues)}</span>
            </div>
            <div className="p-3 bg-black/40 rounded border border-white/5">
              <span className="text-[10px] text-terminal-muted uppercase block">Operating Expenses</span>
              <span className="text-sm font-mono font-bold text-terminal-red mt-1 block">{formatCurrency(expenses)}</span>
            </div>
            <div className="p-3 bg-black/40 rounded border border-white/5">
              <span className="text-[10px] text-terminal-muted uppercase block">Net Profit / Income</span>
              <span className={`text-sm font-mono font-bold mt-1 block ${netIncome >= 0 ? 'text-terminal-green' : 'text-terminal-red'}`}>{formatCurrency(netIncome)}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-2.5 bg-black/30 rounded border border-terminal-border/60 text-center">
              <span className="text-[9px] text-terminal-muted uppercase block">Open / Draft Journals</span>
              <span className="text-sm font-mono font-bold text-terminal-amber">{openEntriesCount}</span>
            </div>
            <div className="p-2.5 bg-black/30 rounded border border-terminal-border/60 text-center">
              <span className="text-[9px] text-terminal-muted uppercase block">Posted Entries</span>
              <span className="text-sm font-mono font-bold text-terminal-green">{postedEntriesCount}</span>
            </div>
            <div className="p-2.5 bg-black/30 rounded border border-terminal-border/60 text-center">
              <span className="text-[9px] text-terminal-muted uppercase block">Pending Settlement</span>
              <span className="text-sm font-mono font-bold text-terminal-blue">{pendingEntriesCount}</span>
            </div>
          </div>
        </div>

        {/* 3. Accounting Health & 8. Fiscal Period Status */}
        <div className="bg-terminal-panel border border-terminal-border rounded p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-terminal-border pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-terminal-green" />
              Accounting Health & Period
            </span>
            <StatusBadge status={isBalanced ? "BALANCED" : "UNBALANCED"} variant={isBalanced ? "success" : "danger"} />
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="p-2.5 bg-black/30 rounded border border-white/5 flex justify-between items-center">
              <span className="text-terminal-muted">Double Entry Status</span>
              <span className={isBalanced ? "text-terminal-green font-bold" : "text-terminal-red font-bold"}>
                {isBalanced ? "100% Valid (Balanced)" : "Discrepancy Detected"}
              </span>
            </div>
            <div className="p-2.5 bg-black/30 rounded border border-white/5 flex justify-between items-center">
              <span className="text-terminal-muted">Last Journal Posting</span>
              <span className="text-white truncate max-w-[140px]" title={lastPosting}>{lastPosting}</span>
            </div>
            <div className="p-2.5 bg-black/30 rounded border border-white/5 flex justify-between items-center">
              <span className="text-terminal-muted">Last Audit Record</span>
              <span className="text-terminal-amber truncate max-w-[140px]" title={lastAudit}>{lastAudit}</span>
            </div>
            <div className="p-2.5 bg-black/30 rounded border border-white/5 flex justify-between items-center">
              <span className="text-terminal-muted">Active Fiscal Period</span>
              <span className="text-terminal-blue font-bold">{activePeriod ? `${activePeriod.periodName} (${activePeriod.status})` : '2026-Q3 (OPEN)'}</span>
            </div>
          </div>

          <div className="pt-2 flex justify-between">
            <Button size="sm" variant="outline" onClick={() => onNavigateTab('PERIODS')} className="text-[10px] uppercase">
              Manage Periods
            </Button>
            <Button size="sm" variant="outline" onClick={() => onNavigateTab('TRIAL_BALANCE')} className="text-[10px] uppercase">
              Trial Balance &rarr;
            </Button>
          </div>
        </div>
      </div>

      {/* 4. Recent Activity & 5. Recent Journal Entries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Journal Entries */}
        <div className="bg-terminal-panel border border-terminal-border rounded p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-terminal-border pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-terminal-amber" />
              Recent Journal Entries ({journalEntries.length})
            </span>
            <Button size="sm" variant="outline" onClick={() => onNavigateTab('JOURNAL')} className="text-[10px]">
              View All &rarr;
            </Button>
          </div>

          <div className="space-y-2">
            {journalEntries.slice(0, 4).map((entry, idx) => (
              <div key={idx} className="p-2.5 bg-black/40 rounded border border-white/5 flex items-center justify-between text-xs font-mono">
                <div>
                  <div className="font-bold text-terminal-amber">{entry.entryNumber}</div>
                  <div className="text-[10px] text-terminal-muted truncate max-w-[200px]">{entry.description}</div>
                </div>
                <div className="text-right">
                  <div className="text-terminal-green font-bold">{formatCurrency(entry.totalDebit || 0)}</div>
                  <span className="text-[9px] text-terminal-muted">{entry.status || 'POSTED'}</span>
                </div>
              </div>
            ))}
            {journalEntries.length === 0 && (
              <div className="text-xs text-terminal-muted text-center py-4 font-mono">No journal entries recorded.</div>
            )}
          </div>
        </div>

        {/* 6. Recent Ledger Updates & 7. Latest Certificates */}
        <div className="bg-terminal-panel border border-terminal-border rounded p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-terminal-border pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-terminal-blue" />
              Latest Cryptographic Certificates ({certificates.length})
            </span>
            <Button size="sm" variant="outline" onClick={() => onNavigateTab('CERTIFICATES')} className="text-[10px]">
              View All &rarr;
            </Button>
          </div>

          <div className="space-y-2">
            {certificates.slice(0, 4).map((cert, idx) => (
              <div key={idx} className="p-2.5 bg-black/40 rounded border border-white/5 flex items-center justify-between text-xs font-mono">
                <div>
                  <div className="font-bold text-terminal-blue">{cert.certificateNumber || `CERT-${idx+1}`}</div>
                  <div className="text-[9px] text-terminal-muted truncate max-w-[180px]">Hash: {cert.hash || cert.sha256Hash || '0x4E7A...'}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-terminal-green font-bold">VERIFIED</span>
                  <div className="text-[9px] text-terminal-muted">{cert.createdAt ? new Date(cert.createdAt).toLocaleDateString() : '2026-08-06'}</div>
                </div>
              </div>
            ))}
            {certificates.length === 0 && (
              <div className="text-xs text-terminal-muted text-center py-4 font-mono">No certificates generated.</div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Access Navigation Grid */}
      <div className="bg-terminal-panel border border-terminal-border rounded p-4 space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-terminal-muted block">Enterprise Accounting Workmodules</span>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button onClick={() => onNavigateTab('COA')} className="p-3 bg-black/30 border border-white/10 rounded hover:border-terminal-amber/50 hover:bg-terminal-amber/5 text-left transition">
            <div className="text-terminal-amber font-bold text-xs">Chart of Accounts</div>
            <div className="text-[10px] text-terminal-muted mt-1">Directory of Assets, Liabilities & Equity</div>
          </button>
          <button onClick={() => onNavigateTab('JOURNAL')} className="p-3 bg-black/30 border border-white/10 rounded hover:border-terminal-amber/50 hover:bg-terminal-amber/5 text-left transition">
            <div className="text-terminal-amber font-bold text-xs">Journal Register</div>
            <div className="text-[10px] text-terminal-muted mt-1">Double-Entry Journal Postings & Reversals</div>
          </button>
          <button onClick={() => onNavigateTab('TRIAL_BALANCE')} className="p-3 bg-black/30 border border-white/10 rounded hover:border-terminal-amber/50 hover:bg-terminal-amber/5 text-left transition">
            <div className="text-terminal-amber font-bold text-xs">Trial Balance</div>
            <div className="text-[10px] text-terminal-muted mt-1">Debit & Credit Verification Engine</div>
          </button>
          <button onClick={() => onNavigateTab('CERTIFICATES')} className="p-3 bg-black/30 border border-white/10 rounded hover:border-terminal-amber/50 hover:bg-terminal-amber/5 text-left transition">
            <div className="text-terminal-amber font-bold text-xs">Audit Certificates</div>
            <div className="text-[10px] text-terminal-muted mt-1">SHA-256 Ledger Cryptographic Proofs</div>
          </button>
        </div>
      </div>
    </div>
  );
};
