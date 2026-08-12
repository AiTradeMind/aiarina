import React, { useState } from 'react';
import { 
  Building2, 
  TrendingUp, 
  TrendingDown, 
  BarChart2, 
  Layers, 
  PieChart, 
  Search,
  ChevronRight
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SectorDetail {
  id: string;
  name: string;
  indexValue: number;
  change: number;
  changePct: number;
  weightagePct: number;
  advances: number;
  declines: number;
  constituents: Array<{ symbol: string; name: string; price: number; changePct: number; mcapCr: number }>;
}

export const SectorView: React.FC = () => {
  const [selectedSectorId, setSelectedSectorId] = useState<string>('BANKING');

  const sectors: SectorDetail[] = [
    {
      id: 'BANKING',
      name: 'NIFTY BANK',
      indexValue: 52140.20,
      change: 745.10,
      changePct: 1.45,
      weightagePct: 33.5,
      advances: 10,
      declines: 2,
      constituents: [
        { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', price: 1610.20, changePct: -1.73, mcapCr: 1220000 },
        { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', price: 1180.50, changePct: 2.85, mcapCr: 830000 },
        { symbol: 'SBIN', name: 'State Bank of India', price: 865.10, changePct: 2.15, mcapCr: 770000 },
        { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', price: 1790.00, changePct: 1.40, mcapCr: 355000 },
        { symbol: 'AXISBANK', name: 'Axis Bank Ltd', price: 1240.30, changePct: 1.95, mcapCr: 382000 },
      ]
    },
    {
      id: 'IT',
      name: 'NIFTY IT',
      indexValue: 38920.00,
      change: 430.20,
      changePct: 1.12,
      weightagePct: 14.2,
      advances: 8,
      declines: 2,
      constituents: [
        { symbol: 'TCS', name: 'Tata Consultancy Services', price: 4120.00, changePct: 1.45, mcapCr: 1490000 },
        { symbol: 'INFY', name: 'Infosys Ltd', price: 1820.30, changePct: 2.31, mcapCr: 755000 },
        { symbol: 'HCLTECH', name: 'HCL Technologies', price: 1640.00, changePct: 0.85, mcapCr: 445000 },
        { symbol: 'WIPRO', name: 'Wipro Ltd', price: 520.10, changePct: -0.40, mcapCr: 272000 },
      ]
    },
    {
      id: 'AUTO',
      name: 'NIFTY AUTO',
      indexValue: 24850.10,
      change: 558.00,
      changePct: 2.30,
      weightagePct: 6.8,
      advances: 12,
      declines: 3,
      constituents: [
        { symbol: 'M&M', name: 'Mahindra & Mahindra', price: 2980.00, changePct: 3.40, mcapCr: 370000 },
        { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', price: 1045.00, changePct: 2.60, mcapCr: 385000 },
        { symbol: 'MARUTI', name: 'Maruti Suzuki India', price: 12450.00, changePct: 1.20, mcapCr: 391000 },
        { symbol: 'BAJAJ-AUTO', name: 'Bajaj Auto Ltd', price: 9850.00, changePct: 1.80, mcapCr: 275000 },
      ]
    },
    {
      id: 'PHARMA',
      name: 'NIFTY PHARMA',
      indexValue: 20120.50,
      change: -172.00,
      changePct: -0.85,
      weightagePct: 4.5,
      advances: 4,
      declines: 11,
      constituents: [
        { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical', price: 1715.00, changePct: -1.04, mcapCr: 411000 },
        { symbol: 'CIPLA', name: 'Cipla Ltd', price: 1510.00, changePct: -0.60, mcapCr: 122000 },
        { symbol: 'DRREDDY', name: 'Dr Reddys Labs', price: 6850.00, changePct: -0.90, mcapCr: 114000 },
      ]
    },
    {
      id: 'ENERGY',
      name: 'NIFTY ENERGY',
      indexValue: 41250.00,
      change: 788.00,
      changePct: 1.95,
      weightagePct: 11.2,
      advances: 8,
      declines: 2,
      constituents: [
        { symbol: 'RELIANCE', name: 'Reliance Industries', price: 3120.50, changePct: 2.77, mcapCr: 2110000 },
        { symbol: 'NTPC', name: 'NTPC Ltd', price: 395.00, changePct: 1.80, mcapCr: 383000 },
        { symbol: 'ONGC', name: 'Oil & Natural Gas Corp', price: 315.00, changePct: 1.20, mcapCr: 396000 },
      ]
    },
    {
      id: 'FMCG',
      name: 'NIFTY FMCG',
      indexValue: 56800.00,
      change: -240.00,
      changePct: -0.42,
      weightagePct: 8.1,
      advances: 5,
      declines: 10,
      constituents: [
        { symbol: 'ITC', name: 'ITC Ltd', price: 485.60, changePct: -0.86, mcapCr: 606000 },
        { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', price: 2540.00, changePct: -0.30, mcapCr: 596000 },
        { symbol: 'NESTLEIND', name: 'Nestle India Ltd', price: 2520.00, changePct: 0.20, mcapCr: 243000 },
      ]
    },
    {
      id: 'METAL',
      name: 'NIFTY METAL',
      indexValue: 9850.00,
      change: 268.00,
      changePct: 2.80,
      weightagePct: 3.8,
      advances: 13,
      declines: 2,
      constituents: [
        { symbol: 'TATASTEEL', name: 'Tata Steel Ltd', price: 168.50, changePct: 3.20, mcapCr: 210000 },
        { symbol: 'JSWSTEEL', name: 'JSW Steel Ltd', price: 940.00, changePct: 2.90, mcapCr: 229000 },
        { symbol: 'HINDALCO', name: 'Hindalco Industries', price: 680.00, changePct: 2.40, mcapCr: 152000 },
      ]
    },
    {
      id: 'PSU_BANK',
      name: 'NIFTY PSU BANK',
      indexValue: 7420.00,
      change: 223.00,
      changePct: 3.10,
      weightagePct: 3.2,
      advances: 11,
      declines: 1,
      constituents: [
        { symbol: 'SBIN', name: 'State Bank of India', price: 865.10, changePct: 2.15, mcapCr: 770000 },
        { symbol: 'BANKBARODA', name: 'Bank of Baroda', price: 285.00, changePct: 3.80, mcapCr: 147000 },
        { symbol: 'CANBK', name: 'Canara Bank', price: 118.50, changePct: 4.10, mcapCr: 107000 },
      ]
    },
    {
      id: 'REALTY',
      name: 'NIFTY REALTY',
      indexValue: 1080.00,
      change: 10.20,
      changePct: 0.95,
      weightagePct: 1.8,
      advances: 7,
      declines: 3,
      constituents: [
        { symbol: 'DLF', name: 'DLF Ltd', price: 860.00, changePct: 1.20, mcapCr: 212000 },
        { symbol: 'LODHA', name: 'Macrotech Developers', price: 1450.00, changePct: 0.80, mcapCr: 145000 },
      ]
    },
    {
      id: 'TELECOM',
      name: 'NIFTY TELECOM',
      indexValue: 2140.00,
      change: 33.70,
      changePct: 1.60,
      weightagePct: 2.9,
      advances: 5,
      declines: 1,
      constituents: [
        { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', price: 1540.20, changePct: 1.85, mcapCr: 910000 },
        { symbol: 'IDEA', name: 'Vodafone Idea Ltd', price: 16.20, changePct: 0.80, mcapCr: 110000 },
      ]
    },
    {
      id: 'CHEMICAL',
      name: 'NIFTY CHEMICAL',
      indexValue: 3450.00,
      change: -6.90,
      changePct: -0.20,
      weightagePct: 1.4,
      advances: 6,
      declines: 8,
      constituents: [
        { symbol: 'SRF', name: 'SRF Ltd', price: 2410.00, changePct: -0.40, mcapCr: 71000 },
        { symbol: 'PIIND', name: 'PI Industries', price: 3820.00, changePct: 0.10, mcapCr: 58000 },
      ]
    },
    {
      id: 'TEXTILE',
      name: 'NIFTY TEXTILE',
      indexValue: 1820.00,
      change: 8.10,
      changePct: 0.45,
      weightagePct: 0.8,
      advances: 6,
      declines: 4,
      constituents: [
        { symbol: 'RAYMOND', name: 'Raymond Ltd', price: 3120.00, changePct: 0.90, mcapCr: 20700 },
      ]
    }
  ];

  const activeSector = sectors.find(s => s.id === selectedSectorId) || sectors[0];

  return (
    <div className="flex flex-col md:flex-row h-full bg-[#090d16] text-slate-200 font-mono text-xs overflow-hidden border border-slate-800 rounded">
      
      {/* Left Sector List Column */}
      <div className="w-full md:w-80 border-r border-slate-800 bg-[#0c1221] flex flex-col h-full shrink-0">
        <div className="p-3 border-b border-slate-800">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-terminal-amber" />
            Core Indian Sectors
          </h3>
          <p className="text-[10px] text-slate-400">12 Sector Groupings & Index Feeds</p>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sectors.map(sec => {
            const isSelected = sec.id === selectedSectorId;
            return (
              <div
                key={sec.id}
                onClick={() => setSelectedSectorId(sec.id)}
                className={cn(
                  "p-2.5 rounded border transition cursor-pointer flex justify-between items-center",
                  isSelected 
                    ? "bg-terminal-amber/15 border-terminal-amber text-white font-bold" 
                    : "bg-black/30 border-slate-800/80 hover:bg-slate-800/60 text-slate-300"
                )}
              >
                <div>
                  <span className="block text-xs font-bold">{sec.name}</span>
                  <span className="text-[9px] text-slate-400">Weight: {sec.weightagePct}%</span>
                </div>
                <div className="text-right">
                  <span className="block font-mono text-xs font-bold">₹{sec.indexValue.toFixed(0)}</span>
                  <span className={cn(
                    "text-[10px] font-mono font-bold block",
                    sec.changePct >= 0 ? "text-terminal-green" : "text-terminal-red"
                  )}>
                    {sec.changePct >= 0 ? '+' : ''}{sec.changePct.toFixed(2)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Sector Detail Column */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 space-y-4">
        
        {/* Active Sector Summary Banner */}
        <div className="p-4 bg-[#0c1221] rounded border border-slate-800 flex flex-wrap justify-between items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white uppercase">{activeSector.name}</h2>
              <span className="px-2 py-0.5 bg-terminal-blue/20 text-terminal-blue border border-terminal-blue/40 text-[9px] font-black rounded">
                WEIGHT {activeSector.weightagePct}%
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Consolidated Index Analytics & Top Constituent Weights</p>
          </div>

          <div className="flex items-center gap-6">
            <div>
              <span className="text-[9px] text-slate-400 block font-bold uppercase">INDEX LEVEL</span>
              <span className="text-xl font-black text-white font-mono">₹{activeSector.indexValue.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 block font-bold uppercase">DAILY CHANGE</span>
              <span className={cn(
                "text-xl font-black font-mono",
                activeSector.changePct >= 0 ? "text-terminal-green" : "text-terminal-red"
              )}>
                {activeSector.changePct >= 0 ? '+' : ''}{activeSector.changePct.toFixed(2)}%
              </span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 block font-bold uppercase">ADV / DEC</span>
              <span className="text-sm font-black font-mono text-white">
                <span className="text-terminal-green">{activeSector.advances} A</span> / <span className="text-terminal-red">{activeSector.declines} D</span>
              </span>
            </div>
          </div>
        </div>

        {/* Sector Constituent Table */}
        <div className="bg-[#0c1221] p-4 rounded border border-slate-800 space-y-3">
          <h4 className="text-xs font-black text-white uppercase border-b border-slate-800 pb-2 flex justify-between items-center">
            <span>Sector Constituents & Stock Performances</span>
            <span className="text-[10px] text-terminal-amber">{activeSector.constituents.length} Key Stocks</span>
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400 font-black">
                  <th className="p-2">Symbol</th>
                  <th className="p-2">Company Name</th>
                  <th className="p-2 text-right">LTP Price</th>
                  <th className="p-2 text-right">Daily Change %</th>
                  <th className="p-2 text-right">Market Cap (₹ Cr)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {activeSector.constituents.map(c => (
                  <tr key={c.symbol} className="hover:bg-slate-800/50">
                    <td className="p-2.5 font-bold text-terminal-amber">{c.symbol}</td>
                    <td className="p-2.5 text-slate-300">{c.name}</td>
                    <td className="p-2.5 text-right font-bold text-white">₹{c.price.toFixed(2)}</td>
                    <td className={cn(
                      "p-2.5 text-right font-black",
                      c.changePct >= 0 ? "text-terminal-green" : "text-terminal-red"
                    )}>
                      {c.changePct >= 0 ? '+' : ''}{c.changePct.toFixed(2)}%
                    </td>
                    <td className="p-2.5 text-right text-slate-400">₹{c.mcapCr.toLocaleString()} Cr</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
