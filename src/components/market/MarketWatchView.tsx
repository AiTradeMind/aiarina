import React, { useState } from 'react';
import { 
  Star, 
  Search, 
  SlidersHorizontal, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Layers, 
  Building2 
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { EnterpriseMarketTable, ColumnDef } from './EnterpriseMarketTable';

interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  exchange: 'NSE' | 'BSE' | 'MCX';
  segment: 'EQUITY' | 'ETF' | 'INDEX' | 'FUTURES' | 'OPTIONS' | 'COMMODITY';
  price: number;
  change: number;
  changePct: number;
  high: number;
  low: number;
  volume: number;
  oi?: number;
  isFavorite?: boolean;
}

interface MarketWatchViewProps {
  onSelectInstrument?: (item: any) => void;
}

export const MarketWatchView: React.FC<MarketWatchViewProps> = ({ onSelectInstrument }) => {
  const [activeSegment, setActiveSegment] = useState<string>('ALL');

  const [items, setItems] = useState<WatchlistItem[]>([
    { id: '1', symbol: 'NIFTY 50', name: 'Nifty 50 Index', exchange: 'NSE', segment: 'INDEX', price: 24120.50, change: 184.20, changePct: 0.77, high: 24180.00, low: 23980.00, volume: 14200000, isFavorite: true },
    { id: '2', symbol: 'BANKNIFTY', name: 'Nifty Bank Index', exchange: 'NSE', segment: 'INDEX', price: 52140.20, change: 745.10, changePct: 1.45, high: 52300.00, low: 51600.00, volume: 9800000, isFavorite: true },
    { id: '3', symbol: 'RELIANCE', name: 'Reliance Industries Ltd', exchange: 'NSE', segment: 'EQUITY', price: 3120.50, change: 84.20, changePct: 2.77, high: 3140.00, low: 3050.00, volume: 18200000, isFavorite: true },
    { id: '4', symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', exchange: 'NSE', segment: 'EQUITY', price: 1610.20, change: -28.40, changePct: -1.73, high: 1645.00, low: 1605.00, volume: 22400000, isFavorite: false },
    { id: '5', symbol: 'NIFTYBEES', name: 'Nippon India ETF Nifty BeES', exchange: 'NSE', segment: 'ETF', price: 265.40, change: 2.10, changePct: 0.80, high: 266.00, low: 263.80, volume: 4500000, isFavorite: false },
    { id: '6', symbol: 'GOLDBEES', name: 'Nippon India ETF Gold BeES', exchange: 'NSE', segment: 'ETF', price: 68.20, change: 0.45, changePct: 0.66, high: 68.50, low: 67.90, volume: 3200000, isFavorite: true },
    { id: '7', symbol: 'NIFTY26JUL24000CE', name: 'NIFTY 30 JUL 24000 CE', exchange: 'NSE', segment: 'OPTIONS', price: 285.50, change: 42.10, changePct: 17.30, high: 310.00, low: 220.00, volume: 18500000, oi: 14200000, isFavorite: true },
    { id: '8', symbol: 'NIFTY26FUT', name: 'NIFTY Futures 30 JUL 2026', exchange: 'NSE', segment: 'FUTURES', price: 24160.00, change: 192.00, changePct: 0.80, high: 24210.00, low: 24010.00, volume: 8500000, oi: 11200000, isFavorite: false },
    { id: '9', symbol: 'GOLD', name: 'Gold 1 Kg Futures', exchange: 'MCX', segment: 'COMMODITY', price: 72450.00, change: 610.00, changePct: 0.85, high: 72800.00, low: 72100.00, volume: 45200, oi: 18450, isFavorite: true },
    { id: '10', symbol: 'CRUDEOIL', name: 'Crude Oil 100 BBL Futures', exchange: 'MCX', segment: 'COMMODITY', price: 6420.00, change: -81.00, changePct: -1.25, high: 6540.00, low: 6390.00, volume: 142000, oi: 38900, isFavorite: false },
  ]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setItems(prev => prev.map(item => item.id === id ? { ...item, isFavorite: !item.isFavorite } : item));
  };

  const filteredItems = items.filter(item => {
    if (activeSegment === 'FAVORITES') return item.isFavorite;
    if (activeSegment === 'ALL') return true;
    return item.segment === activeSegment;
  });

  const columns: ColumnDef<WatchlistItem>[] = [
    {
      key: 'favorite',
      header: 'Fav',
      accessor: (r) => (
        <button
          onClick={(e) => toggleFavorite(r.id, e)}
          className="p-1 hover:scale-125 transition"
          title="Toggle Favorite"
        >
          <Star className={cn("w-4 h-4", r.isFavorite ? "fill-terminal-amber text-terminal-amber" : "text-slate-600 hover:text-slate-400")} />
        </button>
      ),
      align: 'center',
      sortable: false
    },
    { key: 'symbol', header: 'Symbol', accessor: (r) => <span className="font-bold text-terminal-amber">{r.symbol}</span>, sortable: true },
    { key: 'name', header: 'Description', accessor: 'name' },
    { key: 'exchange', header: 'Exch', accessor: (r) => <span className="px-1.5 py-0.5 bg-slate-800 text-slate-300 text-[9px] font-bold rounded">{r.exchange}</span>, filterable: true, filterOptions: ['NSE', 'BSE', 'MCX'] },
    { key: 'segment', header: 'Segment', accessor: (r) => <span className="text-terminal-blue font-bold text-[10px]">{r.segment}</span>, filterable: true, filterOptions: ['EQUITY', 'ETF', 'INDEX', 'FUTURES', 'OPTIONS', 'COMMODITY'] },
    { key: 'price', header: 'LTP (₹)', accessor: (r) => <span className="font-bold text-white">₹{r.price.toLocaleString()}</span>, sortable: true, align: 'right' },
    { key: 'changePct', header: 'Change %', accessor: (r) => <span className={cn("font-black", r.changePct >= 0 ? "text-terminal-green" : "text-terminal-red")}>{r.changePct >= 0 ? '+' : ''}{r.changePct.toFixed(2)}%</span>, sortable: true, align: 'right' },
    { key: 'high', header: 'High', accessor: (r) => `₹${r.high.toLocaleString()}`, align: 'right' },
    { key: 'low', header: 'Low', accessor: (r) => `₹${r.low.toLocaleString()}`, align: 'right' },
    { key: 'volume', header: 'Volume', accessor: (r) => r.volume.toLocaleString(), align: 'right' },
    { key: 'oi', header: 'OI', accessor: (r) => r.oi ? r.oi.toLocaleString() : 'N/A', align: 'right' }
  ];

  return (
    <div className="flex flex-col h-full bg-[#090d16] font-mono text-xs overflow-hidden">
      
      {/* Watchlist Segment Bar */}
      <div className="p-3 bg-[#0c1221] border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-terminal-amber" />
          <h3 className="text-sm font-black text-white uppercase tracking-wider">Enterprise Market Watch</h3>
        </div>

        <div className="flex gap-1.5">
          {['ALL', 'FAVORITES', 'EQUITY', 'ETF', 'INDEX', 'FUTURES', 'OPTIONS', 'COMMODITY'].map(seg => (
            <button
              key={seg}
              onClick={() => setActiveSegment(seg)}
              className={cn(
                "px-2.5 py-1 rounded text-[10px] font-black uppercase transition",
                activeSegment === seg 
                  ? "bg-terminal-amber text-black" 
                  : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
              )}
            >
              {seg === 'FAVORITES' ? '★ Favorites' : seg}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="flex-1 overflow-hidden p-3">
        <EnterpriseMarketTable
          data={filteredItems}
          columns={columns}
          title="Watchlist Feed Matrix"
          subtitle="Multi-asset live streaming prices with instant right-panel inspector support"
          onRowClick={(row) => onSelectInstrument?.(row)}
        />
      </div>

    </div>
  );
};
