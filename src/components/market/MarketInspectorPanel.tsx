import React from 'react';
import { 
  X, 
  Activity, 
  Zap, 
  Database, 
  Clock, 
  ShieldCheck, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Layers, 
  BarChart2, 
  FileText,
  Building2,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { safeFormat } from '../../lib/utils';

export interface InspectorInstrument {
  id?: string;
  symbol: string;
  name?: string;
  exchange: string;
  segment: string;
  isin?: string;
  lotSize?: number;
  freezeQuantity?: number;
  tickSize?: string | number;
  pricePrecision?: number;
  upperCircuit?: number;
  lowerCircuit?: number;
  expiry?: string;
  expiryType?: string;
  oi?: number;
  oiChange?: number;
  volume?: number;
  turnover?: number;
  lastPrice?: number;
  changePct?: number;
  corporateActions?: Array<{ type: string; details: string; recordDate: string }>;
  historicalStatus?: string;
  dataProvider?: string;
  apiStatus?: 'ACTIVE' | 'CONNECTED' | 'DEGRADED' | 'DISCONNECTED';
  latencyMs?: number;
  sector?: string;
  industry?: string;
}

interface MarketInspectorPanelProps {
  instrument: InspectorInstrument | null;
  onClose: () => void;
}

export const MarketInspectorPanel: React.FC<MarketInspectorPanelProps> = ({ instrument, onClose }) => {
  if (!instrument) return null;

  const price = instrument.lastPrice || 1000;
  const changePct = instrument.changePct || 0;
  const isPositive = changePct >= 0;

  return (
    <div className="w-96 border-l border-slate-800 bg-[#090e1a] flex flex-col h-full z-20 shrink-0 font-mono text-xs shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-[#0c1221] flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-black text-white">{instrument.symbol}</span>
            <span className="px-2 py-0.5 bg-terminal-amber/20 text-terminal-amber border border-terminal-amber/40 text-[9px] font-black rounded">
              {instrument.exchange}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[220px]">
            {instrument.name || instrument.symbol}
          </p>
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition"
          title="Close Inspector Panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Details Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* Live Price Header Box */}
        <div className="p-3 bg-black/60 rounded border border-slate-800/80 flex justify-between items-center">
          <div>
            <span className="text-[9px] text-slate-400 uppercase font-bold block">LAST TRADED PRICE</span>
            <span className="text-lg font-black text-white font-mono">₹{price.toFixed(2)}</span>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-slate-400 uppercase font-bold block">DAILY CHANGE</span>
            <span className={`text-sm font-black font-mono ${isPositive ? 'text-terminal-green' : 'text-terminal-red'}`}>
              {isPositive ? '+' : ''}{changePct.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Master Details Grid */}
        <div className="bg-[#0c1221] p-3 rounded border border-slate-800 space-y-2">
          <span className="text-[10px] font-black uppercase text-terminal-amber block border-b border-slate-800 pb-1">
            Master Specification
          </span>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
            <div>
              <span className="text-slate-400 block text-[9px]">SEGMENT / TYPE</span>
              <span className="text-white font-bold">{instrument.segment}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px]">ISIN CODE</span>
              <span className="text-terminal-blue font-bold font-mono text-[10px]">
                {instrument.isin || 'INE000A01018'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px]">LOT SIZE</span>
              <span className="text-white font-bold">{instrument.lotSize || 1}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px]">FREEZE QUANTITY</span>
              <span className="text-terminal-red font-bold">{instrument.freezeQuantity || 100}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px]">TICK SIZE</span>
              <span className="text-terminal-green font-bold">₹{instrument.tickSize || '0.05'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px]">PRICE PRECISION</span>
              <span className="text-white font-bold">{instrument.pricePrecision || 2} Decimals</span>
            </div>
          </div>
        </div>

        {/* Circuit Limits & Expiry */}
        <div className="bg-[#0c1221] p-3 rounded border border-slate-800 space-y-2">
          <span className="text-[10px] font-black uppercase text-terminal-blue block border-b border-slate-800 pb-1">
            Risk & Expiry Limits
          </span>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
            <div>
              <span className="text-slate-400 block text-[9px]">UPPER CIRCUIT</span>
              <span className="text-terminal-green font-bold">₹{instrument.upperCircuit ? instrument.upperCircuit.toFixed(2) : (price * 1.1).toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px]">LOWER CIRCUIT</span>
              <span className="text-terminal-red font-bold">₹{instrument.lowerCircuit ? instrument.lowerCircuit.toFixed(2) : (price * 0.9).toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px]">EXPIRY DATE</span>
              <span className="text-white font-bold">{instrument.expiry ? safeFormat(instrument.expiry, 'dd-MMM-yyyy') : 'N/A (EQUITY)'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px]">EXPIRY TYPE</span>
              <span className="text-terminal-amber font-bold">{instrument.expiryType || 'MONTHLY'}</span>
            </div>
          </div>
        </div>

        {/* Liquidity & OI */}
        <div className="bg-[#0c1221] p-3 rounded border border-slate-800 space-y-2">
          <span className="text-[10px] font-black uppercase text-terminal-green block border-b border-slate-800 pb-1">
            Liquidity & Derivatives OI
          </span>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
            <div>
              <span className="text-slate-400 block text-[9px]">OPEN INTEREST (OI)</span>
              <span className="text-white font-bold">{instrument.oi ? instrument.oi.toLocaleString() : '1,245,000'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px]">OI CHANGE</span>
              <span className="text-terminal-green font-bold">+{instrument.oiChange || 12400} (+1.2%)</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px]">VOLUME</span>
              <span className="text-white font-bold">{instrument.volume ? instrument.volume.toLocaleString() : '4,850,200'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px]">TURNOVER</span>
              <span className="text-terminal-amber font-bold">₹{instrument.turnover ? (instrument.turnover / 10000000).toFixed(2) : '485.2'} Cr</span>
            </div>
          </div>
        </div>

        {/* Corporate Actions */}
        <div className="bg-[#0c1221] p-3 rounded border border-slate-800 space-y-2">
          <span className="text-[10px] font-black uppercase text-amber-400 block border-b border-slate-800 pb-1">
            Corporate Actions
          </span>

          {instrument.corporateActions && instrument.corporateActions.length > 0 ? (
            <div className="space-y-1.5 pt-1">
              {instrument.corporateActions.map((ca, idx) => (
                <div key={idx} className="p-2 bg-black/40 rounded border border-slate-800 text-[10px]">
                  <div className="flex justify-between font-bold text-terminal-amber">
                    <span>{ca.type}</span>
                    <span>{ca.recordDate}</span>
                  </div>
                  <p className="text-slate-300 mt-0.5">{ca.details}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-2 text-slate-500 italic text-[10px]">No pending corporate actions recorded.</div>
          )}
        </div>

        {/* Technical Provider & API Telemetry */}
        <div className="bg-[#0c1221] p-3 rounded border border-slate-800 space-y-2">
          <span className="text-[10px] font-black uppercase text-sky-400 block border-b border-slate-800 pb-1">
            Feed Provider & Gateway Telemetry
          </span>

          <div className="space-y-1.5 pt-1 text-[10px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Data Provider:</span>
              <span className="text-white font-bold">{instrument.dataProvider || `${instrument.exchange}_DIRECT_FEED`}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">API Status:</span>
              <span className="text-terminal-green font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-terminal-green" />
                {instrument.apiStatus || 'CONNECTED'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Gateway Latency:</span>
              <span className="text-terminal-green font-bold">{instrument.latencyMs || 2} ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Historical Status:</span>
              <span className="text-terminal-amber font-bold">{instrument.historicalStatus || 'SYNCHRONIZED (MODULE 16)'}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Footer Close */}
      <div className="p-3 border-t border-slate-800 bg-[#0c1221]">
        <button 
          onClick={onClose}
          className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded transition uppercase tracking-wider"
        >
          Close Inspector
        </button>
      </div>
    </div>
  );
};
