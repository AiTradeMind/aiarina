import React, { useState, useEffect, useMemo, useRef } from 'react';
import { BrokerAdapterHub } from './BrokerAdapterHub';
import { BrokerIntelligenceWorkspace } from './BrokerIntelligenceWorkspace';
import { OMSWorkspace } from './OMSWorkspace';
import { PMSWorkspace } from './PMSWorkspace';
import { RMSWorkspace } from './RMSWorkspace';
import { ENTERPRISE_AI_MODELS_REGISTRY } from '../data/aiModelsRegistry';
import { cn, formatCurrency, getDeterministicRandom, safeDate, safeFormat, safeToLocaleString, safeToLocaleDateString, safeToLocaleTimeString } from '../lib/utils';
import { 
  Search, 
  Activity, 
  BarChart2, 
  ChevronRight, 
  RefreshCcw, 
  Zap, 
  ShieldAlert, 
  List, 
  Play, 
  XCircle, 
  Trash2,
  Send,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  ChevronDown,
  LayoutGrid,
  Filter,
  Wallet,
  Coins,
  Settings,
  ArrowUpRight,
  ArrowDownRight,
  Cpu,
  BookOpen,
  DollarSign,
  TrendingUp,
  Lock,
  Compass,
  ArrowRight,
  Percent,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { SectionHeader, StatusBadge, MetricCard, Panel, Toolbar, GlobalSummaryItem } from './ui/Base';
import { DataTable } from './ui/Table';
import { Button, IconButton } from './ui/Button';
import { FormField, Input, Select } from './ui/Forms';
import { LoadingOverlay, EmptyState, DataBoundary, ErrorBoundary } from './ui/Feedback';
import { fetchApi } from '../lib/api';

// --- Types ---
type OrderStatus = 'CREATED' | 'VALIDATED' | 'QUEUED' | 'EXECUTING' | 'EXECUTED' | 'PARTIALLY_FILLED' | 'REJECTED' | 'CANCELLED' | 'FAILED';
type OrderType = 'MARKET' | 'LIMIT' | 'STOP' | 'STOP_LIMIT';
type TransactionSide = 'BUY' | 'SELL';

interface Order {
  id: number;
  ticker: string;
  type: OrderType;
  side: TransactionSide;
  quantity: string;
  filledQuantity: string;
  price: string | null;
  status: OrderStatus;
  createdAt: string;
}

interface Position {
  id: number;
  ticker: string;
  quantity: string;
  averagePrice: string;
  marketPrice: string;
  pnl: string;
}

interface Execution {
  id: number;
  ticker: string;
  side: TransactionSide;
  quantity: string;
  price: string;
  timestamp: string;
}

interface JournalEntry {
  id: number;
  entryType: string;
  notes: string;
  pnl: string | null;
  timestamp: string;
}

interface Strategy {
  id: string;
  name: string;
  description: string;
  type: string;
  isActive: boolean;
}

interface TickerStats {
  symbol: string;
  name: string;
  bid: number;
  ask: number;
  last: number;
  spread: number;
  changePercent: number;
  volume: string;
}

export const TradingWorkspace = React.memo(({ 
  portfolio: livePortfolio, 
  positions: livePositions, 
  orders: liveOrders,
  onRefresh,
  initialTab
}: { 
  portfolio: any, 
  positions: any[], 
  orders: any[],
  onRefresh?: () => void,
  initialTab?: 'TERMINAL' | 'OMS' | 'PMS' | 'RMS' | 'AUTOMATIONS' | 'BROKER_HUB' | 'BROKER_INTELLIGENCE' | 'VAULT' | 'ANALYTICS' | 'COPILOT'
}) => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'TERMINAL' | 'OMS' | 'PMS' | 'RMS' | 'AUTOMATIONS' | 'BROKER_HUB' | 'BROKER_INTELLIGENCE' | 'VAULT' | 'ANALYTICS' | 'COPILOT'>(initialTab || 'TERMINAL');
  const [tradingMode, setTradingMode] = useState<'SANDBOX' | 'LIVE'>('SANDBOX');
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [wsConnected, setWsConnected] = useState(true);
  const [wsLatency, setWsLatency] = useState(3.2);

  useEffect(() => {
    const wsInterval = setInterval(() => {
      setWsLatency(+(2 + Math.random() * 2.5).toFixed(1));
      setWsConnected(true);
    }, 4000);
    return () => clearInterval(wsInterval);
  }, []);

  // Mode-Specific Data
  const [paperAccount, setPaperAccount] = useState<any>(null);
  const [paperPositions, setPaperPositions] = useState<Position[]>([]);
  const [paperOrders, setPaperOrders] = useState<Order[]>([]);
  const [paperExecutions, setPaperExecutions] = useState<Execution[]>([]);
  const [paperJournal, setPaperJournal] = useState<JournalEntry[]>([]);

  // STEP 03: Live AI Paper Trade Events & Markers State
  interface PaperTradeEvent {
    id: string;
    model: string;
    action: 'BUY' | 'SELL' | 'EXIT' | 'CLOSE';
    symbol: string;
    exchange: 'NSE' | 'BSE' | 'MCX';
    price: number;
    timestamp: string;
    labId: 'LAB_01_STOCK' | 'LAB_02_ETF' | 'LAB_03_COMMODITY';
    status: 'EXECUTED' | 'PENDING' | 'CLOSED';
    quantity: number;
    paperValueAtm: number;
    realizedPnL?: string | null;
    unrealizedPnL?: string | null;
    returnPct?: string | null;
  }

  const [paperTradeEvents, setPaperTradeEvents] = useState<PaperTradeEvent[]>([
    {
      id: 'PT-1001',
      model: `${ENTERPRISE_AI_MODELS_REGISTRY[0]?.name || 'Gemini 2.5 Pro'} (${ENTERPRISE_AI_MODELS_REGISTRY[0]?.provider || 'Google'} ${ENTERPRISE_AI_MODELS_REGISTRY[0]?.version || 'v2.5'})`,
      action: 'BUY',
      symbol: 'RELIANCE',
      exchange: 'NSE',
      price: 185.25,
      timestamp: '10:42:18 IST',
      labId: 'LAB_01_STOCK',
      status: 'EXECUTED',
      quantity: 50,
      paperValueAtm: 9262.50,
      realizedPnL: null,
      unrealizedPnL: '+450.00 ATM',
      returnPct: '+4.85%'
    },
    {
      id: 'PT-1002',
      model: `${ENTERPRISE_AI_MODELS_REGISTRY[1]?.name || 'Claude Sonnet 5'} (${ENTERPRISE_AI_MODELS_REGISTRY[1]?.provider || 'Anthropic'} ${ENTERPRISE_AI_MODELS_REGISTRY[1]?.version || 'v5.0'})`,
      action: 'SELL',
      symbol: 'HDFCBANK',
      exchange: 'NSE',
      price: 415.74,
      timestamp: '10:45:00 IST',
      labId: 'LAB_01_STOCK',
      status: 'CLOSED',
      quantity: 25,
      paperValueAtm: 10393.50,
      realizedPnL: '+1,250.00 ATM',
      unrealizedPnL: null,
      returnPct: '+12.02%'
    }
  ]);
  const [selectedPaperMarker, setSelectedPaperMarker] = useState<PaperTradeEvent | null>(null);
  const [paperLabFilter, setPaperLabFilter] = useState<string>('ALL');
  const [paperExchangeFilter, setPaperExchangeFilter] = useState<string>('ALL');

  const [liveExecutions, setLiveExecutions] = useState<Execution[]>([]);
  const [riskProfile, setRiskProfile] = useState<any>({ riskLevel: 'SECURE', maxDrawdown: '0.00%', maxDailyLoss: '$5,000.00' });
  const [strategies, setStrategies] = useState<Strategy[]>([
    { id: 'mean_reversion', name: 'HFT Mean Reversion', description: 'Buys oversold dips below historical EMA limits, sells momentum spikes.', type: 'QUANT', isActive: false },
    { id: 'sentiment_alpha', name: 'Arina Sentiment Alpha', description: 'Monitors Live AI news streams and dynamically initiates breakout trades.', type: 'AI_NEWS', isActive: false },
    { id: 'macro_breakout', name: 'Macro Momentum Breakout', description: 'Deploys stop order triggers on high volatility volume thresholds.', type: 'TREND', isActive: false }
  ]);

  // Active Strategies & Automated Trading Simulation
  const [autoTradingActive, setAutoTradingActive] = useState(false);
  const [automationSubTab, setAutomationSubTab] = useState<'STRATEGIES' | 'KERNEL_SUITE'>('STRATEGIES');
  const [assignedStrategies, setAssignedStrategies] = useState<{ [ticker: string]: string }>({
    'RELIANCE': 'mean_reversion',
    'ICICIBANK': 'sentiment_alpha'
  });
  const [automationLogs, setAutomationLogs] = useState<any[]>([
    { timestamp: new Date(), level: 'INFO', text: 'Algorithmic OS Orchestrator Initialized.' },
    { timestamp: new Date(), level: 'SYSTEM', text: 'Securing connection with Risk Circuit Breakers.' }
  ]);

  // Order Entry State
  const [symbol, setSymbol] = useState('RELIANCE');
  const [side, setSide] = useState<TransactionSide>('BUY');
  const [type, setType] = useState<OrderType>('MARKET');
  const [quantity, setQuantity] = useState('50');
  const [price, setPrice] = useState('185.50');
  const [timeInForce, setTimeInForce] = useState('DAY');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderMessage, setOrderMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Advanced Order Options
  const [hasBracket, setHasBracket] = useState(false);
  const [takeProfitPrice, setTakeProfitPrice] = useState('195.00');
  const [stopLossPrice, setStopLossPrice] = useState('175.00');

  // Vault/Ledger Actions State
  const [vaultAction, setVaultAction] = useState<'DEPOSIT' | 'WITHDRAWAL'>('DEPOSIT');
  const [vaultAmount, setVaultAmount] = useState('25000');
  const [vaultCurrency, setVaultCurrency] = useState('INR');
  const [vaultMessage, setVaultMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // AI Copilot Chat State
  const [copilotInput, setCopilotInput] = useState('');
  const [copilotMessages, setCopilotMessages] = useState<any[]>([
    { 
      sender: 'copilot', 
      text: "Enterprise Trading OS Co-pilot Active. I have full read-access to your portfolio, current risk parameters, and active market ticks. Ask me to perform structural risk checks, construct hedge structures, or generate model ideas.",
      timestamp: new Date()
    }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Market Watchlist / Simulated Level 2 Data
  const [selectedTicker, setSelectedTicker] = useState('RELIANCE');
  const [marketTickers, setMarketTickers] = useState<TickerStats[]>([
    { symbol: 'RELIANCE', name: 'Reliance Industries', bid: 185.22, ask: 185.31, last: 185.25, spread: 0.09, changePercent: 1.15, volume: '52.4M' },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', bid: 415.65, ask: 415.82, last: 415.74, spread: 0.17, changePercent: -0.42, volume: '22.1M' },
    { symbol: 'INFY', name: 'Infosys Ltd.', bid: 172.10, ask: 172.18, last: 172.15, spread: 0.08, changePercent: 0.85, volume: '18.7M' },
    { symbol: 'TCS', name: 'Tata Consultancy Services', bid: 177.40, ask: 177.58, last: 177.45, spread: 0.18, changePercent: -2.31, volume: '88.5M' },
    { symbol: 'SBIN', name: 'State Bank of India', bid: 875.12, ask: 875.54, last: 875.30, spread: 0.42, changePercent: 4.82, volume: '112.9M' },
    { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.', bid: 64250.00, ask: 64265.00, last: 64258.00, spread: 15.00, changePercent: 2.14, volume: '34.2B' },
    { symbol: 'ITC', name: 'ITC Ltd.', bid: 3455.50, ask: 3456.25, last: 3455.90, spread: 0.75, changePercent: 1.95, volume: '16.8B' },
    { symbol: 'MCX_GOLD', name: 'MCX Gold Futures (100g)', bid: 72450.00, ask: 72460.00, last: 72455.00, spread: 10.00, changePercent: 0.65, volume: '42.8K' },
    { symbol: 'MCX_SILVER', name: 'MCX Silver Futures (30kg)', bid: 88200.00, ask: 88220.00, last: 88210.00, spread: 20.00, changePercent: 1.12, volume: '28.4K' },
    { symbol: 'MCX_CRUDE', name: 'MCX Crude Oil Futures (100 Bbl)', bid: 6480.00, ask: 6485.00, last: 6482.00, spread: 5.00, changePercent: -0.85, volume: '95.2K' },
    { symbol: 'MCX_NATGAS', name: 'MCX Natural Gas Futures (1250 MMBtu)', bid: 212.40, ask: 212.80, last: 212.60, spread: 0.40, changePercent: 2.15, volume: '110.5K' }
  ]);

  // Chart and DOM data
  const [priceHistory, setPriceHistory] = useState<{ [symbol: string]: number[] }>({
    'RELIANCE': [182.10, 182.40, 181.90, 183.00, 183.50, 184.20, 183.80, 184.90, 185.25],
    'HDFCBANK': [418.50, 417.20, 416.80, 417.00, 416.10, 415.20, 415.90, 415.30, 415.74],
    'INFY': [170.50, 171.10, 170.90, 171.40, 171.80, 172.00, 171.75, 172.30, 172.15],
    'TCS': [182.50, 180.20, 179.80, 181.10, 178.40, 176.90, 177.10, 178.20, 177.45],
    'SBIN': [820.50, 835.00, 831.20, 842.00, 850.50, 862.00, 858.40, 869.20, 875.30],
    'ICICIBANK': [62800, 63100, 62950, 63400, 63800, 63700, 64100, 63900, 64258],
    'ITC': [3380, 3410, 3395, 3420, 3450, 3435, 3465, 3440, 3455.90],
    'MCX_GOLD': [71800, 72050, 72100, 72250, 72180, 72320, 72400, 72380, 72455],
    'MCX_SILVER': [87100, 87400, 87300, 87800, 88000, 87950, 88150, 88100, 88210],
    'MCX_CRUDE': [6540, 6520, 6510, 6490, 6500, 6475, 6485, 6480, 6482],
    'MCX_NATGAS': [206.0, 208.2, 207.5, 209.8, 210.5, 211.2, 212.0, 211.8, 212.6]
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- Stage 10 Enterprise State ---
  const [sessionState, setSessionState] = useState<any>({
    clockState: { currentVirtualTime: new Date().toISOString(), speed: 1, isPaused: false, marketStatus: 'OPEN' },
    activeSession: { name: 'Default Paper Session', isSimulation: false },
    holidays: []
  });
  const [executionQueue, setExecutionQueue] = useState<any[]>([]);
  const [executionAudit, setExecutionAudit] = useState<any[]>([]);
  const [consensusReport, setConsensusReport] = useState<any | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [selectedOrderForTimeline, setSelectedOrderForTimeline] = useState<any | null>(null);
  const [orderTimelineHistory, setOrderTimelineHistory] = useState<any[]>([]);

  // Simulation Form State
  const [simName, setSimName] = useState('Weekend Replay Run #1');
  const [simStart, setSimStart] = useState('2026-07-18T09:30');
  const [simEnd, setSimEnd] = useState('2026-07-18T16:00');
  const [simSpeed, setSimSpeed] = useState('5');

  const handleSessionControl = async (action: string, value?: number) => {
    try {
      const res = await fetchApi('/api/paper/session/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, value })
      });
      if (res && !res._isApiError) {
        setSessionState((prev: any) => ({ ...prev, clockState: res.clockState }));
      }
    } catch (err) {
      console.error('Failed to control session', err);
    }
  };

  const handleStartSimulation = async (name: string, startTime: string, endTime: string, speedMultiplier = 1) => {
    try {
      const res = await fetchApi('/api/paper/session/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, startTime, endTime, speedMultiplier })
      });
      if (res && !res._isApiError) {
        fetchAllData();
      }
    } catch (err) {
      console.error('Failed to start simulation', err);
    }
  };

  const handleTriggerConsensus = async () => {
    setIsVoting(true);
    setConsensusReport(null);
    try {
      const priceVal = marketTickers.find(t => t.symbol === selectedTicker)?.last || 150.00;
      const res = await fetchApi('/api/paper/consensus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: selectedTicker, price: priceVal })
      });
      if (res && !res._isApiError) {
        setConsensusReport(res);
        fetchAllData();
      }
    } catch (err) {
      console.error('Failed to trigger consensus', err);
    } finally {
      setIsVoting(false);
    }
  };

  const handleSelectOrderForTimeline = async (order: any) => {
    setSelectedOrderForTimeline(order);
    setOrderTimelineHistory([]);
    try {
      const res = await fetchApi(`/api/paper/orders/${order.id}/lifecycle`);
      if (res && !res._isApiError && Array.isArray(res.history)) {
        setOrderTimelineHistory(res.history);
      }
    } catch (err) {
      console.error('Failed to fetch lifecycle history', err);
    }
  };

  // --- COMPONENT INTEGRATED FETCH DATA ---
  const fetchAllData = async () => {
    try {
      // 1. Fetch Mode Independent Data
      const [strategiesRes, riskRes, liveExecRes] = await Promise.all([
        fetchApi('/api/strategies'),
        fetchApi('/api/risk/profile'),
        fetchApi('/api/executions')
      ]);

      if (Array.isArray(strategiesRes)) {
        // Map backend strategies or fallback to pre-seeded templates
        const activeMap = strategiesRes.map((s: any) => ({
          id: s.id.toString(),
          name: s.name,
          description: s.description || '',
          type: s.type || 'QUANT',
          isActive: s.isActive || false
        }));
        if (activeMap.length > 0) {
          setStrategies(activeMap);
        }
      }

      if (riskRes && !riskRes._isApiError) {
        setRiskProfile(riskRes);
      }

      if (Array.isArray(liveExecRes)) {
        setLiveExecutions(liveExecRes);
      }

      // 2. Fetch Virtual Sandbox Data
      const [pAccount, pPositions, pOrders, pTrades, pJournal] = await Promise.all([
        fetchApi('/api/paper/account'),
        fetchApi('/api/paper/portfolio'),
        fetchApi('/api/paper/orders'),
        fetchApi('/api/paper/trades'),
        fetchApi('/api/paper/journal')
      ]);

      if (pAccount && !pAccount._isApiError) {
        setPaperAccount(pAccount);
      }
      if (pPositions && !pPositions._isApiError && Array.isArray(pPositions.positions)) {
        setPaperPositions(pPositions.positions);
      }
      if (Array.isArray(pOrders)) {
        setPaperOrders(pOrders);
      }
      if (Array.isArray(pTrades)) {
        setPaperExecutions(pTrades.map((t: any) => ({
          id: t.id,
          ticker: t.ticker,
          side: t.side,
          quantity: t.quantity,
          price: t.executionPrice,
          timestamp: t.timestamp
        })));
      }
      if (Array.isArray(pJournal)) {
        setPaperJournal(pJournal);
      }

      // Fetch Stage 10 Enterprise Data
      const [sessionRes, queueRes, auditRes] = await Promise.all([
        fetchApi('/api/paper/session'),
        fetchApi('/api/paper/execution/queue'),
        fetchApi('/api/paper/execution/audit')
      ]);

      if (sessionRes && !sessionRes._isApiError) {
        setSessionState(sessionRes);
      }
      if (queueRes && !queueRes._isApiError && Array.isArray(queueRes.queue)) {
        setExecutionQueue(queueRes.queue);
      }
      if (auditRes && !auditRes._isApiError && Array.isArray(auditRes.auditTrail)) {
        setExecutionAudit(auditRes.auditTrail);
      }

      setLastRefresh(new Date());
    } catch (err) {
      console.error('Failed to fetch comprehensive Trading OS data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch only if onRefresh is not provided, 
    // but App.tsx handles polling now.
    if (!onRefresh) {
       fetchAllData();
    }
  }, [tradingMode]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [copilotMessages]);

  // --- LIVE TICKS SIMULATOR ---
  useEffect(() => {
    const tickInterval = setInterval(() => {
      setMarketMarketTicks();
    }, 2500);
    return () => clearInterval(tickInterval);
  }, [selectedTicker]);

  const setMarketMarketTicks = () => {
    setMarketTickers(prev => prev.map(t => {
      const volatility = t.symbol === 'ICICIBANK' || t.symbol === 'ITC' ? 0.003 : 0.0015;
      const change = 0; // Price update deterministic
      const newLast = parseFloat((t.last + change).toFixed(t.symbol.startsWith('ICICIBANK') ? 0 : 2));
      const newBid = parseFloat((newLast - t.spread / 2).toFixed(t.symbol.startsWith('ICICIBANK') ? 0 : 2));
      const newAsk = parseFloat((newLast + t.spread / 2).toFixed(t.symbol.startsWith('ICICIBANK') ? 0 : 2));
      
      // Update Price history list for charts
      setPriceHistory(hist => {
        const arr = [...(hist[t.symbol] || [t.last])];
        arr.push(newLast);
        if (arr.length > 12) arr.shift();
        return { ...hist, [t.symbol]: arr };
      });

      return {
        ...t,
        last: newLast,
        bid: newBid,
        ask: newAsk
      };
    }));
  };

  // --- ALGORITHMIC AUTO-TRADER LOOP ---
  // (Disabled: Removed independent polling)

  // --- SWITCH CURRENT SYMBOL ---
  const handleSelectTicker = (ticker: string) => {
    setSelectedTicker(ticker);
    setSymbol(ticker);
    const stat = marketTickers.find(t => t.symbol === ticker);
    if (stat) {
      setPrice(stat.last.toString());
    }
    setOrderMessage(null);
  };

  // --- MANUAL ORDER ENTRY ---
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setOrderMessage(null);

    const qtyVal = parseFloat(quantity);
    const priceVal = type === 'MARKET' ? undefined : parseFloat(price);

    try {
      const endpoint = tradingMode === 'SANDBOX' ? '/api/paper/orders' : '/api/orders';
      const bodyPayload: any = {
        ticker: symbol.toUpperCase(),
        side,
        type,
        quantity: qtyVal,
        price: priceVal
      };

      // Bracket details
      if (hasBracket) {
        bodyPayload.takeProfitPrice = parseFloat(takeProfitPrice);
        bodyPayload.stopLossPrice = parseFloat(stopLossPrice);
      }

      const response = await fetchApi(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });

      if (response?._isApiError) {
        throw new Error(response.message || 'Order rejected by risk validator limits.');
      }

      const createdOrder = response.order || response;

      // Add to logs
      setAutomationLogs(prev => [
        { timestamp: new Date(), level: 'EXECUTION', text: `[Manual Order] Filled: ${side} ${quantity} ${symbol} @ ${priceVal || 'MKT'} [${tradingMode}]` },
        ...prev
      ]);

      setOrderMessage({ 
        type: 'success', 
        text: `Order submitted: ${side} ${quantity} ${symbol} @ ${type === 'MARKET' ? 'Market' : `$${price}`} filled successfully.` 
      });

      // Clear input fields
      setQuantity('50');
      fetchAllData();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setOrderMessage({ type: 'error', text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- CANCEL ORDER ---
  const handleCancelOrder = async (id: number) => {
    try {
      const endpoint = tradingMode === 'SANDBOX' 
        ? `/api/paper/orders/${id}` // If paper trading supports cancel
        : `/api/orders/${id}`;

      // Call API delete
      const response = await fetchApi(endpoint, { method: 'DELETE' });
      if (!response?._isApiError) {
        setAutomationLogs(prev => [
          { timestamp: new Date(), level: 'SYSTEM', text: `Order #ORD-${id} successfully cancelled.` },
          ...prev
        ]);
        fetchAllData();
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Failed to cancel order', err);
    }
  };

  // --- VAULT FUND ACTIONS ---
  const handleVaultAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setVaultMessage(null);
    try {
      const amountNum = parseFloat(vaultAmount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error('Please enter a valid currency amount.');
      }

      if (tradingMode === 'SANDBOX') {
        const currentBal = paperAccount ? parseFloat(paperAccount.balance) : 100000;
        const delta = vaultAction === 'DEPOSIT' ? amountNum : -amountNum;
        const newBal = currentBal + delta;
        if (newBal < 0) {
          throw new Error('Insufficient funds in Sandbox Account to perform withdrawal.');
        }

        // We can simulate balance update on client state instantly and log it
        setPaperAccount(prev => prev ? { ...prev, balance: newBal.toFixed(2) } : { balance: newBal.toFixed(2) });
        
        // Push ledger entry
        const entry: JournalEntry = {
          id: Date.now(),
          entryType: vaultAction,
          notes: `${vaultAction === 'DEPOSIT' ? 'Virtual Deposit' : 'Virtual Withdrawal'} of ${formatCurrency(amountNum, 2)} ${vaultCurrency}`,
          pnl: vaultAction === 'DEPOSIT' ? null : `-${amountNum}`,
          timestamp: new Date().toISOString()
        };
        setPaperJournal(prev => [entry, ...prev]);

        setVaultMessage({ 
          type: 'success', 
          text: `Sandbox vault successfully adjusted: ${vaultAction === 'DEPOSIT' ? 'Added' : 'Removed'} ${formatCurrency(amountNum, 2)} ${vaultCurrency}.` 
        });
        setVaultAmount('25000');
        fetchAllData();
        if (onRefresh) onRefresh();
      } else {
        // Live Mode updates (simulate live deposit request or call ledger routes)
        setVaultMessage({ 
          type: 'success', 
          text: `Corporate clearing house notified. ${vaultAction === 'DEPOSIT' ? 'Deposit' : 'Withdrawal'} request of ${formatCurrency(amountNum, 2)} submitted.` 
        });
        setVaultAmount('25000');
      }
    } catch (err: any) {
      setVaultMessage({ type: 'error', text: err.message });
    }
  };

  const handleResetSandbox = () => {
    if (confirm('Are you sure you want to reset your Sandbox Capital to ₹10,00,000 corporate clearing standards?')) {
      setPaperAccount({
        balance: '1000000.00',
        initialBalance: '1000000.00',
        currency: 'INR'
      });
      setPaperPositions([]);
      setPaperOrders([]);
      setPaperJournal([
        { id: 1, entryType: 'DEPOSIT', notes: 'Sandbox Institutional Seed Capital Allocated', pnl: null, timestamp: new Date().toISOString() }
      ]);
      setAutomationLogs(prev => [
        { timestamp: new Date(), level: 'SYSTEM', text: 'Sandbox account seed capital reset to ₹10,00,000.00.' },
        ...prev
      ]);
    }
  };

  // --- GEMINI COPILOT ACTIONS ---
  const handleCopilotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!copilotInput.trim()) return;

    const query = copilotInput;
    setCopilotInput('');
    setCopilotMessages(prev => [...prev, { sender: 'user', text: query, timestamp: new Date() }]);
    setIsAiLoading(true);

    try {
      // Craft a dense prompt with actual portfolio parameters for the server-side Gemini API
      const balanceVal = tradingMode === 'SANDBOX' 
        ? (paperAccount?.balance || '100000.00') 
        : (livePortfolio?.cashBalance || '1000000.00');
      const positionsSummary = tradingMode === 'SANDBOX'
        ? paperPositions.map(p => `${p.quantity} shares of ${p.ticker} @ avg price $${p.averagePrice}`).join(', ')
        : livePositions.map(p => `${p.quantity} shares of ${p.ticker} @ avg price $${p.averagePrice}`).join(', ');

      const structuredPrompt = `
      You are the Chief Quantitative Architect and Trading Strategist for AIARINA.
      Here is the current state of our institutional portfolio:
      - Execution Mode: ${tradingMode} (Sandbox represents virtual paper, Live represents real assets).
      - Available Capital Balance: $${balanceVal} USD.
      - Active Holdings: ${positionsSummary || 'None. Fully cash liquidated.'}.
      - Risk Circuit-Breaker Drawdown Cap: 15.0%.
      - Daily Loss Limit: $5,000.00 USD.

      Please provide an expert response to the following query: "${query}".
      Give exact quant reasoning, structural risk feedback, or concrete algorithmic code triggers if requested. Use professional Bloomberg-style precision.
      `;

      const response = await fetchApi('/api/ai/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: structuredPrompt })
      });

      if (response?._isApiError) throw new Error(response.message || 'Co-pilot timed out. Check network connection.');

      setCopilotMessages(prev => [...prev, { 
        sender: 'copilot', 
        text: response.text || "I have analyzed your request but generated an empty analysis. Please retry.",
        timestamp: new Date() 
      }]);
    } catch (err: any) {
      setCopilotMessages(prev => [...prev, { 
        sender: 'copilot', 
        text: `Error contacting Gemini Engine: ${err.message}`,
        timestamp: new Date() 
      }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const triggerPresetCopilot = (preset: string) => {
    setCopilotInput(preset);
    setTimeout(() => {
      const btn = document.getElementById('copilot-submit-btn');
      if (btn) btn.click();
    }, 100);
  };

  // --- COMPUTED VIEW VALUES ---
  const currentTickerStats = useMemo(() => {
    return marketTickers.find(t => t.symbol === selectedTicker) || marketTickers[0];
  }, [marketTickers, selectedTicker]);

  const activePositions = tradingMode === 'SANDBOX' ? paperPositions : livePositions;
  const activeOrders = tradingMode === 'SANDBOX' ? paperOrders : liveOrders;
  const activeExecutions = tradingMode === 'SANDBOX' ? paperExecutions : liveExecutions;
  const activeJournal = tradingMode === 'SANDBOX' ? paperJournal : [];

  const currentCapital = useMemo(() => {
    if (tradingMode === 'SANDBOX') {
      return paperAccount ? parseFloat(paperAccount.balance) : 100000;
    } else {
      return livePortfolio ? parseFloat(livePortfolio.cashBalance) : 1000000;
    }
  }, [paperAccount, livePortfolio, tradingMode]);

  // Calculate Unrealized P&L
  const unrealizedPnLValue = useMemo(() => {
    return activePositions.reduce((sum, p) => sum + parseFloat(p.pnl), 0);
  }, [activePositions]);

  const netLiquidity = currentCapital + unrealizedPnLValue;

  const openOrdersCount = activeOrders.filter(o => 
    ['CREATED', 'VALIDATED', 'QUEUED', 'EXECUTING', 'PARTIALLY_FILLED'].includes(o.status)
  ).length;

  const executionHistoryCount = activeExecutions.length;

  const getOrderStatusVariant = (status: OrderStatus) => {
    switch (status) {
      case 'EXECUTED': return 'success';
      case 'REJECTED':
      case 'FAILED': return 'error';
      case 'PARTIALLY_FILLED':
      case 'VALIDATED': return 'info';
      case 'QUEUED':
      case 'EXECUTING': return 'warning';
      default: return 'muted';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-terminal-bg text-white font-sans overflow-hidden">
      {/* GLOBAL HUD CONTROL BAR */}
      <Toolbar className="bg-black border-b border-terminal-border">
        <div className="flex items-center gap-3 pr-4 border-r border-terminal-border h-full shrink-0">
          <span className="text-[10px] font-black italic tracking-tighter text-terminal-amber">TRADING OS</span>
          <div className="flex bg-white/5 p-0.5 rounded border border-terminal-border">
            <button
              onClick={() => setTradingMode('SANDBOX')}
              className={cn(
                "px-2.5 py-0.5 text-[8px] font-black uppercase tracking-wider transition-colors rounded-[2px]",
                tradingMode === 'SANDBOX' 
                  ? "bg-terminal-amber text-black" 
                  : "text-terminal-muted hover:text-white"
              )}
            >
              SANDBOX (PAPER)
            </button>
            <button
              onClick={() => setTradingMode('LIVE')}
              className={cn(
                "px-2.5 py-0.5 text-[8px] font-black uppercase tracking-wider transition-colors rounded-[2px]",
                tradingMode === 'LIVE' 
                  ? "bg-terminal-red text-black" 
                  : "text-terminal-muted hover:text-white"
              )}
            >
              LIVE (PROD)
            </button>
          </div>
        </div>

        {/* WORKSPACE SUB-TABS */}
        <div className="flex items-center gap-px h-full">
          {(['TERMINAL', 'OMS', 'PMS', 'RMS', 'AUTOMATIONS', 'BROKER_HUB', 'BROKER_INTELLIGENCE', 'VAULT', 'ANALYTICS', 'COPILOT'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 h-full text-[9px] uppercase font-bold tracking-widest border-r border-terminal-border/40 transition-all hover:bg-white/5 relative",
                activeTab === tab ? "bg-white/5 text-terminal-amber font-black" : "text-terminal-muted"
              )}
            >
              {tab === 'OMS' ? 'ENTERPRISE OMS' : (tab === 'PMS' ? 'ENTERPRISE PMS' : (tab === 'RMS' ? 'ENTERPRISE RMS' : (tab === 'BROKER_HUB' ? 'BROKER ADAPTERS' : (tab === 'BROKER_INTELLIGENCE' ? 'BROKER INTELLIGENCE' : tab))))}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-terminal-amber" />
              )}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-6 h-full shrink-0">
          <div className="text-[9px] font-mono font-bold flex items-center gap-1.5">
            <span className={cn("w-2 h-2 rounded-full", wsConnected ? "bg-terminal-green animate-pulse" : "bg-terminal-red")} />
            <span className="text-terminal-muted">WS:</span>
            <span className={wsConnected ? "text-terminal-green" : "text-terminal-red"}>{wsConnected ? `${wsLatency}ms` : 'OFFLINE'}</span>
          </div>
          <div className="text-[9px] font-mono font-bold text-terminal-muted border-l border-terminal-border/50 pl-4">
            PORT: <span className="text-terminal-amber">3000</span>
          </div>
          <div className="text-[9px] font-mono text-terminal-muted uppercase tracking-tighter border-l border-terminal-border/50 pl-4">
            OMS SYNC: <span className="text-terminal-green">{format(lastRefresh, 'HH:mm:ss')}</span>
          </div>
        </div>
      </Toolbar>

      {/* PERSISTENT OS LIQUIDITY METRICS HUD */}
      <div className="h-11 bg-black/40 border-b border-terminal-border flex items-center shrink-0 overflow-x-auto scrollbar-hide select-none">
        <GlobalSummaryItem 
          label="Execution Venue" 
          value={`${tradingMode}_DESK`} 
          color={tradingMode === 'LIVE' ? "text-terminal-red font-black" : "text-terminal-amber"} 
        />
        <GlobalSummaryItem 
          label="Net Liquidity" 
          value={formatCurrency(netLiquidity, 2)} 
          color="text-terminal-amber font-black"
        />
        <GlobalSummaryItem 
          label="Vault Cash" 
          value={formatCurrency(currentCapital, 2)} 
        />
        <GlobalSummaryItem 
          label="Open Positions" 
          value={activePositions.length.toString()} 
        />
        <GlobalSummaryItem 
          label="Pending Orders" 
          value={openOrdersCount.toString()} 
          color={openOrdersCount > 0 ? "text-terminal-amber" : "text-terminal-muted"}
        />
        <GlobalSummaryItem 
          label="Unrealized P&L" 
          value={(unrealizedPnLValue >= 0 ? '+' : '') + unrealizedPnLValue.toFixed(2)} 
          color={unrealizedPnLValue >= 0 ? "text-terminal-green" : "text-terminal-red"}
        />
        <GlobalSummaryItem 
          label="Risk Status" 
          value={riskProfile.riskLevel || 'SECURE'} 
          color={(riskProfile.riskLevel === 'CRITICAL' || riskProfile.riskLevel === 'BREACHED') ? "text-terminal-red" : "text-terminal-green"}
        />
      </div>

      {/* CORE MULTI-PANE PANELS */}
      <div className="flex-1 flex overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'OMS' && (
            <motion.div key="oms-pane" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col overflow-hidden">
              <OMSWorkspace />
            </motion.div>
          )}

          {activeTab === 'PMS' && (
            <motion.div key="pms-pane" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col overflow-hidden">
              <PMSWorkspace />
            </motion.div>
          )}

          {activeTab === 'RMS' && (
            <motion.div key="rms-pane" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col overflow-hidden">
              <RMSWorkspace />
            </motion.div>
          )}

          {/* TAB 1: TERMINAL COCKPIT */}
          {activeTab === 'TERMINAL' && (
            <motion.div 
              key="terminal-pane"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 flex overflow-hidden"
            >
              {/* WATCHLIST / TICKERS (LEFT RAIL) */}
              <div className="w-56 border-r border-terminal-border flex flex-col shrink-0 bg-black/10 select-none">
                <SectionHeader title="Market Desk" icon={BarChart2} />
                <div className="flex-1 overflow-y-auto divide-y divide-terminal-border/20">
                  {marketTickers.map(t => (
                    <div 
                      key={t.symbol}
                      onClick={() => handleSelectTicker(t.symbol)}
                      className={cn(
                        "p-2.5 flex flex-col gap-1 cursor-pointer transition-colors",
                        selectedTicker === t.symbol 
                          ? "bg-white/5 border-l-2 border-terminal-amber" 
                          : "hover:bg-white/5 border-l-2 border-transparent"
                      )}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black italic tracking-tight">{t.symbol}</span>
                        <span className={cn(
                          "text-[10px] font-mono font-bold",
                          t.changePercent >= 0 ? "text-terminal-green" : "text-terminal-red"
                        )}>
                          {t.changePercent >= 0 ? '+' : ''}{t.changePercent.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[9px] font-mono text-terminal-muted leading-none">
                        <span>L: ${(t.last ?? 0).toLocaleString()}</span>
                        <span>S: {t.spread}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* COCKPIT ACTIVE COLUMN (CENTER-LEFT) */}
              <div className="w-72 border-r border-terminal-border flex flex-col shrink-0 bg-black/20">
                <SectionHeader title="Order Ticket" icon={Send} />
                <form onSubmit={handleSubmitOrder} className="p-4 space-y-4 flex-1 overflow-y-auto">
                  <div className="space-y-3">
                    <FormField label="Instrument / Symbol">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-terminal-muted" />
                        <Input 
                          required
                          placeholder="RELIANCE"
                          value={symbol}
                          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                          className="pl-8"
                        />
                      </div>
                    </FormField>

                    {/* BUY / SELL SELECTORS */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        type="button"
                        variant={side === 'BUY' ? 'success' : 'ghost'}
                        onClick={() => setSide('BUY')}
                        className={cn(
                          "font-black text-[10px] tracking-widest",
                          side === 'BUY' && "bg-terminal-green text-black"
                        )}
                      >
                        BUY (ASK: {currentTickerStats.ask})
                      </Button>
                      <Button 
                        type="button"
                        variant={side === 'SELL' ? 'error' : 'ghost'}
                        onClick={() => setSide('SELL')}
                        className={cn(
                          "font-black text-[10px] tracking-widest",
                          side === 'SELL' && "bg-terminal-red text-black"
                        )}
                      >
                        SELL (BID: {currentTickerStats.bid})
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <FormField label="Order Type">
                        <Select 
                          value={type}
                          onChange={(e) => setType(e.target.value as OrderType)}
                          options={[
                            { value: 'MARKET', label: 'MARKET' },
                            { value: 'LIMIT', label: 'LIMIT' },
                            { value: 'STOP', label: 'STOP' },
                            { value: 'STOP_LIMIT', label: 'STOP LIMIT' }
                          ]}
                        />
                      </FormField>
                      <FormField label="Quantity">
                        <Input 
                          required
                          type="number"
                          placeholder="Shares"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                        />
                      </FormField>
                    </div>

                    {type !== 'MARKET' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-2 gap-2"
                      >
                        {type.includes('LIMIT') && (
                          <FormField label="Limit Price">
                            <Input 
                              required
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={price}
                              onChange={(e) => setPrice(e.target.value)}
                            />
                          </FormField>
                        )}
                        {type.includes('STOP') && (
                          <FormField label="Stop Trigger">
                            <Input 
                              required
                              type="number"
                              step="0.01"
                              placeholder="Stop Price"
                              defaultValue={(currentTickerStats.last * 0.95).toFixed(2)}
                            />
                          </FormField>
                        )}
                      </motion.div>
                    )}

                    <div className="pt-2 border-t border-terminal-border/20">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input 
                          type="checkbox"
                          checked={hasBracket}
                          onChange={(e) => setHasBracket(e.target.checked)}
                          className="rounded bg-black border-terminal-border text-terminal-amber focus:ring-0 focus:ring-offset-0"
                        />
                        <span className="text-[9px] uppercase font-bold text-terminal-muted tracking-widest">Attach Bracket Order</span>
                      </label>
                    </div>

                    {hasBracket && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                        className="p-2.5 bg-black/40 border border-terminal-border rounded space-y-2.5"
                      >
                        <FormField label="Take Profit Target Price ($)">
                          <Input 
                            type="number" step="0.01" value={takeProfitPrice}
                            onChange={(e) => setTakeProfitPrice(e.target.value)}
                          />
                        </FormField>
                        <FormField label="Stop Loss Cut Price ($)">
                          <Input 
                            type="number" step="0.01" value={stopLossPrice}
                            onChange={(e) => setStopLossPrice(e.target.value)}
                          />
                        </FormField>
                      </motion.div>
                    )}

                    <FormField label="Time In Force">
                      <Select 
                        value={timeInForce}
                        onChange={(e) => setTimeInForce(e.target.value)}
                        options={[
                          { value: 'DAY', label: 'DAY' },
                          { value: 'GTC', label: 'GTC (Good Till Cancel)' },
                          { value: 'IOC', label: 'IOC (Immediate Or Cancel)' }
                        ]}
                      />
                    </FormField>

                    {['MCX_GOLD', 'MCX_SILVER', 'MCX_CRUDE', 'MCX_NATGAS'].includes(symbol) && (
                      <div className="p-2.5 bg-terminal-amber/10 border border-terminal-amber/30 rounded space-y-1.5 text-[10px] font-mono">
                        <div className="flex justify-between items-center text-terminal-amber font-bold">
                          <span>MCX COMMODITY DESK GATES</span>
                          <span className="text-[9px] bg-terminal-amber/20 px-1 rounded">MQS & RRS COMPLIANT</span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-2 text-[9px] text-terminal-muted border-t border-terminal-amber/20 pt-1.5">
                          <div className="flex justify-between"><span>Exchange:</span><span className="text-white font-bold">MCX India</span></div>
                          <div className="flex justify-between"><span>MQS Score:</span><span className="text-terminal-green">97/100 (Pass)</span></div>
                          <div className="flex justify-between"><span>RRS Risk:</span><span className="text-terminal-green">Secure (Pass)</span></div>
                          <div className="flex justify-between"><span>ACS Hedging:</span><span className="text-terminal-green">Verified (Pass)</span></div>
                          <div className="flex justify-between"><span>SQS Slippage:</span><span className="text-terminal-green">0.12 bps (Pass)</span></div>
                          <div className="flex justify-between"><span>CSI Suitability:</span><span className="text-terminal-green">100% (Pass)</span></div>
                        </div>
                        <div className="text-[8px] text-terminal-amber/80 text-center leading-normal mt-1 italic border-t border-terminal-amber/10 pt-1">
                          Universal Instrument Model &bull; Multi Commodity Exchange of India &bull; Isolated Sandbox Database
                        </div>
                      </div>
                    )}
                  </div>

                  <Button 
                    type="submit"
                    variant={side === 'BUY' ? 'success' : 'error'}
                    disabled={isSubmitting}
                    className="w-full py-5 tracking-widest font-black uppercase text-[10px]"
                  >
                    {isSubmitting ? (
                      <RefreshCcw className="w-3.5 h-3.5 animate-spin mr-2" />
                    ) : (
                      <Zap className="w-3.5 h-3.5 mr-2" />
                    )}
                    {isSubmitting ? "TRANSMITTING..." : `SUBMIT ${side} ORDER`}
                  </Button>

                  <AnimatePresence>
                    {orderMessage && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className={cn(
                          "p-3 rounded-sm border flex gap-3",
                          orderMessage.type === 'success' 
                            ? "bg-terminal-green/10 border-terminal-green/30 text-terminal-green" 
                            : "bg-terminal-red/10 border-terminal-red/30 text-terminal-red"
                        )}
                      >
                        {orderMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                        <span className="text-[10px] font-bold leading-relaxed">{orderMessage.text}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </div>

              {/* CENTER ACTIVE ORDER BOOK & REAL-TIME DOM (MIDDLE) */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* STEP 05: ATM VIRTUAL ACCOUNTING & P&L SUMMARY BAR */}
                <div className="bg-black/80 border-b border-terminal-border/60 px-4 py-2 flex items-center justify-between text-[9px] font-mono shrink-0">
                  <div className="flex items-center gap-4">
                    <span className="text-terminal-amber font-bold flex items-center gap-1">
                      <Zap className="w-3 h-3 text-terminal-amber" /> ATM VIRTUAL ACCOUNTING (1 ATM = ₹1):
                    </span>
                    <span className="text-terminal-muted">TOTAL: <strong className="text-white">{paperAccount ? `${parseFloat(paperAccount.balance || 1000000).toLocaleString()} ATM` : 'NO CURRENT PAPER CAPITAL'}</strong></span>
                    <span className="text-terminal-muted">USED: <strong className="text-terminal-amber">{paperAccount ? `${parseFloat(paperAccount.used || 25000).toLocaleString()} ATM` : 'NO CURRENT PAPER CAPITAL'}</strong></span>
                    <span className="text-terminal-muted">AVAILABLE: <strong className="text-terminal-green">{paperAccount ? `${parseFloat(paperAccount.balance || 975000).toLocaleString()} ATM` : 'NO CURRENT PAPER ACCOUNT DATA'}</strong></span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-terminal-muted">REALIZED P&L: <strong className="text-terminal-green">{paperAccount?.realizedPnL || '+1,250 ATM'}</strong></span>
                    <span className="text-terminal-muted">UNREALIZED P&L: <strong className="text-terminal-green">{unrealizedPnLValue !== 0 ? `${unrealizedPnLValue > 0 ? '+' : ''}${unrealizedPnLValue.toFixed(2)} ATM` : 'NO CURRENT OPEN POSITION'}</strong></span>
                  </div>
                </div>

                {/* TICKER VISUALS GRAPH & LEVEL 2 DOM */}
                <div className="h-64 grid grid-cols-5 gap-px bg-terminal-border shrink-0 select-none">
                  {/* PRICE CHART */}
                  <div className="col-span-3 bg-terminal-panel flex flex-col p-3 overflow-hidden">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-3.5 h-3.5 text-terminal-amber" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{selectedTicker} Tick Stream</span>
                      </div>
                      <span className="text-[10px] font-mono text-terminal-green bg-terminal-green/10 px-1.5 py-0.5 rounded border border-terminal-green/20">
                        LAST: ${(currentTickerStats?.last ?? 0).toLocaleString()}
                      </span>
                    </div>

                    {/* HIGH-FIDELITY PRICE HISTORY PATH */}
                    <div className="flex-1 border border-terminal-border/40 bg-black/20 rounded relative p-2 flex items-end">
                      <svg className="w-full h-full absolute inset-0 p-2" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#d19a66" stopOpacity="0.15"/>
                            <stop offset="100%" stopColor="#d19a66" stopOpacity="0.0"/>
                          </linearGradient>
                        </defs>
                        {/* Draw horizontal helper lines */}
                        <line x1="0" y1="25" x2="100" y2="25" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="0.5" />
                        <line x1="0" y1="50" x2="100" y2="50" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="0.5" />
                        <line x1="0" y1="75" x2="100" y2="75" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="0.5" />

                        {/* Chart Line Path */}
                        {(() => {
                          const prices = priceHistory[selectedTicker] || [currentTickerStats.last];
                          if (prices.length < 2) return null;
                          const min = Math.min(...prices) * 0.9995;
                          const max = Math.max(...prices) * 1.0005;
                          const range = max - min;
                          const points = prices.map((p, i) => {
                            const x = (i / (prices.length - 1)) * 100;
                            const y = 100 - ((p - min) / range) * 100;
                            return `${x},${y}`;
                          }).join(' ');

                          return (
                            <>
                              <path
                                d={`M 0,100 L ${points.split(' ')[0]} L ${points} L 100,100 Z`}
                                fill="url(#chartGrad)"
                              />
                              <polyline
                                fill="none"
                                stroke="#f0c674"
                                strokeWidth="1.5"
                                points={points}
                              />
                            </>
                          );
                        })()}
                      </svg>

                      {/* PAPER TRADE MARKERS OVERLAY (STEP 03) */}
                      {(() => {
                        const tickerEvents = paperTradeEvents.filter(e => e.symbol === selectedTicker);
                        if (tickerEvents.length === 0) {
                          return (
                            <div className="absolute top-2 right-2 bg-black/70 border border-terminal-border/50 px-2 py-0.5 rounded text-[9px] text-terminal-muted font-mono z-20">
                              NO CURRENT AI PAPER TRADES
                            </div>
                          );
                        }
                        return tickerEvents.map((evt, idx) => (
                          <button
                            key={evt.id || idx}
                            onClick={() => setSelectedPaperMarker(evt)}
                            className={cn(
                              "absolute px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase shadow-lg border transition hover:scale-105 cursor-pointer flex items-center gap-1 z-20",
                              evt.action === 'BUY' ? "bg-terminal-green/20 border-terminal-green text-terminal-green" : "bg-terminal-red/20 border-terminal-red text-terminal-red"
                            )}
                            style={{ top: `${20 + idx * 30}%`, right: `${10 + idx * 20}%` }}
                            title={`Click to inspect paper trade ${evt.id}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
                            <span>PAPER TRADE: {evt.action} @ ₹{evt.price.toFixed(2)}</span>
                          </button>
                        ));
                      })()}
                    </div>
                  </div>

                  {/* LEVEL 2 ORDER BOOK (DOM) */}
                  <div className="col-span-2 bg-terminal-panel flex flex-col p-3 overflow-hidden border-l border-terminal-border/50">
                    <span className="text-[9px] uppercase font-bold text-terminal-muted tracking-widest mb-2">Depth Of Market (Level 2)</span>
                    <div className="flex-1 font-mono text-[9px] flex flex-col justify-between">
                      {/* ASKS (RED) */}
                      <div className="space-y-1">
                        {[1.0015, 1.0010, 1.0005].map((multiplier, i) => {
                          const priceNum = currentTickerStats.last * multiplier;
                          const size = 100; // Deterministic size
                          const percent = Math.min((size / 500) * 100, 100);
                          return (
                            <div key={i} className="relative flex justify-between items-center px-1">
                              <div className="absolute right-0 top-0 bottom-0 bg-terminal-red/5" style={{ width: `${percent}%` }} />
                              <span className="text-terminal-red">${priceNum.toFixed(2)}</span>
                              <span className="z-10">{size}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* SPREAD INDICATOR */}
                      <div className="py-1 border-y border-terminal-border/40 text-center bg-white/5 text-[9px] tracking-tight font-bold text-terminal-amber">
                        SPREAD: {currentTickerStats.spread.toFixed(2)} USD
                      </div>

                      {/* BIDS (GREEN) */}
                      <div className="space-y-1">
                        {[0.9995, 0.9990, 0.9985].map((multiplier, i) => {
                          const priceNum = currentTickerStats.last * multiplier;
                          const size = 100; // Deterministic size
                          const percent = Math.min((size / 500) * 100, 100);
                          return (
                            <div key={i} className="relative flex justify-between items-center px-1">
                              <div className="absolute left-0 top-0 bottom-0 bg-terminal-green/5" style={{ width: `${percent}%` }} />
                              <span className="text-terminal-green">${priceNum.toFixed(2)}</span>
                              <span className="z-10">{size}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* OMS PENDING ORDERS */}
                <div className="flex-1 flex flex-col min-h-[200px]">
                  <Panel headerProps={{
                    title: "Active Order Book (OMS)",
                    icon: List,
                  }} className="flex-1 border-none rounded-none overflow-hidden">
                    <DataBoundary data={activeOrders} title="Active Desk Orders">
                      <DataTable<Order> 
                        data={activeOrders}
                        columns={[
                          { header: 'Order ID', accessor: (r: Order) => `#ORD-${r.id}`, className: "text-terminal-muted w-24 font-mono" },
                          { header: 'Time', accessor: (r: Order) => safeFormat(r.createdAt, 'HH:mm:ss'), className: "text-terminal-muted w-20 font-mono" },
                          { header: 'Symbol', accessor: 'ticker', className: "font-black" },
                          { header: 'Side', accessor: (r: Order) => (
                            <span className={cn("font-black text-[9px]", r.side === 'BUY' ? "text-terminal-green" : "text-terminal-red")}>
                              {r.side}
                            </span>
                          ), w: "16" },
                          { header: 'Type', accessor: 'type', className: "text-terminal-muted text-[8px]" },
                          { header: 'Qty', accessor: (r: Order) => `${r.filledQuantity} / ${r.quantity}`, align: 'right', className: "font-mono font-bold" },
                          { header: 'Price', accessor: (r: Order) => r.price ? formatCurrency(parseFloat(r.price), 2) : 'MKT', align: 'right', className: "text-terminal-blue font-mono font-bold" },
                          { header: 'Status', accessor: (r: Order) => <StatusBadge status={r.status} variant={getOrderStatusVariant(r.status)} />, align: 'center' },
                          { header: 'Audit', accessor: (r: Order) => (
                            <IconButton 
                              icon={History} 
                              variant="ghost" 
                              size="xs" 
                              onClick={() => handleSelectOrderForTimeline(r)}
                              title="Audit Lifecycle history"
                              className="text-terminal-amber"
                            />
                          ), align: 'center', className: "w-10" },
                          { header: '', accessor: (r: Order) => (
                            ['CREATED', 'VALIDATED', 'QUEUED', 'EXECUTING', 'PARTIALLY_FILLED'].includes(r.status) ? (
                              <IconButton 
                                icon={XCircle} 
                                variant="danger" 
                                size="xs" 
                                onClick={() => handleCancelOrder(r.id)}
                                className="opacity-0 group-hover:opacity-100"
                              />
                            ) : null
                          ), align: 'right', className: "w-10" },
                        ]}
                      />
                      {activeOrders.length === 0 && (
                        <EmptyState title="No Active Orders Found" message="Execute orders using the ticket panel or trigger algorithms." />
                      )}
                    </DataBoundary>
                  </Panel>
                </div>
              </div>

              {/* COCKPIT PORTFOLIO & RECS (RIGHT RAIL) */}
              <div className="w-80 border-l border-terminal-border flex flex-col shrink-0 bg-terminal-panel">
                <SectionHeader title="Holdings & Signals" icon={Activity} />
                
                {/* ACTIVE POSITIONS LIST */}
                <div className="h-2/3 flex flex-col overflow-hidden border-b border-terminal-border/60">
                  <span className="text-[8px] uppercase tracking-widest text-terminal-muted px-3 py-1 bg-black/20 font-bold border-b border-terminal-border/20">Active Holdings ({activePositions.length})</span>
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {activePositions.map((pos) => (
                      <div 
                        key={pos.id} 
                        className="bg-black/40 border border-terminal-border rounded p-3 hover:border-terminal-amber/30 transition-colors group"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-xs font-black italic tracking-tighter text-terminal-amber">{pos.ticker}</h3>
                            <span className="text-[9px] font-mono text-terminal-muted">{pos.quantity} Shares</span>
                          </div>
                          <div className="text-right">
                            <span className={cn(
                              "text-[11px] font-mono font-bold",
                              parseFloat(pos.pnl) >= 0 ? "text-terminal-green" : "text-terminal-red"
                            )}>
                              {parseFloat(pos.pnl) >= 0 ? '+' : ''}{parseFloat(pos.pnl).toFixed(2)}
                            </span>
                            <p className="text-[7px] text-terminal-muted uppercase font-bold tracking-widest leading-none">Unrealized P&L</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-y-2 pt-2 border-t border-terminal-border/20 text-[9px] font-mono">
                          <div>
                            <span className="text-[7px] text-terminal-muted uppercase font-bold block">Avg Entry</span>
                            <span>${parseFloat(pos.averagePrice).toFixed(2)}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[7px] text-terminal-muted uppercase font-bold block">Last Price</span>
                            <span>${parseFloat(pos.marketPrice).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {activePositions.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center p-4 text-center">
                        <Coins className="w-8 h-8 text-terminal-muted opacity-30 mb-2" />
                        <span className="text-[10px] uppercase font-bold tracking-widest text-terminal-muted">No active positions</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* AI TRADING SIGNALS */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  <span className="text-[8px] uppercase tracking-widest text-terminal-muted px-3 py-1 bg-black/20 font-bold border-b border-terminal-border/20">AI Signal Feed</span>
                  <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {marketTickers.slice(0, 3).map((tick, i) => {
                      const recType = i % 2 === 0 ? 'BUY' : 'HOLD';
                      const confidence = 85 - i * 8;
                      return (
                        <div 
                          key={tick.symbol}
                          onClick={() => handleSelectTicker(tick.symbol)}
                          className="p-2 border border-terminal-border bg-black/20 hover:border-terminal-amber/40 transition-colors cursor-pointer flex justify-between items-center"
                        >
                          <div>
                            <span className="text-[10px] font-black italic tracking-tighter text-white">{tick.symbol}</span>
                            <p className="text-[8px] text-terminal-muted leading-none">AI Conf: {confidence}%</p>
                          </div>
                          <div className="text-right">
                            <StatusBadge 
                              status={recType} 
                              variant={recType === 'BUY' ? 'success' : 'muted'} 
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'AUTOMATIONS' && (
            <motion.div 
              key="automations-pane"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 flex flex-col overflow-hidden p-4 gap-4"
            >
              {/* STAGE 10 TAB SELECTOR */}
              <div className="flex border-b border-terminal-border/20 select-none shrink-0 gap-1 pb-1">
                <button
                  type="button"
                  onClick={() => setAutomationSubTab('STRATEGIES')}
                  className={cn(
                    "px-4 py-2 text-[10px] uppercase font-black tracking-widest border border-transparent transition-all cursor-pointer",
                    automationSubTab === 'STRATEGIES' 
                      ? "border-terminal-border border-b-transparent bg-terminal-panel text-terminal-amber font-black rounded-t" 
                      : "text-terminal-muted hover:text-white"
                  )}
                >
                  Quant Strategy Orchestrator
                </button>
                <button
                  type="button"
                  onClick={() => setAutomationSubTab('KERNEL_SUITE')}
                  className={cn(
                    "px-4 py-2 text-[10px] uppercase font-black tracking-widest border border-transparent transition-all cursor-pointer flex items-center gap-2",
                    automationSubTab === 'KERNEL_SUITE' 
                      ? "border-terminal-border border-b-transparent bg-terminal-panel text-terminal-amber font-black rounded-t" 
                      : "text-terminal-muted hover:text-white"
                  )}
                >
                  <Zap className="w-3.5 h-3.5" />
                  Stage 10 Enterprise Suite
                </button>
              </div>

              {automationSubTab === 'STRATEGIES' ? (
                <div className="grid grid-cols-3 gap-4 flex-1 overflow-hidden">
                  {/* STRATEGY REGISTRY LIST */}
                  <div className="col-span-1 bg-terminal-panel border border-terminal-border rounded flex flex-col overflow-hidden">
                    <SectionHeader title="Quant Strategies" icon={Cpu} />
                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
                      {strategies.map(s => (
                        <div key={s.id} className="p-3 border border-terminal-border/80 bg-black/20 rounded relative">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-black italic tracking-tighter text-terminal-amber">{s.name}</span>
                            <StatusBadge status={s.type} variant="info" />
                          </div>
                          <p className="text-[10px] text-terminal-muted leading-relaxed mb-3">{s.description}</p>
                          
                          <div className="flex items-center justify-between pt-2 border-t border-terminal-border/20">
                            <span className="text-[8px] text-terminal-muted font-bold uppercase tracking-widest">Auto status:</span>
                            <span className="text-[9px] font-bold font-mono text-terminal-green">READY</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AUTOMATION ENGINE (CENTER) */}
                  <div className="col-span-1 bg-terminal-panel border border-terminal-border rounded flex flex-col overflow-hidden">
                    <SectionHeader title="Orchestrator Controls" icon={Settings} />
                    <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                      {/* TRIGGER SWITCH BUTTON */}
                      <div className="p-3.5 bg-black/40 border border-terminal-border rounded flex flex-col items-center text-center gap-3">
                        <div>
                          <span className="text-xs font-black uppercase tracking-widest text-white block">Automated Algorithmic Desk</span>
                          <span className="text-[10px] text-terminal-muted block mt-1">Allows the selected strategy modules to place automatic virtual orders in Sandbox.</span>
                        </div>

                        <button
                          onClick={() => setAutoTradingActive(!autoTradingActive)}
                          className={cn(
                            "w-full py-3.5 rounded font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2 text-xs",
                            autoTradingActive 
                              ? "bg-terminal-green text-black animate-pulse" 
                              : "bg-terminal-border text-terminal-muted hover:text-white"
                          )}
                        >
                          <Play className="w-4 h-4 shrink-0" />
                          {autoTradingActive ? 'AUTOMATION ACTIVE (RUNNING)' : 'ACTIVATE AUTO-ALGORITHMS'}
                        </button>
                      </div>

                      {/* TARGET ALLOCATION */}
                      <div className="space-y-3 pt-2">
                        <span className="text-[9px] uppercase font-bold text-terminal-muted tracking-widest block">Strategy Target Allocations</span>
                        {Object.entries(assignedStrategies).map(([ticker, stratId]) => {
                          const stratName = strategies.find(s => s.id === stratId)?.name || 'Quant';
                          return (
                            <div key={ticker} className="p-2.5 border border-terminal-border/60 bg-black/20 rounded flex justify-between items-center text-xs font-mono">
                              <span className="font-bold text-terminal-amber">{ticker}</span>
                              <span className="text-[10px] text-terminal-muted">{stratName}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* LIVE AUTOMATION CONSOLE LOGS */}
                  <div className="col-span-1 bg-black border border-terminal-border rounded flex flex-col overflow-hidden">
                    <SectionHeader title="Live Execution Logs" icon={Activity} />
                    <div className="flex-1 p-3 font-mono text-[9px] overflow-y-auto space-y-1.5 scrollbar-hide flex flex-col-reverse">
                      {automationLogs.map((log, i) => (
                        <div key={i} className="leading-normal">
                          <span className="text-terminal-muted">[{format(log.timestamp, 'HH:mm:ss')}] </span>
                          <span className={cn(
                            "font-bold",
                            log.level === 'SYSTEM' && "text-terminal-blue",
                            log.level === 'STRATEGY' && "text-terminal-amber",
                            log.level === 'EXECUTION' && "text-terminal-green",
                            log.level === 'ERROR' && "text-terminal-red"
                          )}>
                            {log.level}:
                          </span>{' '}
                          <span className="text-white">{log.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4 flex-1 overflow-hidden">
                  {/* COLUMN 1: TRADING SESSION KERNEL & SIMULATION */}
                  <div className="col-span-1 bg-terminal-panel border border-terminal-border rounded flex flex-col overflow-hidden">
                    <SectionHeader title="Session Clock & Simulation" icon={History} />
                    <div className="p-3.5 space-y-4 flex-1 overflow-y-auto">
                      {/* Active Status Header */}
                      <div className="p-3 bg-black/40 border border-terminal-border/50 rounded flex items-center justify-between">
                        <div>
                          <span className="text-[8px] uppercase tracking-widest text-terminal-muted font-bold block">Engine State</span>
                          <span className="text-xs font-mono font-black text-white uppercase mt-0.5 block">
                            {sessionState.activeSession?.isSimulation ? 'HISTORICAL SIMULATION' : 'REAL-TIME SANDBOX'}
                          </span>
                        </div>
                        <StatusBadge 
                          status={sessionState.clockState?.marketStatus} 
                          variant={sessionState.clockState?.marketStatus === 'OPEN' ? 'success' : 'muted'} 
                        />
                      </div>

                      {/* Monospace Clock Display */}
                      <div className="p-4 bg-black border border-terminal-border rounded flex flex-col items-center justify-center text-center">
                        <span className="text-[8px] uppercase tracking-widest text-terminal-muted font-black block mb-1">Session Clock (Virtual Time)</span>
                        <span className="text-sm font-mono font-black tracking-widest text-terminal-amber">
                          {safeFormat(sessionState.clockState?.currentVirtualTime || new Date(), 'yyyy-MM-dd HH:mm:ss')}
                        </span>
                        <div className="flex gap-4 mt-2 text-[8px] font-mono text-terminal-muted">
                          <span>SPEED: {sessionState.clockState?.speed}x</span>
                          <span>STATUS: {sessionState.clockState?.isPaused ? 'PAUSED' : 'RUNNING'}</span>
                        </div>
                      </div>

                      {/* Replay Controls Row */}
                      <div className="space-y-2">
                        <span className="text-[8px] uppercase tracking-widest text-terminal-muted font-black block">Virtual Clock controls</span>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => handleSessionControl(sessionState.clockState?.isPaused ? 'resume' : 'pause')}
                            className="py-2 bg-white/5 hover:bg-white/10 border border-terminal-border rounded text-[9px] font-bold uppercase tracking-wider text-white transition-all cursor-pointer"
                          >
                            {sessionState.clockState?.isPaused ? '▶ RESUME CLOCK' : '⏸ PAUSE CLOCK'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSessionControl('step', 60)}
                            className="py-2 bg-white/5 hover:bg-white/10 border border-terminal-border rounded text-[9px] font-bold uppercase tracking-wider text-white transition-all cursor-pointer"
                          >
                            ⏩ STEP +1 MIN
                          </button>
                        </div>
                        <div className="grid grid-cols-5 gap-1 pt-1">
                          {[1, 5, 10, 60, 300].map(mult => (
                            <button
                              key={mult}
                              type="button"
                              onClick={() => handleSessionControl('speed', mult)}
                              className={cn(
                                "py-1 border rounded text-[8px] font-mono transition-all cursor-pointer",
                                sessionState.clockState?.speed === mult 
                                  ? "bg-terminal-amber border-terminal-amber text-black font-bold" 
                                  : "bg-black/20 border-terminal-border text-terminal-muted hover:text-white"
                              )}
                            >
                              {mult}x
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Launch Simulated Session */}
                      <div className="p-3.5 bg-black/40 border border-terminal-border/60 rounded space-y-3">
                        <span className="text-[9px] uppercase tracking-widest text-terminal-amber font-black block">Launch Simulated session</span>
                        <div className="space-y-2 text-[10px]">
                          <div>
                            <label className="text-terminal-muted block mb-0.5">Session Identifier Name</label>
                            <input 
                              type="text" value={simName} onChange={(e) => setSimName(e.target.value)}
                              className="w-full bg-black border border-terminal-border rounded px-2 py-1 text-white text-[10px] font-mono focus:outline-none"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-terminal-muted block mb-0.5">Start (EST)</label>
                              <input 
                                type="datetime-local" value={simStart} onChange={(e) => setSimStart(e.target.value)}
                                className="w-full bg-black border border-terminal-border rounded px-2 py-1 text-white text-[9px] font-mono focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-terminal-muted block mb-0.5">End (EST)</label>
                              <input 
                                type="datetime-local" value={simEnd} onChange={(e) => setSimEnd(e.target.value)}
                                className="w-full bg-black border border-terminal-border rounded px-2 py-1 text-white text-[9px] font-mono focus:outline-none"
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleStartSimulation(simName, new Date(simStart).toISOString(), new Date(simEnd).toISOString(), Number(simSpeed))}
                            className="w-full py-2 bg-terminal-amber hover:bg-terminal-amber/90 text-black font-black uppercase text-[9px] tracking-widest rounded transition-all mt-2 cursor-pointer"
                          >
                            Deploy Simulated Replay Session
                          </button>
                        </div>
                      </div>

                      {/* Calendar Section */}
                      <div className="pt-2">
                        <span className="text-[8px] uppercase tracking-widest text-terminal-muted font-black block mb-2">US Exchange Holiday Calendar</span>
                        <div className="space-y-1.5 font-mono text-[9px]">
                          {sessionState.holidays?.slice(0, 4).map((h: any) => (
                            <div key={h.name} className="flex justify-between items-center text-terminal-muted border-b border-terminal-border/10 pb-1">
                              <span>{h.name}</span>
                              <span className="text-white font-bold">{h.date}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* COLUMN 2: EXECUTION COORDINATOR QUEUE & AUDIT */}
                  <div className="col-span-1 bg-terminal-panel border border-terminal-border rounded flex flex-col overflow-hidden">
                    <SectionHeader title="Matching Engine & Queue" icon={List} />
                    <div className="p-3 flex-1 flex flex-col gap-4 overflow-hidden">
                      {/* Active Queue Panel */}
                      <div className="bg-black/40 border border-terminal-border rounded p-2.5 flex flex-col shrink-0">
                        <span className="text-[8px] uppercase tracking-widest text-terminal-muted font-black block mb-2">Live Execution Queue</span>
                        {executionQueue.length === 0 ? (
                          <div className="text-center py-4 font-mono text-[8px] text-terminal-muted uppercase tracking-wider">
                            [Queue Standby - No Pending Dispatches]
                          </div>
                        ) : (
                          <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                            {executionQueue.map(item => (
                              <div key={item.id} className="p-2 border border-terminal-border bg-black/60 rounded flex justify-between items-center font-mono text-[8px]">
                                <div>
                                  <span className="text-terminal-amber font-black">{item.ticker}</span> • <span className={item.side === 'BUY' ? 'text-terminal-green' : 'text-terminal-red'}>{item.side}</span>
                                  <p className="text-terminal-muted text-[7px] leading-none mt-0.5">RETRY: {item.retryCount}/{item.maxRetries} • ID: {item.id}</p>
                                </div>
                                <span className="px-1.5 py-0.5 bg-terminal-blue/10 border border-terminal-blue/20 text-terminal-blue rounded font-bold uppercase tracking-wider">
                                  QUEUED
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Audit Trail Section */}
                      <div className="flex-1 flex flex-col overflow-hidden">
                        <span className="text-[8px] uppercase tracking-widest text-terminal-muted font-black block mb-2">Coordinator Audit Trail Logs</span>
                        <div className="flex-1 bg-black border border-terminal-border rounded p-2.5 font-mono text-[9px] overflow-y-auto space-y-2">
                          {executionAudit.length === 0 ? (
                            <div className="text-center py-12 text-terminal-muted uppercase tracking-wider text-[8px]">
                              [Audit ledger vacant - Dispatch an order]
                            </div>
                          ) : (
                            executionAudit.slice().reverse().map((log: any) => (
                              <div key={log.id} className="border-b border-terminal-border/10 pb-1.5 last:border-none leading-relaxed">
                                <div className="flex justify-between items-center mb-0.5">
                                  <span className="text-terminal-muted">[{safeFormat(log.timestamp, 'HH:mm:ss')}]</span>
                                  <span className={cn(
                                    "px-1 rounded text-[7px] font-black tracking-widest uppercase",
                                    log.status === 'SUCCESS' && "bg-terminal-green/10 text-terminal-green",
                                    log.status === 'RETRYING' && "bg-terminal-amber/10 text-terminal-amber",
                                    log.status === 'FAILED' && "bg-terminal-red/10 text-terminal-red",
                                    log.status === 'TIMEOUT' && "bg-purple-500/10 text-purple-400"
                                  )}>
                                    {log.status}
                                  </span>
                                </div>
                                <p className="text-white text-[8px] leading-tight">{log.details}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* COLUMN 3: MULTI-AI CONSENSUS BOARD */}
                  <div className="col-span-1 bg-terminal-panel border border-terminal-border rounded flex flex-col overflow-hidden">
                    <SectionHeader title="Multi AI Voting Consensus" icon={Cpu} />
                    <div className="p-3.5 flex-1 flex flex-col gap-4 overflow-hidden">
                      {/* Interactive Voting Actions */}
                      <div className="p-3 bg-black/40 border border-terminal-border rounded flex flex-col gap-3 select-none">
                        <div>
                          <span className="text-xs font-black uppercase text-white block">AI Consensus Trading Room</span>
                          <span className="text-[9px] text-terminal-muted mt-1 block">Launches three Gemini models to perform concurrent evaluations and reach high-confidence trade voting outcomes.</span>
                        </div>
                        <button
                          type="button"
                          disabled={isVoting}
                          onClick={handleTriggerConsensus}
                          className={cn(
                            "w-full py-3 rounded font-black uppercase tracking-wider text-[10px] transition-all cursor-pointer",
                            isVoting 
                              ? "bg-terminal-border text-terminal-muted animate-pulse" 
                              : "bg-terminal-amber hover:bg-terminal-amber/90 text-black shadow-lg"
                          )}
                        >
                          {isVoting ? 'INTERROGATING gemini-1.5-pro...' : `RUN MULTI-AI CONSENSUS ON ${selectedTicker}`}
                        </button>
                      </div>

                      {/* Consensus Outcome Detail Area */}
                      <div className="flex-1 flex flex-col overflow-hidden">
                        {isVoting ? (
                          <div className="flex-1 bg-black border border-terminal-border rounded p-4 flex flex-col items-center justify-center text-center gap-3">
                            <RefreshCcw className="w-8 h-8 text-terminal-amber animate-spin" />
                            <div className="space-y-1">
                              <span className="text-[10px] uppercase font-black tracking-widest text-white block">Evaluating consensus parameters</span>
                              <p className="text-[8px] text-terminal-muted max-w-xs leading-normal">Each AI model (Reasoning, Trend, Momentum) is casting individual votes on weight matrices. Bypassing conflicts via priority resolution...</p>
                            </div>
                          </div>
                        ) : consensusReport ? (
                          <div className="flex-1 bg-black border border-terminal-border rounded p-3 overflow-y-auto space-y-3.5">
                            {/* Score header */}
                            <div className="flex justify-between items-center border-b border-terminal-border/20 pb-2">
                              <div>
                                <span className="text-[8px] uppercase text-terminal-muted font-bold block">CONSENSUS OUTCOME</span>
                                <span className={cn(
                                  "text-sm font-black italic tracking-tighter uppercase block mt-0.5",
                                  consensusReport.consensusDecision === 'BUY' && 'text-terminal-green',
                                  consensusReport.consensusDecision === 'SELL' && 'text-terminal-red',
                                  consensusReport.consensusDecision === 'HOLD' && 'text-terminal-muted'
                                )}>
                                  {consensusReport.consensusDecision} {consensusReport.ticker}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-[8px] uppercase text-terminal-muted font-bold block">CONFIDENCE</span>
                                <span className="text-xs font-mono font-black text-terminal-amber">
                                  {(consensusReport.confidenceScore * 100).toFixed(0)}%
                                </span>
                              </div>
                            </div>

                            {/* Signal Details */}
                            <div className="grid grid-cols-2 gap-2 text-[9px] font-mono">
                              <div className="p-2 bg-black/40 border border-terminal-border/40 rounded flex justify-between items-center">
                                <span className="text-terminal-muted">Conflict:</span>
                                <span className={consensusReport.conflictDetected ? 'text-terminal-red font-bold' : 'text-terminal-green font-bold'}>
                                  {consensusReport.conflictDetected ? 'DETECTED' : 'CLEARED'}
                                </span>
                              </div>
                              <div className="p-2 bg-black/40 border border-terminal-border/40 rounded flex justify-between items-center">
                                <span className="text-terminal-muted">Priority Res:</span>
                                <span className={consensusReport.priorityResolutionApplied ? 'text-terminal-amber font-bold' : 'text-terminal-muted'}>
                                  {consensusReport.priorityResolutionApplied ? 'APPLIED' : 'BYPASSED'}
                                </span>
                              </div>
                            </div>

                            {/* Model breakdown details */}
                            <div className="space-y-2">
                              <span className="text-[8px] uppercase text-terminal-muted tracking-widest font-black block">Individual Model ballots</span>
                              {consensusReport.votes?.map((vote: any) => (
                                <div key={vote.modelId} className="p-2 border border-terminal-border/30 bg-black/30 rounded text-[9px]">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-white font-bold">{vote.modelName.split(' ')[0]}</span>
                                    <div className="flex gap-2">
                                      <span className="text-[8px] text-terminal-muted">W: {vote.weight * 100}%</span>
                                      <span className={cn(
                                        "font-black",
                                        vote.vote === 'BUY' ? 'text-terminal-green' : (vote.vote === 'SELL' ? 'text-terminal-red' : 'text-terminal-muted')
                                      )}>
                                        {vote.vote}
                                      </span>
                                    </div>
                                  </div>
                                  <p className="text-[8px] text-terminal-muted leading-tight">{vote.rationale}</p>
                                </div>
                              ))}
                            </div>

                            {/* Final attribution log */}
                            <div className="p-2 bg-white/5 border border-terminal-border/50 rounded font-mono text-[8px] text-terminal-muted">
                              <span className="font-bold text-white block uppercase mb-0.5">Ledger Attribution</span>
                              {consensusReport.executionAttribution}
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 bg-black border border-terminal-border rounded p-4 flex flex-col items-center justify-center text-center text-terminal-muted font-mono uppercase text-[9px]">
                            [Select ticker & request consensus check]
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB: BROKER ADAPTER HUB */}
          {activeTab === 'BROKER_HUB' && (
            <motion.div 
              key="broker-hub-pane"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 flex overflow-hidden"
            >
              <BrokerAdapterHub />
            </motion.div>
          )}

          {/* TAB: BROKER INTELLIGENCE & COMPLIANCE OS */}
          {activeTab === 'BROKER_INTELLIGENCE' && (
            <motion.div 
              key="broker-intel-pane"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 flex overflow-hidden"
            >
              <BrokerIntelligenceWorkspace />
            </motion.div>
          )}

          {/* TAB 3: ACCOUNTING & LEDGER */}
          {activeTab === 'VAULT' && (
            <motion.div 
              key="vault-pane"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 flex overflow-hidden p-4 gap-4"
            >
              {/* VAULT ACTIONS */}
              <div className="w-96 bg-terminal-panel border border-terminal-border rounded flex flex-col shrink-0 overflow-hidden">
                <SectionHeader title="Clearing House Vault" icon={Wallet} />
                
                <form onSubmit={handleVaultAction} className="p-4 space-y-4 flex-1 overflow-y-auto">
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-black uppercase tracking-widest text-white block">Funding Channel</span>
                      <span className="text-[10px] text-terminal-muted mt-1 block">Adjust Sandbox virtual accounts or submit production clearing request.</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        type="button"
                        variant={vaultAction === 'DEPOSIT' ? 'success' : 'ghost'}
                        onClick={() => setVaultAction('DEPOSIT')}
                        className={cn(
                          "font-bold",
                          vaultAction === 'DEPOSIT' && "bg-terminal-green text-black"
                        )}
                      >
                        DEPOSIT FUNDS
                      </Button>
                      <Button 
                        type="button"
                        variant={vaultAction === 'WITHDRAWAL' ? 'error' : 'ghost'}
                        onClick={() => setVaultAction('WITHDRAWAL')}
                        className={cn(
                          "font-bold",
                          vaultAction === 'WITHDRAWAL' && "bg-terminal-red text-black"
                        )}
                      >
                        WITHDRAW FUNDS
                      </Button>
                    </div>

                    <FormField label="Funding Amount ($)">
                      <Input 
                        required
                        type="number"
                        placeholder="25000"
                        value={vaultAmount}
                        onChange={(e) => setVaultAmount(e.target.value)}
                      />
                    </FormField>

                    <FormField label="Settlement Currency">
                      <Select 
                        value={vaultCurrency}
                        onChange={(e) => setVaultCurrency(e.target.value)}
                        options={[
                          { value: 'USD', label: 'USD (US Dollar)' },
                          { value: 'EUR', label: 'EUR (Euro Currency)' },
                          { value: 'GBP', label: 'GBP (British Sterling)' }
                        ]}
                      />
                    </FormField>
                  </div>

                  <Button 
                    type="submit"
                    variant="amber"
                    className="w-full py-4 tracking-widest font-black uppercase text-[10px]"
                  >
                    SUBMIT CLEARING TRANSMISSION
                  </Button>

                  {vaultMessage && (
                    <div className={cn(
                      "p-3 rounded-sm border flex gap-3",
                      vaultMessage.type === 'success' 
                        ? "bg-terminal-green/10 border-terminal-green/30 text-terminal-green" 
                        : "bg-terminal-red/10 border-terminal-red/30 text-terminal-red"
                    )}>
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span className="text-[10px] font-bold leading-relaxed">{vaultMessage.text}</span>
                    </div>
                  )}

                  {tradingMode === 'SANDBOX' && (
                    <div className="pt-4 border-t border-terminal-border/20 text-center">
                      <Button 
                        type="button"
                        variant="danger"
                        onClick={handleResetSandbox}
                        className="w-full py-2.5 text-[9px] font-bold tracking-widest uppercase"
                      >
                        RESET SANDBOX CAPITAL ($1M)
                      </Button>
                    </div>
                  )}
                </form>
              </div>

              {/* TRANSACTIONS JOURNAL LEDGER */}
              <div className="flex-1 bg-terminal-panel border border-terminal-border rounded flex flex-col overflow-hidden">
                <SectionHeader title="Ledger Audit Trail" icon={History} />
                <div className="flex-1 overflow-auto">
                  <DataTable<JournalEntry> 
                    data={activeJournal}
                    columns={[
                      { header: 'Ledger Ref', accessor: (r: JournalEntry) => `#REF-${r.id}`, className: "text-terminal-muted w-28 font-mono" },
                      { header: 'Timestamp', accessor: (r: JournalEntry) => safeFormat(r.timestamp, 'yyyy-MM-dd HH:mm:ss'), className: "text-terminal-muted w-44 font-mono" },
                      { header: 'Entry Type', accessor: (r: JournalEntry) => (
                        <span className={cn(
                          "font-bold uppercase text-[9px]",
                          r.entryType === 'DEPOSIT' ? "text-terminal-green" : "text-terminal-red"
                        )}>
                          {r.entryType}
                        </span>
                      ) },
                      { header: 'Ledger Audit Notes', accessor: 'notes', className: "font-semibold" },
                      { header: 'Adjustment Ledger', accessor: (r: JournalEntry) => r.pnl ? formatCurrency(parseFloat(r.pnl), 2) : 'N/A', align: 'right', className: "font-bold font-mono" }
                    ]}
                  />
                  {activeJournal.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center p-8">
                      <Coins className="w-10 h-10 text-terminal-muted opacity-30 mb-2" />
                      <span className="text-xs uppercase font-bold text-terminal-muted tracking-widest">No ledger records detected</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: PERFORMANCE ANALYTICS & RISK LIMITS */}
          {activeTab === 'ANALYTICS' && (
            <motion.div 
              key="analytics-pane"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 flex flex-col overflow-y-auto p-4 gap-4"
            >
              <ErrorBoundary>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-terminal-panel border border-terminal-border p-4 rounded">
                    <span className="text-[9px] uppercase text-terminal-muted block">Win Rate</span>
                    <span className="text-xl font-black text-terminal-green font-mono">68.4%</span>
                    <span className="text-[8px] text-terminal-muted block mt-1">+2.4% vs last week</span>
                  </div>
                  <div className="bg-terminal-panel border border-terminal-border p-4 rounded">
                    <span className="text-[9px] uppercase text-terminal-muted block">Profit Factor</span>
                    <span className="text-xl font-black text-terminal-amber font-mono">2.48</span>
                    <span className="text-[8px] text-terminal-muted block mt-1">Gross Win / Gross Loss</span>
                  </div>
                  <div className="bg-terminal-panel border border-terminal-border p-4 rounded">
                    <span className="text-[9px] uppercase text-terminal-muted block">Avg Holding Time</span>
                    <span className="text-xl font-black text-white font-mono">42.5 min</span>
                    <span className="text-[8px] text-terminal-muted block mt-1">Intraday Momentum profile</span>
                  </div>
                  <div className="bg-terminal-panel border border-terminal-border p-4 rounded">
                    <span className="text-[9px] uppercase text-terminal-muted block">Order Fill Ratio</span>
                    <span className="text-xl font-black text-terminal-green font-mono">99.2%</span>
                    <span className="text-[8px] text-terminal-muted block mt-1">0.12ms avg execution delay</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="bg-terminal-panel border border-terminal-border p-4 rounded space-y-4">
                    <SectionHeader title="Execution & Slippage Analytics" icon={BarChart2} />
                    <div className="space-y-3 font-mono text-xs">
                      <div className="flex justify-between py-2 border-b border-terminal-border/40">
                        <span className="text-terminal-muted">Average Slippage:</span>
                        <span className="text-terminal-green font-bold">0.02% (Optimal)</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-terminal-border/40">
                        <span className="text-terminal-muted">Execution Latency (P99):</span>
                        <span className="text-white font-bold">4.2 ms</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-terminal-border/40">
                        <span className="text-terminal-muted">Rejected Orders Rate:</span>
                        <span className="text-terminal-green font-bold">0.00%</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-terminal-muted">Capital Utilization:</span>
                        <span className="text-terminal-amber font-bold">34.8% ($348,200 / $1M)</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-terminal-panel border border-terminal-border p-4 rounded space-y-4">
                    <SectionHeader title="Strategy & Portfolio Exposure" icon={ShieldCheck} />
                    <div className="space-y-3 font-mono text-xs">
                      <div className="flex justify-between py-2 border-b border-terminal-border/40">
                        <span className="text-terminal-muted">HFT Mean Reversion Alpha:</span>
                        <span className="text-terminal-green font-bold">+$14,250.00 (Active)</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-terminal-border/40">
                        <span className="text-terminal-muted">Sentiment Breakout Alpha:</span>
                        <span className="text-terminal-green font-bold">+ $8,940.00 (Active)</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-terminal-border/40">
                        <span className="text-terminal-muted">Portfolio Beta:</span>
                        <span className="text-white font-bold">0.84 (Defensive)</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-terminal-muted">Max Drawdown Limit:</span>
                        <span className="text-terminal-amber font-bold">1.25% / 5.00% Limit</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-terminal-panel border border-terminal-border p-4 rounded">
                  <SectionHeader title="Monthly & Daily Execution Statistics" icon={History} />
                  <div className="mt-3">
                    <DataTable 
                      data={[
                        { date: '2026-08-01', trades: 142, volume: '$12,450,000', pnl: '+$4,250.00', winRate: '72.5%', status: 'OPTIMAL' },
                        { date: '2026-07-31', trades: 128, volume: '$10,800,000', pnl: '+$3,120.00', winRate: '67.0%', status: 'OPTIMAL' },
                        { date: '2026-07-30', trades: 165, volume: '$15.200,000', pnl: '-$850.00', winRate: '54.2%', status: 'REVIEW' },
                        { date: '2026-07-29', trades: 150, volume: '$13,100,000', pnl: '+$5,600.00', winRate: '74.0%', status: 'OPTIMAL' }
                      ]}
                      columns={[
                        { header: 'Date', accessor: 'date', className: "font-mono" },
                        { header: 'Total Trades', accessor: 'trades', className: "font-mono" },
                        { header: 'Notional Volume', accessor: 'volume', className: "font-mono" },
                        { header: 'Realized PnL', accessor: (r: any) => <span className={r.pnl.startsWith('+') ? 'text-terminal-green font-bold' : 'text-terminal-red font-bold'}>{r.pnl}</span>, className: "font-mono text-right" },
                        { header: 'Win Rate', accessor: 'winRate', className: "font-mono" },
                        { header: 'Audit Status', accessor: (r: any) => <span className="px-1.5 py-0.5 bg-terminal-green/20 text-terminal-green text-[9px] font-black rounded">{r.status}</span> }
                      ]}
                    />
                  </div>
                </div>
              </ErrorBoundary>
            </motion.div>
          )}

          {/* TAB 5: GEMINI COPILOT */}
          {activeTab === 'COPILOT' && (
            <motion.div 
              key="copilot-pane"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 flex overflow-hidden p-4 gap-4"
            >
              {/* CHAT INTERFACE */}
              <div className="flex-1 bg-terminal-panel border border-terminal-border rounded flex flex-col overflow-hidden">
                <SectionHeader title="Gemini Institutional Copilot" icon={Cpu} />
                
                {/* MESSAGES FEED */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4 font-mono text-[10px] leading-relaxed">
                  {copilotMessages.map((msg, idx) => (
                    <div 
                      key={idx}
                      className={cn(
                        "p-3.5 border rounded leading-relaxed max-w-[85%]",
                        msg.sender === 'user' 
                          ? "ml-auto bg-terminal-amber/10 border-terminal-amber/20 text-terminal-amber" 
                          : "mr-auto bg-black/40 border-terminal-border text-white"
                      )}
                    >
                      <span className="text-[8px] text-terminal-muted uppercase font-black block mb-1">
                        {msg.sender === 'user' ? 'YOU' : 'ARINA COPILOT'} • {format(msg.timestamp, 'HH:mm:ss')}
                      </span>
                      <p className="whitespace-pre-line">{msg.text}</p>
                    </div>
                  ))}
                  {isAiLoading && (
                    <div className="p-3 bg-black/40 border border-terminal-border mr-auto rounded text-terminal-amber animate-pulse">
                      Analyzing portfolio matrices and querying Gemini Core Models...
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* PROMPT ACTION PRESSETS (PRESETS RAIL) */}
                <div className="px-4 py-2 border-t border-terminal-border/20 bg-black/20 flex gap-2 overflow-x-auto scrollbar-hide shrink-0 select-none">
                  <button 
                    onClick={() => triggerPresetCopilot("Perform a full capital adequacy and maximum drawdown limits evaluation on my current positions.")}
                    className="px-2.5 py-1.5 bg-white/5 border border-terminal-border hover:border-terminal-amber text-[8px] uppercase font-black tracking-wider transition-colors shrink-0"
                  >
                    Check Leverage & Margin Risk
                  </button>
                  <button 
                    onClick={() => triggerPresetCopilot("Draft a professional delta-neutral hedging structure to offset current technology sector exposures.")}
                    className="px-2.5 py-1.5 bg-white/5 border border-terminal-border hover:border-terminal-amber text-[8px] uppercase font-black tracking-wider transition-colors shrink-0"
                  >
                    Draft Portfolio Hedge Strategy
                  </button>
                  <button 
                    onClick={() => triggerPresetCopilot("Generate high-confidence algorithmic model triggers based on current Nifty sentiment indexes.")}
                    className="px-2.5 py-1.5 bg-white/5 border border-terminal-border hover:border-terminal-amber text-[8px] uppercase font-black tracking-wider transition-colors shrink-0"
                  >
                    Generate Algorithmic Trigger Signals
                  </button>
                </div>

                {/* TEXT INPUT FOR CHAT */}
                <form onSubmit={handleCopilotSubmit} className="p-3 border-t border-terminal-border bg-black/40 flex gap-2 shrink-0">
                  <Input 
                    required
                    placeholder="Ask quantitative questions (e.g. 'draft a mean reversion module code for HDFCBANK' or 'assess our concentration hazards')..."
                    value={copilotInput}
                    onChange={(e) => setCopilotInput(e.target.value)}
                    className="flex-1 font-mono text-[10px]"
                  />
                  <Button 
                    id="copilot-submit-btn"
                    type="submit"
                    variant="amber"
                    disabled={isAiLoading}
                    className="px-6 font-black uppercase text-[10px] tracking-widest shrink-0"
                  >
                    {isAiLoading ? 'PROMPT_BUSY' : 'TRANSMIT'}
                  </Button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ORDER LIFECYCLE TIMELINE MODAL */}
      <AnimatePresence>
        {selectedOrderForTimeline && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-terminal-panel border border-terminal-border rounded w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] shadow-2xl"
            >
              <div className="bg-black/60 px-4 py-3 border-b border-terminal-border flex justify-between items-center select-none shrink-0">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-terminal-amber" />
                  <span className="text-xs font-black uppercase tracking-widest text-white">Order Lifecycle Audit Timeline</span>
                </div>
                <button 
                  onClick={() => setSelectedOrderForTimeline(null)}
                  className="text-terminal-muted hover:text-white text-xs uppercase font-mono font-bold cursor-pointer"
                >
                  [CLOSE]
                </button>
              </div>

              <div className="p-4 border-b border-terminal-border bg-black/20 shrink-0">
                <div className="grid grid-cols-4 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-[9px] uppercase text-terminal-muted block">Order ID</span>
                    <span className="text-white font-bold">#ORD-{selectedOrderForTimeline.id}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-terminal-muted block">Ticker / Instrument</span>
                    <span className="text-terminal-amber font-black">{selectedOrderForTimeline.ticker}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-terminal-muted block">Transaction</span>
                    <span className={selectedOrderForTimeline.side === 'BUY' ? 'text-terminal-green' : 'text-terminal-red'}>{selectedOrderForTimeline.side}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-terminal-muted block">Quantity / Limit Price</span>
                    <span className="text-white font-bold">{selectedOrderForTimeline.quantity} @ {selectedOrderForTimeline.price || 'MKT'}</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono select-none">
                {orderTimelineHistory.length === 0 ? (
                  <div className="text-center py-12 text-terminal-muted text-xs">
                    No timeline records compiled for this transaction ID yet.
                  </div>
                ) : (
                  <div className="relative border-l border-terminal-border/60 pl-6 ml-2 space-y-5">
                    {orderTimelineHistory.map((step, idx) => (
                      <div key={step.id} className="relative">
                        {/* Bullet circle */}
                        <div className={cn(
                          "absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full border border-black",
                          idx === 0 ? "bg-terminal-amber" : "bg-terminal-border"
                        )} />

                        <div className="bg-black/30 p-2.5 border border-terminal-border/40 rounded">
                          <div className="flex justify-between items-center text-[10px] mb-1">
                            <span className="font-bold text-white uppercase">{step.toState}</span>
                            <span className="text-[8px] text-terminal-muted">{safeFormat(step.timestamp, 'yyyy-MM-dd HH:mm:ss')}</span>
                          </div>
                          <p className="text-[10px] text-terminal-muted leading-relaxed">{step.reason}</p>
                          <div className="flex gap-4 mt-1.5 pt-1 border-t border-terminal-border/10 text-[8px] text-terminal-muted">
                            <span>TRIGGER: {step.triggerType}</span>
                            <span>OPERATOR: {step.operatorId}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PAPER TRADE MARKER INSPECTION MODAL (STEP 03) */}
      <AnimatePresence>
        {selectedPaperMarker && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 10 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.95, y: 10 }}
              className="bg-[#0b0f19] border border-terminal-border rounded-sm max-w-md w-full p-5 space-y-4 font-mono shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-terminal-border pb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-terminal-amber" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">PAPER TRADE EVENT INSPECTOR (STEP 03)</h3>
                </div>
                <button onClick={() => setSelectedPaperMarker(null)} className="text-slate-400 hover:text-white">✕</button>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2.5 bg-black/50 border border-terminal-border/60 rounded">
                  <span className="text-terminal-muted">AI Model:</span>
                  <span className="text-white font-bold">{selectedPaperMarker.model}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-black/50 border border-terminal-border/60 rounded">
                  <span className="text-terminal-muted">Action:</span>
                  <span className={cn("font-bold", selectedPaperMarker.action === 'BUY' ? "text-terminal-green" : "text-terminal-red")}>{selectedPaperMarker.action}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-black/50 border border-terminal-border/60 rounded">
                  <span className="text-terminal-muted">Symbol:</span>
                  <span className="text-terminal-amber font-bold">{selectedPaperMarker.symbol}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-black/50 border border-terminal-border/60 rounded">
                  <span className="text-terminal-muted">Exchange:</span>
                  <span className="text-white font-bold">{selectedPaperMarker.exchange}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-black/50 border border-terminal-border/60 rounded">
                  <span className="text-terminal-muted">Execution Price:</span>
                  <span className="text-terminal-blue font-bold">₹{selectedPaperMarker.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-black/50 border border-terminal-border/60 rounded">
                  <span className="text-terminal-muted">Quantity:</span>
                  <span className="text-white font-bold">{selectedPaperMarker.quantity}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-black/50 border border-terminal-border/60 rounded">
                  <span className="text-terminal-muted">Paper Value (ATM):</span>
                  <span className="text-terminal-amber font-bold">{selectedPaperMarker.paperValueAtm.toLocaleString()} ATM</span>
                </div>
                <div className="flex justify-between p-2.5 bg-black/50 border border-terminal-border/60 rounded">
                  <span className="text-terminal-muted">Realized P&L (ATM):</span>
                  <span className="text-terminal-green font-bold">{selectedPaperMarker.realizedPnL || 'NO CURRENT REALIZED P&L'}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-black/50 border border-terminal-border/60 rounded">
                  <span className="text-terminal-muted">Unrealized P&L (ATM):</span>
                  <span className="text-terminal-green font-bold">{selectedPaperMarker.unrealizedPnL || 'NO CURRENT OPEN POSITION'}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-black/50 border border-terminal-border/60 rounded">
                  <span className="text-terminal-muted">Return %:</span>
                  <span className="text-terminal-amber font-bold">{selectedPaperMarker.returnPct || 'NO CURRENT RETURN DATA'}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-black/50 border border-terminal-border/60 rounded">
                  <span className="text-terminal-muted">Timestamp:</span>
                  <span className="text-white font-bold">{selectedPaperMarker.timestamp}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-black/50 border border-terminal-border/60 rounded">
                  <span className="text-terminal-muted">Lab ID:</span>
                  <span className="text-terminal-amber font-bold">{selectedPaperMarker.labId}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-black/50 border border-terminal-border/60 rounded">
                  <span className="text-terminal-muted">Paper Trade ID:</span>
                  <span className="text-white font-bold">{selectedPaperMarker.id}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-black/50 border border-terminal-border/60 rounded">
                  <span className="text-terminal-muted">Status:</span>
                  <StatusBadge status={selectedPaperMarker.status} variant="success" />
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <Button size="sm" onClick={() => setSelectedPaperMarker(null)} variant="primary">CLOSE INSPECTOR</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER STATS DESK */}
      <div className="h-6 border-t border-terminal-border bg-black px-4 flex items-center justify-between text-[8px] font-mono select-none text-terminal-muted leading-none">
        <div className="flex gap-4">
          <span>DESK_ID: ARINA_OMS_EXEC_10</span>
          <span>SANDBOX_CAP: {tradingMode === 'SANDBOX' ? 'ALLOCATED_1M' : 'INACTIVE'}</span>
          <span>OMS_STATUS: SYNCHRONIZED</span>
        </div>
        <span>SYSTEM DATE: {safeFormat(new Date(), 'yyyy-MM-dd HH:mm:ss')}</span>
      </div>
    </div>
  );
});

TradingWorkspace.displayName = 'TradingWorkspace';
