import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCcw, 
  Filter, 
  Activity, 
  PieChart, 
  Zap, 
  Layers, 
  ChevronRight 
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface OptionStrike {
  strike: number;
  call: {
    oi: number;
    oiChange: number;
    volume: number;
    iv: number;
    delta: number;
    gamma: number;
    theta: number;
    vega: number;
    ltp: number;
    change: number;
  };
  put: {
    oi: number;
    oiChange: number;
    volume: number;
    iv: number;
    delta: number;
    gamma: number;
    theta: number;
    vega: number;
    ltp: number;
    change: number;
  };
}

export const OptionChainView: React.FC = () => {
  const [underlying, setUnderlying] = useState('NIFTY_50');
  const [expiry, setExpiry] = useState('30-JUL-2026');
  const [spotPrice, setSpotPrice] = useState(24120.50);

  // Generate Option Chain Strikes dynamically
  const strikes = useMemo(() => {
    const baseSpot = underlying === 'NIFTY_50' ? 24100 : underlying === 'BANKNIFTY' ? 52100 : 3100;
    const step = underlying === 'NIFTY_50' ? 50 : underlying === 'BANKNIFTY' ? 100 : 20;
    const count = 15;
    const list: OptionStrike[] = [];

    const startStrike = baseSpot - Math.floor(count / 2) * step;

    for (let i = 0; i < count; i++) {
      const strike = startStrike + i * step;
      const isCallITM = strike < baseSpot;
      const isPutITM = strike > baseSpot;

      // Realistic option pricing & Greeks approximation
      const dist = Math.abs(strike - baseSpot);
      const callLtp = Math.max(5, isCallITM ? (baseSpot - strike) + 40 : Math.max(5, 150 - dist * 0.4));
      const putLtp = Math.max(5, isPutITM ? (strike - baseSpot) + 40 : Math.max(5, 150 - dist * 0.4));

      list.push({
        strike,
        call: {
          oi: Math.floor(50000 + Math.random() * 150000),
          oiChange: Math.floor((Math.random() - 0.3) * 20000),
          volume: Math.floor(100000 + Math.random() * 500000),
          iv: Number((13 + (dist / 100) * 0.5).toFixed(2)),
          delta: Number((isCallITM ? 0.6 + Math.min(0.35, dist / 1000) : 0.4 - Math.min(0.35, dist / 1000)).toFixed(2)),
          gamma: Number((0.0025 - (dist / 100000)).toFixed(4)),
          theta: Number((-12.5 - (dist / 100)).toFixed(2)),
          vega: Number((8.4 + (dist / 200)).toFixed(2)),
          ltp: Number(callLtp.toFixed(2)),
          change: Number(((Math.random() - 0.4) * 15).toFixed(2))
        },
        put: {
          oi: Math.floor(60000 + Math.random() * 160000),
          oiChange: Math.floor((Math.random() - 0.3) * 20000),
          volume: Math.floor(120000 + Math.random() * 450000),
          iv: Number((13.5 + (dist / 100) * 0.5).toFixed(2)),
          delta: Number((isPutITM ? -0.6 - Math.min(0.35, dist / 1000) : -0.4 + Math.min(0.35, dist / 1000)).toFixed(2)),
          gamma: Number((0.0025 - (dist / 100000)).toFixed(4)),
          theta: Number((-11.8 - (dist / 100)).toFixed(2)),
          vega: Number((8.2 + (dist / 200)).toFixed(2)),
          ltp: Number(putLtp.toFixed(2)),
          change: Number(((Math.random() - 0.4) * 15).toFixed(2))
        }
      });
    }

    return list;
  }, [underlying, spotPrice]);

  // Aggregate Total OI & PCR
  const totalCallOI = strikes.reduce((sum, s) => sum + s.call.oi, 0);
  const totalPutOI = strikes.reduce((sum, s) => sum + s.put.oi, 0);
  const pcr = Number((totalPutOI / totalCallOI).toFixed(2));

  // Find ATM strike
  const atmStrike = strikes.reduce((prev, curr) => 
    Math.abs(curr.strike - spotPrice) < Math.abs(prev.strike - spotPrice) ? curr : prev
  ).strike;

  return (
    <div className="flex flex-col h-full bg-[#090d16] text-slate-200 font-mono text-xs overflow-hidden">
      
      {/* Option Chain Control Header */}
      <div className="p-3 bg-[#0c1221] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        
        {/* Selector Tools */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Underlying Index/Stock:</span>
            <select
              value={underlying}
              onChange={(e) => {
                setUnderlying(e.target.value);
                setSpotPrice(e.target.value === 'NIFTY_50' ? 24120.50 : e.target.value === 'BANKNIFTY' ? 52140.00 : 3120.50);
              }}
              className="bg-black border border-slate-800 text-terminal-amber font-black rounded px-2.5 py-1 text-xs"
            >
              <option value="NIFTY_50">NIFTY 50</option>
              <option value="BANKNIFTY">BANKNIFTY</option>
              <option value="FINNIFTY">FINNIFTY</option>
              <option value="RELIANCE">RELIANCE</option>
              <option value="TCS">TCS</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Expiry Series:</span>
            <select
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className="bg-black border border-slate-800 text-white font-bold rounded px-2.5 py-1 text-xs"
            >
              <option value="30-JUL-2026">30-JUL-2026 (MONTHLY)</option>
              <option value="23-JUL-2026">23-JUL-2026 (WEEKLY)</option>
              <option value="16-JUL-2026">16-JUL-2026 (WEEKLY)</option>
            </select>
          </div>
        </div>

        {/* Spot Price & PCR Stats */}
        <div className="flex items-center gap-4 text-xs">
          <div className="px-3 py-1 bg-black/60 rounded border border-slate-800 flex items-center gap-2">
            <span className="text-slate-400 font-bold">SPOT PRICE:</span>
            <span className="text-white font-black font-mono text-sm">₹{spotPrice.toFixed(2)}</span>
          </div>

          <div className="px-3 py-1 bg-black/60 rounded border border-slate-800 flex items-center gap-2">
            <span className="text-slate-400 font-bold">OPTION PCR:</span>
            <span className={cn("font-black font-mono text-sm", pcr >= 1 ? "text-terminal-green" : "text-terminal-red")}>
              {pcr}
            </span>
            <span className="text-[9px] text-slate-400">({pcr >= 1 ? 'BULLISH' : 'BEARISH'})</span>
          </div>

          <div className="px-3 py-1 bg-black/60 rounded border border-slate-800 flex items-center gap-2">
            <span className="text-slate-400 font-bold">ATM STRIKE:</span>
            <span className="text-terminal-amber font-black font-mono">{atmStrike}</span>
          </div>
        </div>

      </div>

      {/* Main Option Chain Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-center border-collapse">
          
          {/* Header Rows */}
          <thead className="sticky top-0 z-20 bg-[#0c1221] shadow-md border-b border-slate-800">
            {/* Call / Put Span Row */}
            <tr className="border-b border-slate-800/80 text-[10px] font-black uppercase tracking-wider">
              <th colSpan={8} className="p-1.5 bg-emerald-950/20 text-terminal-green border-r border-slate-800">
                CALL OPTIONS (CE) — BULLISH SIDE
              </th>
              <th colSpan={1} className="p-1.5 bg-slate-900 text-terminal-amber border-r border-slate-800">
                STRIKE
              </th>
              <th colSpan={8} className="p-1.5 bg-rose-950/20 text-terminal-red">
                PUT OPTIONS (PE) — BEARISH SIDE
              </th>
            </tr>

            {/* Column Headers */}
            <tr className="text-[9px] font-black uppercase text-slate-400 border-b border-slate-800">
              {/* Call Columns */}
              <th className="p-2 border-r border-slate-800/40">OI</th>
              <th className="p-2 border-r border-slate-800/40">Chg OI</th>
              <th className="p-2 border-r border-slate-800/40">Vol</th>
              <th className="p-2 border-r border-slate-800/40">IV</th>
              <th className="p-2 border-r border-slate-800/40">Delta</th>
              <th className="p-2 border-r border-slate-800/40">Theta</th>
              <th className="p-2 border-r border-slate-800/40">Vega</th>
              <th className="p-2 border-r border-slate-800 text-terminal-green">LTP</th>

              {/* Strike */}
              <th className="p-2 border-r border-slate-800 bg-slate-900 text-terminal-amber font-bold">STRIKE</th>

              {/* Put Columns */}
              <th className="p-2 border-r border-slate-800/40 text-terminal-red">LTP</th>
              <th className="p-2 border-r border-slate-800/40">Vega</th>
              <th className="p-2 border-r border-slate-800/40">Theta</th>
              <th className="p-2 border-r border-slate-800/40">Delta</th>
              <th className="p-2 border-r border-slate-800/40">IV</th>
              <th className="p-2 border-r border-slate-800/40">Vol</th>
              <th className="p-2 border-r border-slate-800/40">Chg OI</th>
              <th className="p-2">OI</th>
            </tr>
          </thead>

          {/* Table Data Rows */}
          <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
            {strikes.map((s) => {
              const isATM = s.strike === atmStrike;
              const isCallITM = s.strike < spotPrice;
              const isPutITM = s.strike > spotPrice;

              return (
                <tr 
                  key={s.strike}
                  className={cn(
                    "hover:bg-slate-800/60 transition",
                    isATM && "bg-terminal-amber/15 font-bold"
                  )}
                >
                  {/* Call Cells */}
                  <td className={cn("p-2 border-r border-slate-800/40", isCallITM && "bg-emerald-950/20")}>
                    {s.call.oi.toLocaleString()}
                  </td>
                  <td className={cn("p-2 border-r border-slate-800/40", s.call.oiChange >= 0 ? "text-terminal-green" : "text-terminal-red", isCallITM && "bg-emerald-950/20")}>
                    {s.call.oiChange >= 0 ? '+' : ''}{s.call.oiChange.toLocaleString()}
                  </td>
                  <td className={cn("p-2 border-r border-slate-800/40 text-slate-400", isCallITM && "bg-emerald-950/20")}>
                    {s.call.volume.toLocaleString()}
                  </td>
                  <td className={cn("p-2 border-r border-slate-800/40 text-slate-300", isCallITM && "bg-emerald-950/20")}>
                    {s.call.iv}%
                  </td>
                  <td className={cn("p-2 border-r border-slate-800/40 text-slate-400", isCallITM && "bg-emerald-950/20")}>
                    {s.call.delta}
                  </td>
                  <td className={cn("p-2 border-r border-slate-800/40 text-slate-500", isCallITM && "bg-emerald-950/20")}>
                    {s.call.theta}
                  </td>
                  <td className={cn("p-2 border-r border-slate-800/40 text-slate-500", isCallITM && "bg-emerald-950/20")}>
                    {s.call.vega}
                  </td>
                  <td className={cn("p-2 border-r border-slate-800 font-bold text-terminal-green", isCallITM && "bg-emerald-950/30")}>
                    ₹{s.call.ltp.toFixed(2)}
                  </td>

                  {/* STRIKE PRICE CENTER CELL */}
                  <td className={cn(
                    "p-2 border-r border-slate-800 font-black text-white font-mono text-xs",
                    isATM ? "bg-terminal-amber text-black" : "bg-slate-900/90 text-terminal-amber"
                  )}>
                    {s.strike}
                  </td>

                  {/* Put Cells */}
                  <td className={cn("p-2 border-r border-slate-800/40 font-bold text-terminal-red", isPutITM && "bg-rose-950/30")}>
                    ₹{s.put.ltp.toFixed(2)}
                  </td>
                  <td className={cn("p-2 border-r border-slate-800/40 text-slate-500", isPutITM && "bg-rose-950/20")}>
                    {s.put.vega}
                  </td>
                  <td className={cn("p-2 border-r border-slate-800/40 text-slate-500", isPutITM && "bg-rose-950/20")}>
                    {s.put.theta}
                  </td>
                  <td className={cn("p-2 border-r border-slate-800/40 text-slate-400", isPutITM && "bg-rose-950/20")}>
                    {s.put.delta}
                  </td>
                  <td className={cn("p-2 border-r border-slate-800/40 text-slate-300", isPutITM && "bg-rose-950/20")}>
                    {s.put.iv}%
                  </td>
                  <td className={cn("p-2 border-r border-slate-800/40 text-slate-400", isPutITM && "bg-rose-950/20")}>
                    {s.put.volume.toLocaleString()}
                  </td>
                  <td className={cn("p-2 border-r border-slate-800/40", s.put.oiChange >= 0 ? "text-terminal-green" : "text-terminal-red", isPutITM && "bg-rose-950/20")}>
                    {s.put.oiChange >= 0 ? '+' : ''}{s.put.oiChange.toLocaleString()}
                  </td>
                  <td className={cn("p-2", isPutITM && "bg-rose-950/20")}>
                    {s.put.oi.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>

        </table>
      </div>

      {/* Option Chain Footer Summary */}
      <div className="p-2.5 bg-[#0c1221] border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-400 shrink-0">
        <div className="flex gap-4">
          <span>Total Call OI: <strong className="text-terminal-green font-mono">{totalCallOI.toLocaleString()}</strong></span>
          <span>Total Put OI: <strong className="text-terminal-red font-mono">{totalPutOI.toLocaleString()}</strong></span>
        </div>
        <div className="flex gap-3 text-[10px]">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-950/60 border border-emerald-500 rounded-sm"></span> ITM Calls</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-rose-950/60 border border-rose-500 rounded-sm"></span> ITM Puts</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-terminal-amber rounded-sm"></span> ATM Strike</span>
        </div>
      </div>

    </div>
  );
};
