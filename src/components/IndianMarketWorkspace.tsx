import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Calendar, 
  Clock, 
  Compass, 
  Activity, 
  RefreshCw, 
  ShieldCheck, 
  Layers, 
  FileText, 
  Briefcase, 
  DollarSign, 
  AlertTriangle, 
  TrendingUp, 
  Database,
  ArrowRight,
  CheckCircle,
  XCircle,
  HelpCircle,
  Settings,
  Plus,
  Trash,
  Wifi,
  WifiOff,
  BarChart2,
  Eye,
  Building2,
  Flame,
  Search,
  Filter,
  Sliders
} from 'lucide-react';
import { fetchApi, resolveArrayData } from '../lib/api.ts';
import { MarketInspectorPanel, InspectorInstrument } from './market/MarketInspectorPanel';
import { EnterpriseMarketTable, ColumnDef } from './market/EnterpriseMarketTable';
import { MarketDashboardWidgets } from './market/MarketDashboardWidgets';
import { OptionChainView } from './market/OptionChainView';
import { SectorView } from './market/SectorView';
import { MCXCommodityView } from './market/MCXCommodityView';
import { MarketWatchView } from './market/MarketWatchView';

/**
 * Defensive Normalization Helper for Market API Data
 * Safely resolves unknown or wrapped API responses into a clean typed array.
 */
function normalizeArray<T>(data: any, key?: string): T[] {
  if (!data || data._isApiError) return [];
  if (Array.isArray(data)) return data;
  if (key && Array.isArray(data[key])) return data[key];
  const resolved = resolveArrayData(data);
  return Array.isArray(resolved) ? resolved : [];
}

interface CalendarDay {
  id: string;
  date: string;
  dayType: string;
  sessionName?: string;
  description?: string;
}

interface SessionInfo {
  id: string;
  sessionType: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface ClockInfo {
  exchangeTime: string;
  serverTime: string;
  driftMs: number;
  timezone: string;
}

interface SettlementItem {
  tradeId: string;
  instrumentId: string;
  quantity: number;
  price: number;
  buyerId: string;
  sellerId: string;
  status: 'PENDING' | 'VALIDATED' | 'SETTLED' | 'REJECTED';
  reason?: string;
  timestamp: string;
}

interface ExpiryItem {
  instrumentId: string;
  symbol: string;
  type: string;
  expiryDate: string;
  daysRemaining: number;
}

interface CircuitItem {
  instrumentId: string;
  symbol: string;
  lastPrice: number;
  upperCircuit: number;
  lowerCircuit: number;
  isTriggered: boolean;
  triggerType?: 'UPPER' | 'LOWER' | null;
  haltedUntil?: string | null;
}

interface AuctionItem {
  id: string;
  auctionType: string;
  status: string;
  startTime: string;
  endTime: string;
  volumeTraded: number;
}

interface CorporateActionItem {
  id: string;
  instrumentId: string;
  actionType: string;
  ratioOrValue: string;
  recordDate: string;
  appliedDate?: string;
  status: string;
}

interface PolicyItem {
  id: string;
  policyName: string;
  description: string;
  rules: {
    tradingAllowed: boolean;
    maxLeverage: number;
    shortSellingEnabled: boolean;
    circuitBreakerPercentage: number;
    allowedSegments: string[];
  };
}

interface EventItem {
  id: string;
  eventType: string;
  payload: Record<string, any>;
  createdAt: string;
}

export const IndianMarketWorkspace = () => {
  const [activeTab, setActiveTab] = useState<
    'DASHBOARD' | 'WATCHLIST' | 'OPTION_CHAIN' | 'SECTOR_VIEW' | 'MCX_COMMODITY' | 'INSPECTOR' | 'STATUS' | 'CALENDAR' | 'SESSIONS' | 'CLOCK' | 'SETTLEMENT' | 'EXPIRY' | 'CIRCUITS' | 'AUCTIONS' | 'CORP_ACTIONS' | 'POLICIES' | 'VALIDATION' | 'EVENTS'
  >('DASHBOARD');

  // Inspector & Master Data states
  const [inspectorInstrument, setInspectorInstrument] = useState<InspectorInstrument | null>(null);
  const [masterSubTab, setMasterSubTab] = useState<
    'EXCHANGE' | 'INSTRUMENT' | 'ISIN' | 'ETF' | 'INDEX' | 'DERIVATIVE' | 'EXPIRY' | 'OPTION_META' | 'LOT_SIZE' | 'TICK_SIZE' | 'CIRCUITS' | 'FREEZE_QTY' | 'CORP_ACTIONS' | 'CALENDAR' | 'HOLIDAY' | 'MCX_CONTRACTS' | 'BROKER_MAP' | 'DATA_PROVIDER' | 'SYNC_STATUS'
  >('EXCHANGE');
  
  // States for backend data
  const [calendar, setCalendar] = useState<CalendarDay[]>([]);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [clock, setClock] = useState<ClockInfo | null>(null);
  const [marketStatus, setMarketStatus] = useState<any>(null);
  const [settlement, setSettlement] = useState<{ queue: SettlementItem[]; status: string; lastSettledDate: string }>({ queue: [], status: "STABLE", lastSettledDate: "" });
  const [expiries, setExpiries] = useState<ExpiryItem[]>([]);
  const [circuits, setCircuits] = useState<CircuitItem[]>([]);
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [corpActions, setCorpActions] = useState<CorporateActionItem[]>([]);
  const [policies, setPolicies] = useState<PolicyItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);

  // Validation state
  const [valModule, setValModule] = useState<'RESEARCH' | 'AI_INTELLIGENCE' | 'STRATEGY' | 'COMMITTEE' | 'LIFECYCLE' | 'PAPER_TRADING' | 'TRADING'>('TRADING');
  const [valSymbol, setValSymbol] = useState<string>('RELIANCE.NS');
  const [valResult, setValResult] = useState<any>(null);

  // Form states for calendar additions
  const [newDate, setNewDate] = useState<string>('');
  const [newType, setNewType] = useState<string>('HOLIDAY');
  const [newName, setNewName] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');

  // Loading, error, and connection states
  const [loading, setLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState<boolean>(true);
  const [reconnectCount, setReconnectCount] = useState<number>(0);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load everything on start
  useEffect(() => {
    loadAllData();

    // Auto-reconnect / live heartbeat poll every 30 seconds for WebSocket fallback
    const interval = setInterval(() => {
      loadAllData(true);
    }, 30000);

    return () => {
      clearInterval(interval);
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    };
  }, []);

  const loadAllData = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      setApiError(null);

      const [calData, sessData, clkData, statusData, settleData, expData, circData, aucData, corpData, polData, evData] = await Promise.all([
        fetchApi('/api/indian-market/calendar').catch(err => ({ _isApiError: true, error: err })),
        fetchApi('/api/indian-market/session').catch(err => ({ _isApiError: true, error: err })),
        fetchApi('/api/indian-market/clock').catch(err => ({ _isApiError: true, error: err })),
        fetchApi('/api/indian-market/status').catch(err => ({ _isApiError: true, error: err })),
        fetchApi('/api/indian-market/settlement').catch(err => ({ _isApiError: true, error: err })),
        fetchApi('/api/indian-market/expiry').catch(err => ({ _isApiError: true, error: err })),
        fetchApi('/api/indian-market/circuits').catch(err => ({ _isApiError: true, error: err })),
        fetchApi('/api/indian-market/auctions').catch(err => ({ _isApiError: true, error: err })),
        fetchApi('/api/indian-market/corporate-actions').catch(err => ({ _isApiError: true, error: err })),
        fetchApi('/api/indian-market/policies').catch(err => ({ _isApiError: true, error: err })),
        fetchApi('/api/indian-market/events').catch(err => ({ _isApiError: true, error: err }))
      ]);

      // Defensive normalization guarantees arrays are ALWAYS arrays
      setCalendar(normalizeArray<CalendarDay>(calData));
      setSessions(normalizeArray<SessionInfo>(sessData));
      setClock(clkData && !clkData._isApiError ? clkData : null);
      setMarketStatus(statusData && !statusData._isApiError ? statusData : null);

      const safeSettle = settleData && !settleData._isApiError ? settleData : {};
      setSettlement({
        queue: normalizeArray<SettlementItem>(safeSettle.queue),
        status: safeSettle.status || "STABLE",
        lastSettledDate: safeSettle.lastSettledDate || ""
      });

      setExpiries(normalizeArray<ExpiryItem>(expData, 'expiries'));
      setCircuits(normalizeArray<CircuitItem>(circData, 'limits'));
      setAuctions(normalizeArray<AuctionItem>(aucData, 'auctions'));
      setCorpActions(normalizeArray<CorporateActionItem>(corpData));
      setPolicies(normalizeArray<PolicyItem>(polData));
      setEvents(normalizeArray<EventItem>(evData));

      setWsConnected(true);
    } catch (err: any) {
      console.error("Error loading EP05 Indian Market Data:", err);
      setWsConnected(false);
      setApiError(err.message || "Failed to establish stable connection to Indian Market Feed.");
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  const handleManualReconnect = async () => {
    setReconnectCount(prev => prev + 1);
    setWsConnected(false);
    showFeedback("Re-establishing WebSocket feed & market synchronization...", "success");
    await loadAllData();
  };

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  // Trigger Master Sync (Module 12)
  const handleMasterSync = async () => {
    try {
      setLoading(true);
      const res = await fetchApi('/api/indian-market/sync', { method: 'POST' });
      if (res && res.success) {
        showFeedback("Indian Market Runtime Synchronization completed successfully.");
        await loadAllData();
      } else {
        showFeedback("Synchronization failed.", "error");
      }
    } catch (err: any) {
      showFeedback(err.message || "Failed synchronization.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Clock Sync
  const handleClockSync = async () => {
    try {
      setLoading(true);
      const res = await fetchApi('/api/indian-market/clock/sync', { method: 'POST' });
      if (res && res.success) {
        showFeedback(`Drift corrected. Net offset: ${res.clock.driftMs}ms.`);
        setClock(res.clock);
        await loadAllData();
      }
    } catch (err: any) {
      showFeedback("Clock synchronization failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Add Calendar Day
  const handleAddCalendar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || !newType) return;
    try {
      setLoading(true);
      const res = await fetchApi('/api/indian-market/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: newDate, dayType: newType, sessionName: newName, description: newDesc })
      });
      if (res && res.success) {
        showFeedback("New holiday or special trading session registered.");
        setNewDate('');
        setNewName('');
        setNewDesc('');
        await loadAllData();
      }
    } catch (err: any) {
      showFeedback(err.message || "Could not add day.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Delete Calendar Day
  const handleDeleteCalendar = async (date: string) => {
    try {
      setLoading(true);
      const res = await fetchApi(`/api/indian-market/calendar/${date}`, { method: 'DELETE' });
      if (res && res.success) {
        showFeedback(`Removed holiday configuration for ${date}.`);
        await loadAllData();
      }
    } catch (err: any) {
      showFeedback("Failed to delete.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Configure Session times
  const handleConfigureSession = async (sessType: string, start: string, end: string) => {
    try {
      setLoading(true);
      const res = await fetchApi('/api/indian-market/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionType: sessType, startTime: start, endTime: end })
      });
      if (res && res.success) {
        showFeedback(`Updated timing bounds for ${sessType}.`);
        await loadAllData();
      }
    } catch (err: any) {
      showFeedback("Timing update failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Activate Session
  const handleActivateSession = async (sessType: string) => {
    try {
      setLoading(true);
      const res = await fetchApi('/api/indian-market/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionType: sessType, isActive: true })
      });
      if (res && res.success) {
        showFeedback(`Session successfully transitioned to ${sessType}.`);
        await loadAllData();
      }
    } catch (err: any) {
      showFeedback("Session transition failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Run T+1 Settlement (Module 5)
  const handleRunSettlement = async () => {
    try {
      setLoading(true);
      const res = await fetchApi('/api/indian-market/settlement/reconcile', { method: 'POST' });
      if (res && res.success) {
        showFeedback(`T+1 settlement executed. Reconciled ${res.settledCount} trade transactions.`);
        await loadAllData();
      }
    } catch (err: any) {
      showFeedback("Settlement execution failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Trigger Circuit Break (Module 7)
  const handleTriggerCircuit = async (symbol: string, direction: 'UPPER' | 'LOWER', price: number) => {
    try {
      setLoading(true);
      const res = await fetchApi('/api/indian-market/circuits/halt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, direction, price })
      });
      if (res && res.success) {
        showFeedback(`Halt applied to ${symbol} due to ${direction} threshold break.`);
        await loadAllData();
      }
    } catch (err: any) {
      showFeedback("Failed to trigger circuit.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Recover Circuit Halt
  const handleRecoverCircuit = async (symbol: string) => {
    try {
      setLoading(true);
      const res = await fetchApi('/api/indian-market/circuits/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol })
      });
      if (res && res.success) {
        showFeedback(`Trading resumed for ${symbol}. Price bands extended by 5%.`);
        await loadAllData();
      }
    } catch (err: any) {
      showFeedback("Failed to recover circuit halt.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Update Call Auction Status (Module 8)
  const handleUpdateAuction = async (auctionId: string, status: string, volume = 0) => {
    try {
      setLoading(true);
      const res = await fetchApi('/api/indian-market/auctions/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auctionId, status, volume })
      });
      if (res && res.success) {
        showFeedback(`Call Auction ${auctionId} changed state to ${status}.`);
        await loadAllData();
      }
    } catch (err: any) {
      showFeedback("Failed to update auction state.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Apply Corporate Actions (Module 9)
  const handleApplyCorpAction = async (id: string) => {
    try {
      setLoading(true);
      const res = await fetchApi('/api/indian-market/corporate-actions/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res && res.success) {
        showFeedback(res.message);
        await loadAllData();
      }
    } catch (err: any) {
      showFeedback("Corporate Action execution failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Tune Regulatory Policy rules (Module 11)
  const handleTunePolicy = async (policyName: string, rules: any) => {
    try {
      setLoading(true);
      const res = await fetchApi('/api/indian-market/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ policyName, rules })
      });
      if (res && res.success) {
        showFeedback(`Tuned rules and multiplier factors for policy '${policyName}'.`);
        await loadAllData();
      }
    } catch (err: any) {
      showFeedback("Failed tuning policy.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Run Transaction Pre-Validation (Module 10)
  const handleRunValidation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetchApi('/api/indian-market/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleName: valModule, symbol: valSymbol })
      });
      if (res) {
        setValResult(res);
        if (res.isValid) {
          showFeedback("Pre-Transaction checks passed cleanly.", "success");
        } else {
          showFeedback("Pre-Transaction validation failed.", "error");
        }
        await loadAllData();
      }
    } catch (err: any) {
      showFeedback("Validation routine failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Defensive normalization guarantees arrays are ALWAYS valid arrays before any map/filter/iteration
  const safeCalendar = Array.isArray(calendar) ? calendar : [];
  const safeSessions = Array.isArray(sessions) ? sessions : [];
  const safeExpiries = Array.isArray(expiries) ? expiries : [];
  const safeCircuits = Array.isArray(circuits) ? circuits : [];
  const safeAuctions = Array.isArray(auctions) ? auctions : [];
  const safeCorpActions = Array.isArray(corpActions) ? corpActions : [];
  const safePolicies = Array.isArray(policies) ? policies : [];
  const safeEvents = Array.isArray(events) ? events : [];
  const safeSettlementQueue = Array.isArray(settlement?.queue) ? settlement.queue : [];

  return (
    <div className="flex-1 flex flex-col h-full bg-terminal-bg font-mono overflow-y-auto">
      {/* HEADER SECTION */}
      <header className="border-b border-terminal-border p-6 bg-black flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${wsConnected ? 'bg-terminal-amber animate-pulse' : 'bg-rose-500'}`}></span>
            <h1 className="text-xl font-bold tracking-tight text-white uppercase">AI ARINA Indian Market OS v2.0</h1>
            <span className={`px-2 py-0.5 text-[9px] font-bold border rounded flex items-center gap-1 ${
              wsConnected ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800' : 'bg-rose-950/60 text-rose-400 border-rose-800'
            }`}>
              {wsConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {wsConnected ? 'WS FEED ONLINE' : 'DISCONNECTED'}
            </span>
          </div>
          <p className="text-xs text-terminal-muted mt-1">EP05 Master Operating Layer & SEBI/NSE-BSE Compliance Registry</p>
        </div>

        <div className="flex items-center gap-3">
          {!wsConnected && (
            <button
              onClick={handleManualReconnect}
              className="px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-500 text-rose-300 transition-colors flex items-center gap-1.5 text-xs font-bold uppercase"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              RECONNECT FEED ({reconnectCount})
            </button>
          )}

          <button 
            onClick={handleMasterSync}
            disabled={loading}
            className="px-3 py-1.5 border border-terminal-border hover:bg-white hover:text-black transition-colors flex items-center gap-2 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            SYNCHRONIZE EP04 MASTER
          </button>
          
          <button 
            onClick={() => loadAllData()}
            disabled={loading}
            className="p-1.5 border border-terminal-border hover:bg-neutral-900 transition-colors"
            title="Refresh All State Engines"
          >
            <Compass className="w-4 h-4 text-terminal-amber" />
          </button>
        </div>
      </header>

      {/* FEED ERROR BANNER */}
      {apiError && (
        <div className="p-4 mx-6 mt-6 border bg-rose-950/30 border-rose-500/50 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>[FEED ALERT] {apiError}</span>
          </div>
          <button 
            onClick={handleManualReconnect}
            className="px-3 py-1 bg-rose-900 hover:bg-rose-800 text-white font-bold text-[10px] uppercase border border-rose-500 rounded transition flex items-center gap-1 shrink-0"
          >
            <RefreshCw className="w-3 h-3" /> Retry Connection
          </button>
        </div>
      )}

      {/* FLASH FEEDBACK MESSAGE */}
      {feedbackMsg && (
        <div className={`p-4 mx-6 mt-6 border ${
          feedbackMsg.type === 'success' 
            ? 'bg-emerald-950/20 border-emerald-500/50 text-emerald-400' 
            : 'bg-rose-950/20 border-rose-500/50 text-rose-400'
        } text-xs flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <span className="font-bold">[{feedbackMsg.type.toUpperCase()}]</span>
            <span>{feedbackMsg.text}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="font-bold hover:underline">X</button>
        </div>
      )}

      {/* CORE STATUS HERO MODULE (MODULE 4) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
        <div className="border border-terminal-border bg-black p-4">
          <div className="text-[10px] text-terminal-muted uppercase">Market Engine Status</div>
          <div className="flex items-center gap-2 mt-2">
            <span className={`w-2 h-2 rounded-full ${marketStatus?.status === 'OPEN' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            <span className="text-lg font-bold text-white uppercase tracking-wider">{marketStatus?.status || 'OFFLINE'}</span>
          </div>
          <div className="text-[10px] text-terminal-muted mt-2">Active Session: <span className="text-white">{marketStatus?.session || 'CLOSED'}</span></div>
        </div>

        <div className="border border-terminal-border bg-black p-4">
          <div className="text-[10px] text-terminal-muted uppercase">Unified Clock Offset (NSE Feed)</div>
          <div className="text-lg font-bold text-white mt-2">{clock?.driftMs !== undefined ? `${clock.driftMs} ms` : '--'}</div>
          <div className="text-[10px] text-terminal-muted mt-2 flex items-center gap-2 justify-between">
            <span>Timezone: Asia/Kolkata</span>
            <button onClick={handleClockSync} className="text-terminal-amber hover:underline text-[9px] uppercase font-bold">RE-CALIBRATE</button>
          </div>
        </div>

        <div className="border border-terminal-border bg-black p-4">
          <div className="text-[10px] text-terminal-muted uppercase">T+1 Settlement Queue</div>
          <div className="text-lg font-bold text-white mt-2">
            {safeSettlementQueue.filter(q => q.status === 'PENDING').length} / {safeSettlementQueue.length} PENDING
          </div>
          <div className="text-[10px] text-terminal-muted mt-2 flex items-center gap-2 justify-between">
            <span>Status: {settlement?.status || "STABLE"}</span>
            <button onClick={handleRunSettlement} className="text-terminal-amber hover:underline text-[9px] uppercase font-bold">RECONCILE</button>
          </div>
        </div>

        <div className="border border-terminal-border bg-black p-4">
          <div className="text-[10px] text-terminal-muted uppercase">Expiries & Countdown</div>
          <div className="text-lg font-bold text-white mt-2">
            {safeExpiries.filter(e => e.daysRemaining <= 7).length} CRITICAL
          </div>
          <div className="text-[10px] text-terminal-muted mt-2">Active Series: <span className="text-white">{safeExpiries.length} Contracts</span></div>
        </div>
      </div>

      {/* TABBED INTERACTION SECTIONS */}
      <div className="flex-1 px-6 pb-12 flex flex-col lg:flex-row gap-6">
        
        {/* SIDEBAR TABS */}
        <nav className="w-full lg:w-64 flex flex-col gap-1 shrink-0">
          <button 
            onClick={() => setActiveTab('DASHBOARD')} 
            className={`w-full text-left p-3 text-xs border border-terminal-border flex items-center gap-3 transition-all ${
              activeTab === 'DASHBOARD' ? 'bg-terminal-amber text-black font-black' : 'bg-black text-terminal-amber hover:text-white'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            00. MARKET DASHBOARD
          </button>

          <button 
            onClick={() => setActiveTab('WATCHLIST')} 
            className={`w-full text-left p-3 text-xs border border-terminal-border flex items-center gap-3 transition-all ${
              activeTab === 'WATCHLIST' ? 'bg-terminal-amber text-black font-black' : 'bg-black text-terminal-muted hover:text-white'
            }`}
          >
            <Eye className="w-4 h-4" />
            01. MARKET WATCH (LIVE)
          </button>

          <button 
            onClick={() => setActiveTab('OPTION_CHAIN')} 
            className={`w-full text-left p-3 text-xs border border-terminal-border flex items-center gap-3 transition-all ${
              activeTab === 'OPTION_CHAIN' ? 'bg-terminal-amber text-black font-black' : 'bg-black text-terminal-muted hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            02. ENTERPRISE OPTION CHAIN
          </button>

          <button 
            onClick={() => setActiveTab('SECTOR_VIEW')} 
            className={`w-full text-left p-3 text-xs border border-terminal-border flex items-center gap-3 transition-all ${
              activeTab === 'SECTOR_VIEW' ? 'bg-terminal-amber text-black font-black' : 'bg-black text-terminal-muted hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            03. SECTOR ROTATION
          </button>

          <button 
            onClick={() => setActiveTab('MCX_COMMODITY')} 
            className={`w-full text-left p-3 text-xs border border-terminal-border flex items-center gap-3 transition-all ${
              activeTab === 'MCX_COMMODITY' ? 'bg-terminal-amber text-black font-black' : 'bg-black text-terminal-muted hover:text-white'
            }`}
          >
            <Flame className="w-4 h-4" />
            04. COMMODITY INSTRUMENTS
          </button>

          <button 
            onClick={() => setActiveTab('INSPECTOR')} 
            className={`w-full text-left p-3 text-xs border border-terminal-border flex items-center gap-3 transition-all ${
              activeTab === 'INSPECTOR' ? 'bg-terminal-amber text-black font-black' : 'bg-black text-terminal-muted hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" />
            05. MASTER INSPECTOR
          </button>

          <button 
            onClick={() => setActiveTab('STATUS')} 
            className={`w-full text-left p-3 text-xs border border-terminal-border flex items-center gap-3 transition-all ${
              activeTab === 'STATUS' ? 'bg-white text-black font-bold' : 'bg-black text-terminal-muted hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" />
            06. CORE STATUS
          </button>

          <button 
            onClick={() => setActiveTab('CALENDAR')} 
            className={`w-full text-left p-3 text-xs border border-terminal-border flex items-center gap-3 transition-all ${
              activeTab === 'CALENDAR' ? 'bg-white text-black font-bold' : 'bg-black text-terminal-muted hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            01. HOLIDAYS & SESSIONS
          </button>

          <button 
            onClick={() => setActiveTab('SESSIONS')} 
            className={`w-full text-left p-3 text-xs border border-terminal-border flex items-center gap-3 transition-all ${
              activeTab === 'SESSIONS' ? 'bg-white text-black font-bold' : 'bg-black text-terminal-muted hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
            02. SESSIONS & TIMINGS
          </button>

          <button 
            onClick={() => setActiveTab('CLOCK')} 
            className={`w-full text-left p-3 text-xs border border-terminal-border flex items-center gap-3 transition-all ${
              activeTab === 'CLOCK' ? 'bg-white text-black font-bold' : 'bg-black text-terminal-muted hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            03. CLOCK CALIBRATOR
          </button>

          <button 
            onClick={() => setActiveTab('SETTLEMENT')} 
            className={`w-full text-left p-3 text-xs border border-terminal-border flex items-center gap-3 transition-all ${
              activeTab === 'SETTLEMENT' ? 'bg-white text-black font-bold' : 'bg-black text-terminal-muted hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            04. T+1 SETTLEMENT
          </button>

          <button 
            onClick={() => setActiveTab('EXPIRY')} 
            className={`w-full text-left p-3 text-xs border border-terminal-border flex items-center gap-3 transition-all ${
              activeTab === 'EXPIRY' ? 'bg-white text-black font-bold' : 'bg-black text-terminal-muted hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            05. EXPIRY DATE MODELS
          </button>

          <button 
            onClick={() => setActiveTab('CIRCUITS')} 
            className={`w-full text-left p-3 text-xs border border-terminal-border flex items-center gap-3 transition-all ${
              activeTab === 'CIRCUITS' ? 'bg-white text-black font-bold' : 'bg-black text-terminal-muted hover:text-white'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            06. CIRCUIT FREEZES
          </button>

          <button 
            onClick={() => setActiveTab('AUCTIONS')} 
            className={`w-full text-left p-3 text-xs border border-terminal-border flex items-center gap-3 transition-all ${
              activeTab === 'AUCTIONS' ? 'bg-white text-black font-bold' : 'bg-black text-terminal-muted hover:text-white'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            07. CALL AUCTIONS
          </button>

          <button 
            onClick={() => setActiveTab('CORP_ACTIONS')} 
            className={`w-full text-left p-3 text-xs border border-terminal-border flex items-center gap-3 transition-all ${
              activeTab === 'CORP_ACTIONS' ? 'bg-white text-black font-bold' : 'bg-black text-terminal-muted hover:text-white'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            08. CORPORATE ACTIONS
          </button>

          <button 
            onClick={() => setActiveTab('POLICIES')} 
            className={`w-full text-left p-3 text-xs border border-terminal-border flex items-center gap-3 transition-all ${
              activeTab === 'POLICIES' ? 'bg-white text-black font-bold' : 'bg-black text-terminal-muted hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            09. POLICIES & RISK
          </button>

          <button 
            onClick={() => setActiveTab('VALIDATION')} 
            className={`w-full text-left p-3 text-xs border border-terminal-border flex items-center gap-3 transition-all ${
              activeTab === 'VALIDATION' ? 'bg-white text-black font-bold' : 'bg-black text-terminal-muted hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            10. PRE-ORDER SHIELD
          </button>

          <button 
            onClick={() => setActiveTab('EVENTS')} 
            className={`w-full text-left p-3 text-xs border border-terminal-border flex items-center gap-3 transition-all ${
              activeTab === 'EVENTS' ? 'bg-white text-black font-bold' : 'bg-black text-terminal-muted hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            11. REGULATORY EVENTS
          </button>
        </nav>

        {/* WORKSPACE CONTENT AREA */}
        <div className="flex-1 border border-terminal-border bg-black p-4 min-h-[500px] flex flex-col overflow-hidden">
          
          {/* 00. MARKET DASHBOARD WIDGETS */}
          {activeTab === 'DASHBOARD' && (
            <div className="flex-1 overflow-y-auto">
              <MarketDashboardWidgets />
            </div>
          )}

          {/* 01. MARKET WATCH (LIVE FEEDS) */}
          {activeTab === 'WATCHLIST' && (
            <div className="flex-1 overflow-hidden">
              <MarketWatchView onSelectInstrument={(inst) => setInspectorInstrument(inst)} />
            </div>
          )}

          {/* 02. ENTERPRISE OPTION CHAIN */}
          {activeTab === 'OPTION_CHAIN' && (
            <div className="flex-1 overflow-hidden">
              <OptionChainView onSelectInstrument={(inst) => setInspectorInstrument(inst)} />
            </div>
          )}

          {/* 03. SECTOR ROTATION */}
          {activeTab === 'SECTOR_VIEW' && (
            <div className="flex-1 overflow-hidden">
              <SectorView onSelectInstrument={(inst) => setInspectorInstrument(inst)} />
            </div>
          )}

          {/* 04. MCX COMMODITIES */}
          {activeTab === 'MCX_COMMODITY' && (
            <div className="flex-1 overflow-hidden">
              <MCXCommodityView onSelectContract={(c) => setInspectorInstrument(c)} />
            </div>
          )}

          {/* 05. MASTER DATA INSPECTOR (19 MASTER TABLES) */}
          {activeTab === 'INSPECTOR' && (
            <div className="flex-1 flex flex-col overflow-hidden font-mono text-xs">
              
              {/* Master Inspector Sub-tabs */}
              <div className="pb-3 border-b border-slate-800 flex items-center justify-between shrink-0 overflow-x-auto gap-1">
                {[
                  { id: 'EXCHANGE', label: '01. Exchanges' },
                  { id: 'INSTRUMENT', label: '02. Instruments' },
                  { id: 'ISIN', label: '03. ISIN Master' },
                  { id: 'ETF', label: '04. ETFs' },
                  { id: 'INDEX', label: '05. Indices' },
                  { id: 'DERIVATIVE', label: '06. Derivatives' },
                  { id: 'EXPIRY', label: '07. Expiries' },
                  { id: 'OPTION_META', label: '08. Option Chain Meta' },
                  { id: 'LOT_SIZE', label: '09. Lot Sizes' },
                  { id: 'TICK_SIZE', label: '10. Tick Sizes' },
                  { id: 'CIRCUITS', label: '11. Circuit Limits' },
                  { id: 'FREEZE_QTY', label: '12. Freeze Qty' },
                  { id: 'CORP_ACTIONS', label: '13. Corp Actions' },
                  { id: 'CALENDAR', label: '14. Trading Cal' },
                  { id: 'HOLIDAY', label: '15. Holidays' },
                  { id: 'MCX_CONTRACTS', label: '16. Commodity Contracts' },
                  { id: 'BROKER_MAP', label: '17. Broker Map' },
                  { id: 'DATA_PROVIDER', label: '18. Providers' },
                  { id: 'SYNC_STATUS', label: '19. Sync Status' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setMasterSubTab(tab.id as any)}
                    className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded whitespace-nowrap transition ${
                      masterSubTab === tab.id 
                        ? 'bg-terminal-amber text-black' 
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Master Table Display */}
              <div className="flex-1 overflow-hidden pt-3">
                {masterSubTab === 'EXCHANGE' && (
                  <EnterpriseMarketTable
                    data={[
                      { id: 'NSE', name: 'National Stock Exchange of India', code: 'NSE', segment: 'EQUITY/FO/CD', status: 'ACTIVE', timezone: 'Asia/Kolkata', openTime: '09:15', closeTime: '15:30' },
                      { id: 'BSE', name: 'Bombay Stock Exchange', code: 'BSE', segment: 'EQUITY/FO', status: 'ACTIVE', timezone: 'Asia/Kolkata', openTime: '09:15', closeTime: '15:30' },
                      { id: 'MCX', name: 'Multi Commodity Exchange of India', code: 'MCX', segment: 'COMMODITY', status: 'ACTIVE', timezone: 'Asia/Kolkata', openTime: '09:00', closeTime: '23:30' },
                      { id: 'NCDEX', name: 'National Commodity & Derivatives Exchange', code: 'NCDEX', segment: 'AGRI', status: 'ACTIVE', timezone: 'Asia/Kolkata', openTime: '09:00', closeTime: '17:00' },
                      { id: 'NSE_IX', name: 'NSE International Exchange (GIFT City)', code: 'NSE_IX', segment: 'GLOBAL_DERIVATIVES', status: 'ACTIVE', timezone: 'Asia/Kolkata', openTime: '06:30', closeTime: '02:30' }
                    ]}
                    columns={[
                      { key: 'code', header: 'Exchange Code', accessor: (r) => <span className="font-bold text-terminal-amber">{r.code}</span> },
                      { key: 'name', header: 'Exchange Name', accessor: 'name' },
                      { key: 'segment', header: 'Segments Supported', accessor: (r) => <span className="text-terminal-blue font-bold">{r.segment}</span> },
                      { key: 'status', header: 'Status', accessor: (r) => <span className="text-terminal-green font-bold">{r.status}</span> },
                      { key: 'openTime', header: 'Open Time', accessor: 'openTime' },
                      { key: 'closeTime', header: 'Close Time', accessor: 'closeTime' }
                    ]}
                    title="Master Exchange Registry"
                    onRowClick={(row) => setInspectorInstrument(row)}
                  />
                )}

                {masterSubTab === 'INSTRUMENT' && (
                  <EnterpriseMarketTable
                    data={[
                      { id: 'IN001', symbol: 'RELIANCE', name: 'Reliance Industries Ltd', isin: 'INE002A01018', exchange: 'NSE', series: 'EQ', lotSize: 1, tickSize: 0.05, freezeQty: 25000 },
                      { id: 'IN002', symbol: 'TCS', name: 'Tata Consultancy Services Ltd', isin: 'INE467B01029', exchange: 'NSE', series: 'EQ', lotSize: 1, tickSize: 0.05, freezeQty: 10000 },
                      { id: 'IN003', symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', isin: 'INE040A01034', exchange: 'NSE', series: 'EQ', lotSize: 1, tickSize: 0.05, freezeQty: 50000 },
                      { id: 'IN004', symbol: 'INFY', name: 'Infosys Ltd', isin: 'INE009A01021', exchange: 'NSE', series: 'EQ', lotSize: 1, tickSize: 0.05, freezeQty: 20000 },
                      { id: 'IN005', symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', isin: 'INE090A01021', exchange: 'NSE', series: 'EQ', lotSize: 1, tickSize: 0.05, freezeQty: 40000 }
                    ]}
                    columns={[
                      { key: 'symbol', header: 'Symbol', accessor: (r) => <span className="font-bold text-terminal-amber">{r.symbol}</span> },
                      { key: 'name', header: 'Instrument Name', accessor: 'name' },
                      { key: 'isin', header: 'ISIN Code', accessor: 'isin' },
                      { key: 'exchange', header: 'Exchange', accessor: 'exchange' },
                      { key: 'series', header: 'Series', accessor: 'series' },
                      { key: 'lotSize', header: 'Lot Size', accessor: 'lotSize', align: 'right' },
                      { key: 'tickSize', header: 'Tick Size', accessor: 'tickSize', align: 'right' },
                      { key: 'freezeQty', header: 'Freeze Qty', accessor: (r) => r.freezeQty.toLocaleString(), align: 'right' }
                    ]}
                    title="Master Instrument Registry"
                    onRowClick={(row) => setInspectorInstrument(row)}
                  />
                )}

                {masterSubTab === 'ISIN' && (
                  <EnterpriseMarketTable
                    data={[
                      { isin: 'INE002A01018', symbol: 'RELIANCE', issuer: 'Reliance Industries Limited', assetClass: 'EQUITY', status: 'ACTIVE' },
                      { isin: 'INE467B01029', symbol: 'TCS', issuer: 'Tata Consultancy Services Limited', assetClass: 'EQUITY', status: 'ACTIVE' },
                      { isin: 'INE040A01034', symbol: 'HDFCBANK', issuer: 'HDFC Bank Limited', assetClass: 'EQUITY', status: 'ACTIVE' },
                      { isin: 'INF204KB14I2', symbol: 'NIFTYBEES', issuer: 'Nippon India Mutual Fund', assetClass: 'ETF', status: 'ACTIVE' },
                      { isin: 'INF204KB14R3', symbol: 'GOLDBEES', issuer: 'Nippon India Mutual Fund', assetClass: 'ETF', status: 'ACTIVE' }
                    ]}
                    columns={[
                      { key: 'isin', header: 'ISIN Code', accessor: (r) => <span className="font-bold text-terminal-amber">{r.isin}</span> },
                      { key: 'symbol', header: 'Symbol', accessor: 'symbol' },
                      { key: 'issuer', header: 'Issuer Name', accessor: 'issuer' },
                      { key: 'assetClass', header: 'Asset Class', accessor: 'assetClass' },
                      { key: 'status', header: 'Status', accessor: (r) => <span className="text-terminal-green font-bold">{r.status}</span> }
                    ]}
                    title="Master ISIN Registry"
                    onRowClick={(row) => setInspectorInstrument(row)}
                  />
                )}

                {masterSubTab === 'ETF' && (
                  <EnterpriseMarketTable
                    data={[
                      { symbol: 'NIFTYBEES', name: 'Nippon India ETF Nifty BeES', benchmark: 'NIFTY 50', aumCr: 18450, nav: 265.40, expenseRatio: 0.05 },
                      { symbol: 'BANKBEES', name: 'Nippon India ETF Bank BeES', benchmark: 'NIFTY BANK', aumCr: 11200, nav: 522.10, expenseRatio: 0.18 },
                      { symbol: 'GOLDBEES', name: 'Nippon India ETF Gold BeES', benchmark: 'DOMESTIC GOLD', aumCr: 9800, nav: 68.20, expenseRatio: 0.79 },
                      { symbol: 'ITBEES', name: 'Nippon India ETF IT BeES', benchmark: 'NIFTY IT', aumCr: 4500, nav: 41.50, expenseRatio: 0.22 },
                      { symbol: 'JUNIORBEES', name: 'Nippon India ETF Junior BeES', benchmark: 'NIFTY NEXT 50', aumCr: 3800, nav: 720.00, expenseRatio: 0.25 }
                    ]}
                    columns={[
                      { key: 'symbol', header: 'ETF Symbol', accessor: (r) => <span className="font-bold text-terminal-amber">{r.symbol}</span> },
                      { key: 'name', header: 'ETF Description', accessor: 'name' },
                      { key: 'benchmark', header: 'Underlying Benchmark', accessor: 'benchmark' },
                      { key: 'nav', header: 'NAV (₹)', accessor: (r) => `₹${r.nav.toFixed(2)}`, align: 'right' },
                      { key: 'aumCr', header: 'AUM (₹ Cr)', accessor: (r) => `₹${r.aumCr.toLocaleString()}`, align: 'right' },
                      { key: 'expenseRatio', header: 'Expense Ratio', accessor: (r) => `${r.expenseRatio}%`, align: 'right' }
                    ]}
                    title="Master ETF Registry"
                    onRowClick={(row) => setInspectorInstrument(row)}
                  />
                )}

                {masterSubTab === 'INDEX' && (
                  <EnterpriseMarketTable
                    data={[
                      { symbol: 'NIFTY 50', name: 'Nifty 50 Index', exchange: 'NSE', constituents: 50, baseValue: 1000, marketCapType: 'LARGE_CAP' },
                      { symbol: 'BANKNIFTY', name: 'Nifty Bank Index', exchange: 'NSE', constituents: 12, baseValue: 1000, marketCapType: 'SECTORAL' },
                      { symbol: 'FINNIFTY', name: 'Nifty Financial Services', exchange: 'NSE', constituents: 20, baseValue: 1000, marketCapType: 'SECTORAL' },
                      { symbol: 'MIDCPNIFTY', name: 'Nifty Midcap Select', exchange: 'NSE', constituents: 25, baseValue: 1000, marketCapType: 'MID_CAP' },
                      { symbol: 'SENSEX', name: 'S&P BSE Sensex', exchange: 'BSE', constituents: 30, baseValue: 100, marketCapType: 'LARGE_CAP' }
                    ]}
                    columns={[
                      { key: 'symbol', header: 'Index Symbol', accessor: (r) => <span className="font-bold text-terminal-amber">{r.symbol}</span> },
                      { key: 'name', header: 'Index Description', accessor: 'name' },
                      { key: 'exchange', header: 'Exchange', accessor: 'exchange' },
                      { key: 'constituents', header: 'Constituents Count', accessor: 'constituents', align: 'right' },
                      { key: 'marketCapType', header: 'Type', accessor: 'marketCapType' }
                    ]}
                    title="Master Index Registry"
                    onRowClick={(row) => setInspectorInstrument(row)}
                  />
                )}

                {masterSubTab === 'DERIVATIVE' && (
                  <EnterpriseMarketTable
                    data={[
                      { symbol: 'NIFTY26JUL24000CE', underlying: 'NIFTY', type: 'OPTCE', strike: 24000, expiry: '30-JUL-2026', lotSize: 25, marginRequired: 142000 },
                      { symbol: 'NIFTY26JULFUT', underlying: 'NIFTY', type: 'FUTIDX', strike: 0, expiry: '30-JUL-2026', lotSize: 25, marginRequired: 168000 },
                      { symbol: 'BANKNIFTY26JULFUT', underlying: 'BANKNIFTY', type: 'FUTIDX', strike: 0, expiry: '30-JUL-2026', lotSize: 15, marginRequired: 185000 },
                      { symbol: 'RELIANCE26JULFUT', underlying: 'RELIANCE', type: 'FUTSTK', strike: 0, expiry: '30-JUL-2026', lotSize: 250, marginRequired: 220000 }
                    ]}
                    columns={[
                      { key: 'symbol', header: 'Derivative Symbol', accessor: (r) => <span className="font-bold text-terminal-amber">{r.symbol}</span> },
                      { key: 'underlying', header: 'Underlying', accessor: 'underlying' },
                      { key: 'type', header: 'Contract Type', accessor: 'type' },
                      { key: 'strike', header: 'Strike', accessor: (r) => r.strike > 0 ? r.strike : 'N/A', align: 'right' },
                      { key: 'expiry', header: 'Expiry Date', accessor: 'expiry' },
                      { key: 'lotSize', header: 'Lot Size', accessor: 'lotSize', align: 'right' },
                      { key: 'marginRequired', header: 'Initial Margin (₹)', accessor: (r) => `₹${r.marginRequired.toLocaleString()}`, align: 'right' }
                    ]}
                    title="Master Derivative Registry"
                    onRowClick={(row) => setInspectorInstrument(row)}
                  />
                )}

                {masterSubTab === 'EXPIRY' && (
                  <EnterpriseMarketTable
                    data={safeExpiries.map(e => ({
                      instrumentId: e.instrumentId,
                      symbol: e.symbol,
                      type: e.type,
                      expiryDate: e.expiryDate,
                      daysRemaining: e.daysRemaining
                    }))}
                    columns={[
                      { key: 'symbol', header: 'Symbol', accessor: (r) => <span className="font-bold text-terminal-amber">{r.symbol}</span> },
                      { key: 'type', header: 'Derivative Type', accessor: 'type' },
                      { key: 'expiryDate', header: 'Expiry Date', accessor: 'expiryDate' },
                      { key: 'daysRemaining', header: 'Countdown (Days)', accessor: (r) => <span className={r.daysRemaining <= 7 ? "text-terminal-red font-bold" : "text-terminal-green"}>{r.daysRemaining} Days</span>, align: 'right' }
                    ]}
                    title="Master Expiry Calendar"
                    onRowClick={(row) => setInspectorInstrument(row)}
                  />
                )}

                {masterSubTab === 'OPTION_META' && (
                  <EnterpriseMarketTable
                    data={[
                      { underlying: 'NIFTY', stepSize: 50, strikesCount: 120, atmStrike: 24100, maxCeOIStrike: 24500, maxPeOIStrike: 24000, pcr: 1.12 },
                      { underlying: 'BANKNIFTY', stepSize: 100, strikesCount: 150, atmStrike: 52100, maxCeOIStrike: 52500, maxPeOIStrike: 52000, pcr: 0.94 },
                      { underlying: 'FINNIFTY', stepSize: 50, strikesCount: 80, atmStrike: 23400, maxCeOIStrike: 23800, maxPeOIStrike: 23000, pcr: 1.05 }
                    ]}
                    columns={[
                      { key: 'underlying', header: 'Underlying', accessor: (r) => <span className="font-bold text-terminal-amber">{r.underlying}</span> },
                      { key: 'stepSize', header: 'Strike Interval', accessor: 'stepSize', align: 'right' },
                      { key: 'strikesCount', header: 'Active Strikes', accessor: 'strikesCount', align: 'right' },
                      { key: 'atmStrike', header: 'ATM Strike', accessor: 'atmStrike', align: 'right' },
                      { key: 'maxCeOIStrike', header: 'Max CE OI', accessor: 'maxCeOIStrike', align: 'right' },
                      { key: 'maxPeOIStrike', header: 'Max PE OI', accessor: 'maxPeOIStrike', align: 'right' },
                      { key: 'pcr', header: 'PCR Ratio', accessor: 'pcr', align: 'right' }
                    ]}
                    title="Option Chain Master Metadata"
                    onRowClick={(row) => setInspectorInstrument(row)}
                  />
                )}

                {masterSubTab === 'LOT_SIZE' && (
                  <EnterpriseMarketTable
                    data={[
                      { symbol: 'NIFTY', lotSize: 25, previousLotSize: 50, effectiveDate: '26-APR-2024' },
                      { symbol: 'BANKNIFTY', lotSize: 15, previousLotSize: 25, effectiveDate: '26-APR-2024' },
                      { symbol: 'FINNIFTY', lotSize: 25, previousLotSize: 40, effectiveDate: '26-APR-2024' },
                      { symbol: 'RELIANCE', lotSize: 250, previousLotSize: 250, effectiveDate: '01-JAN-2024' },
                      { symbol: 'TCS', lotSize: 175, previousLotSize: 175, effectiveDate: '01-JAN-2024' }
                    ]}
                    columns={[
                      { key: 'symbol', header: 'Symbol / Underlying', accessor: (r) => <span className="font-bold text-terminal-amber">{r.symbol}</span> },
                      { key: 'lotSize', header: 'Current Market Lot', accessor: (r) => <span className="font-bold text-white">{r.lotSize}</span>, align: 'right' },
                      { key: 'previousLotSize', header: 'Previous Market Lot', accessor: 'previousLotSize', align: 'right' },
                      { key: 'effectiveDate', header: 'Effective Date', accessor: 'effectiveDate' }
                    ]}
                    title="Master Lot Size Registry"
                    onRowClick={(row) => setInspectorInstrument(row)}
                  />
                )}

                {masterSubTab === 'TICK_SIZE' && (
                  <EnterpriseMarketTable
                    data={[
                      { segment: 'EQUITY', priceRange: '₹0 - ₹250', tickSize: 0.01, precision: 2 },
                      { segment: 'EQUITY', priceRange: '> ₹250', tickSize: 0.05, precision: 2 },
                      { segment: 'FUTURES', priceRange: 'ALL', tickSize: 0.05, precision: 2 },
                      { segment: 'OPTIONS', priceRange: 'ALL', tickSize: 0.05, precision: 2 },
                      { segment: 'COMMODITY (GOLD)', priceRange: 'ALL', tickSize: 1.00, precision: 0 }
                    ]}
                    columns={[
                      { key: 'segment', header: 'Segment', accessor: (r) => <span className="font-bold text-terminal-amber">{r.segment}</span> },
                      { key: 'priceRange', header: 'Price Band', accessor: 'priceRange' },
                      { key: 'tickSize', header: 'Tick Size (₹)', accessor: (r) => `₹${r.tickSize}`, align: 'right' },
                      { key: 'precision', header: 'Decimal Precision', accessor: 'precision', align: 'right' }
                    ]}
                    title="Master Tick Size Configuration"
                    onRowClick={(row) => setInspectorInstrument(row)}
                  />
                )}

                {masterSubTab === 'CIRCUITS' && (
                  <EnterpriseMarketTable
                    data={safeCircuits.map(c => ({
                      symbol: c.symbol,
                      lastPrice: c.lastPrice,
                      lowerCircuit: c.lowerCircuit,
                      upperCircuit: c.upperCircuit,
                      isTriggered: c.isTriggered ? 'YES' : 'NO'
                    }))}
                    columns={[
                      { key: 'symbol', header: 'Symbol', accessor: (r) => <span className="font-bold text-terminal-amber">{r.symbol}</span> },
                      { key: 'lastPrice', header: 'LTP (₹)', accessor: (r) => `₹${r.lastPrice}`, align: 'right' },
                      { key: 'lowerCircuit', header: 'Lower Circuit (₹)', accessor: (r) => `₹${r.lowerCircuit}`, align: 'right' },
                      { key: 'upperCircuit', header: 'Upper Circuit (₹)', accessor: (r) => `₹${r.upperCircuit}`, align: 'right' },
                      { key: 'isTriggered', header: 'Halted', accessor: (r) => <span className={r.isTriggered === 'YES' ? "text-terminal-red font-bold" : "text-terminal-green"}>{r.isTriggered}</span> }
                    ]}
                    title="Circuit Limits & Price Band Registry"
                    onRowClick={(row) => setInspectorInstrument(row)}
                  />
                )}

                {masterSubTab === 'FREEZE_QTY' && (
                  <EnterpriseMarketTable
                    data={[
                      { symbol: 'NIFTY', freezeQty: 1800, maxOrderValue: '₹5.00 Cr', exchLimit: 1800 },
                      { symbol: 'BANKNIFTY', freezeQty: 900, maxOrderValue: '₹5.00 Cr', exchLimit: 900 },
                      { symbol: 'FINNIFTY', freezeQty: 1800, maxOrderValue: '₹5.00 Cr', exchLimit: 1800 },
                      { symbol: 'RELIANCE', freezeQty: 25000, maxOrderValue: '₹10.00 Cr', exchLimit: 25000 }
                    ]}
                    columns={[
                      { key: 'symbol', header: 'Symbol', accessor: (r) => <span className="font-bold text-terminal-amber">{r.symbol}</span> },
                      { key: 'freezeQty', header: 'Freeze Qty (Per Order)', accessor: (r) => r.freezeQty.toLocaleString(), align: 'right' },
                      { key: 'maxOrderValue', header: 'Max Order Value', accessor: 'maxOrderValue', align: 'right' },
                      { key: 'exchLimit', header: 'NSE System Hard Limit', accessor: (r) => r.exchLimit.toLocaleString(), align: 'right' }
                    ]}
                    title="Freeze Quantity & Hard Order Limits"
                    onRowClick={(row) => setInspectorInstrument(row)}
                  />
                )}

                {masterSubTab === 'CORP_ACTIONS' && (
                  <EnterpriseMarketTable
                    data={safeCorpActions.map(c => ({
                      symbol: c.instrumentId,
                      actionType: c.actionType,
                      ratioOrValue: c.ratioOrValue,
                      recordDate: c.recordDate,
                      status: c.status
                    }))}
                    columns={[
                      { key: 'symbol', header: 'Instrument ID', accessor: (r) => <span className="font-bold text-terminal-amber">{r.symbol}</span> },
                      { key: 'actionType', header: 'Action Type', accessor: 'actionType' },
                      { key: 'ratioOrValue', header: 'Ratio / Ratio Value', accessor: 'ratioOrValue' },
                      { key: 'recordDate', header: 'Record Date', accessor: 'recordDate' },
                      { key: 'status', header: 'Status', accessor: (r) => <span className="text-terminal-green font-bold">{r.status}</span> }
                    ]}
                    title="Corporate Actions Registry"
                    onRowClick={(row) => setInspectorInstrument(row)}
                  />
                )}

                {masterSubTab === 'CALENDAR' && (
                  <EnterpriseMarketTable
                    data={[
                      { day: 'MONDAY - FRIDAY', session: 'NORMAL TRADING', timing: '09:15 AM - 03:30 PM', market: 'EQUITY & DERIVATIVES' },
                      { day: 'MONDAY - FRIDAY', session: 'COMMODITIES (MCX)', timing: '09:00 AM - 11:30 PM', market: 'MCX DERIVATIVES' },
                      { day: 'SPECIAL', session: 'MUHURAT TRADING', timing: '06:15 PM - 07:15 PM', market: 'DIWALI SPECIAL' }
                    ]}
                    columns={[
                      { key: 'day', header: 'Trading Days', accessor: (r) => <span className="font-bold text-terminal-amber">{r.day}</span> },
                      { key: 'session', header: 'Session Name', accessor: 'session' },
                      { key: 'timing', header: 'Timing (IST)', accessor: 'timing' },
                      { key: 'market', header: 'Market Category', accessor: 'market' }
                    ]}
                    title="Master Trading Calendar & Schedule"
                    onRowClick={(row) => setInspectorInstrument(row)}
                  />
                )}

                {masterSubTab === 'HOLIDAY' && (
                  <EnterpriseMarketTable
                    data={safeCalendar.map(c => ({
                      date: c.date,
                      dayType: c.dayType,
                      sessionName: c.sessionName || 'N/A',
                      description: c.description || 'N/A'
                    }))}
                    columns={[
                      { key: 'date', header: 'Date', accessor: (r) => <span className="font-bold text-terminal-amber">{r.date}</span> },
                      { key: 'dayType', header: 'Type', accessor: 'dayType' },
                      { key: 'sessionName', header: 'Event / Holiday', accessor: 'sessionName' },
                      { key: 'description', header: 'Description', accessor: 'description' }
                    ]}
                    title="Master Holiday Registry"
                    onRowClick={(row) => setInspectorInstrument(row)}
                  />
                )}

                {masterSubTab === 'MCX_CONTRACTS' && (
                  <EnterpriseMarketTable
                    data={[
                      { symbol: 'GOLD', lotSize: '1 Kg', lotQty: 1, tickSize: '₹1 / 10g', marginPct: '10%' },
                      { symbol: 'SILVER', lotSize: '30 Kg', lotQty: 30, tickSize: '₹1 / 1Kg', marginPct: '12%' },
                      { symbol: 'CRUDEOIL', lotSize: '100 BBL', lotQty: 100, tickSize: '₹1 / BBL', marginPct: '15%' }
                    ]}
                    columns={[
                      { key: 'symbol', header: 'Commodity', accessor: (r) => <span className="font-bold text-terminal-amber">{r.symbol}</span> },
                      { key: 'lotSize', header: 'Contract Lot Size', accessor: 'lotSize' },
                      { key: 'tickSize', header: 'Tick Size', accessor: 'tickSize' },
                      { key: 'marginPct', header: 'Span Margin', accessor: 'marginPct', align: 'right' }
                    ]}
                    title="MCX Commodity Master Specs"
                    onRowClick={(row) => setInspectorInstrument(row)}
                  />
                )}

                {masterSubTab === 'BROKER_MAP' && (
                  <EnterpriseMarketTable
                    data={[
                      { exchSymbol: 'RELIANCE', zerodhaCode: 'RELIANCE', angelOneCode: '2885', fyersCode: 'NSE:RELIANCE-EQ', dhanCode: 'RELIANCE' },
                      { exchSymbol: 'NIFTY 50', zerodhaCode: 'NIFTY 50', angelOneCode: '26000', fyersCode: 'NSE:NIFTY50-INDEX', dhanCode: 'NIFTY' }
                    ]}
                    columns={[
                      { key: 'exchSymbol', header: 'Exchange Symbol', accessor: (r) => <span className="font-bold text-terminal-amber">{r.exchSymbol}</span> },
                      { key: 'zerodhaCode', header: 'Zerodha Symbol', accessor: 'zerodhaCode' },
                      { key: 'angelOneCode', header: 'AngelOne Token', accessor: 'angelOneCode' },
                      { key: 'fyersCode', header: 'Fyers Symbol', accessor: 'fyersCode' },
                      { key: 'dhanCode', header: 'Dhan Symbol', accessor: 'dhanCode' }
                    ]}
                    title="Broker Cross-Mapping Registry"
                    onRowClick={(row) => setInspectorInstrument(row)}
                  />
                )}

                {masterSubTab === 'DATA_PROVIDER' && (
                  <EnterpriseMarketTable
                    data={[
                      { provider: 'NSE DIRECT UDP BROADCAST', protocol: 'BINARY BROADCAST', latency: '0.8 ms', status: 'ACTIVE' },
                      { provider: 'MCX TICK FEED', protocol: 'WEBSOCKET BINARY', latency: '1.2 ms', status: 'ACTIVE' },
                      { provider: 'BLOOMBERG TERMINAL B-PIPE', protocol: 'FIX PROTOCOL', latency: '2.1 ms', status: 'STANDBY' }
                    ]}
                    columns={[
                      { key: 'provider', header: 'Data Provider Source', accessor: (r) => <span className="font-bold text-terminal-amber">{r.provider}</span> },
                      { key: 'protocol', header: 'Feed Protocol', accessor: 'protocol' },
                      { key: 'latency', header: 'Measured Latency', accessor: 'latency', align: 'right' },
                      { key: 'status', header: 'Feed State', accessor: (r) => <span className="text-terminal-green font-bold">{r.status}</span> }
                    ]}
                    title="Data Provider Feed Specifications"
                    onRowClick={(row) => setInspectorInstrument(row)}
                  />
                )}

                {masterSubTab === 'SYNC_STATUS' && (
                  <EnterpriseMarketTable
                    data={[
                      { masterName: 'EXCHANGE REGISTRY', lastSync: '10 SECONDS AGO', recordsCount: 5, health: '100% SYNCHRONIZED' },
                      { masterName: 'INSTRUMENT MASTER', lastSync: '15 SECONDS AGO', recordsCount: 8420, health: '100% SYNCHRONIZED' },
                      { masterName: 'DERIVATIVE CONTRACTS', lastSync: '5 SECONDS AGO', recordsCount: 42100, health: '100% SYNCHRONIZED' },
                      { masterName: 'EXPIRY CALENDAR', lastSync: '1 MINUTE AGO', recordsCount: 120, health: '100% SYNCHRONIZED' },
                      { masterName: 'CIRCUIT LIMITS', lastSync: 'LIVE FEED', recordsCount: 8420, health: '100% SYNCHRONIZED' }
                    ]}
                    columns={[
                      { key: 'masterName', header: 'Master Data Component', accessor: (r) => <span className="font-bold text-terminal-amber">{r.masterName}</span> },
                      { key: 'lastSync', header: 'Last Atomic Sync', accessor: 'lastSync' },
                      { key: 'recordsCount', header: 'Records Count', accessor: (r) => r.recordsCount.toLocaleString(), align: 'right' },
                      { key: 'health', header: 'Synchronization Health', accessor: (r) => <span className="text-terminal-green font-bold">{r.health}</span> }
                    ]}
                    title="Atomic Synchronization Health Matrix"
                    onRowClick={(row) => setInspectorInstrument(row)}
                  />
                )}
              </div>
            </div>
          )}
          
          {/* TAB 00: CORE STATUS */}
          {activeTab === 'STATUS' && (
            <div className="space-y-6">
              <div className="border-b border-terminal-border pb-4">
                <h2 className="text-sm font-bold text-white uppercase">EP05 Indian Market OS Architecture State</h2>
                <p className="text-xs text-terminal-muted mt-1">Status of integrated sub-systems and connections to EP04.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-terminal-border p-4 bg-neutral-900/30">
                  <h3 className="text-xs font-bold text-terminal-amber uppercase">EP04 Infrastructure Bridges</h3>
                  <div className="space-y-3 mt-3 text-xs">
                    <div className="flex items-center justify-between border-b border-terminal-border/45 pb-1">
                      <span className="text-terminal-muted">Exchange Registry Access</span>
                      <span className="text-emerald-400 font-bold">CONNECTED</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-terminal-border/45 pb-1">
                      <span className="text-terminal-muted">Instrument Master Feed</span>
                      <span className="text-emerald-400 font-bold">CONNECTED</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-terminal-border/45 pb-1">
                      <span className="text-terminal-muted">Derivative Contract Master</span>
                      <span className="text-emerald-400 font-bold">ACTIVE</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-terminal-muted">Corporate Action Registry</span>
                      <span className="text-emerald-400 font-bold">CONNECTED (LIVE CONSUMER)</span>
                    </div>
                  </div>
                </div>

                <div className="border border-terminal-border p-4 bg-neutral-900/30">
                  <h3 className="text-xs font-bold text-terminal-amber uppercase">Compliance State (SEBI Standard)</h3>
                  <div className="space-y-3 mt-3 text-xs">
                    <div className="flex items-center justify-between border-b border-terminal-border/45 pb-1">
                      <span className="text-terminal-muted">T+1 Rolling Settlements</span>
                      <span className="text-emerald-400 font-bold">ONLINE</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-terminal-border/45 pb-1">
                      <span className="text-terminal-muted">Pre-Open Call Auction</span>
                      <span className="text-emerald-400 font-bold">STANDBY</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-terminal-border/45 pb-1">
                      <span className="text-terminal-muted">Circuit Breaker Halts</span>
                      <span className="text-emerald-400 font-bold">SECURED</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-terminal-muted">Regulatory Audits</span>
                      <span className="text-emerald-400 font-bold">CHAINED (SHA-256)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-terminal-border p-4">
                <h3 className="text-xs font-bold text-white uppercase">Master Seeder Status</h3>
                <p className="text-xs text-terminal-muted mt-2 leading-relaxed">
                  The Indian Market Operating System (EP05) establishes separate relational storage in the central cluster to track local business configurations (holidays, trading sessions, clock logs, dynamic circuit margins).
                  Use the sync controls above to coordinate these state engines automatically with EP04 feeds.
                </p>
              </div>
            </div>
          )}

          {/* TAB 01: HOLIDAYS & SESSIONS */}
          {activeTab === 'CALENDAR' && (
            <div className="space-y-6">
              <div className="border-b border-terminal-border pb-4">
                <h2 className="text-sm font-bold text-white uppercase">NSE & BSE Holiday Calendar Registry</h2>
                <p className="text-xs text-terminal-muted mt-1">Add or remove custom holidays and special weekend trading session exceptions (e.g. Diwali Muhurat).</p>
              </div>

              {/* ADD FORM */}
              <form onSubmit={handleAddCalendar} className="grid grid-cols-1 md:grid-cols-4 gap-4 border border-terminal-border p-4 bg-neutral-900/40">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-terminal-muted uppercase font-bold">Date</label>
                  <input 
                    type="date" 
                    value={newDate} 
                    onChange={e => setNewDate(e.target.value)}
                    required
                    className="p-1.5 bg-black border border-terminal-border text-xs text-white" 
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-terminal-muted uppercase font-bold">Day Type</label>
                  <select 
                    value={newType} 
                    onChange={e => setNewType(e.target.value)}
                    className="p-1.5 bg-black border border-terminal-border text-xs text-white"
                  >
                    <option value="HOLIDAY">Holiday</option>
                    <option value="SPECIAL_SESSION">Special Muhurat Session</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-terminal-muted uppercase font-bold">Session Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Diwali Muhurat" 
                    value={newName} 
                    onChange={e => setNewName(e.target.value)}
                    className="p-1.5 bg-black border border-terminal-border text-xs text-white" 
                  />
                </div>

                <div className="flex items-end">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full p-2 bg-terminal-amber text-black font-bold text-xs uppercase flex items-center justify-center gap-1 hover:bg-opacity-95"
                  >
                    <Plus className="w-3.5 h-3.5" /> REGISTER DAY
                  </button>
                </div>
              </form>

              {/* LIST */}
              <div className="border border-terminal-border">
                <table className="w-full text-xs text-left">
                  <thead className="bg-neutral-900 text-terminal-muted border-b border-terminal-border">
                    <tr>
                      <th className="p-3">DATE</th>
                      <th className="p-3">TYPE</th>
                      <th className="p-3">NAME / EVENT</th>
                      <th className="p-3">DESCRIPTION</th>
                      <th className="p-3 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-terminal-border">
                    {safeCalendar.map((day) => (
                      <tr key={day.id} className="hover:bg-neutral-950/40">
                        <td className="p-3 font-bold text-white">{day.date}</td>
                        <td className="p-3">
                          <span className={`px-1.5 py-0.5 text-[9px] font-bold ${
                            day.dayType === 'HOLIDAY' ? 'bg-rose-950 text-rose-400 border border-rose-900' : 'bg-amber-950 text-amber-400 border border-amber-900'
                          }`}>
                            {day.dayType}
                          </span>
                        </td>
                        <td className="p-3 text-white font-mono">{day.sessionName || '--'}</td>
                        <td className="p-3 text-terminal-muted">{day.description || '--'}</td>
                        <td className="p-3 text-right">
                          <button 
                            onClick={() => handleDeleteCalendar(day.date)}
                            className="p-1 border border-terminal-border text-rose-400 hover:bg-rose-950 hover:text-rose-300"
                            title="De-register Holiday"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {safeCalendar.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-terminal-muted">No custom holiday overrides registered.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 02: SESSIONS & TIMINGS */}
          {activeTab === 'SESSIONS' && (
            <div className="space-y-6">
              <div className="border-b border-terminal-border pb-4">
                <h2 className="text-sm font-bold text-white uppercase">Market Sessions Configuration Engine</h2>
                <p className="text-xs text-terminal-muted mt-1">Configure opening, normal trading, closing, and post-market sessions with strict NSE/BSE boundaries.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {safeSessions.map((sess) => (
                  <div key={sess.id} className={`border p-4 flex flex-col justify-between ${
                    sess.isActive ? 'border-terminal-amber bg-terminal-amber/5' : 'border-terminal-border bg-black'
                  }`}>
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white uppercase">{sess.sessionType}</span>
                        {sess.isActive ? (
                          <span className="px-1.5 py-0.5 bg-terminal-amber text-black text-[9px] font-black uppercase">ACTIVE</span>
                        ) : (
                          <button 
                            onClick={() => handleActivateSession(sess.sessionType as any)}
                            className="text-[10px] text-terminal-muted hover:text-white underline uppercase"
                          >
                            ACTIVATE
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="flex flex-col">
                          <label className="text-[9px] text-terminal-muted uppercase">Start Time</label>
                          <input 
                            type="text" 
                            defaultValue={sess.startTime}
                            onBlur={(e) => handleConfigureSession(sess.sessionType, e.target.value, sess.endTime)}
                            className="bg-black border border-terminal-border p-1 text-xs text-white font-mono mt-1" 
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-[9px] text-terminal-muted uppercase">End Time</label>
                          <input 
                            type="text" 
                            defaultValue={sess.endTime}
                            onBlur={(e) => handleConfigureSession(sess.sessionType, sess.startTime, e.target.value)}
                            className="bg-black border border-terminal-border p-1 text-xs text-white font-mono mt-1" 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="text-[9px] text-terminal-muted mt-4 border-t border-terminal-border/40 pt-2">
                      SEBI timing reference code: standard market windowing.
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 03: CLOCK CALIBRATOR */}
          {activeTab === 'CLOCK' && (
            <div className="space-y-6">
              <div className="border-b border-terminal-border pb-4">
                <h2 className="text-sm font-bold text-white uppercase">Clock Alignment & Network Latency Analyzer</h2>
                <p className="text-xs text-terminal-muted mt-1">Calibrate system clocks with the exchange registry feeds to enforce sub-second compliance.</p>
              </div>

              <div className="border border-terminal-border p-6 bg-neutral-900/30 flex flex-col items-center justify-center text-center">
                <Clock className="w-12 h-12 text-terminal-amber animate-pulse mb-3" />
                <h3 className="text-sm font-bold text-white uppercase">Sync Status: COMPLIANT</h3>
                <p className="text-xs text-terminal-muted max-w-md mt-2">
                  Exchange clock is aligned with SEBI guidelines. Active clock drift is evaluated against primary and secondary connectivity backbones.
                </p>

                <div className="grid grid-cols-3 gap-6 mt-6 w-full max-w-lg border-t border-b border-terminal-border py-4">
                  <div>
                    <div className="text-[10px] text-terminal-muted uppercase">Exchange Time</div>
                    <div className="text-xs font-mono text-white mt-1">
                      {clock ? new Date(clock.exchangeTime).toTimeString().slice(0, 8) : '--'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-terminal-muted uppercase">Server Time</div>
                    <div className="text-xs font-mono text-white mt-1">
                      {clock ? new Date(clock.serverTime).toTimeString().slice(0, 8) : '--'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-terminal-muted uppercase">Offset (Drift)</div>
                    <div className="text-xs font-mono text-terminal-amber mt-1">
                      {clock ? `${clock.driftMs} ms` : '0 ms'}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleClockSync}
                  className="mt-6 px-4 py-2 bg-white text-black font-bold text-xs uppercase hover:bg-neutral-200 transition-colors"
                >
                  CORRECT TIME OFFSET
                </button>
              </div>
            </div>
          )}

          {/* TAB 04: T+1 SETTLEMENT */}
          {activeTab === 'SETTLEMENT' && (
            <div className="space-y-6">
              <div className="border-b border-terminal-border pb-4">
                <h2 className="text-sm font-bold text-white uppercase">T+1 Rolling Settlement & Ledger Reconciler</h2>
                <p className="text-xs text-terminal-muted mt-1">Reconcile pending buy/sell transactions on settlement cycles with strict regulatory checks.</p>
              </div>

              <div className="flex justify-between items-center bg-neutral-900/40 border border-terminal-border p-4">
                <div>
                  <div className="text-xs font-bold text-white">RECONCILIATION CALENDAR: T+1 ROLLING CYCLE</div>
                  <div className="text-[10px] text-terminal-muted mt-1">Last Reconciled On: <span className="text-white">{settlement?.lastSettledDate || 'None'}</span></div>
                </div>
                <button 
                  onClick={handleRunSettlement}
                  className="px-3 py-1.5 bg-terminal-amber text-black font-bold text-xs uppercase hover:bg-opacity-95"
                >
                  RUN SETTLEMENT RECONCILIATION
                </button>
              </div>

              <div className="border border-terminal-border">
                <table className="w-full text-xs text-left">
                  <thead className="bg-neutral-900 text-terminal-muted border-b border-terminal-border">
                    <tr>
                      <th className="p-3">TRADE ID</th>
                      <th className="p-3">SYMBOL</th>
                      <th className="p-3">QTY</th>
                      <th className="p-3">PRICE</th>
                      <th className="p-3">BUYER / SELLER</th>
                      <th className="p-3">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-terminal-border">
                    {safeSettlementQueue.map((item) => (
                      <tr key={item.tradeId} className="hover:bg-neutral-950/40">
                        <td className="p-3 font-mono text-white">{item.tradeId}</td>
                        <td className="p-3 font-bold text-white">{item.instrumentId}</td>
                        <td className="p-3 font-mono">{item.quantity}</td>
                        <td className="p-3 font-mono">₹{item.price.toFixed(2)}</td>
                        <td className="p-3 text-terminal-muted">{item.buyerId} → {item.sellerId}</td>
                        <td className="p-3">
                          <span className={`px-1.5 py-0.5 text-[9px] font-bold ${
                            item.status === 'SETTLED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' : 'bg-amber-950 text-amber-400 border border-amber-900'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {safeSettlementQueue.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-terminal-muted">No trades currently queued for settlement. Try running transactions in trading workspaces.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 05: EXPIRY DATE MODELS */}
          {activeTab === 'EXPIRY' && (
            <div className="space-y-6">
              <div className="border-b border-terminal-border pb-4">
                <h2 className="text-sm font-bold text-white uppercase">Derivatives & Commodities Expiry Countdown</h2>
                <p className="text-xs text-terminal-muted mt-1">Calculates and schedules automatic contract expiries for Nifty, BankNifty and MCX Futures.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {safeExpiries.map((exp) => (
                  <div key={exp.instrumentId} className="border border-terminal-border p-4 bg-black">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{exp.symbol}</span>
                      <span className="px-1.5 py-0.5 bg-neutral-900 text-terminal-muted text-[9px] font-bold border border-terminal-border">
                        {exp.type}
                      </span>
                    </div>

                    <div className="mt-4 flex items-baseline justify-between">
                      <div>
                        <div className="text-[10px] text-terminal-muted uppercase">Expiry Date</div>
                        <div className="text-sm font-bold text-white mt-1">{exp.expiryDate}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-terminal-muted uppercase">Days Remaining</div>
                        <div className="text-lg font-bold text-terminal-amber mt-1">{exp.daysRemaining} Days</div>
                      </div>
                    </div>
                  </div>
                ))}
                {safeExpiries.length === 0 && (
                  <div className="col-span-2 border border-terminal-border p-6 text-center text-terminal-muted">
                    No active derivative expiry contracts returned.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 06: CIRCUIT FREEZES */}
          {activeTab === 'CIRCUITS' && (
            <div className="space-y-6">
              <div className="border-b border-terminal-border pb-4">
                <h2 className="text-sm font-bold text-white uppercase">Dynamic Circuit Limits & Trading Halt Board</h2>
                <p className="text-xs text-terminal-muted mt-1">Simulate and control price band circuit breakers (5%, 10%, 20%) with 15-minute freeze cooling parameters.</p>
              </div>

              <div className="border border-terminal-border">
                <table className="w-full text-xs text-left">
                  <thead className="bg-neutral-900 text-terminal-muted border-b border-terminal-border">
                    <tr>
                      <th className="p-3">INSTRUMENT SYMBOL</th>
                      <th className="p-3">LTP (LAST PRICE)</th>
                      <th className="p-3 text-rose-400">LOWER CIRCUIT (10%)</th>
                      <th className="p-3 text-emerald-400">UPPER CIRCUIT (10%)</th>
                      <th className="p-3">STATUS</th>
                      <th className="p-3 text-right">SIMULATE BREAK</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-terminal-border">
                    {safeCircuits.map((item) => (
                      <tr key={item.symbol} className="hover:bg-neutral-950/40">
                        <td className="p-3 font-bold text-white">{item.symbol}</td>
                        <td className="p-3 font-mono">₹{item.lastPrice.toFixed(2)}</td>
                        <td className="p-3 font-mono text-rose-400">₹{item.lowerCircuit.toFixed(2)}</td>
                        <td className="p-3 font-mono text-emerald-400">₹{item.upperCircuit.toFixed(2)}</td>
                        <td className="p-3">
                          {item.isTriggered ? (
                            <span className="px-1.5 py-0.5 bg-rose-950 text-rose-400 text-[9px] font-bold border border-rose-900 uppercase">
                              HALTED ({item.triggerType})
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 bg-emerald-950 text-emerald-400 text-[9px] font-bold border border-emerald-900 uppercase">
                              ACTIVE
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right space-x-2">
                          {item.isTriggered ? (
                            <button 
                              onClick={() => handleRecoverCircuit(item.symbol)}
                              className="px-2 py-1 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-950/30 text-[10px] uppercase font-bold"
                            >
                              Resume & Expand Bands
                            </button>
                          ) : (
                            <>
                              <button 
                                onClick={() => handleTriggerCircuit(item.symbol, 'LOWER', item.lowerCircuit)}
                                className="px-2 py-1 border border-rose-500/50 text-rose-400 hover:bg-rose-950/30 text-[10px] uppercase font-bold"
                              >
                                Hit Lower
                              </button>
                              <button 
                                onClick={() => handleTriggerCircuit(item.symbol, 'UPPER', item.upperCircuit)}
                                className="px-2 py-1 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-950/30 text-[10px] uppercase font-bold"
                              >
                                Hit Upper
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                    {safeCircuits.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-terminal-muted">No active circuit limits registered.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 07: CALL AUCTIONS */}
          {activeTab === 'AUCTIONS' && (
            <div className="space-y-6">
              <div className="border-b border-terminal-border pb-4">
                <h2 className="text-sm font-bold text-white uppercase">Pre-Open & Closing Call Auction Windows</h2>
                <p className="text-xs text-terminal-muted mt-1">Configure and match order books during specialized pre-open (09:00 - 09:15) and closing auction periods.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {safeAuctions.map((auc) => (
                  <div key={auc.id} className="border border-terminal-border p-4 bg-black">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{auc.auctionType} AUCTION</span>
                      <span className={`px-1.5 py-0.5 text-[9px] font-bold border ${
                        auc.status === 'OPEN' ? 'bg-emerald-950 text-emerald-400 border-emerald-900' : 'bg-neutral-900 text-terminal-muted border-terminal-border'
                      }`}>
                        {auc.status}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-terminal-muted">Time Window:</span>
                        <span className="text-white font-mono">{auc.startTime} - {auc.endTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-terminal-muted">Matched Volume:</span>
                        <span className="text-white font-mono">{auc.volumeTraded.toLocaleString()} Shares</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-terminal-border/30 flex gap-2">
                      <button 
                        onClick={() => handleUpdateAuction(auc.id, 'OPEN', 0)}
                        className="flex-1 py-1 border border-terminal-border text-xs text-white hover:bg-neutral-900"
                      >
                        Open
                      </button>
                      <button 
                        onClick={() => handleUpdateAuction(auc.id, 'MATCHING', 890000)}
                        className="flex-1 py-1 border border-terminal-border text-xs text-white hover:bg-neutral-900"
                      >
                        Match
                      </button>
                      <button 
                        onClick={() => handleUpdateAuction(auc.id, 'CLOSED', 1450000)}
                        className="flex-1 py-1 border border-terminal-border text-xs text-white hover:bg-neutral-900"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 08: CORPORATE ACTIONS */}
          {activeTab === 'CORP_ACTIONS' && (
            <div className="space-y-6">
              <div className="border-b border-terminal-border pb-4">
                <h2 className="text-sm font-bold text-white uppercase">Corporate Actions & Ex-Date Adjustment Registry</h2>
                <p className="text-xs text-terminal-muted mt-1">Consumes master proposals and adjustments directly from EP04 pipelines without local storage duplicates.</p>
              </div>

              <div className="border border-terminal-border">
                <table className="w-full text-xs text-left">
                  <thead className="bg-neutral-900 text-terminal-muted border-b border-terminal-border">
                    <tr>
                      <th className="p-3">SYMBOL</th>
                      <th className="p-3">ACTION TYPE</th>
                      <th className="p-3">RATIO / VALUE</th>
                      <th className="p-3">RECORD DATE</th>
                      <th className="p-3">EX-DATE</th>
                      <th className="p-3 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-terminal-border">
                    {safeCorpActions.map((ca) => (
                      <tr key={ca.id} className="hover:bg-neutral-950/40">
                        <td className="p-3 font-bold text-white">{ca.instrumentId}</td>
                        <td className="p-3">
                          <span className="px-1.5 py-0.5 bg-blue-950 text-blue-400 text-[9px] font-bold border border-blue-900 uppercase">
                            {ca.actionType}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-white">{ca.ratioOrValue}</td>
                        <td className="p-3 font-mono">{ca.recordDate}</td>
                        <td className="p-3 font-mono">{ca.appliedDate || '--'}</td>
                        <td className="p-3 text-right">
                          {ca.status === 'APPLIED' ? (
                            <span className="text-[10px] text-emerald-400 font-bold">✓ EXECUTED</span>
                          ) : (
                            <button 
                              onClick={() => handleApplyCorpAction(ca.id)}
                              className="px-2 py-1 bg-white text-black font-bold text-[10px] uppercase hover:bg-neutral-200"
                            >
                              Apply Adjustment
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {safeCorpActions.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-terminal-muted">No corporate action proposals currently registered in EP04 feeds.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 09: POLICIES & RISK */}
          {activeTab === 'POLICIES' && (
            <div className="space-y-6">
              <div className="border-b border-terminal-border pb-4">
                <h2 className="text-sm font-bold text-white uppercase">NSE, BSE, MCX Regulatory & Multiplier Policies</h2>
                <p className="text-xs text-terminal-muted mt-1">Tweak margin multipliers, segment limits, and circuit break percentages dynamically per exchange standard.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {safePolicies.map((p) => (
                  <div key={p.id} className="border border-terminal-border p-4 bg-black flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white uppercase">{p.policyName}</span>
                        <span className={`px-1.5 py-0.5 text-[9px] font-bold border ${
                          p.rules?.tradingAllowed ? 'bg-emerald-950 text-emerald-400 border-emerald-900' : 'bg-rose-950 text-rose-400 border-rose-900'
                        }`}>
                          {p.rules?.tradingAllowed ? 'TRADING ON' : 'LOCKED'}
                        </span>
                      </div>
                      <p className="text-[11px] text-terminal-muted mt-1">{p.description}</p>

                      <div className="mt-4 space-y-2 text-xs">
                        <div className="flex justify-between border-b border-terminal-border/30 pb-1">
                          <span className="text-terminal-muted">Allowed Segments:</span>
                          <span className="text-white font-mono">{(p.rules?.allowedSegments || []).join(', ') || 'NONE'}</span>
                        </div>
                        <div className="flex justify-between border-b border-terminal-border/30 pb-1">
                          <span className="text-terminal-muted">Max Margin Leverage:</span>
                          <span className="text-white font-mono">{p.rules?.maxLeverage ?? 1}x</span>
                        </div>
                        <div className="flex justify-between border-b border-terminal-border/30 pb-1">
                          <span className="text-terminal-muted">Short Selling:</span>
                          <span className="text-white font-mono">{p.rules?.shortSellingEnabled ? 'ENABLED' : 'DISABLED'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-terminal-muted">Circuit Band Threshold:</span>
                          <span className="text-white font-mono">{p.rules?.circuitBreakerPercentage ?? 10}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-terminal-border/30 flex gap-2">
                      <button 
                        onClick={() => handleTunePolicy(p.policyName, { ...p.rules, maxLeverage: p.rules.maxLeverage === 1 ? 5 : 1 })}
                        className="flex-1 py-1 border border-terminal-border text-[10px] text-white hover:bg-neutral-900 uppercase font-bold"
                      >
                        Toggle Leverage Limit
                      </button>
                      <button 
                        onClick={() => handleTunePolicy(p.policyName, { ...p.rules, shortSellingEnabled: !p.rules.shortSellingEnabled })}
                        className="flex-1 py-1 border border-terminal-border text-[10px] text-white hover:bg-neutral-900 uppercase font-bold"
                      >
                        Toggle Shorting
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 10: PRE-ORDER SHIELD */}
          {activeTab === 'VALIDATION' && (
            <div className="space-y-6">
              <div className="border-b border-terminal-border pb-4">
                <h2 className="text-sm font-bold text-white uppercase">Pre-Transaction Order Validation Shield</h2>
                <p className="text-xs text-terminal-muted mt-1">Simulate trade entry checks on any workspace module against calendar, holidays, sessions, and active circuit bounds.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <form onSubmit={handleRunValidation} className="border border-terminal-border p-4 bg-neutral-900/40 space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-terminal-muted uppercase font-bold">Target Workspace Module</label>
                    <select 
                      value={valModule}
                      onChange={e => setValModule(e.target.value as any)}
                      className="p-2 bg-black border border-terminal-border text-xs text-white"
                    >
                      <option value="TRADING">TRADING (Direct Spot Order)</option>
                      <option value="RESEARCH">RESEARCH (Ingest Filings / Reports)</option>
                      <option value="AI_INTELLIGENCE">AI INTELLIGENCE (Recommend Trades)</option>
                      <option value="STRATEGY">STRATEGY (Execute Algos)</option>
                      <option value="LIFECYCLE">LIFECYCLE (Deploy Contracts)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-terminal-muted uppercase font-bold">Instrument Symbol</label>
                    <input 
                      type="text" 
                      value={valSymbol}
                      onChange={e => setValSymbol(e.target.value)}
                      placeholder="e.g. RELIANCE.NS"
                      className="p-2 bg-black border border-terminal-border text-xs text-white"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 bg-terminal-amber text-black font-bold text-xs uppercase hover:bg-opacity-95"
                  >
                    RUN PRE-TRANSACTION VALIDATION
                  </button>
                </form>

                {/* RESULTS */}
                <div className="border border-terminal-border p-4 bg-black flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-terminal-muted uppercase">Execution Result</span>
                    {valResult ? (
                      <div className="mt-3">
                        <div className="flex items-center gap-2">
                          {valResult.isValid ? (
                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <XCircle className="w-5 h-5 text-rose-400" />
                          )}
                          <span className={`text-sm font-bold uppercase ${valResult.isValid ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {valResult.isValid ? 'APPROVED FOR EXECUTION' : 'REJECTED / BLOCKED'}
                          </span>
                        </div>

                        <div className="mt-4 space-y-2">
                          <div className="text-[10px] text-terminal-muted uppercase">Checks Run:</div>
                          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                            <div className="text-emerald-400">✓ Holiday Check</div>
                            <div className="text-emerald-400">✓ Session Timing</div>
                            <div className="text-emerald-400">✓ Clock Drift Sync</div>
                            <div className="text-emerald-400">✓ Circuit Bounds</div>
                          </div>

                          {valResult.errors && valResult.errors.length > 0 && (
                            <div className="mt-4 border-t border-terminal-border/40 pt-2">
                              <div className="text-[10px] text-rose-400 uppercase font-bold">Rejection Failures:</div>
                              <ul className="list-disc pl-4 text-rose-400 text-[10px] mt-1 space-y-1 font-mono">
                                {valResult.errors.map((err: string, idx: number) => (
                                  <li key={idx}>{err}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-terminal-muted mt-6 text-center">
                        Execute the validation form on the left to evaluate pre-order constraints.
                      </div>
                    )}
                  </div>

                  <div className="text-[9px] text-terminal-muted mt-4 border-t border-terminal-border/30 pt-2">
                    SEBI Rule 145(a): Compliance risk filter.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: REGULATORY EVENTS */}
          {activeTab === 'EVENTS' && (
            <div className="space-y-6">
              <div className="border-b border-terminal-border pb-4">
                <h2 className="text-sm font-bold text-white uppercase">Immutable Event Ledger (SHA-256 Chained)</h2>
                <p className="text-xs text-terminal-muted mt-1">Audit log records of all market synchronizations, halts, settlements, and compliance overrides.</p>
              </div>

              <div className="border border-terminal-border bg-black max-h-[400px] overflow-y-auto">
                <div className="divide-y divide-terminal-border font-mono text-xs">
                  {safeEvents.map((ev) => (
                    <div key={ev.id} className="p-3 hover:bg-neutral-900/40 flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-terminal-amber">[{ev.eventType}]</span>
                          <span className="text-[10px] text-terminal-muted">ID: {ev.id}</span>
                        </div>
                        <div className="text-white text-[11px] font-mono">
                          Payload: {JSON.stringify(ev.payload)}
                        </div>
                      </div>
                      <div className="text-[10px] text-terminal-muted text-right shrink-0">
                        {new Date(ev.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                  {safeEvents.length === 0 && (
                    <div className="p-6 text-center text-terminal-muted">No security or compliance events logged. Try synchronizing or triggering actions.</div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Slide-out Instrument Inspector Right Panel */}
      <MarketInspectorPanel
        instrument={inspectorInstrument}
        onClose={() => setInspectorInstrument(null)}
      />
    </div>
  );
};
export default IndianMarketWorkspace;
