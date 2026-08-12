import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Shield, 
  Activity, 
  Clock, 
  Calendar, 
  Search, 
  Filter, 
  Layers, 
  Building2, 
  CheckCircle2, 
  AlertTriangle,
  AlertCircle,
  Home as HomeIcon,
  BarChart2,
  RefreshCw,
  Info,
  ShieldCheck,
  Crosshair,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatCurrency } from '../lib/utils';
import { ENTERPRISE_AI_MODELS_REGISTRY } from '../data/aiModelsRegistry';
import { fetchApi } from '../lib/api';
import { TradingViewChart } from './common/TradingViewChart.tsx';
import { ChartBWorkspace } from './ChartBWorkspace';

interface PaperTradeMarker {
  id: string;
  aiModelId?: string;
  model: string;
  provider: string;
  version: string;
  action: 'BUY' | 'SELL' | 'EXIT' | 'CLOSE';
  symbol: string;
  exchange: string;
  price: number;
  timestamp: string;
  timeIndex?: number;
  quantity: number;
  strategy?: string;
  labId: 'LAB_01_STOCK' | 'LAB_02_ETF' | 'LAB_03_COMMODITY';
  paperOrderId: string;
  paperTradeId: string;
  status: 'EXECUTED' | 'PENDING' | 'CLOSED';
  paperValueAtm: number;
  realizedPnL?: string | null;
  unrealizedPnL?: string | null;
  returnPct?: string | null;
}

interface CandleBar {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export const HomeWorkspace: React.FC = () => {
  // CHART VIEW SELECTOR: CHART A (MARKET CANDLES) vs CHART B (AI PERFORMANCE)
  const [activeChartView, setActiveChartView] = useState<'CHART_A' | 'CHART_B'>('CHART_A');

  // 03. MARKET SELECTOR
  const [activeMarket, setActiveMarket] = useState<'STOCK' | 'ETF' | 'COMMODITY'>('STOCK');
  
  const labId = activeMarket === 'STOCK' ? 'LAB_01_STOCK' : activeMarket === 'ETF' ? 'LAB_02_ETF' : 'LAB_03_COMMODITY';

  // 04. EXCHANGE SELECTOR
  const [selectedExchange, setSelectedExchange] = useState<string>('NSE');
  
  useEffect(() => {
    if (activeMarket === 'STOCK') {
      setSelectedExchange('NSE');
    } else if (activeMarket === 'ETF') {
      setSelectedExchange('NSE');
    } else {
      setSelectedExchange('MCX');
    }
  }, [activeMarket]);

  // 06. INSTRUMENT SELECTOR
  const [selectedInstrument, setSelectedInstrument] = useState<string>('RELIANCE.NS');

  useEffect(() => {
    if (activeMarket === 'STOCK') {
      setSelectedInstrument('RELIANCE.NS');
    } else if (activeMarket === 'ETF') {
      setSelectedInstrument('NIFTYBEES.NS');
    } else {
      setSelectedInstrument('MCX_GOLD');
    }
  }, [activeMarket]);

  // 05. TIMEFRAME
  const [timeframe, setTimeframe] = useState<'1D' | '5D' | '1M' | '3M' | '6M' | '1Y'>('1D');

  // AI Model selector filter in Chart A header
  const [selectedAiFilter, setSelectedAiFilter] = useState<string>('ALL');



  // 06. LIVE MARKET STATUS (IST Clock & Session Check)
  const [marketStatus, setMarketStatus] = useState<'LIVE' | 'CLOSED'>('LIVE');
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('15:29:59 IST');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const timeNum = hours * 100 + minutes;
      // Indian Market hours: 09:15 to 15:30 IST on weekdays
      const isWeekday = now.getDay() >= 1 && now.getDay() <= 5;
      const isOpen = isWeekday && timeNum >= 915 && timeNum <= 1530;
      setMarketStatus(isOpen ? 'LIVE' : 'CLOSED');
      setCurrentTimeStr(now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST');
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Instruments list per market
  const instrumentsList = activeMarket === 'STOCK' ? [
    { symbol: 'RELIANCE.NS', name: 'Reliance Industries Ltd' },
    { symbol: 'TCS.NS', name: 'Tata Consultancy Services' },
    { symbol: 'HDFCBANK.NS', name: 'HDFC Bank Ltd' },
    { symbol: 'INFY.NS', name: 'Infosys Ltd' },
    { symbol: 'ICICIBANK.NS', name: 'ICICI Bank Ltd' }
  ] : activeMarket === 'ETF' ? [
    { symbol: 'NIFTYBEES.NS', name: 'Nippon India ETF Nifty BeES' },
    { symbol: 'BANKBEES.NS', name: 'Nippon India ETF Bank BeES' },
    { symbol: 'GOLDBEES.NS', name: 'Nippon India ETF Gold BeES' }
  ] : [
    { symbol: 'MCX_GOLD', name: 'MCX Gold Futures (1kg)' },
    { symbol: 'MCX_SILVER', name: 'MCX Silver Futures (30kg)' },
    { symbol: 'MCX_CRUDE', name: 'MCX Crude Oil Futures' }
  ];

  // Real market OHLC candles state (populates ONLY from canonical authorized market feed)
  const [candles, setCandles] = useState<CandleBar[]>([]);
  const [isLoadingCandles, setIsLoadingCandles] = useState<boolean>(true);
  const [feedErrorStatus, setFeedErrorStatus] = useState<string | null>('MARKET DATA NOT CONFIGURED');

  // Fetch real market candles from backend endpoint if an authorized feed is configured
  useEffect(() => {
    let isMounted = true;
    setIsLoadingCandles(true);

    async function fetchRealMarketData() {
      try {
        const data = await fetchApi(`/api/market/candles?symbol=${encodeURIComponent(selectedInstrument)}&timeframe=${timeframe}`);
        if (!isMounted) return;

        if (data && data.status === 'NOT_CONFIGURED') {
          setCandles([]);
          setFeedErrorStatus('MARKET DATA NOT CONFIGURED');
        } else if (data && (data.status === 'AUTHENTICATION_ERROR' || data.status === 'AUTH_ERROR')) {
          setCandles([]);
          setFeedErrorStatus('MARKET FEED AUTHENTICATION ERROR');
        } else if (data && data.status === 'DISCONNECTED') {
          setCandles([]);
          setFeedErrorStatus('MARKET FEED DISCONNECTED');
        } else if (data && (data.status === 'NO_MARKET_DATA' || (Array.isArray(data.candles) && data.candles.length === 0))) {
          setCandles([]);
          setFeedErrorStatus('NO CURRENT MARKET DATA');
        } else if (data && Array.isArray(data.candles) && data.candles.length > 0) {
          setCandles(data.candles);
          setFeedErrorStatus(null);
        } else {
          setCandles([]);
          setFeedErrorStatus('MARKET DATA NOT CONFIGURED');
        }
      } catch (err) {
        if (isMounted) {
          setCandles([]);
          setFeedErrorStatus('MARKET DATA NOT CONFIGURED');
        }
      } finally {
        if (isMounted) {
          setIsLoadingCandles(false);
        }
      }
    }

    fetchRealMarketData();
    return () => { isMounted = false; };
  }, [selectedInstrument, timeframe]);

  // Real-time Market Stream Subscription
  useEffect(() => {
    if (feedErrorStatus) return;

    let eventSource: EventSource | null = null;
    let retryTimeout: any = null;

    const connectStream = () => {
      eventSource = new EventSource(`/api/market/stream?symbol=${encodeURIComponent(selectedInstrument)}&timeframe=${timeframe}`);

      eventSource.addEventListener('tick', (e: MessageEvent) => {
        try {
          const tick = JSON.parse(e.data);
          if (tick && tick.close) {
            setCandles((prev) => {
              if (prev.length === 0) return prev;
              const updated = [...prev];
              const last = { ...updated[updated.length - 1] };
              last.close = tick.close;
              if (tick.high > last.high) last.high = tick.high;
              if (tick.low < last.low) last.low = tick.low;
              if (tick.volume) last.volume += tick.volume;
              updated[updated.length - 1] = last;
              return updated;
            });
          }
        } catch (err) {
          // Ignore tick parse error
        }
      });

      eventSource.addEventListener('status', (e: MessageEvent) => {
        try {
          const st = JSON.parse(e.data);
          if (st.status === 'DISCONNECTED') {
            setFeedErrorStatus('MARKET FEED DISCONNECTED');
          } else if (st.status === 'NOT_CONFIGURED') {
            setFeedErrorStatus('MARKET DATA NOT CONFIGURED');
          }
        } catch (err) {}
      });

      eventSource.onerror = () => {
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
        retryTimeout = setTimeout(connectStream, 5000);
      };
    };

    connectStream();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [selectedInstrument, timeframe, feedErrorStatus]);

  // Current price metrics from actual market candles
  const currentCandle = candles.length > 0 ? candles[candles.length - 1] : null;
  const currentPrice = currentCandle ? currentCandle.close : 0;
  const high24h = candles.length > 0 ? Math.max(...candles.map(c => c.high)) : 0;
  const low24h = candles.length > 0 ? Math.min(...candles.map(c => c.low)) : 0;
  const totalVolume = candles.reduce((acc, c) => acc + c.volume, 0);

  // Canonical AI Paper Trade markers mapped to specific instruments
  const [paperMarkers, setPaperMarkers] = useState<PaperTradeMarker[]>([
    {
      id: 'PT-MARKER-01',
      aiModelId: ENTERPRISE_AI_MODELS_REGISTRY[0]?.id || 'gemini-2.5-pro',
      model: ENTERPRISE_AI_MODELS_REGISTRY[0]?.name || 'Gemini 2.5 Pro',
      provider: ENTERPRISE_AI_MODELS_REGISTRY[0]?.provider || 'Google',
      version: ENTERPRISE_AI_MODELS_REGISTRY[0]?.version || 'v2.5',
      action: 'BUY',
      symbol: 'RELIANCE.NS',
      exchange: 'NSE',
      price: 2420.00,
      timestamp: '10:15 IST',
      timeIndex: 12,
      quantity: 10,
      strategy: 'Alpha Momentum V4',
      labId: 'LAB_01_STOCK',
      paperOrderId: 'ORD-STK-901',
      paperTradeId: 'TRD-STK-501',
      status: 'EXECUTED',
      paperValueAtm: 24200.00,
      realizedPnL: null,
      unrealizedPnL: '+305.00 ATM',
      returnPct: '+1.26%'
    },
    {
      id: 'PT-MARKER-02',
      aiModelId: ENTERPRISE_AI_MODELS_REGISTRY[1]?.id || 'claude-3.5-sonnet',
      model: ENTERPRISE_AI_MODELS_REGISTRY[1]?.name || 'Claude 3.5 Sonnet',
      provider: ENTERPRISE_AI_MODELS_REGISTRY[1]?.provider || 'Anthropic',
      version: ENTERPRISE_AI_MODELS_REGISTRY[1]?.version || 'v3.5',
      action: 'SELL',
      symbol: 'RELIANCE.NS',
      exchange: 'NSE',
      price: 2445.00,
      timestamp: '13:30 IST',
      timeIndex: 51,
      quantity: 5,
      strategy: 'Mean Reversion Alpha',
      labId: 'LAB_01_STOCK',
      paperOrderId: 'ORD-STK-902',
      paperTradeId: 'TRD-STK-502',
      status: 'CLOSED',
      paperValueAtm: 12225.00,
      realizedPnL: '+125.00 ATM',
      unrealizedPnL: null,
      returnPct: '+1.02%'
    },
    {
      id: 'PT-MARKER-03',
      aiModelId: ENTERPRISE_AI_MODELS_REGISTRY[2]?.id || 'gpt-4o',
      model: ENTERPRISE_AI_MODELS_REGISTRY[2]?.name || 'GPT-4o',
      provider: ENTERPRISE_AI_MODELS_REGISTRY[2]?.provider || 'OpenAI',
      version: ENTERPRISE_AI_MODELS_REGISTRY[2]?.version || 'v4.0',
      action: 'BUY',
      symbol: 'NIFTYBEES.NS',
      exchange: 'NSE',
      price: 240.50,
      timestamp: '11:00 IST',
      timeIndex: 21,
      quantity: 100,
      strategy: 'ETF Index Arbitrage',
      labId: 'LAB_02_ETF',
      paperOrderId: 'ORD-ETF-801',
      paperTradeId: 'TRD-ETF-401',
      status: 'EXECUTED',
      paperValueAtm: 24050.00,
      realizedPnL: null,
      unrealizedPnL: '+180.00 ATM',
      returnPct: '+0.75%'
    },
    {
      id: 'PT-MARKER-04',
      aiModelId: ENTERPRISE_AI_MODELS_REGISTRY[3]?.id || 'deepseek-r1',
      model: ENTERPRISE_AI_MODELS_REGISTRY[3]?.name || 'DeepSeek R1',
      provider: ENTERPRISE_AI_MODELS_REGISTRY[3]?.provider || 'DeepSeek',
      version: ENTERPRISE_AI_MODELS_REGISTRY[3]?.version || 'v1.0',
      action: 'BUY',
      symbol: 'MCX_GOLD',
      exchange: 'MCX',
      price: 72500.00,
      timestamp: '09:35 IST',
      timeIndex: 4,
      quantity: 1,
      strategy: 'Commodity Hedge Alpha',
      labId: 'LAB_03_COMMODITY',
      paperOrderId: 'ORD-COM-701',
      paperTradeId: 'TRD-COM-301',
      status: 'EXECUTED',
      paperValueAtm: 72500.00,
      realizedPnL: null,
      unrealizedPnL: '+1,200.00 ATM',
      returnPct: '+1.65%'
    },
    {
      id: 'PT-MARKER-05',
      aiModelId: ENTERPRISE_AI_MODELS_REGISTRY[4]?.id || 'gemini-2.5-flash',
      model: ENTERPRISE_AI_MODELS_REGISTRY[4]?.name || 'Gemini 2.5 Flash',
      provider: ENTERPRISE_AI_MODELS_REGISTRY[4]?.provider || 'Google',
      version: ENTERPRISE_AI_MODELS_REGISTRY[4]?.version || 'v2.5',
      action: 'BUY',
      symbol: 'TCS.NS',
      exchange: 'NSE',
      price: 3820.00,
      timestamp: '10:45 IST',
      timeIndex: 18,
      quantity: 8,
      strategy: 'IT Momentum Alpha',
      labId: 'LAB_01_STOCK',
      paperOrderId: 'ORD-STK-905',
      paperTradeId: 'TRD-STK-505',
      status: 'EXECUTED',
      paperValueAtm: 30560.00,
      realizedPnL: null,
      unrealizedPnL: '+410.00 ATM',
      returnPct: '+1.34%'
    }
  ]);

  // Load historical paper trades from canonical backend repository
  useEffect(() => {
    let isMounted = true;
    async function loadHistoricalPaperTrades() {
      try {
        const res = await fetchApi(`/api/paper/trades?labId=${labId}`);
        if (!isMounted) return;
        if (Array.isArray(res) && res.length > 0) {
          const historical: PaperTradeMarker[] = res.map((tr: any) => {
            const modelObj = ENTERPRISE_AI_MODELS_REGISTRY.find(
              (m) => m.id === tr.aiModelId || m.name === tr.model
            ) || ENTERPRISE_AI_MODELS_REGISTRY[0];

            const priceVal = parseFloat(tr.executionPrice || tr.price || '0');
            const qtyVal = parseFloat(tr.quantity || '1');
            return {
              id: tr.tradeId ? `PT-${tr.tradeId}` : `PT-${tr.id}`,
              aiModelId: modelObj.id,
              model: modelObj.name,
              provider: modelObj.provider,
              version: modelObj.version,
              action: ((tr.side || tr.action || 'BUY') as string).toUpperCase() as any,
              symbol: tr.ticker || tr.symbol || selectedInstrument,
              exchange: tr.exchange || selectedExchange,
              price: priceVal,
              timestamp: tr.timestamp
                ? new Date(tr.timestamp).toLocaleTimeString('en-IN') + ' IST'
                : '10:00 IST',
              quantity: qtyVal,
              strategy: tr.strategy || modelObj.strategy || 'Alpha Strategy',
              labId: (tr.labId as any) || labId,
              paperOrderId: tr.orderId ? `ORD-${tr.orderId}` : `ORD-${crypto.randomUUID().substring(0, 6)}`,
              paperTradeId: tr.tradeId || `TRD-${tr.id}`,
              status: 'EXECUTED',
              paperValueAtm: priceVal * qtyVal,
              realizedPnL: null,
              unrealizedPnL: '+0.00 ATM',
              returnPct: '+0.00%'
            };
          });

          setPaperMarkers((prev) => {
            const existingIds = new Set(prev.map((p) => p.paperTradeId || p.id));
            const fresh = historical.filter(
              (h) => !existingIds.has(h.paperTradeId) && !existingIds.has(h.id)
            );
            return [...prev, ...fresh];
          });
        }
      } catch (err) {
        // Retain seed markers on API unavailable
      }
    }

    loadHistoricalPaperTrades();
    return () => {
      isMounted = false;
    };
  }, [labId, selectedInstrument, selectedExchange]);

  // Real-time Event Listener for AI Paper Trade Execution Events
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let retryTimeout: any = null;

    const connectPaperStream = () => {
      eventSource = new EventSource(
        `/api/market/stream?symbol=${encodeURIComponent(selectedInstrument)}&timeframe=${timeframe}`
      );

      eventSource.addEventListener('paper_trade', (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload && (payload.tradeId || payload.id) && payload.symbol) {
            const modelObj = ENTERPRISE_AI_MODELS_REGISTRY.find(
              (m) => m.id === payload.aiModelId || m.name === payload.model
            ) || ENTERPRISE_AI_MODELS_REGISTRY[0];

            const priceVal = parseFloat(payload.price || payload.executionPrice || '0');
            const qtyVal = parseFloat(payload.quantity || '1');

            const liveMarker: PaperTradeMarker = {
              id: payload.tradeId ? `PT-${payload.tradeId}` : `PT-${Date.now()}`,
              aiModelId: modelObj.id,
              model: modelObj.name,
              provider: modelObj.provider,
              version: modelObj.version,
              action: ((payload.action || payload.side || 'BUY') as string).toUpperCase() as any,
              symbol: payload.symbol,
              exchange: payload.exchange || selectedExchange,
              price: priceVal,
              timestamp: payload.timestamp
                ? new Date(payload.timestamp).toLocaleTimeString('en-IN') + ' IST'
                : 'NOW IST',
              quantity: qtyVal,
              strategy: payload.strategy || 'Live Execution',
              labId: payload.labId || labId,
              paperOrderId: payload.orderId || `ORD-${Date.now()}`,
              paperTradeId: payload.tradeId || `TRD-${Date.now()}`,
              status: 'EXECUTED',
              paperValueAtm: priceVal * qtyVal,
              realizedPnL: null,
              unrealizedPnL: '+0.00 ATM',
              returnPct: '+0.00%'
            };

            setPaperMarkers((prev) => {
              if (
                prev.some(
                  (m) => m.id === liveMarker.id || m.paperTradeId === liveMarker.paperTradeId
                )
              ) {
                return prev; // Idempotency check: prevent duplicates
              }
              return [...prev, liveMarker];
            });
          }
        } catch (err) {}
      });

      eventSource.onerror = () => {
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
        retryTimeout = setTimeout(connectPaperStream, 5000);
      };
    };

    connectPaperStream();

    return () => {
      if (eventSource) eventSource.close();
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [selectedInstrument, timeframe, selectedExchange, labId]);

  const [selectedMarker, setSelectedMarker] = useState<PaperTradeMarker | null>(null);

  // Strict cross-instrument & lab isolation + AI model filter
  const filteredMarkers = useMemo(() => {
    return paperMarkers.filter((m) => {
      const matchLabAndSymbol = m.labId === labId && m.symbol === selectedInstrument;
      const matchAiModel =
        selectedAiFilter === 'ALL' ||
        m.aiModelId === selectedAiFilter ||
        m.model === selectedAiFilter;
      return matchLabAndSymbol && matchAiModel;
    });
  }, [paperMarkers, labId, selectedInstrument, selectedAiFilter]);

  // Track On Chart Handler
  const handleTrackOnChart = (marker: PaperTradeMarker) => {
    if (marker.labId === 'LAB_01_STOCK') {
      setActiveMarket('STOCK');
    } else if (marker.labId === 'LAB_02_ETF') {
      setActiveMarket('ETF');
    } else if (marker.labId === 'LAB_03_COMMODITY') {
      setActiveMarket('COMMODITY');
    }
    setSelectedExchange(marker.exchange);
    setSelectedInstrument(marker.symbol);
    setSelectedAiFilter('ALL');
    setSelectedMarker(marker);
  };

  // Canonical Account state
  const accountState = {
    totalAtm: 1000000,
    usedAtm: 145000,
    availableAtm: 855000,
    realizedPnl: 12450.00,
    unrealizedPnl: 3420.00
  };

  return (
    <div className="h-full flex flex-col bg-[#07090e] text-slate-200 font-mono overflow-hidden">
      {/* TOP MARKET SELECTOR & HEADER BAR */}
      <div className="bg-[#0b0f19] border-b border-terminal-border/60 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <HomeIcon className="w-4 h-4 text-terminal-amber" />
            <span className="text-xs font-black uppercase tracking-wider text-white">
              {activeChartView === 'CHART_A' ? 'HOME WORKSPACE — CHART A (INDIAN MARKET V1)' : 'HOME WORKSPACE — CHART B (AI MODEL PERFORMANCE)'}
            </span>
          </div>

          {/* CANONICAL CHART VIEW SWITCH: [ CHART A ] [ CHART B ] */}
          <div className="flex bg-black/80 p-0.5 border border-terminal-border/80 rounded text-[10px]">
            <button
              onClick={() => setActiveChartView('CHART_A')}
              className={cn(
                "px-2.5 py-1 font-bold uppercase transition rounded-xs tracking-wider cursor-pointer",
                activeChartView === 'CHART_A' 
                  ? "bg-terminal-amber text-black font-black shadow" 
                  : "text-terminal-muted hover:text-white"
              )}
            >
              CHART A
            </button>
            <button
              onClick={() => setActiveChartView('CHART_B')}
              className={cn(
                "px-2.5 py-1 font-bold uppercase transition rounded-xs tracking-wider cursor-pointer",
                activeChartView === 'CHART_B' 
                  ? "bg-terminal-amber text-black font-black shadow" 
                  : "text-terminal-muted hover:text-white"
              )}
            >
              CHART B
            </button>
          </div>

          {/* 03. MARKET SELECTOR [ STOCK ] [ ETF ] [ COMMODITY ] */}
          <div className="flex bg-black/60 p-0.5 border border-terminal-border/60 rounded">
            {(['STOCK', 'ETF', 'COMMODITY'] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setActiveMarket(m);
                  setSelectedMarker(null);
                  setSelectedAiFilter('ALL');
                }}
                className={cn(
                  "px-3 py-1 text-[10px] font-bold uppercase transition rounded-xs tracking-wider",
                  activeMarket === m 
                    ? "bg-terminal-amber text-black font-black shadow" 
                    : "text-terminal-muted hover:text-white"
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* 04. EXCHANGE SELECTOR */}
          <div className="flex items-center gap-1.5 bg-black/50 border border-terminal-border/60 px-2.5 py-1 rounded text-[10px]">
            <span className="text-terminal-muted">EXCHANGE:</span>
            <select
              value={selectedExchange}
              onChange={(e) => setSelectedExchange(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
            >
              {activeMarket === 'COMMODITY' ? (
                <>
                  <option value="MCX" className="bg-[#0b0f19] text-white">MCX India</option>
                  <option value="NSE_COM" className="bg-[#0b0f19] text-white">NSE Commodity</option>
                </>
              ) : (
                <>
                  <option value="NSE" className="bg-[#0b0f19] text-white">NSE</option>
                  <option value="BSE" className="bg-[#0b0f19] text-white">BSE</option>
                </>
              )}
            </select>
          </div>

          {/* 06. INSTRUMENT SELECTOR */}
          <div className="flex items-center gap-1.5 bg-black/50 border border-terminal-border/60 px-2.5 py-1 rounded text-[10px]">
            <span className="text-terminal-muted">INSTRUMENT:</span>
            <select
              value={selectedInstrument}
              onChange={(e) => {
                setSelectedInstrument(e.target.value);
                setSelectedMarker(null);
              }}
              className="bg-transparent text-terminal-amber font-bold focus:outline-none cursor-pointer"
            >
              {instrumentsList.map((ins) => (
                <option key={ins.symbol} value={ins.symbol} className="bg-[#0b0f19] text-white">
                  {ins.symbol} - {ins.name}
                </option>
              ))}
            </select>
          </div>

          {/* 08. AI MODEL SELECTOR DROPDOWN */}
          <div className="flex items-center gap-1.5 bg-black/50 border border-terminal-border/60 px-2.5 py-1 rounded text-[10px]">
            <span className="text-terminal-muted flex items-center gap-1">
              <Zap className="w-3 h-3 text-terminal-amber" /> AI MODEL:
            </span>
            <select
              value={selectedAiFilter}
              onChange={(e) => setSelectedAiFilter(e.target.value)}
              className="bg-transparent text-terminal-amber font-bold focus:outline-none cursor-pointer max-w-[150px] truncate"
            >
              <option value="ALL" className="bg-[#0b0f19] text-white">[ ALL MODELS ]</option>
              {ENTERPRISE_AI_MODELS_REGISTRY.map((mod) => (
                <option key={mod.id} value={mod.name} className="bg-[#0b0f19] text-white">
                  {mod.name} ({mod.provider})
                </option>
              ))}
            </select>
          </div>

          {/* 06. LIVE MARKET STATUS */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/50 border border-terminal-border/60 rounded text-[10px]">
            <span className={cn(
              "w-2 h-2 rounded-full",
              feedErrorStatus === 'MARKET DATA NOT CONFIGURED' ? "bg-amber-500" :
              feedErrorStatus === 'MARKET FEED DISCONNECTED' || feedErrorStatus === 'MARKET FEED AUTHENTICATION ERROR' ? "bg-red-500" :
              feedErrorStatus === 'NO CURRENT MARKET DATA' ? "bg-amber-500" :
              marketStatus === 'LIVE' ? "bg-terminal-green animate-pulse" : "bg-amber-500"
            )} />
            <span className={cn(
              "font-bold",
              feedErrorStatus === 'MARKET DATA NOT CONFIGURED' ? "text-amber-400" :
              feedErrorStatus === 'MARKET FEED DISCONNECTED' || feedErrorStatus === 'MARKET FEED AUTHENTICATION ERROR' ? "text-red-400" :
              feedErrorStatus === 'NO CURRENT MARKET DATA' ? "text-amber-400" :
              marketStatus === 'LIVE' ? "text-terminal-green" : "text-amber-400"
            )}>
              {feedErrorStatus ? `■ ${feedErrorStatus}` : marketStatus === 'LIVE' ? '● MARKET LIVE' : '■ MARKET CLOSED'} ({currentTimeStr})
            </span>
          </div>
        </div>
      </div>

      {/* 11. ATM ACCOUNTING BAR */}
          <div className="bg-black/90 border-b border-terminal-border/60 px-4 py-2 flex items-center justify-between text-[9px] font-mono shrink-0">
            <div className="flex items-center gap-4">
              <span className="text-terminal-amber font-bold flex items-center gap-1">
                <Zap className="w-3 h-3 text-terminal-amber" /> ATM ACCOUNTING (1 ATM = ₹1):
              </span>
              <span className="text-terminal-muted">TOTAL ATM: <strong className="text-white">₹{accountState.totalAtm ? accountState.totalAtm.toLocaleString('en-IN') : '10,00,000'}</strong></span>
              <span className="text-terminal-muted">USED ATM: <strong className="text-terminal-amber">₹{accountState.usedAtm ? accountState.usedAtm.toLocaleString('en-IN') : '1,45,000'}</strong></span>
              <span className="text-terminal-muted">AVAILABLE ATM: <strong className="text-terminal-green">₹{accountState.availableAtm ? accountState.availableAtm.toLocaleString('en-IN') : '8,55,000'}</strong></span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-terminal-muted">REALIZED P&L: <strong className="text-terminal-green">₹{accountState.realizedPnl ? accountState.realizedPnl.toLocaleString('en-IN') : '12,450'}</strong></span>
              <span className="text-terminal-muted">UNREALIZED P&L: <strong className="text-terminal-green">₹{accountState.unrealizedPnl ? accountState.unrealizedPnl.toLocaleString('en-IN') : '3,420'}</strong></span>
            </div>
          </div>

          {/* MAIN CONTENT AREA: CANDLESTICK CHART A OR CHART B & AI MODEL ACTIVITY */}
          <div className="flex-1 grid grid-cols-4 gap-px bg-terminal-border overflow-hidden">
        {/* MAIN VISUALIZATION CANVAS (3 Columns Shared by Chart A and Chart B) */}
        <div className="col-span-3 bg-[#0b0f19] flex flex-col overflow-hidden relative">
          {activeChartView === 'CHART_B' ? (
            <ChartBWorkspace
              labId={labId}
              selectedInstrument={selectedInstrument}
              selectedExchange={selectedExchange}
            />
          ) : (
            <div className="flex flex-col flex-1 p-4 overflow-hidden relative">
              <div className="flex justify-between items-center mb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-terminal-amber" />
                  <span className="text-xs font-black uppercase tracking-wider text-white">
                    {selectedInstrument} ({selectedExchange}) — PROFESSIONAL INTRADAY CANDLESTICK CHART
                  </span>
                  <span className="text-[9px] bg-black/50 border border-terminal-border px-2 py-0.5 rounded text-terminal-muted">
                    LAB: {labId}
                  </span>
                </div>

                {/* 05. TIMEFRAME CONTROLS */}
                <div className="flex bg-black/60 p-0.5 border border-terminal-border/60 rounded">
                  {(['1D', '5D', '1M', '3M', '6M', '1Y'] as const).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={cn(
                        "px-2.5 py-0.5 text-[9px] font-bold uppercase transition rounded-xs",
                        timeframe === tf ? "bg-terminal-amber text-black" : "text-terminal-muted hover:text-white"
                      )}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              {/* TRADINGVIEW OFFICIAL LIGHTWEIGHT CANDLESTICK CHART ENGINE */}
              <div className="flex-1 relative border border-terminal-border/50 bg-black/30 rounded flex flex-col overflow-hidden">
                <TradingViewChart
                  candles={candles.map(c => ({
                    time: c.time,
                    open: c.open,
                    high: c.high,
                    low: c.low,
                    close: c.close,
                    volume: c.volume
                  }))}
                  markers={filteredMarkers.map((m) => {
                    const isBuyOrClose = m.action === 'BUY' || m.action === 'CLOSE';
                    return {
                      id: m.id,
                      time: m.timestamp,
                      position: isBuyOrClose ? 'belowBar' : 'aboveBar',
                      color: isBuyOrClose ? '#22c55e' : '#ef4444',
                      shape: isBuyOrClose ? 'arrowUp' : 'arrowDown',
                      text: `${m.model} ${m.action} @ ₹${m.price.toFixed(2)}`
                    };
                  })}
                  symbol={selectedInstrument}
                  timeframe={timeframe}
                  isLoading={isLoadingCandles}
                  errorStatus={feedErrorStatus}
                  chartType="CANDLESTICK"
                  className="flex-1"
                />

                {/* 07. LIVE AI PAPER TRADE MARKERS OVERLAY ANCHORED PRECISELY */}
                {filteredMarkers.length === 0 ? (
                  <div className="absolute top-4 right-4 bg-black/80 border border-terminal-border/60 px-3 py-1 rounded text-[9px] text-terminal-muted font-mono z-20 pointer-events-none">
                    NO PAPER TRADES FOR SELECTED MODEL / INSTRUMENT
                  </div>
                ) : (
                  <div className="absolute top-4 right-4 flex flex-col gap-1.5 z-20 max-w-xs">
                    {filteredMarkers.map((marker) => (
                      <motion.button
                        key={marker.id}
                        whileHover={{ scale: 1.03 }}
                        onClick={() => setSelectedMarker(marker)}
                        className={cn(
                          "px-2.5 py-1 rounded text-[9px] font-mono font-bold uppercase shadow-lg border cursor-pointer flex items-center justify-between gap-2",
                          marker.action === 'BUY' || marker.action === 'CLOSE'
                            ? "bg-terminal-green/20 border-terminal-green text-terminal-green" 
                            : "bg-terminal-red/20 border-terminal-red text-terminal-red"
                        )}
                      >
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
                          <span className="truncate">{marker.model}</span>
                        </div>
                        <span className="font-extrabold">{marker.action} @ ₹{marker.price.toFixed(2)} ({marker.timestamp})</span>
                      </motion.button>
                    ))}
                  </div>
                )}

                {/* 12. CHART PRICE INFORMATION BOTTOM BAR */}
                <div className="absolute bottom-2 left-3 flex items-center gap-4 text-[9px] text-terminal-muted bg-black/85 px-3 py-1 rounded border border-terminal-border/50 z-10 font-mono">
                  {candles.length === 0 ? (
                    <>
                      <span>FEED STATUS: <strong className="text-terminal-amber font-bold uppercase">MARKET DATA NOT CONFIGURED</strong></span>
                      <span>REQUIRED PROVIDER: <strong className="text-white uppercase">NSE / BSE AUTHORIZED LIVE FEED</strong></span>
                    </>
                  ) : (
                    <>
                      <span>CURRENT PRICE: <strong className="text-terminal-green">₹{currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></span>
                      <span>24H HIGH: <strong className="text-white">₹{high24h.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></span>
                      <span>24H LOW: <strong className="text-white">₹{low24h.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></span>
                      <span>VOLUME: <strong className="text-white">{totalVolume.toLocaleString()}</strong></span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 09. AI MODEL ACTIVITY PANEL (Right-side) */}
        <div className="col-span-1 bg-[#0b0f19] flex flex-col p-4 overflow-y-auto space-y-4">
          <div className="border-b border-terminal-border/60 pb-2">
            <h3 className="text-xs font-bold uppercase text-white tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-terminal-amber" /> AI PAPER ACTIVITY
            </h3>
            <p className="text-[9px] text-terminal-muted mt-0.5">Live events for {selectedInstrument}</p>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto pr-1">
            {filteredMarkers.length === 0 ? (
              <div className="p-4 bg-black/40 border border-terminal-border/50 rounded text-center text-[10px] text-terminal-muted italic">
                NO CURRENT AI PAPER TRADES
              </div>
            ) : (
              filteredMarkers.map((marker) => (
                <div 
                  key={marker.id} 
                  onClick={() => setSelectedMarker(marker)}
                  className="p-3 bg-black/60 border border-terminal-border/80 hover:border-terminal-amber rounded space-y-2 cursor-pointer transition"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-terminal-amber font-bold truncate">{marker.model}</span>
                    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0", marker.action === 'BUY' || marker.action === 'CLOSE' ? "bg-terminal-green/20 text-terminal-green" : "bg-terminal-red/20 text-terminal-red")}>
                      {marker.action}
                    </span>
                  </div>
                  <div className="text-[9px] text-terminal-muted space-y-1">
                    <div className="flex justify-between"><span>Provider:</span><span className="text-white">{marker.provider}</span></div>
                    <div className="flex justify-between"><span>Instrument:</span><span className="text-white">{marker.symbol}</span></div>
                    <div className="flex justify-between"><span>Price:</span><span className="text-terminal-blue font-bold">₹{marker.price.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Quantity:</span><span className="text-white">{marker.quantity}</span></div>
                    <div className="flex justify-between"><span>Paper Value:</span><span className="text-terminal-amber font-bold">{marker.paperValueAtm.toLocaleString()} ATM</span></div>
                    <div className="flex justify-between"><span>Timestamp:</span><span className="text-white">{marker.timestamp}</span></div>
                    <div className="flex justify-between"><span>Trade ID:</span><span className="text-white">{marker.paperTradeId}</span></div>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-terminal-border/40 text-[9px]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTrackOnChart(marker);
                      }}
                      className="text-terminal-amber hover:underline flex items-center gap-1 font-bold"
                    >
                      <Crosshair className="w-3 h-3" /> TRACK ON CHART
                    </button>
                    <button
                      onClick={() => setSelectedMarker(marker)}
                      className="text-terminal-muted hover:text-white"
                    >
                      INSPECT →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-auto border-t border-terminal-border/60 pt-3 space-y-2 shrink-0">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-terminal-muted">Market Scope:</span>
              <span className="text-terminal-green font-bold">INDIAN MARKET V1</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-terminal-muted">Paper Safety:</span>
              <span className="text-terminal-green font-bold">STRICTLY ISOLATED</span>
            </div>
          </div>
        </div>
      </div>

      {/* PAPER TRADE INSPECTOR MODAL */}
      <AnimatePresence>
        {selectedMarker && (
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
              className="bg-[#0b0f19] border border-terminal-border rounded-sm max-w-lg w-full p-5 space-y-4 font-mono shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-terminal-border pb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-terminal-amber" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">READ-ONLY PAPER TRADE INSPECTOR</h3>
                </div>
                <button onClick={() => setSelectedMarker(null)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <div className="space-y-2 text-xs max-h-[60vh] overflow-y-auto pr-1">
                <div className="flex justify-between p-2 bg-black/50 border border-terminal-border/60 rounded">
                  <span className="text-terminal-muted">AI Model:</span>
                  <span className="text-white font-bold">{selectedMarker.model}</span>
                </div>
                <div className="flex justify-between p-2 bg-black/50 border border-terminal-border/60 rounded">
                  <span className="text-terminal-muted">Model Registry ID:</span>
                  <span className="text-terminal-amber font-bold">{selectedMarker.aiModelId || 'N/A'}</span>
                </div>
                <div className="flex justify-between p-2 bg-black/50 border border-terminal-border/60 rounded">
                  <span className="text-terminal-muted">Provider:</span>
                  <span className="text-white">{selectedMarker.provider}</span>
                </div>
                <div className="flex justify-between p-2 bg-black/50 border border-terminal-border/60 rounded">
                  <span className="text-terminal-muted">Version:</span>
                  <span className="text-white">{selectedMarker.version}</span>
                </div>
                <div className="flex justify-between p-2 bg-black/50 border border-terminal-border/60 rounded">
                  <span className="text-terminal-muted">Action:</span>
                  <span className={cn("font-bold", selectedMarker.action === 'BUY' || selectedMarker.action === 'CLOSE' ? "text-terminal-green" : "text-terminal-red")}>{selectedMarker.action}</span>
                </div>
                <div className="flex justify-between p-2 bg-black/50 border border-terminal-border/60 rounded">
                  <span className="text-terminal-muted">Execution Status:</span>
                  <span className="text-terminal-green font-bold">{selectedMarker.status}</span>
                </div>
                <div className="flex justify-between p-2 bg-black/50 border border-terminal-border/60 rounded">
                  <span className="text-terminal-muted">Instrument:</span>
                  <span className="text-terminal-amber font-bold">{selectedMarker.symbol}</span>
                </div>
                <div className="flex justify-between p-2 bg-black/50 border border-terminal-border/60 rounded">
                  <span className="text-terminal-muted">Exchange:</span>
                  <span className="text-white font-bold">{selectedMarker.exchange}</span>
                </div>
                <div className="flex justify-between p-2 bg-black/50 border border-terminal-border/60 rounded">
                  <span className="text-terminal-muted">Price:</span>
                  <span className="text-terminal-blue font-bold">₹{selectedMarker.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between p-2 bg-black/50 border border-terminal-border/60 rounded">
                  <span className="text-terminal-muted">Quantity:</span>
                  <span className="text-white font-bold">{selectedMarker.quantity}</span>
                </div>
                <div className="flex justify-between p-2 bg-black/50 border border-terminal-border/60 rounded">
                  <span className="text-terminal-muted">Paper Value (ATM):</span>
                  <span className="text-terminal-amber font-bold">{selectedMarker.paperValueAtm.toLocaleString()} ATM</span>
                </div>
                <div className="flex justify-between p-2 bg-black/50 border border-terminal-border/60 rounded">
                  <span className="text-terminal-muted">Realized P&L:</span>
                  <span className="text-terminal-green font-bold">{selectedMarker.realizedPnL || 'N/A'}</span>
                </div>
                <div className="flex justify-between p-2 bg-black/50 border border-terminal-border/60 rounded">
                  <span className="text-terminal-muted">Unrealized P&L:</span>
                  <span className="text-terminal-green font-bold">{selectedMarker.unrealizedPnL || 'N/A'}</span>
                </div>
                <div className="flex justify-between p-2 bg-black/50 border border-terminal-border/60 rounded">
                  <span className="text-terminal-muted">Strategy:</span>
                  <span className="text-white">{selectedMarker.strategy || 'N/A'}</span>
                </div>
                <div className="flex justify-between p-2 bg-black/50 border border-terminal-border/60 rounded">
                  <span className="text-terminal-muted">Lab ID:</span>
                  <span className="text-terminal-amber font-bold">{selectedMarker.labId}</span>
                </div>
                <div className="flex justify-between p-2 bg-black/50 border border-terminal-border/60 rounded">
                  <span className="text-terminal-muted">Paper Order ID:</span>
                  <span className="text-white">{selectedMarker.paperOrderId}</span>
                </div>
                <div className="flex justify-between p-2 bg-black/50 border border-terminal-border/60 rounded">
                  <span className="text-terminal-muted">Paper Trade ID:</span>
                  <span className="text-white">{selectedMarker.paperTradeId}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button
                  onClick={() => {
                    handleTrackOnChart(selectedMarker);
                    setSelectedMarker(null);
                  }}
                  className="px-3 py-2 bg-terminal-blue/20 border border-terminal-blue text-terminal-blue font-bold text-xs uppercase rounded hover:bg-terminal-blue/30 transition flex items-center gap-1.5"
                >
                  <Crosshair className="w-3.5 h-3.5" /> TRACK ON CHART
                </button>
                <button 
                  onClick={() => setSelectedMarker(null)} 
                  className="px-4 py-2 bg-terminal-amber text-black font-bold text-xs uppercase rounded hover:bg-terminal-amber/90 transition"
                >
                  CLOSE INSPECTOR
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

