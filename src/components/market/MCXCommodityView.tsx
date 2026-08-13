import React, { useState } from 'react';
import { 
  Flame, 
  TrendingUp, 
  TrendingDown, 
  BarChart2, 
  ShieldCheck, 
  Layers, 
  Clock, 
  DollarSign, 
  Activity 
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { EnterpriseMarketTable, ColumnDef } from './EnterpriseMarketTable';

export interface CommodityContract {
  id: string;
  symbol: string;
  name: string;
  category: 'BULLION' | 'ENERGY' | 'BASE_METALS' | 'AGRICULTURE';
  price: number;
  changePct: number;
  high: number;
  low: number;
  lotSize: number;
  unit: string;
  tickSize: number;
  marginPct: number;
  upperCircuit: number;
  lowerCircuit: number;
  expiry: string;
  oi: number;
  volume: number;
}

interface CommodityViewProps {
  onSelectContract?: (contract: any) => void;
}

export const CommodityInstrumentsView: React.FC<CommodityViewProps> = ({ onSelectContract }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const contracts: CommodityContract[] = [
    {
      id: 'GOLD',
      symbol: 'GOLD',
      name: 'Gold 1 Kg Futures',
      category: 'BULLION',
      price: 72450.00,
      changePct: 0.85,
      high: 72800.00,
      low: 72100.00,
      lotSize: 1,
      unit: '1 Kg (1000g)',
      tickSize: 1.0,
      marginPct: 10.0,
      upperCircuit: 74600.00,
      lowerCircuit: 70200.00,
      expiry: '05-AUG-2026',
      oi: 18450,
      volume: 45200
    },
    {
      id: 'SILVER',
      symbol: 'SILVER',
      name: 'Silver 30 Kg Futures',
      category: 'BULLION',
      price: 88200.00,
      changePct: 1.42,
      high: 88900.00,
      low: 87400.00,
      lotSize: 30,
      unit: '30 Kg',
      tickSize: 1.0,
      marginPct: 12.0,
      upperCircuit: 91700.00,
      lowerCircuit: 84700.00,
      expiry: '05-SEP-2026',
      oi: 24100,
      volume: 89500
    },
    {
      id: 'CRUDEOIL',
      symbol: 'CRUDEOIL',
      name: 'Crude Oil 100 BBL Futures',
      category: 'ENERGY',
      price: 6420.00,
      changePct: -1.25,
      high: 6540.00,
      low: 6390.00,
      lotSize: 100,
      unit: '100 Barrels',
      tickSize: 1.0,
      marginPct: 15.0,
      upperCircuit: 6740.00,
      lowerCircuit: 6100.00,
      expiry: '19-AUG-2026',
      oi: 38900,
      volume: 142000
    },
    {
      id: 'NATURALGAS',
      symbol: 'NATURALGAS',
      name: 'Natural Gas 1250 mmBtu Futures',
      category: 'ENERGY',
      price: 214.50,
      changePct: 3.40,
      high: 218.00,
      low: 209.10,
      lotSize: 1250,
      unit: '1250 mmBtu',
      tickSize: 0.1,
      marginPct: 18.0,
      upperCircuit: 231.00,
      lowerCircuit: 198.00,
      expiry: '26-AUG-2026',
      oi: 42100,
      volume: 185000
    },
    {
      id: 'COPPER',
      symbol: 'COPPER',
      name: 'Copper 2500 Kg Futures',
      category: 'BASE_METALS',
      price: 842.10,
      changePct: 0.65,
      high: 848.00,
      low: 838.00,
      lotSize: 2500,
      unit: '2500 Kg',
      tickSize: 0.05,
      marginPct: 11.0,
      upperCircuit: 875.00,
      lowerCircuit: 809.00,
      expiry: '31-AUG-2026',
      oi: 12800,
      volume: 34100
    },
    {
      id: 'ZINC',
      symbol: 'ZINC',
      name: 'Zinc 5 MT Futures',
      category: 'BASE_METALS',
      price: 268.40,
      changePct: 1.10,
      high: 271.00,
      low: 265.50,
      lotSize: 5,
      unit: '5 Metric Tonnes',
      tickSize: 0.05,
      marginPct: 10.0,
      upperCircuit: 280.00,
      lowerCircuit: 256.00,
      expiry: '31-AUG-2026',
      oi: 8400,
      volume: 21000
    },
    {
      id: 'LEAD',
      symbol: 'LEAD',
      name: 'Lead 5 MT Futures',
      category: 'BASE_METALS',
      price: 182.50,
      changePct: -0.30,
      high: 184.00,
      low: 181.80,
      lotSize: 5,
      unit: '5 Metric Tonnes',
      tickSize: 0.05,
      marginPct: 10.0,
      upperCircuit: 190.00,
      lowerCircuit: 175.00,
      expiry: '31-AUG-2026',
      oi: 6200,
      volume: 14500
    },
    {
      id: 'ALUMINIUM',
      symbol: 'ALUMINIUM',
      name: 'Aluminium 5 MT Futures',
      category: 'BASE_METALS',
      price: 232.10,
      changePct: 0.95,
      high: 234.00,
      low: 230.00,
      lotSize: 5,
      unit: '5 Metric Tonnes',
      tickSize: 0.05,
      marginPct: 10.0,
      upperCircuit: 242.00,
      lowerCircuit: 222.00,
      expiry: '31-AUG-2026',
      oi: 9800,
      volume: 28400
    }
  ];

  const filteredContracts = selectedCategory === 'ALL' 
    ? contracts 
    : contracts.filter(c => c.category === selectedCategory);

  const columns: ColumnDef<CommodityContract>[] = [
    { key: 'symbol', header: 'Symbol', accessor: (r) => <span className="font-bold text-terminal-amber">{r.symbol}</span>, sortable: true },
    { key: 'name', header: 'Contract Name', accessor: 'name', sortable: true },
    { key: 'category', header: 'Category', accessor: (r) => <span className="px-1.5 py-0.5 bg-slate-800 text-slate-300 text-[9px] font-bold rounded">{r.category}</span>, filterable: true, filterOptions: ['BULLION', 'ENERGY', 'BASE_METALS', 'AGRICULTURE'] },
    { key: 'price', header: 'Price (₹)', accessor: (r) => <span className="font-bold text-white">₹{r.price.toLocaleString()}</span>, sortable: true, align: 'right' },
    { key: 'changePct', header: 'Change %', accessor: (r) => <span className={cn("font-black", r.changePct >= 0 ? "text-terminal-green" : "text-terminal-red")}>{r.changePct >= 0 ? '+' : ''}{r.changePct.toFixed(2)}%</span>, sortable: true, align: 'right' },
    { key: 'unit', header: 'Lot Size / Unit', accessor: (r) => <span className="font-mono text-terminal-blue font-bold">{r.lotSize} ({r.unit})</span> },
    { key: 'tickSize', header: 'Tick Size', accessor: (r) => `₹${r.tickSize}` },
    { key: 'marginPct', header: 'Margin %', accessor: (r) => `${r.marginPct}%` },
    { key: 'expiry', header: 'Expiry Date', accessor: 'expiry', sortable: true },
    { key: 'oi', header: 'Open Interest', accessor: (r) => r.oi.toLocaleString(), align: 'right' },
    { key: 'volume', header: 'Volume', accessor: (r) => r.volume.toLocaleString(), align: 'right' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#090d16] font-mono text-xs overflow-hidden">
      {/* Category Navigation Strip */}
      <div className="p-3 bg-[#0c1221] border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-terminal-amber" />
          <h3 className="text-sm font-black text-white uppercase tracking-wider">Commodity Instruments Workspace</h3>
        </div>

        <div className="flex gap-1.5">
          {['ALL', 'BULLION', 'ENERGY', 'BASE_METALS', 'AGRICULTURE'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-2.5 py-1 rounded text-[10px] font-black uppercase transition",
                selectedCategory === cat 
                  ? "bg-terminal-amber text-black" 
                  : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="flex-1 overflow-hidden p-3">
        <EnterpriseMarketTable
          data={filteredContracts}
          columns={columns}
          title="Broker Supported Commodity Instruments & Contract Specifications"
          subtitle="Real-time commodity contracts tracking margin requirements, lot sizes & circuit bands"
          onRowClick={(row) => onSelectContract?.(row)}
        />
      </div>
    </div>
  );
};

// Backward compatibility alias
export const MCXCommodityView = CommodityInstrumentsView;
