import React, { useState, useEffect } from 'react';
import { Settings, Search, FileCode, CheckCircle, Database, Shield } from 'lucide-react';
import { SectionHeader } from '../ui/Base';
import { Button } from '../ui/Button';

interface InspectorViewProps {
  dashboardData: any;
  accounts: any[];
  journalEntries: any[];
}

export const InspectorView: React.FC<InspectorViewProps> = ({
  dashboardData,
  accounts,
  journalEntries
}) => {
  const [selectedEntity, setSelectedEntity] = useState<'SYSTEM' | 'COA' | 'JOURNAL'>('SYSTEM');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [inspectorData, setInspectorData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/accounting/inspector')
      .then(r => r.ok ? r.json() : null)
      .then(res => {
        if (res?.data) setInspectorData(res.data);
      })
      .catch(() => {});
  }, []);

  const selectedCoa = accounts.find(a => a.id === selectedId);
  const selectedJournal = journalEntries.find(j => j.id === selectedId);

  return (
    <div className="space-y-4">
      <SectionHeader title="Accounting System Data Inspector & Hash Chain Auditor" icon={Settings} />

      {inspectorData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-terminal-panel border border-terminal-border p-3 rounded font-mono text-xs">
          <div className="p-2 bg-black/40 border border-terminal-border rounded">
            <span className="text-[10px] text-terminal-muted block">Audit Count</span>
            <span className="text-white font-bold text-sm">{inspectorData.auditCount} Records</span>
          </div>
          <div className="p-2 bg-black/40 border border-terminal-border rounded">
            <span className="text-[10px] text-terminal-muted block">Certificate Count</span>
            <span className="text-purple-300 font-bold text-sm">{inspectorData.certificateCount} SHA-256</span>
          </div>
          <div className="p-2 bg-black/40 border border-terminal-border rounded">
            <span className="text-[10px] text-terminal-muted block">Hash Chain Status</span>
            <span className="text-terminal-green font-bold text-xs">{inspectorData.hashChainStatus}</span>
          </div>
          <div className="p-2 bg-black/40 border border-terminal-border rounded">
            <span className="text-[10px] text-terminal-muted block">Integrity Status</span>
            <span className="text-terminal-green font-bold text-xs">{inspectorData.integrityStatus}</span>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 bg-terminal-panel border border-terminal-border p-2.5 rounded font-mono text-xs">
        <span className="text-terminal-muted uppercase">Inspect Entity:</span>
        <button
          onClick={() => { setSelectedEntity('SYSTEM'); setSelectedId(null); }}
          className={`px-3 py-1 rounded text-[10px] uppercase font-bold transition ${
            selectedEntity === 'SYSTEM' ? 'bg-terminal-amber text-black' : 'bg-black/40 text-terminal-muted hover:text-white border border-terminal-border'
          }`}
        >
          System Health & Hashes
        </button>
        <button
          onClick={() => { setSelectedEntity('COA'); setSelectedId(accounts[0]?.id || null); }}
          className={`px-3 py-1 rounded text-[10px] uppercase font-bold transition ${
            selectedEntity === 'COA' ? 'bg-terminal-amber text-black' : 'bg-black/40 text-terminal-muted hover:text-white border border-terminal-border'
          }`}
        >
          Chart of Accounts
        </button>
        <button
          onClick={() => { setSelectedEntity('JOURNAL'); setSelectedId(journalEntries[0]?.id || null); }}
          className={`px-3 py-1 rounded text-[10px] uppercase font-bold transition ${
            selectedEntity === 'JOURNAL' ? 'bg-terminal-amber text-black' : 'bg-black/40 text-terminal-muted hover:text-white border border-terminal-border'
          }`}
        >
          Journal Entries
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left selector */}
        <div className="bg-terminal-panel border border-terminal-border rounded p-3 space-y-2 font-mono text-xs max-h-[500px] overflow-y-auto">
          {selectedEntity === 'SYSTEM' && (
            <div className="p-3 bg-black/40 border border-terminal-amber/30 rounded text-terminal-amber space-y-2">
              <div className="font-bold uppercase text-xs flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> EP16 Cryptographic State
              </div>
              <div className="text-[10px] text-gray-300">ACID Double-Entry & Immutable Audit Chain</div>
              {inspectorData && (
                <div className="space-y-1 pt-2 border-t border-terminal-border text-[10px] text-terminal-muted font-mono">
                  <div>Last Ledger Update: <span className="text-white">{new Date(inspectorData.lastLedgerUpdate).toLocaleTimeString()}</span></div>
                  <div>Last Journal: <span className="text-terminal-amber">{inspectorData.lastJournalEntry}</span></div>
                  <div>Current Hash: <span className="text-terminal-green truncate block">{inspectorData.currentHash.substring(0, 16)}...</span></div>
                </div>
              )}
            </div>
          )}

          {selectedEntity === 'COA' && (
            accounts.map(acc => (
              <button
                key={acc.id}
                onClick={() => setSelectedId(acc.id)}
                className={`w-full p-2.5 rounded text-left transition ${
                  selectedId === acc.id ? 'bg-terminal-amber/10 border border-terminal-amber font-bold text-terminal-amber' : 'hover:bg-white/5 text-white'
                }`}
              >
                <div>{acc.accountCode} - {acc.accountName}</div>
                <div className="text-[9px] text-terminal-muted uppercase">{acc.accountType}</div>
              </button>
            ))
          )}

          {selectedEntity === 'JOURNAL' && (
            journalEntries.map(j => (
              <button
                key={j.id}
                onClick={() => setSelectedId(j.id)}
                className={`w-full p-2.5 rounded text-left transition ${
                  selectedId === j.id ? 'bg-terminal-amber/10 border border-terminal-amber font-bold text-terminal-amber' : 'hover:bg-white/5 text-white'
                }`}
              >
                <div>{j.entryNumber}</div>
                <div className="text-[9px] text-terminal-muted truncate">{j.description}</div>
              </button>
            ))
          )}
        </div>

        {/* Right JSON Tree */}
        <div className="lg:col-span-2 bg-terminal-panel border border-terminal-border rounded p-4 font-mono text-xs overflow-x-auto space-y-3">
          <div className="flex items-center justify-between border-b border-terminal-border pb-2">
            <span className="text-terminal-amber font-bold uppercase tracking-wider flex items-center gap-2">
              <FileCode className="w-4 h-4" />
              Raw Entity State Inspector & Cryptographic Proofs
            </span>
            <span className="text-[10px] text-terminal-muted">JSON PAYLOAD INSPECTION</span>
          </div>

          <pre className="p-3 bg-black/80 rounded border border-terminal-border text-terminal-green text-[11px] overflow-x-auto">
            {selectedEntity === 'SYSTEM' && JSON.stringify({ dashboard: dashboardData, inspectorDiagnostics: inspectorData }, null, 2)}
            {selectedEntity === 'COA' && JSON.stringify(selectedCoa || {}, null, 2)}
            {selectedEntity === 'JOURNAL' && JSON.stringify(selectedJournal || {}, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};
