import React, { useState } from 'react';
import { CheckCircle, Search, Clock, FileText } from 'lucide-react';
import { SectionHeader } from '../ui/Base';
import { AccountingAuditLog } from '../../modules/accounting/types';

interface AuditViewProps {
  auditLogs: AccountingAuditLog[];
  loading: boolean;
}

export const AuditView: React.FC<AuditViewProps> = ({ auditLogs, loading }) => {
  const [search, setSearch] = useState('');

  const filtered = auditLogs.filter(log => {
    const s = search.toLowerCase();
    return (
      log.action.toLowerCase().includes(s) ||
      log.entityType.toLowerCase().includes(s) ||
      (log.details && log.details.toLowerCase().includes(s))
    );
  });

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'POST_JOURNAL': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'REVERSE_JOURNAL': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'CLOSE_PERIOD': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'CREATE_ACCOUNT': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'SYNC_EP15': return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="Accounting System Audit Trail" icon={CheckCircle} />

      {/* Search Bar */}
      <div className="bg-terminal-panel border border-terminal-border p-2.5 rounded flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-terminal-muted" />
          <input 
            type="text"
            placeholder="Search action, entity type, or audit details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/50 border border-terminal-border rounded pl-9 pr-3 py-1 text-xs text-white placeholder-terminal-muted focus:outline-none focus:border-terminal-amber font-mono"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-terminal-panel border border-terminal-border rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-black/40 border-b border-terminal-border text-terminal-muted text-[10px] uppercase">
                <th className="p-3">Audit ID</th>
                <th className="p-3">Action</th>
                <th className="p-3">Entity Type</th>
                <th className="p-3">Entity Ref ID</th>
                <th className="p-3">Details</th>
                <th className="p-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-terminal-border/50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-terminal-muted">
                    No accounting audit log entries found matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map(log => (
                  <tr key={log.id} className="hover:bg-white/5 transition">
                    <td className="p-3 font-bold text-terminal-amber">#{log.id}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-white">{log.entityType}</td>
                    <td className="p-3 text-terminal-muted">{log.entityId ? `#${log.entityId}` : '-'}</td>
                    <td className="p-3 font-sans text-gray-300 max-w-md truncate">{log.details || '-'}</td>
                    <td className="p-3 text-terminal-muted">{new Date(log.auditTime).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
