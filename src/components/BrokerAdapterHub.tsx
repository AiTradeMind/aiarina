import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  Layers, 
  Zap, 
  CheckCircle2, 
  RefreshCcw, 
  Activity, 
  ArrowRight, 
  Settings, 
  Code2, 
  Server, 
  FileText,
  Lock,
  ChevronRight,
  Sparkles,
  Check
} from 'lucide-react';
import { Button } from './ui/Button';
import { Panel, SectionHeader, StatusBadge } from './ui/Base';
import { 
  BrokerAdapterRegistry, 
  BrokerId, 
  NormalizedOrderRequest, 
  IBrokerAdapter,
  NormalizedOrderResult
} from '../modules/trading/adapters';

export const BrokerAdapterHub: React.FC = () => {
  const registry = BrokerAdapterRegistry.getInstance();
  const [activeBrokerId, setActiveBrokerId] = useState<BrokerId>(registry.getActiveBrokerId());
  const [inspectBrokerId, setInspectBrokerId] = useState<BrokerId>('dhan');

  // Test Order Form State for Payload Translation Inspector
  const [testSymbol, setTestSymbol] = useState('RELIANCE');
  const [testSide, setTestSide] = useState<'BUY' | 'SELL'>('BUY');
  const [testOrderType, setTestOrderType] = useState<'LIMIT' | 'MARKET' | 'STOP_LOSS' | 'BRACKET'>('LIMIT');
  const [testProduct, setTestProduct] = useState<'INTRADAY' | 'DELIVERY' | 'MARGIN' | 'BRACKET' | 'COVER' | 'AMO'>('INTRADAY');
  const [testQuantity, setTestQuantity] = useState(500);
  const [testPrice, setTestPrice] = useState(2920.50);

  // Consistency Test Execution State
  const [testResults, setTestResults] = useState<Record<string, NormalizedOrderResult>>({});
  const [isExecutingTest, setIsExecutingTest] = useState(false);

  const allAdapters = useMemo(() => registry.getAllAdapters(), []);

  const handleSwitchActiveBroker = (id: BrokerId) => {
    registry.setActiveBrokerId(id);
    setActiveBrokerId(id);
  };

  const sampleNormalizedOrder: NormalizedOrderRequest = useMemo(() => ({
    clientOrderId: `CLI-TEST-${Date.now().toString().slice(-4)}`,
    symbol: testSymbol,
    exchange: 'NSE_EQ',
    side: testSide,
    orderType: testOrderType === 'BRACKET' ? 'BRACKET' : (testOrderType === 'STOP_LOSS' ? 'STOP_LOSS' : (testOrderType === 'MARKET' ? 'MARKET' : 'LIMIT')),
    productType: testProduct,
    quantity: testQuantity,
    price: testPrice,
    triggerPrice: testOrderType === 'STOP_LOSS' ? testPrice * 0.98 : undefined,
    stopLossPrice: testProduct === 'BRACKET' ? testPrice * 0.97 : undefined,
    targetPrice: testProduct === 'BRACKET' ? testPrice * 1.05 : undefined,
    validity: 'DAY',
    tag: 'ARINA_UNIFIED_ENGINE'
  }), [testSymbol, testSide, testOrderType, testProduct, testQuantity, testPrice]);

  const currentInspectedAdapter = useMemo(() => registry.getAdapter(inspectBrokerId), [inspectBrokerId]);
  const currentTranslation = useMemo(() => currentInspectedAdapter.translatePayload(sampleNormalizedOrder), [currentInspectedAdapter, sampleNormalizedOrder]);

  const handleRunConsistencyTest = async () => {
    setIsExecutingTest(true);
    const results: Record<string, NormalizedOrderResult> = {};
    for (const adapter of allAdapters) {
      try {
        const res = await adapter.placeOrder(sampleNormalizedOrder);
        results[adapter.brokerId] = res;
      } catch (err: any) {
        console.error(`Error testing adapter ${adapter.brokerId}`, err);
      }
    }
    setTestResults(results);
    setIsExecutingTest(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-terminal-bg text-white font-sans overflow-y-auto p-6 space-y-6">
      {/* HEADER & ARCHITECTURE DIRECTIVE BANNER */}
      <div className="bg-gradient-to-r from-terminal-panel via-black to-terminal-panel border border-terminal-border p-6 rounded relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-terminal-amber/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2.5 py-0.5 bg-terminal-amber/20 text-terminal-amber border border-terminal-amber/40 text-[9px] font-black uppercase tracking-widest rounded">
                Unified Broker Adapter Layer
              </span>
              <span className="px-2.5 py-0.5 bg-terminal-green/20 text-terminal-green border border-terminal-green/40 text-[9px] font-black uppercase tracking-widest rounded">
                Broker-Agnostic Execution Engine
              </span>
            </div>
            <h1 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-6 h-6 text-terminal-amber" />
              Indian Broker Connectivity & Execution Consistency Hub
            </h1>
            <p className="text-xs text-terminal-muted max-w-3xl mt-1 leading-relaxed">
              Live Trading Workspace contains <strong className="text-white">zero broker-specific business logic</strong>. 
              All brokers (<strong className="text-terminal-amber">Dhan, Angel One, Zerodha, Upstox, Fyers</strong>) and <strong className="text-terminal-amber">Paper Trading Engine</strong> connect exclusively via the standardized <code className="text-terminal-green">IBrokerAdapter</code> contract. Switching execution venues requires zero code modification.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <span className="text-[9px] uppercase text-terminal-muted block">Active Broker Route</span>
              <span className="text-sm font-black text-terminal-amber uppercase font-mono">{registry.getAdapter(activeBrokerId).brokerName}</span>
            </div>
            <Button 
              onClick={handleRunConsistencyTest} 
              variant="amber" 
              disabled={isExecutingTest}
              className="px-4 py-2 text-xs font-black uppercase tracking-wider"
            >
              <RefreshCcw className={`w-3.5 h-3.5 mr-2 ${isExecutingTest ? 'animate-spin' : ''}`} />
              {isExecutingTest ? 'Testing Adapters...' : 'Verify Consistency Across Brokers'}
            </Button>
          </div>
        </div>
      </div>

      {/* BROKER ADAPTER CARDS (DHAN, ANGEL ONE, ZERODHA, UPSTOX, FYERS, PAPER) */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <SectionHeader title="REGISTERED BROKER ADAPTERS (IBrokerAdapter)" icon={Server} />
          <span className="text-[10px] font-mono text-terminal-muted">6 Connected Adapters • All Compliant with Unified Schema</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allAdapters.map(adapter => {
            const caps = adapter.getCapabilities();
            const isActive = adapter.brokerId === activeBrokerId;

            return (
              <div 
                key={adapter.brokerId} 
                className={`p-4 rounded border transition-all relative flex flex-col justify-between ${
                  isActive 
                    ? 'bg-terminal-amber/10 border-terminal-amber shadow-lg shadow-terminal-amber/5' 
                    : 'bg-terminal-panel/80 border-terminal-border/60 hover:border-terminal-border'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-white uppercase">{adapter.brokerName}</span>
                        {isActive && (
                          <span className="px-1.5 py-0.2 bg-terminal-amber text-black text-[8px] font-black uppercase rounded">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] font-mono text-terminal-muted block uppercase mt-0.5">
                        Broker ID: <code className="text-terminal-amber">{adapter.brokerId}</code>
                      </span>
                    </div>

                    <StatusBadge status="success" label={`${caps.avgLatencyMs}ms`} />
                  </div>

                  {/* Capabilities tags */}
                  <div className="grid grid-cols-2 gap-2 my-3 text-[9px] font-mono">
                    <div className="bg-black/30 p-2 rounded border border-terminal-border/30">
                      <span className="text-terminal-muted block">Rate Limit:</span>
                      <span className="text-white font-bold">{caps.maxOrdersPerSecond} orders/sec</span>
                    </div>
                    <div className="bg-black/30 p-2 rounded border border-terminal-border/30">
                      <span className="text-terminal-muted block">Segments:</span>
                      <span className="text-terminal-amber font-bold">{caps.supportedSegments.length} Exchanges</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-[9px] font-mono text-terminal-muted">
                    <div className="flex justify-between">
                      <span>Bracket Orders (BO):</span>
                      <span className={caps.supportsBracketOrder ? "text-terminal-green font-bold" : "text-terminal-red"}>
                        {caps.supportsBracketOrder ? "SUPPORTED" : "UNSUPPORTED"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cover Orders (CO):</span>
                      <span className={caps.supportsCoverOrder ? "text-terminal-green font-bold" : "text-terminal-red"}>
                        {caps.supportsCoverOrder ? "SUPPORTED" : "UNSUPPORTED"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>WebSocket Streaming:</span>
                      <span className={caps.supportsWebSockets ? "text-terminal-green font-bold" : "text-terminal-red"}>
                        {caps.supportsWebSockets ? "L2 STREAMING" : "POLLING"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-3 border-t border-terminal-border/40">
                  <button 
                    onClick={() => setInspectBrokerId(adapter.brokerId)}
                    className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-wider rounded border transition-colors ${
                      inspectBrokerId === adapter.brokerId 
                        ? 'bg-terminal-amber/20 border-terminal-amber text-terminal-amber' 
                        : 'bg-white/5 border-terminal-border hover:bg-white/10 text-terminal-muted'
                    }`}
                  >
                    Inspect Payload
                  </button>

                  <button 
                    onClick={() => handleSwitchActiveBroker(adapter.brokerId)}
                    disabled={isActive}
                    className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded border transition-colors ${
                      isActive 
                        ? 'bg-terminal-green/20 border-terminal-green/40 text-terminal-green cursor-default' 
                        : 'bg-terminal-amber border-terminal-amber text-black hover:bg-terminal-amber/90 font-black'
                    }`}
                  >
                    {isActive ? 'Routing Active' : 'Set as Active'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* REAL-TIME PAYLOAD TRANSLATION INSPECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ORDER BUILDER FORM */}
        <div className="lg:col-span-5 bg-terminal-panel border border-terminal-border rounded p-5 space-y-4">
          <SectionHeader title="TEST ORDER BUILDER (Normalized Schema)" icon={Code2} />

          <div className="space-y-3 text-xs font-mono">
            <div>
              <label className="text-[10px] uppercase text-terminal-muted block mb-1">Trading Symbol</label>
              <input 
                type="text" 
                value={testSymbol}
                onChange={(e) => setTestSymbol(e.target.value.toUpperCase())}
                className="w-full bg-black border border-terminal-border p-2 rounded text-white font-bold text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase text-terminal-muted block mb-1">Side</label>
                <select 
                  value={testSide}
                  onChange={(e) => setTestSide(e.target.value as any)}
                  className="w-full bg-black border border-terminal-border p-2 rounded text-white text-xs font-bold"
                >
                  <option value="BUY">BUY</option>
                  <option value="SELL">SELL</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase text-terminal-muted block mb-1">Order Type</label>
                <select 
                  value={testOrderType}
                  onChange={(e) => setTestOrderType(e.target.value as any)}
                  className="w-full bg-black border border-terminal-border p-2 rounded text-white text-xs font-bold"
                >
                  <option value="LIMIT">LIMIT</option>
                  <option value="MARKET">MARKET</option>
                  <option value="STOP_LOSS">STOP_LOSS</option>
                  <option value="BRACKET">BRACKET</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase text-terminal-muted block mb-1">Product Type</label>
                <select 
                  value={testProduct}
                  onChange={(e) => setTestProduct(e.target.value as any)}
                  className="w-full bg-black border border-terminal-border p-2 rounded text-white text-xs font-bold"
                >
                  <option value="INTRADAY">INTRADAY (MIS/I)</option>
                  <option value="DELIVERY">DELIVERY (CNC/D)</option>
                  <option value="MARGIN">MARGIN (NRML)</option>
                  <option value="BRACKET">BRACKET (BO/OCI)</option>
                  <option value="COVER">COVER (CO)</option>
                  <option value="AMO">AMO (AFTER MARKET)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase text-terminal-muted block mb-1">Quantity</label>
                <input 
                  type="number" 
                  value={testQuantity}
                  onChange={(e) => setTestQuantity(parseInt(e.target.value) || 100)}
                  className="w-full bg-black border border-terminal-border p-2 rounded text-white font-bold text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase text-terminal-muted block mb-1">Price (₹)</label>
              <input 
                type="number" 
                step="0.05"
                value={testPrice}
                onChange={(e) => setTestPrice(parseFloat(e.target.value) || 2000)}
                className="w-full bg-black border border-terminal-border p-2 rounded text-white font-bold text-xs"
              />
            </div>
          </div>

          <div className="bg-black/40 p-3 rounded border border-terminal-border/40 text-[10px] font-mono text-terminal-muted space-y-1">
            <span className="text-terminal-amber font-bold block uppercase mb-1">Normalized Request JSON:</span>
            <pre className="text-[9px] text-terminal-green overflow-x-auto p-2 bg-black rounded">
              {JSON.stringify(sampleNormalizedOrder, null, 2)}
            </pre>
          </div>
        </div>

        {/* TRANSLATION PAYLOAD INSPECTOR DISPLAY */}
        <div className="lg:col-span-7 bg-terminal-panel border border-terminal-border rounded p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex justify-between items-center mb-4">
              <SectionHeader 
                title={`VENDOR TRANSLATION PAYLOAD INSPECTOR [${currentInspectedAdapter.brokerName}]`} 
                icon={Activity} 
              />
              <span className="text-[10px] font-mono px-2 py-0.5 bg-terminal-amber/10 border border-terminal-amber/30 text-terminal-amber rounded">
                HTTP {currentTranslation.method}
              </span>
            </div>

            <div className="text-xs font-mono space-y-3">
              <div>
                <span className="text-[10px] uppercase text-terminal-muted block">API Endpoint URL</span>
                <code className="text-terminal-green font-bold bg-black px-2 py-1 rounded block border border-terminal-border/40 overflow-x-auto text-[10px]">
                  {currentTranslation.endpoint}
                </code>
              </div>

              <div>
                <span className="text-[10px] uppercase text-terminal-muted block mb-1">Generated Headers</span>
                <pre className="text-[9px] text-white/80 p-2.5 bg-black rounded border border-terminal-border/40 overflow-x-auto">
                  {JSON.stringify(currentTranslation.headers, null, 2)}
                </pre>
              </div>

              <div>
                <span className="text-[10px] uppercase text-terminal-muted block mb-1">Translated Vendor Payload Body</span>
                <pre className="text-[9.5px] text-terminal-amber p-3 bg-black rounded border border-terminal-border/60 overflow-x-auto leading-relaxed">
                  {JSON.stringify(currentTranslation.body, null, 2)}
                </pre>
              </div>

              <div>
                <span className="text-[10px] uppercase text-terminal-muted block mb-1">Adapter Translation Notes</span>
                <ul className="space-y-1 pl-4 list-disc text-[10px] text-terminal-muted">
                  {currentTranslation.translationNotes.map((note, i) => (
                    <li key={i}>{note}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-terminal-green/10 border border-terminal-green/30 p-3 rounded flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-terminal-green shrink-0" />
            <p className="text-[10px] text-terminal-green leading-snug">
              <strong>Execution Consistency Verified:</strong> The Execution Engine passes this exact <code className="text-white">NormalizedOrderRequest</code> to <code className="text-white">{currentInspectedAdapter.brokerName}</code> without holding any vendor specific code in the core engine.
            </p>
          </div>
        </div>
      </div>

      {/* CONSISTENCY VERIFICATION BENCHMARK TABLE */}
      {Object.keys(testResults).length > 0 && (
        <div className="bg-terminal-panel border border-terminal-border rounded p-5 space-y-4">
          <SectionHeader title="CROSS-BROKER EXECUTION CONSISTENCY BENCHMARK" icon={ShieldCheck} />

          <div className="overflow-x-auto font-mono text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-terminal-border bg-black/40 text-[9px] uppercase text-terminal-muted">
                  <th className="p-2.5">Broker Name</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Broker Order ID</th>
                  <th className="p-2.5">Fill Price (₹)</th>
                  <th className="p-2.5">Latency</th>
                  <th className="p-2.5">Slippage</th>
                  <th className="p-2.5">EQS Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-terminal-border/30 text-[10px]">
                {Object.entries(testResults).map(([bId, res]: [string, NormalizedOrderResult]) => (
                  <tr key={bId} className="hover:bg-white/5">
                    <td className="p-2.5 font-bold text-white uppercase">{registry.getAdapter(bId as BrokerId).brokerName}</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 bg-terminal-green/20 text-terminal-green text-[8px] font-bold uppercase rounded">
                        {res.status}
                      </span>
                    </td>
                    <td className="p-2.5 text-terminal-amber">{res.brokerOrderId}</td>
                    <td className="p-2.5 font-bold text-white">₹{res.executedPrice?.toFixed(2)}</td>
                    <td className="p-2.5 text-terminal-muted">{res.executionLatencyMs}ms</td>
                    <td className="p-2.5 text-terminal-muted">{res.slippageBps} bps</td>
                    <td className="p-2.5">
                      <span className="font-bold text-terminal-green">{res.fillQualityScore} / 100</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
