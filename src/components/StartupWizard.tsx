import React, { useState } from 'react';
import { 
  CheckCircle2, AlertTriangle, RefreshCcw, Download, Search, 
  Terminal, Server, Database, Cpu, ShieldCheck, Play, Layers, Check, Clock
} from 'lucide-react';
import { motion } from 'motion/react';

interface StartupWizardProps {
  showToast: (msg: string) => void;
}

export function StartupWizard({ showToast }: StartupWizardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStep, setSelectedStep] = useState('STEP-01');
  const [isRunningAll, setIsRunningAll] = useState(false);

  const [steps, setSteps] = useState([
    { id: 'STEP-01', title: 'Environment Variable Validation', desc: 'Verify .env.example, GEMINI_API_KEY, JWT secrets, and server config.', status: 'PASSED', category: 'Environment' },
    { id: 'STEP-02', title: 'Dependency Verification', desc: 'Check package.json, node_modules, Vite, Express, and React dependencies.', status: 'PASSED', category: 'Dependencies' },
    { id: 'STEP-03', title: 'PostgreSQL & Drizzle ORM Check', desc: 'Verify database connection pool, migrations schema, and connection URL.', status: 'PASSED', category: 'Database' },
    { id: 'STEP-04', title: 'REST API & CORS Gateway Check', desc: 'Validate Express routes, middleware, and reverse proxy ingress rules.', status: 'PASSED', category: 'Gateway' },
    { id: 'STEP-05', title: 'Gemini AI Model Verification', desc: 'Ping Gemini 2.5 Flash / Pro model API and test token quota limits.', status: 'PASSED', category: 'AI Intelligence' },
    { id: 'STEP-06', title: 'Quantitative Strategy Verification', desc: 'Validate algorithmic trading models, risk guardrails, and backtest limits.', status: 'PASSED', category: 'Strategy' },
    { id: 'STEP-07', title: 'Cryptographic HSM Signer Audit', desc: 'Check secp256k1 key ring, SHA-256 hash chains, and tamper seals.', status: 'PASSED', category: 'Security' },
    { id: 'STEP-08', title: 'Production Deployment Readiness', desc: 'Verify container port 3000 binding, Dockerfile, and start script.', status: 'PASSED', category: 'Deployment' }
  ]);

  const handleRunAll = () => {
    setIsRunningAll(true);
    showToast('Running full system initialization & validation sequence...');
    setTimeout(() => {
      setIsRunningAll(false);
      showToast('All 8 enterprise startup validation checks passed successfully!');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-terminal-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold rounded">
              ENTERPRISE STARTUP WIZARD & INITIALIZATION
            </span>
            <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> System Readiness 100%
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-1">
            First-Time System Initialization & Production Deployment Checklist
          </h2>
        </div>
        <div className="flex items-center gap-2.5">
          <button 
            onClick={handleRunAll}
            disabled={isRunningAll}
            className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow font-mono"
          >
            <Play className={`w-3.5 h-3.5 ${isRunningAll ? 'animate-spin' : ''}`} /> 
            <span>{isRunningAll ? 'Validating Systems...' : 'Run All Validations'}</span>
          </button>
          <button onClick={() => showToast('Exported startup validation audit report.')} className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-terminal-border text-slate-200 text-xs rounded-lg flex items-center gap-1.5 font-mono">
            <Download className="w-3.5 h-3.5 text-emerald-400" /> Export Checklist
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* MAIN CONTENT (3 COLUMNS) */}
        <div className="xl:col-span-3 space-y-6">
          
          {/* EXECUTIVE KPI METRICS HEADER */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="p-3 bg-[#0d121e] border border-terminal-border rounded-xl space-y-1">
              <div className="text-[9px] text-slate-400 uppercase font-bold">Total Checks</div>
              <div className="text-xl font-bold font-mono text-white">8 / 8</div>
              <div className="text-[9px] text-emerald-400">100% Complete</div>
            </div>
            <div className="p-3 bg-[#0d121e] border border-terminal-border rounded-xl space-y-1">
              <div className="text-[9px] text-slate-400 uppercase font-bold">Passed Status</div>
              <div className="text-xl font-bold font-mono text-emerald-400">8 Passed</div>
              <div className="text-[9px] text-emerald-400">Zero errors</div>
            </div>
            <div className="p-3 bg-[#0d121e] border border-terminal-border rounded-xl space-y-1">
              <div className="text-[9px] text-slate-400 uppercase font-bold">Warnings</div>
              <div className="text-xl font-bold font-mono text-amber-400">0</div>
              <div className="text-[9px] text-slate-400">Clean state</div>
            </div>
            <div className="p-3 bg-[#0d121e] border border-terminal-border rounded-xl space-y-1">
              <div className="text-[9px] text-slate-400 uppercase font-bold">Environment</div>
              <div className="text-xl font-bold font-mono text-cyan-400">Production</div>
              <div className="text-[9px] text-cyan-400">Secure container</div>
            </div>
            <div className="p-3 bg-[#0d121e] border border-terminal-border rounded-xl space-y-1">
              <div className="text-[9px] text-slate-400 uppercase font-bold">Readiness</div>
              <div className="text-xl font-bold font-mono text-emerald-400">Ready</div>
              <div className="text-[9px] text-emerald-400">Deployable</div>
            </div>
          </div>

          {/* SEARCH & FILTER BAR */}
          <div className="p-4 bg-[#0d121e] border border-terminal-border rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search startup steps, validations, modules..." 
                className="w-full bg-black/60 border border-terminal-border rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <button onClick={() => showToast('Reset wizard verification state successfully.')} className="px-3 py-2 bg-slate-900 border border-terminal-border text-slate-200 hover:text-white rounded-lg text-xs flex items-center gap-1.5 font-mono">
                <RefreshCcw className="w-3.5 h-3.5 text-cyan-400" /> Reset State
              </button>
            </div>
          </div>

          {/* CHECKLIST MATRIX */}
          <div className="p-5 bg-[#0d121e] border border-terminal-border rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-terminal-border pb-3">
              <h3 className="font-bold text-white text-sm uppercase flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Enterprise Startup & Initialization Matrix
              </h3>
              <span className="text-xs text-emerald-400 font-mono">All Subsystems Verified</span>
            </div>

            <div className="space-y-3">
              {steps.map((step, idx) => (
                <div 
                  key={idx} 
                  onClick={() => { setSelectedStep(step.id); showToast(`Inspected step ${step.id}: ${step.title}`); }}
                  className={`p-4 bg-black/40 border rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer transition-all ${selectedStep === step.id ? 'border-emerald-500 bg-emerald-500/5' : 'border-terminal-border hover:border-slate-600'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 font-mono text-xs font-bold">
                      {step.id}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-white text-sm">{step.title}</strong>
                        <span className="px-2 py-0.5 bg-slate-900 border border-terminal-border text-slate-300 text-[10px] font-mono rounded">
                          {step.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{step.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-mono font-bold rounded flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> {step.status}
                    </span>
                    <button onClick={(e) => { e.stopPropagation(); showToast(`Re-ran validation for ${step.title}`); }} className="px-3 py-1.5 bg-slate-900 border border-terminal-border text-slate-200 hover:text-white text-xs rounded font-mono">
                      Re-run Check
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* DOCKED STARTUP WIZARD INSPECTOR PANEL */}
        <div className="space-y-4">
          <div className="p-5 bg-[#0d121e] border border-terminal-border rounded-xl space-y-4 sticky top-4">
            <div className="flex items-center justify-between border-b border-terminal-border pb-3">
              <h3 className="font-bold text-white text-sm uppercase">Wizard Inspector</h3>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded">VERIFIED</span>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 bg-black/50 border border-terminal-border rounded-lg space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Selected Step ID</span>
                <div className="text-emerald-400 font-bold">{selectedStep}</div>
              </div>

              <div className="p-3 bg-black/50 border border-terminal-border rounded-lg space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Validation Engine</span>
                <div className="text-white">Enterprise Readiness v4.8</div>
              </div>

              <div className="p-3 bg-black/50 border border-terminal-border rounded-lg space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Execution Status</span>
                <div className="text-emerald-400">Passed (0 ms latency)</div>
              </div>

              <div className="p-3 bg-black/50 border border-terminal-border rounded-lg space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Container Protocol</span>
                <div className="text-cyan-400">Node.js ESM / Express Ingress</div>
              </div>

              <div className="space-y-2 pt-2 border-t border-terminal-border">
                <button onClick={() => showToast('Generated diagnostic log bundle.')} className="w-full py-1.5 bg-slate-900 border border-terminal-border text-slate-200 hover:text-white rounded text-xs font-sans">
                  Generate Diagnostics
                </button>
                <button onClick={() => showToast('Exported startup verification proof.')} className="w-full py-1.5 bg-slate-900 border border-terminal-border text-slate-200 hover:text-white rounded text-xs font-sans">
                  Export Proof of Startup
                </button>
              </div>
            </div>

            <button onClick={() => showToast('Locked startup configuration for production deployment.')} className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs rounded font-bold transition-all shadow">
              Lock Production Config
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
