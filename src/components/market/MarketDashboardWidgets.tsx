import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart2, 
  PieChart, 
  Activity, 
  Flame, 
  Layers, 
  Zap, 
  Users, 
  Compass, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldAlert,
  Gauge
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface MarketDashboardWidgetsProps {
  onSelectInstrument?: (instrument: any) => void;
}

export const MarketDashboardWidgets: React.FC<MarketDashboardWidgetsProps> = ({ onSelectInstrument }) => {
  // Sample real data calculations based on market feeds
  const advances = 1380;
  const declines = 820;
  const unchanged = 110;
  const totalTraded = advances + declines + unchanged;
  const advPct = Math.round((advances / totalTraded) * 100);
  const decPct = Math.round((declines / totalTraded) * 100);

  // Top Gainers
  const topGainers = [
    { symbol: 'RELIANCE', price: 3120.50, change: 84.20, changePct: 2.77, exchange: 'NSE' },
    { symbol: 'TATAMOTORS', price: 1045.00, change: 26.50, changePct: 2.60, exchange: 'NSE' },
    { symbol: 'INFY', price: 1820.30, change: 41.10, changePct: 2.31, exchange: 'NSE' },
    { symbol: 'SBIN', price: 865.10, change: 18.20, changePct: 2.15, exchange: 'NSE' },
    { symbol: 'BAJFINANCE', price: 7240.00, change: 135.00, changePct: 1.90, exchange: 'NSE' },
  ];

  // Top Losers
  const topLosers = [
    { symbol: 'HDFCBANK', price: 1610.20, change: -28.40, changePct: -1.73, exchange: 'NSE' },
    { symbol: 'ASIANPAINT', price: 2910.00, change: -42.00, changePct: -1.42, exchange: 'NSE' },
    { symbol: 'TITAN', price: 3380.00, change: -41.50, changePct: -1.21, exchange: 'NSE' },
    { symbol: 'SUNPHARMA', price: 1715.00, change: -18.00, changePct: -1.04, exchange: 'NSE' },
    { symbol: 'ITC', price: 485.60, change: -4.20, changePct: -0.86, exchange: 'NSE' },
  ];

  // 52 Week High/Low
  const high52 = [
    { symbol: 'BHARTIARTL', price: 1540.20, high: 1545.00, changePct: 1.85 },
    { symbol: 'MAHINDCIE', price: 620.00, high: 622.50, changePct: 3.20 },
    { symbol: 'HAL', price: 5120.00, high: 5150.00, changePct: 2.95 },
  ];

  const low52 = [
    { symbol: 'PAYTM', price: 380.10, low: 375.00, changePct: -3.40 },
    { symbol: 'ZEEL', price: 128.50, low: 125.00, changePct: -2.10 },
  ];

  // OI & Volume Leaders
  const volumeLeaders = [
    { symbol: 'SBIN', volume: '24.5M', turnover: '₹2,118 Cr', changePct: 2.15 },
    { symbol: 'RELIANCE', volume: '18.2M', turnover: '₹5,679 Cr', changePct: 2.77 },
    { symbol: 'TCS', volume: '8.4M', turnover: '₹3,210 Cr', changePct: 1.45 },
  ];

  const oiLeaders = [
    { symbol: 'NIFTY 24000 CE', oi: '14.2M', oiChange: '+2.4M', type: 'LONG BUILDUP', isBullish: true },
    { symbol: 'BANKNIFTY 52000 PE', oi: '9.8M', oiChange: '+1.8M', type: 'SHORT COVERING', isBullish: true },
    { symbol: 'FINNIFTY 23000 CE', oi: '6.5M', oiChange: '-850K', type: 'LONG UNWINDING', isBullish: false },
  ];

  // Sector Heat Map
  const sectors = [
    { name: 'BANKING', changePct: 1.45, isPositive: true },
    { name: 'IT', changePct: 1.12, isPositive: true },
    { name: 'AUTO', changePct: 2.30, isPositive: true },
    { name: 'PHARMA', changePct: -0.85, isPositive: false },
    { name: 'ENERGY', changePct: 1.95, isPositive: true },
    { name: 'FMCG', changePct: -0.42, isPositive: false },
    { name: 'METAL', changePct: 2.80, isPositive: true },
    { name: 'PSU BANK', changePct: 3.10, isPositive: true },
    { name: 'REALTY', changePct: 0.95, isPositive: true },
    { name: 'TELECOM', changePct: 1.60, isPositive: true },
    { name: 'CHEMICAL', changePct: -0.20, isPositive: false },
    { name: 'TEXTILE', changePct: 0.45, isPositive: true },
  ];

  return (
    <div className="space-y-4 font-mono text-xs">
      
      {/* TOP METRICS STRIP: PCR, INDIA VIX, MMI, FII/DII */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        
        {/* Put Call Ratio */}
        <div className="bg-[#0c1221] p-3 rounded border border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">PUT-CALL RATIO (PCR)</span>
            <span className="text-xl font-black text-terminal-green font-mono">1.18</span>
            <span className="text-[9px] text-terminal-green block">BULLISH SENTIMENT</span>
          </div>
          <div className="p-2 bg-terminal-green/10 rounded border border-terminal-green/30">
            <PieChart className="w-5 h-5 text-terminal-green" />
          </div>
        </div>

        {/* India VIX */}
        <div className="bg-[#0c1221] p-3 rounded border border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">INDIA VIX (VOLATILITY)</span>
            <span className="text-xl font-black text-white font-mono">13.42</span>
            <span className="text-[9px] text-terminal-green block">-1.25% (LOW RISK)</span>
          </div>
          <div className="p-2 bg-terminal-blue/10 rounded border border-terminal-blue/30">
            <Activity className="w-5 h-5 text-terminal-blue" />
          </div>
        </div>

        {/* Market Mood Index (MMI) */}
        <div className="bg-[#0c1221] p-3 rounded border border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">MARKET MOOD INDEX</span>
            <span className="text-xl font-black text-terminal-amber font-mono">68 / 100</span>
            <span className="text-[9px] text-terminal-amber block">GREED ZONE</span>
          </div>
          <div className="p-2 bg-terminal-amber/10 rounded border border-terminal-amber/30">
            <Gauge className="w-5 h-5 text-terminal-amber" />
          </div>
        </div>

        {/* FII / DII Institutional Activity */}
        <div className="bg-[#0c1221] p-3 rounded border border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">FII / DII NET FLOWS</span>
            <div className="flex gap-2 text-[10px] font-bold font-mono">
              <span className="text-terminal-green">FII: +₹1,840 Cr</span>
              <span className="text-terminal-green">DII: +₹920 Cr</span>
            </div>
            <span className="text-[9px] text-slate-400 block mt-0.5">NET INSTITUTIONAL BUYERS</span>
          </div>
          <div className="p-2 bg-slate-800 rounded border border-slate-700">
            <Users className="w-5 h-5 text-white" />
          </div>
        </div>

      </div>

      {/* SECOND ROW: MARKET BREADTH & SECTOR ROTATION HEATMAP */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Market Breadth Card */}
        <div className="bg-[#0c1221] p-4 rounded border border-slate-800 space-y-3 lg:col-span-1 flex flex-col justify-between">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-terminal-amber" />
              <h4 className="text-xs font-black text-white uppercase">Market Breadth (Advance/Decline)</h4>
            </div>
            <span className="text-[9px] font-bold text-terminal-green bg-terminal-green/10 border border-terminal-green/30 px-1.5 py-0.5 rounded">
              A/D: 1.68
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-terminal-green">ADVANCES: {advances} ({advPct}%)</span>
              <span className="text-terminal-red">DECLINES: {declines} ({decPct}%)</span>
            </div>

            {/* Visual Bar */}
            <div className="w-full h-3 bg-black rounded-full overflow-hidden flex border border-slate-800">
              <div style={{ width: `${advPct}%` }} className="bg-terminal-green h-full"></div>
              <div style={{ width: `${100 - advPct - decPct}%` }} className="bg-slate-700 h-full"></div>
              <div style={{ width: `${decPct}%` }} className="bg-terminal-red h-full"></div>
            </div>

            <div className="flex justify-between text-[9px] text-slate-400 pt-1">
              <span>Unchanged: {unchanged} stocks</span>
              <span>Total Tracked: {totalTraded} stocks</span>
            </div>
          </div>

          <div className="p-2 bg-black/40 rounded border border-slate-800 text-[10px] text-slate-300">
            <strong>VWAP Analytics:</strong> 72% of NIFTY 50 constituents trading above 20-day VWAP line, confirming broad-based momentum.
          </div>
        </div>

        {/* Sector Rotation Heatmap Grid */}
        <div className="bg-[#0c1221] p-4 rounded border border-slate-800 space-y-3 lg:col-span-2">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-terminal-amber" />
              <h4 className="text-xs font-black text-white uppercase">Sector Performance & Heat Map</h4>
            </div>
            <span className="text-[9px] font-bold text-slate-400">12 CORE SECTORS</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {sectors.map(sec => (
              <div 
                key={sec.name}
                className={cn(
                  "p-2.5 rounded border flex flex-col justify-between transition cursor-pointer hover:scale-[1.02]",
                  sec.isPositive 
                    ? "bg-terminal-green/10 border-terminal-green/30 hover:border-terminal-green" 
                    : "bg-terminal-red/10 border-terminal-red/30 hover:border-terminal-red"
                )}
              >
                <span className="text-[10px] font-black text-white truncate">{sec.name}</span>
                <span className={cn(
                  "text-xs font-black font-mono mt-1",
                  sec.isPositive ? "text-terminal-green" : "text-terminal-red"
                )}>
                  {sec.isPositive ? '+' : ''}{sec.changePct.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* THIRD ROW: TOP GAINERS, TOP LOSERS, 52W HIGH/LOW, VOLUME LEADERS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Top Gainers */}
        <div className="bg-[#0c1221] p-3 rounded border border-slate-800 space-y-2">
          <div className="flex justify-between items-center pb-1.5 border-b border-slate-800">
            <span className="text-[10px] font-black uppercase text-terminal-green flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Top Gainers
            </span>
            <span className="text-[9px] text-slate-400">NSE</span>
          </div>
          <div className="space-y-1.5">
            {topGainers.map(g => (
              <div key={g.symbol} className="p-1.5 bg-black/40 rounded flex justify-between items-center hover:bg-slate-800/40 cursor-pointer" onClick={() => onSelectInstrument?.(g)}>
                <div>
                  <span className="font-bold text-white block text-[11px]">{g.symbol}</span>
                  <span className="text-[9px] text-slate-400">₹{g.price.toFixed(2)}</span>
                </div>
                <span className="font-black text-terminal-green font-mono text-[11px]">+{g.changePct.toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div className="bg-[#0c1221] p-3 rounded border border-slate-800 space-y-2">
          <div className="flex justify-between items-center pb-1.5 border-b border-slate-800">
            <span className="text-[10px] font-black uppercase text-terminal-red flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" /> Top Losers
            </span>
            <span className="text-[9px] text-slate-400">NSE</span>
          </div>
          <div className="space-y-1.5">
            {topLosers.map(l => (
              <div key={l.symbol} className="p-1.5 bg-black/40 rounded flex justify-between items-center hover:bg-slate-800/40 cursor-pointer" onClick={() => onSelectInstrument?.(l)}>
                <div>
                  <span className="font-bold text-white block text-[11px]">{l.symbol}</span>
                  <span className="text-[9px] text-slate-400">₹{l.price.toFixed(2)}</span>
                </div>
                <span className="font-black text-terminal-red font-mono text-[11px]">{l.changePct.toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* 52 Week High / Low */}
        <div className="bg-[#0c1221] p-3 rounded border border-slate-800 space-y-2">
          <div className="flex justify-between items-center pb-1.5 border-b border-slate-800">
            <span className="text-[10px] font-black uppercase text-terminal-amber flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" /> 52 Week High / Low
            </span>
          </div>
          <div className="space-y-1 text-[10px]">
            <span className="text-[9px] text-terminal-green font-bold block">52W HIGHS BREAKOUT</span>
            {high52.map(h => (
              <div key={h.symbol} className="p-1 bg-black/40 rounded flex justify-between items-center">
                <span className="font-bold text-white">{h.symbol}</span>
                <span className="font-mono text-terminal-green font-bold">₹{h.high.toFixed(2)}</span>
              </div>
            ))}
            <span className="text-[9px] text-terminal-red font-bold block mt-2">52W LOWS BREAKDOWN</span>
            {low52.map(l => (
              <div key={l.symbol} className="p-1 bg-black/40 rounded flex justify-between items-center">
                <span className="font-bold text-white">{l.symbol}</span>
                <span className="font-mono text-terminal-red font-bold">₹{l.low.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* OI & Volume Leaders */}
        <div className="bg-[#0c1221] p-3 rounded border border-slate-800 space-y-2">
          <div className="flex justify-between items-center pb-1.5 border-b border-slate-800">
            <span className="text-[10px] font-black uppercase text-terminal-blue flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Volume & OI Leaders
            </span>
          </div>
          <div className="space-y-1.5">
            {oiLeaders.map(oi => (
              <div key={oi.symbol} className="p-1.5 bg-black/40 rounded flex justify-between items-center text-[10px]">
                <div>
                  <span className="font-bold text-white block text-[10px]">{oi.symbol}</span>
                  <span className="text-[8px] text-terminal-blue font-bold">{oi.type}</span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-terminal-amber font-bold block">{oi.oi}</span>
                  <span className="text-[8px] text-terminal-green">{oi.oiChange}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
