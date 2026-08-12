import React, { useState, useEffect, useMemo } from 'react';
import { BackupWorkspace } from './BackupWorkspace';
import { 
  Shield, 
  Users, 
  Building2, 
  Lock, 
  ShieldCheck, 
  History, 
  Activity, 
  Server, 
  Key, 
  KeyRound, 
  Terminal as TerminalIcon, 
  RefreshCcw, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Eye, 
  Plus, 
  Check, 
  X, 
  LogOut, 
  ToggleLeft, 
  ToggleRight, 
  Play, 
  Cpu, 
  Globe, 
  Radio, 
  UserPlus, 
  FileCheck, 
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, safeFormat } from '../lib/utils';
import { SectionHeader, StatusBadge, MetricCard, Panel, Toolbar, GlobalSummaryItem } from './ui/Base';
import { DataTable, SearchBar } from './ui/Table';
import { LoadingOverlay, EmptyState, DataBoundary } from './ui/Feedback';
import { Button, IconButton } from './ui/Button';
import { fetchApi, resolveArrayData } from '../lib/api';
import { 
  AdminUserItem, 
  OrganizationItem, 
  TeamItem, 
  RoleItem, 
  PermissionItem, 
  SessionItem, 
  ApiKeyItem, 
  SecurityPolicyItem, 
  AdminAuditItem, 
  AdminRuntimeMetric, 
  AdminQaReport, 
  RoleType, 
  WorkspaceId 
} from '../modules/identity/types/ep19.types';

export type AdminTab = 
  | 'DASHBOARD' 
  | 'GENESIS'
  | 'BACKUP'
  | 'USERS' 
  | 'ORGANIZATIONS' 
  | 'TEAMS' 
  | 'ROLES' 
  | 'PERMISSIONS' 
  | 'SESSIONS' 
  | 'API_KEYS' 
  | 'SECRETS'
  | 'SECURITY_POLICIES' 
  | 'OPERATIONS'
  | 'COMPLIANCE'
  | 'SECURITY'
  | 'AUDIT' 
  | 'RUNTIME' 
  | 'INSPECTOR';

export const AdministrationWorkspace = React.memo(({ systemStatus, currentUser, initialTab }: { systemStatus?: any, currentUser?: any, initialTab?: AdminTab }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab || 'DASHBOARD');
  
  // Data states
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationItem[]>([]);
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [secrets, setSecrets] = useState<any[]>([]);
  const [securityPolicies, setSecurityPolicies] = useState<SecurityPolicyItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditItem[]>([]);
  const [runtimeMetric, setRuntimeMetric] = useState<AdminRuntimeMetric | null>(null);
  const [qaReport, setQaReport] = useState<AdminQaReport | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [permissionFilter, setPermissionFilter] = useState<string>('ALL');

  // Modal & Form States
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserOrgId, setNewUserOrgId] = useState('ORG-001');
  const [newUserRole, setNewUserRole] = useState<RoleType>('ANALYST');

  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  const [showCreateApiKeyModal, setShowCreateApiKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyOwner, setNewKeyOwner] = useState('USR-1001');
  const [newKeyScope, setNewKeyScope] = useState('read:all');

  // Inspector States
  const [checkEmail, setCheckEmail] = useState('vance@arina.ai');
  const [checkWorkspace, setCheckWorkspace] = useState<WorkspaceId>('OMS');
  const [accessResult, setAccessResult] = useState<any>(null);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [uRes, oRes, tRes, rRes, pRes, sRes, kRes, secRes, polRes, aRes, runRes, qRes] = await Promise.all([
        fetchApi('/api/admin/users'),
        fetchApi('/api/admin/organizations'),
        fetchApi('/api/admin/teams'),
        fetchApi('/api/admin/roles'),
        fetchApi('/api/admin/permissions'),
        fetchApi('/api/admin/sessions'),
        fetchApi('/api/admin/api-keys'),
        fetchApi('/api/secrets/list'),
        fetchApi('/api/admin/security-policies'),
        fetchApi('/api/admin/audit'),
        fetchApi('/api/admin/runtime'),
        fetchApi('/api/admin/qa')
      ]);

      if (uRes?.data) setUsers(resolveArrayData(uRes.data));
      if (oRes?.data) setOrganizations(resolveArrayData(oRes.data));
      if (tRes?.data) setTeams(resolveArrayData(tRes.data));
      if (rRes?.data) setRoles(resolveArrayData(rRes.data));
      if (pRes?.data) setPermissions(resolveArrayData(pRes.data));
      if (sRes?.data) setSessions(resolveArrayData(sRes.data));
      if (kRes?.data) setApiKeys(resolveArrayData(kRes.data));
      if (secRes?.data) setSecrets(resolveArrayData(secRes.data));
      if (polRes?.data) setSecurityPolicies(resolveArrayData(polRes.data));
      if (aRes?.data) setAuditLogs(resolveArrayData(aRes.data));
      if (runRes?.data) setRuntimeMetric(runRes.data);
      if (qRes?.data) setQaReport(qRes.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Action Handlers
  const handleCreateUser = async () => {
    if (!newUserName || !newUserEmail) return;
    try {
      const res = await fetchApi('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          organizationId: newUserOrgId,
          roles: [newUserRole]
        })
      });
      if (res?.data) {
        setShowCreateUserModal(false);
        setNewUserName('');
        setNewUserEmail('');
        fetchAllData();
      }
    } catch (e) {
      console.error('Error creating user:', e);
    }
  };

  const handleCreateRole = async () => {
    if (!newRoleName || !newRoleDesc) return;
    try {
      const res = await fetchApi('/api/admin/roles', {
        method: 'POST',
        body: JSON.stringify({
          name: newRoleName,
          type: 'CUSTOM_ROLE',
          description: newRoleDesc,
          permissions: ['dashboard:read', 'oms:read']
        })
      });
      if (res?.data) {
        setShowCreateRoleModal(false);
        setNewRoleName('');
        setNewRoleDesc('');
        fetchAllData();
      }
    } catch (e) {
      console.error('Error creating role:', e);
    }
  };

  const handleCreateApiKey = async () => {
    if (!newKeyName || !newKeyOwner) return;
    try {
      const res = await fetchApi('/api/admin/api-keys', {
        method: 'POST',
        body: JSON.stringify({
          name: newKeyName,
          ownerUserId: newKeyOwner,
          scopes: [newKeyScope],
          expiresDays: 180
        })
      });
      if (res?.data) {
        setShowCreateApiKeyModal(false);
        setNewKeyName('');
        fetchAllData();
      }
    } catch (e) {
      console.error('Error creating API key:', e);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await fetchApi('/api/admin/sessions/revoke', {
        method: 'POST',
        body: JSON.stringify({ sessionId })
      });
      fetchAllData();
    } catch (e) {
      console.error('Revoke session error:', e);
    }
  };

  const handleTogglePolicy = async (policyId: string) => {
    try {
      await fetchApi('/api/admin/security-policies/toggle', {
        method: 'POST',
        body: JSON.stringify({ policyId })
      });
      fetchAllData();
    } catch (e) {
      console.error('Toggle policy error:', e);
    }
  };

  const handleCheckAccess = async () => {
    try {
      const res = await fetchApi('/api/admin/workspace-check', {
        method: 'POST',
        body: JSON.stringify({ email: checkEmail, workspace: checkWorkspace })
      });
      if (res?.data) {
        setAccessResult(res.data);
      }
    } catch (e) {
      console.error('Check access error:', e);
    }
  };

  const handleRunQa = async () => {
    try {
      const res = await fetchApi('/api/admin/qa');
      if (res?.data) setQaReport(res.data);
    } catch (e) {
      console.error('Run QA error:', e);
    }
  };

  // Filtered lists
  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.userId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const filteredPermissions = useMemo(() => {
    return permissions.filter(p => {
      const matchesSearch = p.code.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesWs = permissionFilter === 'ALL' || p.workspace === permissionFilter;
      return matchesSearch && matchesWs;
    });
  }, [permissions, searchQuery, permissionFilter]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-terminal-bg text-white font-sans selection:bg-terminal-amber/30 relative">
      {/* TOOLBAR HEADER */}
      <Toolbar>
        <div className="flex items-center gap-2 pr-4 border-r border-terminal-border h-full">
          <Shield className="w-4 h-4 text-terminal-amber" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-terminal-muted italic">EP19 • Enterprise Administration & RBAC</span>
        </div>

        <GlobalSummaryItem label="Users" value={users.length.toString()} color="text-terminal-amber" />
        <GlobalSummaryItem label="Organizations" value={organizations.length.toString()} color="text-terminal-blue" />
        <GlobalSummaryItem label="Active Sessions" value={sessions.filter(s => s.status === 'ACTIVE').length.toString()} color="text-terminal-green" />
        <GlobalSummaryItem label="API Keys" value={apiKeys.length.toString()} color="text-terminal-cyan" />
        <GlobalSummaryItem label="Security Score" value={`${runtimeMetric?.healthScore || 100}%`} color="text-terminal-green" />

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="xs" onClick={fetchAllData}>
            <RefreshCcw className="w-3 h-3 mr-1" /> Refresh
          </Button>
          <Button variant="outline" size="xs" onClick={() => setActiveTab('INSPECTOR')} className="text-terminal-amber border-terminal-amber/40">
            <FileCheck className="w-3 h-3 mr-1" /> QA Inspector
          </Button>
        </div>
      </Toolbar>

      {/* TABS HEADER */}
      <div className="h-10 border-b border-terminal-border bg-black/40 flex items-center px-4 overflow-x-auto scrollbar-hide shrink-0 gap-1">
        {[
          { id: 'DASHBOARD', label: 'Dashboard', icon: Activity },
          { id: 'ORGANIZATIONS', label: 'Organizations', icon: Building2 },
          { id: 'TEAMS', label: 'Teams', icon: UserCheck },
          { id: 'USERS', label: 'Users', icon: Users },
          { id: 'ROLES', label: 'Roles', icon: Lock },
          { id: 'PERMISSIONS', label: 'Permissions', icon: ShieldCheck },
          { id: 'SESSIONS', label: 'Sessions', icon: LogOut },
          { id: 'API_KEYS', label: 'API Keys', icon: KeyRound },
          { id: 'SECRETS', label: 'Secrets & Keys (ESKM)', icon: Key },
          { id: 'SECURITY_POLICIES', label: 'Security Center', icon: Shield },
          { id: 'BACKUP', label: 'Backup & Restore', icon: Server },
          { id: 'AUDIT', label: 'Audit Center', icon: History },
          { id: 'INSPECTOR', label: 'Enterprise Inspector', icon: FileCheck },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-mono uppercase tracking-wider rounded transition-colors whitespace-nowrap",
                isActive ? "bg-terminal-amber/20 text-terminal-amber font-bold border border-terminal-amber/40" : "text-terminal-muted hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className="w-3 h-3 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* MAIN VIEW CONTENT */}
      <div className="flex-1 overflow-y-auto p-6 relative">
        {loading && <LoadingOverlay message="Loading EP19 Enterprise Administration State..." />}

        {activeTab === 'BACKUP' && <BackupWorkspace />}

        {/* TAB 1: DASHBOARD */}
        {activeTab === 'DASHBOARD' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <MetricCard title="Total Identities" value={users.length.toString()} subtitle="Active Enterprise Users" icon={Users} color="amber" />
              <MetricCard title="Organizations & BUs" value={`${organizations.length} / ${teams.length}`} subtitle="Units & Teams" icon={Building2} color="blue" />
              <MetricCard title="Active Sessions" value={sessions.filter(s => s.status === 'ACTIVE').length.toString()} subtitle="Device Connections" icon={LogOut} color="green" />
              <MetricCard title="Security Policies" value={`${securityPolicies.filter(p => p.isEnabled).length} Active`} subtitle="Policies Enforced" icon={ShieldCheck} color="cyan" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Active Users Overview */}
              <Panel title="Identity & User Overview" icon={Users} className="lg:col-span-2">
                <div className="space-y-3 font-mono text-xs">
                  {users.slice(0, 5).map(user => (
                    <div key={user.id} className="flex items-center justify-between p-3 rounded bg-white/5 border border-terminal-border/40">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{user.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-terminal-amber/20 text-terminal-amber font-mono">{user.userId}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-terminal-blue/20 text-terminal-blue font-mono">{user.roles[0]}</span>
                        </div>
                        <div className="text-[10px] text-terminal-muted mt-1">{user.email} • {user.organizationName}</div>
                      </div>
                      <StatusBadge status={user.status} />
                    </div>
                  ))}
                </div>
              </Panel>

              {/* Security Health Summary */}
              <Panel title="Runtime Security Monitor" icon={Shield}>
                <div className="space-y-4 font-mono text-xs">
                  <div className="p-3 rounded bg-white/5 border border-terminal-border/40 space-y-2">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-terminal-muted">Security Health Score:</span>
                      <span className="text-terminal-green font-bold">{runtimeMetric?.healthScore || 100}%</span>
                    </div>
                    <div className="w-full bg-black/40 h-2 rounded overflow-hidden">
                      <div className="bg-terminal-green h-full" style={{ width: `${runtimeMetric?.healthScore || 100}%` }} />
                    </div>
                  </div>

                  <div className="space-y-2 text-[11px]">
                    <div className="flex justify-between border-b border-terminal-border/20 py-1">
                      <span className="text-terminal-muted">Workers Active:</span>
                      <span className="text-white font-bold">{runtimeMetric?.activeWorkers || 6}</span>
                    </div>
                    <div className="flex justify-between border-b border-terminal-border/20 py-1">
                      <span className="text-terminal-muted">Permission Cache:</span>
                      <span className="text-terminal-cyan font-bold">{runtimeMetric?.cachedPermissionsCount || 128} Entries</span>
                    </div>
                    <div className="flex justify-between border-b border-terminal-border/20 py-1">
                      <span className="text-terminal-muted">Session Monitor:</span>
                      <span className="text-terminal-green font-bold">{runtimeMetric?.sessionMonitorStatus || 'HEALTHY'}</span>
                    </div>
                    <div className="flex justify-between border-b border-terminal-border/20 py-1">
                      <span className="text-terminal-muted">24h Incidents:</span>
                      <span className="text-terminal-green font-bold">{runtimeMetric?.securityIncidents24h || 0}</span>
                    </div>
                  </div>
                </div>
              </Panel>
            </div>
          </div>
        )}

        {/* TAB 2: USERS */}
        {activeTab === 'USERS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <SearchBar placeholder="Search users by name, email, or ID..." value={searchQuery} onChange={setSearchQuery} />
              <Button size="xs" onClick={() => setShowCreateUserModal(true)} className="bg-terminal-amber text-black hover:bg-terminal-amber/80">
                <UserPlus className="w-3 h-3 mr-1" /> Add User
              </Button>
            </div>

            <Panel title="Enterprise User Identity Register" icon={Users}>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-terminal-border text-[10px] text-terminal-muted uppercase">
                      <th className="p-3">User ID</th>
                      <th className="p-3">Name & Email</th>
                      <th className="p-3">Organization</th>
                      <th className="p-3">Team</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">MFA</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-terminal-border/30">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-white/5">
                        <td className="p-3 text-terminal-amber font-bold">{u.userId}</td>
                        <td className="p-3">
                          <div className="font-bold text-white">{u.name}</div>
                          <div className="text-[10px] text-terminal-muted">{u.email}</div>
                        </td>
                        <td className="p-3 text-terminal-muted">{u.organizationName}</td>
                        <td className="p-3 text-terminal-muted">{u.teamName}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-terminal-blue/20 text-terminal-blue font-bold text-[10px]">{u.roles.join(', ')}</span>
                        </td>
                        <td className="p-3">
                          {u.mfaEnabled ? <span className="text-terminal-green flex items-center gap-1 text-[10px]"><CheckCircle2 className="w-3 h-3" /> TOTP</span> : <span className="text-terminal-muted text-[10px]">Disabled</span>}
                        </td>
                        <td className="p-3">
                          <StatusBadge status={u.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>
        )}

        {/* TAB 3: ORGANIZATIONS */}
        {activeTab === 'ORGANIZATIONS' && (
          <div className="space-y-4">
            <Panel title="Enterprise Organizations & Divisions" icon={Building2}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {organizations.map(org => (
                  <div key={org.id} className="p-4 rounded bg-white/5 border border-terminal-border/60 space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between border-b border-terminal-border/40 pb-2">
                      <div>
                        <span className="font-bold text-white text-sm">{org.name}</span>
                        <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-terminal-amber/20 text-terminal-amber">{org.code}</span>
                      </div>
                      <StatusBadge status={org.status} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-terminal-muted block">Business Unit:</span>
                        <span className="text-white">{org.businessUnit}</span>
                      </div>
                      <div>
                        <span className="text-terminal-muted block">Department:</span>
                        <span className="text-white">{org.department}</span>
                      </div>
                      <div>
                        <span className="text-terminal-muted block">Total Users:</span>
                        <span className="text-terminal-amber font-bold">{org.userCount}</span>
                      </div>
                      <div>
                        <span className="text-terminal-muted block">Teams:</span>
                        <span className="text-terminal-cyan font-bold">{org.teamsCount}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        )}

        {/* TAB 4: TEAMS */}
        {activeTab === 'TEAMS' && (
          <div className="space-y-4">
            <Panel title="Organizational Teams & Desks" icon={UserCheck}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teams.map(team => (
                  <div key={team.id} className="p-4 rounded bg-white/5 border border-terminal-border/60 space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between border-b border-terminal-border/40 pb-2">
                      <span className="font-bold text-terminal-amber text-sm">{team.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-terminal-blue/20 text-terminal-blue">{team.teamId}</span>
                    </div>
                    <p className="text-terminal-muted text-[11px]">{team.description}</p>
                    <div className="flex justify-between items-center text-[11px] pt-2 border-t border-terminal-border/20">
                      <span className="text-terminal-muted">Lead: <span className="text-white font-bold">{team.leadUserId}</span></span>
                      <span className="text-terminal-muted">Members: <span className="text-terminal-green font-bold">{team.memberCount}</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        )}

        {/* TAB 5: ROLES */}
        {activeTab === 'ROLES' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest text-terminal-amber">Role-Based Access Control (RBAC) Hierarchy</h3>
              <Button size="xs" onClick={() => setShowCreateRoleModal(true)} className="bg-terminal-amber text-black hover:bg-terminal-amber/80">
                <Plus className="w-3 h-3 mr-1" /> Create Custom Role
              </Button>
            </div>

            <Panel title="Enterprise Role Definitions" icon={Lock}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {roles.map(r => (
                  <div key={r.id} className="p-4 rounded bg-white/5 border border-terminal-border/60 space-y-3 font-mono text-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-terminal-border/40 pb-2">
                        <span className="font-bold text-white">{r.name}</span>
                        {r.isSystem && <span className="text-[9px] px-1.5 py-0.5 rounded bg-terminal-muted/20 text-terminal-muted">SYSTEM</span>}
                      </div>
                      <p className="text-terminal-muted text-[11px] mt-2">{r.description}</p>
                    </div>
                    <div className="pt-3 border-t border-terminal-border/20 flex justify-between items-center text-[10px]">
                      <span className="text-terminal-amber font-bold">{r.permissions.length} Permissions</span>
                      <span className="text-terminal-muted">{r.userCount} Users Assigned</span>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        )}

        {/* TAB 6: PERMISSIONS */}
        {activeTab === 'PERMISSIONS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <SearchBar placeholder="Filter permissions..." value={searchQuery} onChange={setSearchQuery} />
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="text-terminal-muted text-[10px]">Workspace Filter:</span>
                <select 
                  value={permissionFilter} 
                  onChange={e => setPermissionFilter(e.target.value)}
                  className="bg-black/60 border border-terminal-border rounded px-2 py-1 text-white text-xs"
                >
                  <option value="ALL">All Workspaces</option>
                  {['DASHBOARD', 'RESEARCH', 'AI', 'STRATEGY', 'COMMITTEE', 'OMS', 'PORTFOLIO', 'RISK', 'EXECUTION', 'ACCOUNTING', 'TREASURY', 'NOTIFICATIONS', 'ADMINISTRATION'].map(ws => (
                    <option key={ws} value={ws}>{ws}</option>
                  ))}
                </select>
              </div>
            </div>

            <Panel title="Granular Permission Matrix (13 Workspaces × 8 Actions)" icon={ShieldCheck}>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-terminal-border text-[10px] text-terminal-muted uppercase">
                      <th className="p-3">Perm ID</th>
                      <th className="p-3">Code</th>
                      <th className="p-3">Workspace</th>
                      <th className="p-3">Action</th>
                      <th className="p-3">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-terminal-border/30">
                    {filteredPermissions.map(p => (
                      <tr key={p.id} className="hover:bg-white/5">
                        <td className="p-3 text-terminal-amber font-bold">{p.permId}</td>
                        <td className="p-3 text-terminal-cyan font-bold">{p.code}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-terminal-blue/20 text-terminal-blue font-bold text-[10px]">{p.workspace}</span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-terminal-green/20 text-terminal-green font-bold text-[10px]">{p.action}</span>
                        </td>
                        <td className="p-3 text-terminal-muted">{p.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>
        )}

        {/* TAB 7: SESSIONS */}
        {activeTab === 'SESSIONS' && (
          <div className="space-y-4">
            <Panel title="Active User Sessions & Device Tracking" icon={LogOut}>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-terminal-border text-[10px] text-terminal-muted uppercase">
                      <th className="p-3">Session ID</th>
                      <th className="p-3">User</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">IP & Location</th>
                      <th className="p-3">Device</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-terminal-border/30">
                    {sessions.map(s => (
                      <tr key={s.id} className="hover:bg-white/5">
                        <td className="p-3 text-terminal-amber font-bold">{s.sessionId}</td>
                        <td className="p-3">
                          <div className="font-bold text-white">{s.userName}</div>
                          <div className="text-[10px] text-terminal-muted">{s.userEmail}</div>
                        </td>
                        <td className="p-3 text-terminal-blue">{s.role}</td>
                        <td className="p-3">
                          <div className="text-white">{s.ipAddress}</div>
                          <div className="text-[10px] text-terminal-muted">{s.location}</div>
                        </td>
                        <td className="p-3 text-terminal-muted">{s.deviceType}</td>
                        <td className="p-3">
                          <StatusBadge status={s.status} />
                        </td>
                        <td className="p-3">
                          {s.status === 'ACTIVE' && (
                            <Button size="xs" variant="outline" className="text-terminal-red border-terminal-red/30 hover:bg-terminal-red/20" onClick={() => handleRevokeSession(s.sessionId)}>
                              Force Logout
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>
        )}

        {/* TAB 8: API KEYS */}
        {activeTab === 'API_KEYS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest text-terminal-amber">Enterprise API Key Management & Rotation</h3>
              <Button size="xs" onClick={() => setShowCreateApiKeyModal(true)} className="bg-terminal-amber text-black hover:bg-terminal-amber/80">
                <KeyRound className="w-3 h-3 mr-1" /> Generate API Key
              </Button>
            </div>

            <Panel title="Active API Keys" icon={Key}>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-terminal-border text-[10px] text-terminal-muted uppercase">
                      <th className="p-3">Key ID</th>
                      <th className="p-3">Name</th>
                      <th className="p-3">Masked Secret</th>
                      <th className="p-3">Owner</th>
                      <th className="p-3">Scopes</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-terminal-border/30">
                    {apiKeys.map(k => (
                      <tr key={k.id} className="hover:bg-white/5">
                        <td className="p-3 text-terminal-amber font-bold">{k.keyId}</td>
                        <td className="p-3 font-bold text-white">{k.name}</td>
                        <td className="p-3 text-terminal-cyan font-mono">{k.keyMasked}</td>
                        <td className="p-3 text-terminal-muted">{k.ownerEmail}</td>
                        <td className="p-3">
                          <div className="flex gap-1 flex-wrap">
                            {k.scopes.map(sc => (
                              <span key={sc} className="px-1.5 py-0.5 rounded bg-white/10 text-white text-[9px]">{sc}</span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3">
                          <StatusBadge status={k.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>
        )}

        {/* TAB: SECRETS & KEY MANAGEMENT (ESKM PHASE 10D) */}
        {activeTab === 'SECRETS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-xs text-terminal-muted">
                <Key className="w-4 h-4 text-terminal-amber" />
                <span>Enterprise Vault Standard • AES-256-GCM Hardware Encrypted</span>
              </div>
            </div>

            <Panel title="Enterprise Platform Secrets Vault (AES-256-GCM)" icon={Key}>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-terminal-border text-[10px] text-terminal-muted uppercase">
                      <th className="p-3">Secret ID</th>
                      <th className="p-3">Name</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Masked Ciphertext</th>
                      <th className="p-3">Environment</th>
                      <th className="p-3">Version</th>
                      <th className="p-3">Auto-Rotate</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-terminal-border/30">
                    {secrets.map((sec: any) => (
                      <tr key={sec.id} className="hover:bg-white/5">
                        <td className="p-3 text-terminal-amber font-bold">{sec.id}</td>
                        <td className="p-3 font-bold text-white">{sec.name}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-terminal-blue/20 text-terminal-blue text-[10px] font-bold">
                            {sec.category}
                          </span>
                        </td>
                        <td className="p-3 text-terminal-cyan font-mono text-[11px]">
                          {sec.maskedValue}
                        </td>
                        <td className="p-3 text-terminal-muted">{sec.environment}</td>
                        <td className="p-3 text-white font-bold">v{sec.currentVersion}</td>
                        <td className="p-3 text-terminal-muted">{sec.autoRotateDays}d</td>
                        <td className="p-3">
                          <StatusBadge status={sec.status} />
                        </td>
                        <td className="p-3 text-right">
                          <Button size="xs" variant="ghost" onClick={async () => {
                            try {
                              const res = await fetchApi(`/api/secrets/rotate`, {
                                method: 'POST',
                                body: JSON.stringify({ secretId: sec.id, triggeredBy: 'ADMIN_UI' })
                              });
                              if (res?.data) fetchAllData();
                            } catch (e) {
                              console.error('Rotate secret error:', e);
                            }
                          }}>
                            Rotate
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>
        )}

        {/* TAB 9: SECURITY POLICIES */}
        {activeTab === 'SECURITY_POLICIES' && (
          <div className="space-y-4">
            <Panel title="Enterprise Security Policies" icon={Shield}>
              <div className="space-y-4">
                {securityPolicies.map(pol => (
                  <div key={pol.id} className="p-4 rounded bg-white/5 border border-terminal-border/60 flex items-center justify-between font-mono text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{pol.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-terminal-blue/20 text-terminal-blue">{pol.category}</span>
                      </div>
                      <div className="text-[11px] text-terminal-muted mt-2">
                        Configuration: {JSON.stringify(pol.configuration)}
                      </div>
                    </div>

                    <button 
                      onClick={() => handleTogglePolicy(pol.policyId)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded border text-xs font-bold transition-colors",
                        pol.isEnabled ? "bg-terminal-green/20 border-terminal-green text-terminal-green" : "bg-terminal-muted/20 border-terminal-muted text-terminal-muted"
                      )}
                    >
                      {pol.isEnabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      <span>{pol.isEnabled ? 'ENABLED' : 'DISABLED'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        )}

        {/* TAB 10: AUDIT */}
        {activeTab === 'AUDIT' && (
          <div className="space-y-4">
            <Panel title="Administration Audit Log" icon={History}>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-terminal-border text-[10px] text-terminal-muted uppercase">
                      <th className="p-3">Audit ID</th>
                      <th className="p-3">Actor</th>
                      <th className="p-3">Action</th>
                      <th className="p-3">Target Resource</th>
                      <th className="p-3">Details</th>
                      <th className="p-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-terminal-border/30">
                    {auditLogs.map(a => (
                      <tr key={a.id} className="hover:bg-white/5">
                        <td className="p-3 text-terminal-amber font-bold">{a.auditId}</td>
                        <td className="p-3 text-white font-bold">{a.actorEmail}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-terminal-blue/20 text-terminal-blue text-[10px] font-bold">{a.action}</span>
                        </td>
                        <td className="p-3 text-terminal-cyan">{a.targetResource}</td>
                        <td className="p-3 text-terminal-muted">{a.details}</td>
                        <td className="p-3 text-terminal-muted text-[10px]">{safeFormat(a.timestamp, 'yyyy-MM-dd HH:mm:ss')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>
        )}

        {/* TAB 11: RUNTIME */}
        {activeTab === 'RUNTIME' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard title="Active Workers" value={(runtimeMetric?.activeWorkers || 6).toString()} subtitle="Admin Worker Threads" icon={Cpu} color="amber" />
              <MetricCard title="Cached Permissions" value={(runtimeMetric?.cachedPermissionsCount || 128).toString()} subtitle="In-Memory Cache" icon={Layers} color="cyan" />
              <MetricCard title="Policy Validator" value={runtimeMetric?.policyValidatorStatus || 'ACTIVE'} subtitle="Real-time Enforcement" icon={CheckCircle2} color="green" />
            </div>

            <Panel title="Administration Runtime Worker Telemetry" icon={Server}>
              <div className="p-4 rounded bg-black/40 border border-terminal-border/60 font-mono text-xs space-y-3">
                <div className="text-terminal-amber font-bold text-sm">[ADMIN_RUNTIME_WORKER_POOL]</div>
                <div className="text-terminal-muted">Worker 01: Active • Syncing permission cache across cluster...</div>
                <div className="text-terminal-muted">Worker 02: Active • Monitoring session timeouts (Sweep interval 30s)...</div>
                <div className="text-terminal-muted">Worker 03: Active • Validating API key expiry policy...</div>
                <div className="text-terminal-muted">Worker 04: Active • Auditing inter-module RBAC calls (EP03, EP11, EP12, EP13, EP16, EP17, EP18)...</div>
                <div className="text-terminal-green font-bold pt-2">All 6 Workers Operating Nominally. Health Score: {runtimeMetric?.healthScore || 100}%</div>
              </div>
            </Panel>
          </div>
        )}

        {/* TAB 12: INSPECTOR & QA */}
        {activeTab === 'INSPECTOR' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Workspace Access Tester */}
              <Panel title="Workspace Access Engine Tester" icon={ShieldCheck}>
                <div className="space-y-4 font-mono text-xs">
                  <div>
                    <label className="text-terminal-muted text-[10px] block mb-1">User Email:</label>
                    <input 
                      type="email" 
                      value={checkEmail} 
                      onChange={e => setCheckEmail(e.target.value)} 
                      className="w-full bg-black/60 border border-terminal-border rounded p-2 text-white text-xs" 
                    />
                  </div>

                  <div>
                    <label className="text-terminal-muted text-[10px] block mb-1">Target Workspace:</label>
                    <select 
                      value={checkWorkspace} 
                      onChange={e => setCheckWorkspace(e.target.value as any)} 
                      className="w-full bg-black/60 border border-terminal-border rounded p-2 text-white text-xs"
                    >
                      {['DASHBOARD', 'RESEARCH', 'AI', 'STRATEGY', 'COMMITTEE', 'OMS', 'PORTFOLIO', 'RISK', 'EXECUTION', 'ACCOUNTING', 'TREASURY', 'NOTIFICATIONS', 'ADMINISTRATION'].map(ws => (
                        <option key={ws} value={ws}>{ws}</option>
                      ))}
                    </select>
                  </div>

                  <Button size="xs" onClick={handleCheckAccess} className="w-full bg-terminal-amber text-black font-bold">
                    Test Workspace Authorization
                  </Button>

                  {accessResult && (
                    <div className={cn("p-3 rounded border text-xs mt-3", accessResult.allowed ? "bg-terminal-green/20 border-terminal-green text-terminal-green" : "bg-terminal-red/20 border-terminal-red text-terminal-red")}>
                      <div className="font-bold">{accessResult.allowed ? 'AUTHORIZATION GRANTED' : 'AUTHORIZATION DENIED'}</div>
                      <div className="text-[11px] mt-1">{accessResult.reason}</div>
                    </div>
                  )}
                </div>
              </Panel>

              {/* QA Suite Runner */}
              <Panel title="EP19 QA Verification Suite" icon={FileCheck}>
                <div className="space-y-4 font-mono text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-terminal-muted">Build Status: <span className="text-terminal-green font-bold">{qaReport?.buildStatus || 'PASS'}</span></span>
                    <Button size="xs" onClick={handleRunQa} variant="outline" className="text-terminal-amber border-terminal-amber/40">
                      Run Full EP19 QA Suite
                    </Button>
                  </div>

                  {qaReport && (
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {qaReport.modules.map(m => (
                        <div key={m.moduleId} className="p-2 rounded bg-white/5 border border-terminal-border/30 flex items-center justify-between text-[10px]">
                          <div>
                            <span className="font-bold text-white">{m.moduleId}: {m.moduleName}</span>
                            <p className="text-terminal-muted">{m.details}</p>
                          </div>
                          <span className="px-1.5 py-0.5 rounded bg-terminal-green/20 text-terminal-green font-bold">{m.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Panel>
            </div>
          </div>
        )}
      </div>

      {/* CREATE USER MODAL */}
      {showCreateUserModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-terminal-bg border border-terminal-amber p-6 rounded max-w-md w-full space-y-4 font-mono text-xs">
            <div className="flex justify-between items-center border-b border-terminal-border pb-2">
              <span className="font-bold text-terminal-amber text-sm">Add New Enterprise User</span>
              <button onClick={() => setShowCreateUserModal(false)}><X className="w-4 h-4 text-terminal-muted" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-terminal-muted text-[10px] block mb-1">Full Name</label>
                <input value={newUserName} onChange={e => setNewUserName(e.target.value)} placeholder="e.g. Sarah Jenkins" className="w-full bg-black/60 border border-terminal-border rounded p-2 text-white" />
              </div>
              <div>
                <label className="text-terminal-muted text-[10px] block mb-1">Email Address</label>
                <input value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} placeholder="e.g. sarah@arina.ai" className="w-full bg-black/60 border border-terminal-border rounded p-2 text-white" />
              </div>
              <div>
                <label className="text-terminal-muted text-[10px] block mb-1">Role</label>
                <select value={newUserRole} onChange={e => setNewUserRole(e.target.value as any)} className="w-full bg-black/60 border border-terminal-border rounded p-2 text-white">
                  {['SUPER_ADMIN', 'PLATFORM_ADMIN', 'ORGANIZATION_ADMIN', 'TREASURY_OFFICER', 'RISK_OFFICER', 'COMPLIANCE_OFFICER', 'TRADER', 'ANALYST', 'VIEWER'].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button size="xs" variant="ghost" onClick={() => setShowCreateUserModal(false)}>Cancel</Button>
              <Button size="xs" onClick={handleCreateUser} className="bg-terminal-amber text-black font-bold">Create User</Button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE ROLE MODAL */}
      {showCreateRoleModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-terminal-bg border border-terminal-amber p-6 rounded max-w-md w-full space-y-4 font-mono text-xs">
            <div className="flex justify-between items-center border-b border-terminal-border pb-2">
              <span className="font-bold text-terminal-amber text-sm">Create Custom Enterprise Role</span>
              <button onClick={() => setShowCreateRoleModal(false)}><X className="w-4 h-4 text-terminal-muted" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-terminal-muted text-[10px] block mb-1">Role Name</label>
                <input value={newRoleName} onChange={e => setNewRoleName(e.target.value)} placeholder="e.g. Senior Treasury Auditor" className="w-full bg-black/60 border border-terminal-border rounded p-2 text-white" />
              </div>
              <div>
                <label className="text-terminal-muted text-[10px] block mb-1">Description</label>
                <input value={newRoleDesc} onChange={e => setNewRoleDesc(e.target.value)} placeholder="e.g. Read and approval authority for cash flows" className="w-full bg-black/60 border border-terminal-border rounded p-2 text-white" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button size="xs" variant="ghost" onClick={() => setShowCreateRoleModal(false)}>Cancel</Button>
              <Button size="xs" onClick={handleCreateRole} className="bg-terminal-amber text-black font-bold">Save Role</Button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE API KEY MODAL */}
      {showCreateApiKeyModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-terminal-bg border border-terminal-amber p-6 rounded max-w-md w-full space-y-4 font-mono text-xs">
            <div className="flex justify-between items-center border-b border-terminal-border pb-2">
              <span className="font-bold text-terminal-amber text-sm">Generate Enterprise API Key</span>
              <button onClick={() => setShowCreateApiKeyModal(false)}><X className="w-4 h-4 text-terminal-muted" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-terminal-muted text-[10px] block mb-1">Key Name / Description</label>
                <input value={newKeyName} onChange={e => setNewKeyName(e.target.value)} placeholder="e.g. OMS Order Flow Ingestion Key" className="w-full bg-black/60 border border-terminal-border rounded p-2 text-white" />
              </div>
              <div>
                <label className="text-terminal-muted text-[10px] block mb-1">Scope</label>
                <input value={newKeyScope} onChange={e => setNewKeyScope(e.target.value)} placeholder="e.g. oms:write" className="w-full bg-black/60 border border-terminal-border rounded p-2 text-white" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button size="xs" variant="ghost" onClick={() => setShowCreateApiKeyModal(false)}>Cancel</Button>
              <Button size="xs" onClick={handleCreateApiKey} className="bg-terminal-amber text-black font-bold">Generate Key</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
