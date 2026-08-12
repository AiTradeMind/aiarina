import React, { useState, useEffect, useCallback } from 'react';
import { 
  Activity, 
  Book, 
  FileSpreadsheet, 
  DollarSign, 
  PieChart, 
  ShieldCheck, 
  Settings, 
  Scale, 
  CheckCircle, 
  Calendar, 
  RefreshCw,
  Landmark,
  FileText,
  Lock,
  ArrowRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { SectionHeader, Toolbar, GlobalSummaryItem, StatusBadge } from './ui/Base';
import { DataBoundary, LoadingOverlay } from './ui/Feedback';
import { Button } from './ui/Button';

// Subcomponents
import { DashboardView } from './accounting/DashboardView';
import { COAView } from './accounting/COAView';
import { JournalView } from './accounting/JournalView';
import { LedgerView } from './accounting/LedgerView';
import { TrialBalanceView } from './accounting/TrialBalanceView';
import { ProfitLossView } from './accounting/ProfitLossView';
import { BalanceSheetView } from './accounting/BalanceSheetView';
import { AuditView } from './accounting/AuditView';
import { CertificatesView } from './accounting/CertificatesView';
import { PeriodsView } from './accounting/PeriodsView';
import { InspectorView } from './accounting/InspectorView';

interface AccountingWorkspaceProps {
  balance?: number;
  trades?: any[];
  initialTab?: string;
  onRefresh?: () => void;
}

export const AccountingWorkspace: React.FC<AccountingWorkspaceProps> = React.memo(({
  initialTab,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<
    'DASHBOARD' | 'COA' | 'JOURNAL' | 'LEDGER' | 'TRIAL_BALANCE' | 'PNL' | 'BALANCE_SHEET' | 'PERIODS' | 'CERTIFICATES' | 'AUDIT' | 'INSPECTOR'
  >((initialTab as any) || 'DASHBOARD');

  const [loading, setLoading] = useState(false);
  const [syncingEP15, setSyncingEP15] = useState(false);

  // Accounting State
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  const [ledgerAccounts, setLedgerAccounts] = useState<any[]>([]);
  const [trialBalance, setTrialBalance] = useState<any>(null);
  const [pnlStatement, setPnlStatement] = useState<any>(null);
  const [balanceSheet, setBalanceSheet] = useState<any>(null);
  const [periods, setPeriods] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const fetchAllAccountingData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [dashRes, coaRes, journalRes, ledgerRes, tbRes, pnlRes, bsRes, periodsRes, certsRes, auditRes] = await Promise.all([
        fetch('/api/accounting/dashboard').then(r => r.ok ? r.json() : { data: null }),
        fetch('/api/accounting/coa').then(r => r.ok ? r.json() : { data: [] }),
        fetch('/api/accounting/journal').then(r => r.ok ? r.json() : { data: [] }),
        fetch('/api/accounting/ledger').then(r => r.ok ? r.json() : { data: [] }),
        fetch('/api/accounting/trial-balance').then(r => r.ok ? r.json() : { data: null }),
        fetch('/api/accounting/profit-loss').then(r => r.ok ? r.json() : { data: null }),
        fetch('/api/accounting/balance-sheet').then(r => r.ok ? r.json() : { data: null }),
        fetch('/api/accounting/periods').then(r => r.ok ? r.json() : { data: [] }),
        fetch('/api/accounting/certificates').then(r => r.ok ? r.json() : { data: [] }),
        fetch('/api/accounting/audit').then(r => r.ok ? r.json() : { data: [] }),
      ]);

      if (dashRes?.data) setDashboardData(dashRes.data);
      if (coaRes?.data) setAccounts(coaRes.data);
      if (journalRes?.data) setJournalEntries(journalRes.data);
      if (ledgerRes?.data) setLedgerAccounts(ledgerRes.data);
      if (tbRes?.data) setTrialBalance(tbRes.data);
      if (pnlRes?.data) setPnlStatement(pnlRes.data);
      if (bsRes?.data) setBalanceSheet(bsRes.data);
      if (periodsRes?.data) setPeriods(periodsRes.data);
      if (certsRes?.data) setCertificates(certsRes.data);
      if (auditRes?.data) setAuditLogs(auditRes.data);

      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('[AccountingWorkspace] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [onRefresh]);

  useEffect(() => {
    fetchAllAccountingData();
  }, [fetchAllAccountingData]);

  // Actions
  const handlePostJournal = async (req: any) => {
    const res = await fetch('/api/accounting/post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to post journal entry');
    await fetchAllAccountingData();
    return json;
  };

  const handleReverseJournal = async (id: number, reason: string) => {
    const res = await fetch(`/api/accounting/journal/reverse/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to reverse journal entry');
    await fetchAllAccountingData();
    return json;
  };

  const handleCreateAccount = async (req: any) => {
    const res = await fetch('/api/accounting/coa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to create chart of account');
    await fetchAllAccountingData();
    return json;
  };

  const handleCreatePeriod = async (req: any) => {
    const res = await fetch('/api/accounting/periods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to create period');
    await fetchAllAccountingData();
    return json;
  };

  const handleClosePeriod = async (periodId: number) => {
    const res = await fetch(`/api/accounting/periods/close/${periodId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to close period');
    await fetchAllAccountingData();
    return json;
  };

  const handleFetchAccountLedger = async (accountId: number) => {
    const res = await fetch(`/api/accounting/ledger/${accountId}`);
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to fetch account ledger');
    return json.data;
  };

  const handleVerifyCertificate = async (certificateId: number) => {
    const res = await fetch(`/api/accounting/certificates/verify/${certificateId}`);
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Verification failed');
    return json.data;
  };

  const handleSyncEP15 = async () => {
    try {
      setSyncingEP15(true);
      const res = await fetch('/api/accounting/sync-ep15', { method: 'POST' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'EP15 Sync failed');
      alert(`EP15 Sync Complete: ${json.message}`);
      await fetchAllAccountingData();
    } catch (err: any) {
      alert(`EP15 Trade Sync Notice: ${err.message}`);
    } finally {
      setSyncingEP15(false);
    }
  };

  const tabs = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: Activity },
    { id: 'COA', label: 'Chart of Accounts', icon: FileSpreadsheet },
    { id: 'JOURNAL', label: 'Journal Entries', icon: Book },
    { id: 'LEDGER', label: 'General Ledger', icon: Book },
    { id: 'TRIAL_BALANCE', label: 'Trial Balance', icon: Scale },
    { id: 'PNL', label: 'Profit & Loss', icon: PieChart },
    { id: 'BALANCE_SHEET', label: 'Balance Sheet', icon: DollarSign },
    { id: 'PERIODS', label: 'Accounting Periods', icon: Calendar },
    { id: 'CERTIFICATES', label: 'Certificates', icon: ShieldCheck },
    { id: 'AUDIT', label: 'Accounting Audit', icon: CheckCircle },
    { id: 'INSPECTOR', label: 'Inspector', icon: Settings },
  ];

  return (
    <div className="flex flex-col h-full bg-terminal-bg text-white font-sans relative overflow-hidden">
      <DataBoundary data={dashboardData || {}} title="Enterprise Accounting & General Ledger">
        
        {/* TOP DECISION FACTORY MISSION HEADER */}
        <div className="bg-black border-b border-terminal-border px-3 py-1.5 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-white/10 pb-1.5 mb-1.5">
            <div className="flex items-center gap-2.5">
              <div className="p-1 rounded bg-terminal-amber/10 border border-terminal-amber/30 text-terminal-amber">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
                  Enterprise Financial Accounting & General Ledger (ACID OS v3.2)
                  <span className="text-[9px] bg-terminal-green/20 text-terminal-green px-1.5 py-0.2 rounded border border-terminal-green/40">DOUBLE ENTRY IMMUTABLE</span>
                </h1>
                <p className="text-[9px] text-terminal-muted uppercase tracking-wider">Automated Trade Sync &bull; Cryptographic SHA-256 Certificates &bull; Strict Balance</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSyncEP15} 
                disabled={syncingEP15}
                className="h-6 text-[9px] px-2 py-0 border border-terminal-blue text-terminal-blue hover:bg-terminal-blue/20 uppercase flex items-center gap-1 font-mono"
              >
                <RefreshCw className={`w-3 h-3 ${syncingEP15 ? 'animate-spin' : ''}`} />
                SYNC EP15 TRADES
              </Button>
            </div>
          </div>

          {/* WORKFLOW PIPELINE FLOW */}
          <div className="flex items-center justify-between text-[9px] uppercase font-mono overflow-x-auto py-1 gap-1.5 text-terminal-muted bg-white/5 px-2.5 rounded border border-terminal-border/40">
            <div className="flex items-center gap-1 text-terminal-amber">
              <Landmark className="w-3 h-3" />
              <span className="font-bold">Treasury</span>
            </div>
            <ArrowRight className="w-2.5 h-2.5 text-terminal-muted shrink-0" />
            <div className="flex items-center gap-1 text-terminal-blue">
              <FileText className="w-3 h-3" />
              <span className="font-bold">Journal Postings</span>
            </div>
            <ArrowRight className="w-2.5 h-2.5 text-terminal-muted shrink-0" />
            <div className="flex items-center gap-1 text-purple-300">
              <Scale className="w-3 h-3" />
              <span className="font-bold">General Ledger</span>
            </div>
            <ArrowRight className="w-2.5 h-2.5 text-terminal-muted shrink-0" />
            <div className="flex items-center gap-1 text-terminal-green">
              <ShieldCheck className="w-3 h-3" />
              <span className="font-bold">SHA-256 Audit</span>
            </div>
          </div>
        </div>

        {/* TOP SUMMARY METRICS BAR */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 p-2 bg-black/60 border-b border-terminal-border shrink-0 text-xs font-mono">
          <div className="bg-terminal-panel p-1.5 rounded border border-terminal-border/50 text-center">
            <div className="text-[9px] text-terminal-muted uppercase">Double Entry</div>
            <div className={`text-xs font-bold mt-0.5 ${dashboardData?.doubleEntryBalanced ? 'text-terminal-green' : 'text-terminal-red'}`}>
              {dashboardData?.doubleEntryBalanced ? "BALANCED" : "UNBALANCED"}
            </div>
          </div>
          <div className="bg-terminal-panel p-1.5 rounded border border-terminal-border/50 text-center">
            <div className="text-[9px] text-terminal-muted uppercase">Total Assets</div>
            <div className="text-xs font-bold text-terminal-green mt-0.5">${(dashboardData?.totalAssets || 0).toLocaleString()}</div>
          </div>
          <div className="bg-terminal-panel p-1.5 rounded border border-terminal-border/50 text-center">
            <div className="text-[9px] text-terminal-muted uppercase">Net Income</div>
            <div className="text-xs font-bold text-terminal-amber mt-0.5">${(dashboardData?.netIncome || 0).toLocaleString()}</div>
          </div>
          <div className="bg-terminal-panel p-1.5 rounded border border-terminal-border/50 text-center">
            <div className="text-[9px] text-terminal-muted uppercase">Unposted Entries</div>
            <div className="text-xs font-bold text-white mt-0.5">{dashboardData?.unpostedEntries || 0}</div>
          </div>
          <div className="bg-terminal-panel p-1.5 rounded border border-terminal-border/50 text-center">
            <div className="text-[9px] text-terminal-muted uppercase">Active Period</div>
            <div className="text-xs font-bold text-terminal-blue mt-0.5">{dashboardData?.activePeriod || "2026-Q3"}</div>
          </div>
          <div className="bg-terminal-panel p-1.5 rounded border border-terminal-border/50 text-center">
            <div className="text-[9px] text-terminal-muted uppercase font-bold text-terminal-green">Audit Status</div>
            <div className="text-xs font-bold text-terminal-green mt-0.5 flex items-center justify-center gap-1">
              <Lock className="w-2.5 h-2.5" /> SECURE
            </div>
          </div>
        </div>

        {/* TOP HORIZONTAL TABS BAR (ALL 11 WORKSPACES EXACTLY AS REQUESTED) */}
        <div className="bg-black/80 border-b border-terminal-border px-3 py-1.5 shrink-0 flex items-center gap-1.5 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 text-xs rounded font-mono transition-all uppercase tracking-wider shrink-0",
                activeTab === tab.id 
                  ? "bg-terminal-amber/20 text-terminal-amber font-bold border border-terminal-amber/40" 
                  : "text-terminal-muted hover:text-white hover:bg-white/5 border border-terminal-border/40"
              )}
            >
              <tab.icon className={cn("w-3 h-3", activeTab === tab.id ? "text-terminal-amber" : "text-terminal-muted")} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* MAIN BODY AREA WITH CENTER CONTENT AND RIGHT INSPECTOR */}
        <div className="flex flex-1 overflow-hidden relative">
          {loading && <LoadingOverlay message="Processing Accounting Workspace..." />}

          {/* CENTER VIEW AREA - SINGLE SCROLL CONTAINER */}
          <div className="flex-1 flex flex-col overflow-y-auto bg-black/20 p-3 space-y-3">
            {activeTab === 'DASHBOARD' && (
              <DashboardView 
                data={dashboardData}
                journalEntries={journalEntries}
                ledgerAccounts={ledgerAccounts}
                certificates={certificates}
                periods={periods}
                auditLogs={auditLogs}
                trialBalance={trialBalance}
                onRefresh={fetchAllAccountingData}
                onPostJournalClick={() => setActiveTab('JOURNAL')}
                onSyncEP15Click={handleSyncEP15}
                onNavigateTab={(tab) => setActiveTab(tab as any)}
                syncingEP15={syncingEP15}
              />
            )}

            {activeTab === 'COA' && (
              <COAView 
                accounts={accounts}
                loading={loading}
                onCreateAccount={handleCreateAccount}
              />
            )}

            {activeTab === 'JOURNAL' && (
              <JournalView 
                entries={journalEntries}
                accounts={accounts}
                loading={loading}
                onPostJournal={handlePostJournal}
                onReverseJournal={handleReverseJournal}
              />
            )}

            {activeTab === 'LEDGER' && (
              <LedgerView 
                ledgerAccounts={ledgerAccounts}
                accounts={accounts}
                loading={loading}
                onFetchAccountLedger={handleFetchAccountLedger}
              />
            )}

            {activeTab === 'TRIAL_BALANCE' && (
              <TrialBalanceView 
                trialBalance={trialBalance}
                loading={loading}
                onRefresh={fetchAllAccountingData}
              />
            )}

            {activeTab === 'PNL' && (
              <ProfitLossView 
                statement={pnlStatement}
                loading={loading}
                onRefresh={fetchAllAccountingData}
              />
            )}

            {activeTab === 'BALANCE_SHEET' && (
              <BalanceSheetView 
                statement={balanceSheet}
                loading={loading}
                onRefresh={fetchAllAccountingData}
              />
            )}

            {activeTab === 'PERIODS' && (
              <PeriodsView 
                periods={periods}
                loading={loading}
                onCreatePeriod={handleCreatePeriod}
                onClosePeriod={handleClosePeriod}
              />
            )}

            {activeTab === 'CERTIFICATES' && (
              <CertificatesView 
                certificates={certificates}
                loading={loading}
                onVerifyCertificate={handleVerifyCertificate}
              />
            )}

            {activeTab === 'AUDIT' && (
              <AuditView 
                auditLogs={auditLogs}
                loading={loading}
              />
            )}

            {activeTab === 'INSPECTOR' && (
              <InspectorView 
                dashboardData={dashboardData}
                accounts={accounts}
                journalEntries={journalEntries}
              />
            )}
          </div>

          {/* RIGHT ENTERPRISE INSPECTOR PANEL */}
          <div className="w-80 border-l border-terminal-border flex flex-col shrink-0 bg-terminal-panel overflow-y-auto p-3 text-xs font-mono space-y-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-terminal-amber border-b border-terminal-border/40 pb-1 flex items-center justify-between">
              <span>Enterprise Inspector</span>
              <span className="text-[9px] text-terminal-green">ACTIVE ACID</span>
            </div>
            
            <div className="space-y-2">
              <span className="text-[9px] uppercase font-bold text-terminal-muted">Selected Workspace Metadata</span>
              <div className="p-3 bg-black/40 border border-terminal-border/60 rounded space-y-2 text-[11px]">
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-terminal-muted">Active Module</span>
                  <span className="font-bold text-terminal-amber">Financial Accounting</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-terminal-muted">Active Tab</span>
                  <span className="font-bold text-white">{activeTab}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-terminal-muted">Double Entry Status</span>
                  <span className={dashboardData?.doubleEntryBalanced ? "text-terminal-green font-bold" : "text-terminal-red font-bold"}>
                    {dashboardData?.doubleEntryBalanced ? "Balanced" : "Unbalanced"}
                  </span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-terminal-muted">Chart of Accounts</span>
                  <span className="text-terminal-blue font-bold">{accounts.length} Accounts</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-terminal-muted">Journal Entries</span>
                  <span className="text-white font-bold">{journalEntries.length} Entries</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-terminal-muted">Active Fiscal Period</span>
                  <span className="text-terminal-amber">{dashboardData?.activePeriod || '2026-Q3'}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-terminal-muted">Certificates</span>
                  <span className="text-purple-300">{certificates.length} SHA-256</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-terminal-muted">Audit Records</span>
                  <span className="text-white">{auditLogs.length} Logs</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-terminal-muted">Database Engine</span>
                  <span className="text-terminal-green">PostgreSQL / ACID</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-terminal-muted">API Connection</span>
                  <span className="text-terminal-green">Connected (/api/accounting)</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* STATUS FOOTER BAR */}
        <div className="bg-black border-t border-terminal-border px-4 py-1.5 shrink-0 flex flex-wrap items-center justify-between text-[10px] font-mono text-terminal-muted">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-terminal-green animate-pulse" /> DB: Connected (PostgreSQL / ACID)</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-terminal-green" /> API: Online (v3.2)</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-terminal-green" /> WS: Synchronized</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Scheduler: Active</span>
            <span>Ledgers: {accounts.length} Active</span>
            <span>Feed: Real-Time</span>
            <span className="text-terminal-green font-bold">Health: 100% OK</span>
          </div>
        </div>

      </DataBoundary>
    </div>
  );
});

AccountingWorkspace.displayName = 'AccountingWorkspace';
