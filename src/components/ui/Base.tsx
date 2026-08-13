import React from 'react';
import { cn } from '../../lib/utils';
import { ErrorBoundary } from './Feedback';
import { format } from 'date-fns';
import { 
  LucideIcon, 
  Menu, 
  Bell, 
  Search, 
  User, 
  ChevronDown, 
  Activity, 
  ShieldCheck, 
  Globe, 
  Wifi, 
  Clock, 
  Terminal,
  Database,
  Zap,
  Server,
  Cpu as AIProcessor,
  Cloud,
  Activity as Heartbeat,
  ArrowUpRight,
  ArrowDownRight,
  Settings
} from 'lucide-react';

// --- Panel & Section Header ---

interface SectionHeaderProps {
  title: string;
  icon?: LucideIcon | React.ReactNode;
  rightElement?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'amber' | 'blue' | 'muted';
}

export const SectionHeader: React.FC<SectionHeaderProps> = React.memo(({ 
  title, 
  icon, 
  rightElement, 
  className,
  variant = 'amber'
}) => {
  const variantStyles = {
    amber: "text-terminal-amber",
    blue: "text-terminal-blue",
    muted: "text-terminal-muted",
    default: "text-white"
  };

  const iconStyles = {
    amber: "text-terminal-amber",
    blue: "text-terminal-blue",
    muted: "text-terminal-muted",
    default: "text-white"
  };

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    if (typeof icon === 'function' || typeof icon === 'object') {
      const IconComponent = icon as any;
      return <IconComponent className={cn("w-3.5 h-3.5", iconStyles[variant])} />;
    }
    return null;
  };

  return (
    <div className={cn("flex items-center justify-between px-3 py-1.5 bg-terminal-panel border-b border-terminal-border shrink-0", className)}>
      <div className="flex items-center gap-2">
        {renderIcon()}
        <h2 className={cn("text-[10px] uppercase font-bold tracking-[0.15em]", variantStyles[variant])}>
          {title}
        </h2>
      </div>
      {rightElement}
    </div>
  );
});

interface PanelProps {
  children: React.ReactNode;
  className?: string;
  headerProps?: SectionHeaderProps;
}

export const Panel: React.FC<PanelProps> = React.memo(({ children, className, headerProps }) => (
  <div className={cn("bg-terminal-panel border border-terminal-border rounded-sm overflow-hidden flex flex-col", className)}>
    {headerProps && <SectionHeader {...headerProps} />}
    <div className="flex-1 overflow-auto relative">
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </div>
  </div>
));

// --- Status Badge & Chip ---

interface StatusProps {
  status: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'muted';
  className?: string;
}

export const StatusBadge: React.FC<StatusProps> = React.memo(({ status, variant = 'info', className }) => {
  const styles = {
    success: "bg-terminal-green/10 text-terminal-green border-terminal-green/20",
    warning: "bg-terminal-amber/10 text-terminal-amber border-terminal-amber/20",
    error: "bg-terminal-red/10 text-terminal-red border-terminal-red/20",
    info: "bg-terminal-blue/10 text-terminal-blue border-terminal-blue/20",
    muted: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  };

  return (
    <span className={cn("px-1.5 py-0.5 rounded-[2px] text-[8px] font-bold border uppercase tracking-wider", styles[variant], className)}>
      {status}
    </span>
  );
});

// --- Workspace Header ---

interface WorkspaceHeaderProps {
  title: string;
  osName?: string;
  kernelVersion?: string;
  status?: 'ok' | 'error' | 'warning';
  className?: string;
}

const TerminalClock = () => {
  const [time, setTime] = React.useState(new Date());
  
  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-[11px] font-mono text-terminal-amber font-bold tabular-nums">
      {format(time, 'HH:mm:ss')}
    </div>
  );
};

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = React.memo(({ 
  title, 
  osName = "ARINA_OS", 
  kernelVersion = "v1.0.4-LTS",
  status = 'ok',
  className,
  onSettingsClick
}) => (
  <header className={cn("h-10 border-b border-terminal-border bg-black/40 flex items-center px-4 shrink-0", className)}>
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-black italic tracking-tighter text-terminal-amber">{osName}</span>
      <span className="text-terminal-muted text-[10px] tracking-widest uppercase font-bold select-none">/ {title}</span>
    </div>

    <div className="ml-auto flex items-center gap-6">
      <div className="flex items-center gap-2">
        <div className={cn(
          "w-1.5 h-1.5 rounded-full animate-pulse",
          status === 'ok' ? "bg-terminal-green" : status === 'warning' ? "bg-terminal-amber" : "bg-terminal-red"
        )} />
        <span className="text-[9px] font-mono text-terminal-muted uppercase">Kernel: <span className="text-white">{kernelVersion}</span></span>
      </div>
      <TerminalClock />
      {onSettingsClick && (
        <button 
          onClick={onSettingsClick}
          className="ml-2 p-1.5 text-terminal-muted hover:text-white rounded hover:bg-white/10 transition-colors"
          title="Workspace Preferences"
        >
          <Settings className="w-4 h-4" />
        </button>
      )}
    </div>
  </header>
));

// --- Global Status Bar ---

export const GlobalSummaryItem = React.memo(({ label, value, color = "text-white" }: { label: string, value: string, color?: string }) => (
  <div className="px-3.5 py-1 border-r border-[#1e293b] last:border-r-0 flex flex-col justify-center min-w-[115px]">
    <span className="text-[8px] uppercase text-slate-400 font-bold tracking-widest leading-tight">{label}</span>
    <span className={cn("text-[11px] font-mono font-bold leading-tight mt-0.5", color)}>{value}</span>
  </div>
));

export const GlobalFooter = React.memo(({ systemStatus }: { systemStatus: any }) => (
  <footer className="h-7 border-t border-terminal-border bg-black shrink-0 flex items-center px-4 gap-6 z-50">
    <div className="flex items-center gap-1.5 min-w-[80px]">
      <Database className="w-3 h-3 text-terminal-muted" />
      <span className="text-[8px] font-bold text-terminal-muted uppercase">DB:</span>
      <span className="text-[8px] font-mono text-terminal-green uppercase">OK</span>
    </div>
    <div className="flex items-center gap-1.5 min-w-[80px]">
      <Globe className="w-3 h-3 text-terminal-muted" />
      <span className="text-[8px] font-bold text-terminal-muted uppercase">API:</span>
      <span className="text-[8px] font-mono text-terminal-green uppercase">CONNECTED</span>
    </div>
    <div className="flex items-center gap-1.5 min-w-[80px]">
      <Zap className="w-3 h-3 text-terminal-blue" />
      <span className="text-[8px] font-bold text-terminal-muted uppercase">WS:</span>
      <span className="text-[8px] font-mono text-terminal-blue uppercase">SYNCED</span>
    </div>
    <div className="flex items-center gap-1.5 min-w-[90px]">
      <Server className="w-3 h-3 text-terminal-muted" />
      <span className="text-[8px] font-bold text-terminal-muted uppercase">SCHEDULER:</span>
      <span className="text-[8px] font-mono text-terminal-green uppercase">ACTIVE</span>
    </div>
    <div className="flex items-center gap-1.5 min-w-[80px]">
      <AIProcessor className="w-3 h-3 text-terminal-muted" />
      <span className="text-[8px] font-bold text-terminal-muted uppercase">AI:</span>
      <span className="text-[8px] font-mono text-terminal-amber uppercase">READY</span>
    </div>
    <div className="flex items-center gap-1.5 min-w-[100px]">
      <Cloud className="w-3 h-3 text-terminal-muted" />
      <span className="text-[8px] font-bold text-terminal-muted uppercase">FEED:</span>
      <span className="text-[8px] font-mono text-terminal-green uppercase">STREAMING</span>
    </div>
    <div className="ml-auto flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Heartbeat className="w-3 h-3 text-terminal-green animate-pulse" />
        <span className="text-[8px] font-bold text-terminal-muted uppercase tracking-widest">Health: <span className="text-terminal-green">OPTIMAL</span></span>
      </div>
      <div className="text-[8px] font-mono text-terminal-muted border-l border-terminal-border pl-4 uppercase">
        NODE_OS_INST_01
      </div>
    </div>
  </footer>
));

// --- Toolbar ---

interface ToolbarProps {
  children: React.ReactNode;
  className?: string;
}

export const Toolbar: React.FC<ToolbarProps> = React.memo(({ children, className }) => (
  <div className={cn("h-10 border-b border-terminal-border bg-black/60 flex items-center px-4 gap-6 shrink-0 overflow-x-auto scrollbar-hide", className)}>
    {children}
  </div>
));

// --- Metric Card ---

interface MetricCardProps {
  label: string;
  value: React.ReactNode;
  subValue?: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
  valueClassName?: string;
  icon?: any;
}

export const MetricCard: React.FC<MetricCardProps> = React.memo(({ label, value, subValue, change, trend, className, valueClassName, icon }) => {
  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    if (typeof icon === 'function' || typeof icon === 'object') {
      const IconComponent = icon as any;
      return <IconComponent className="w-4 h-4 text-terminal-amber" />;
    }
    return null;
  };

  return (
    <div className={cn("p-4 bg-black/40 border border-terminal-border rounded-sm space-y-2", className)}>
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          {renderIcon()}
          <span className="text-[9px] font-bold uppercase tracking-widest text-terminal-muted">{label}</span>
        </div>
        {trend && (
          trend === 'up' ? <ArrowUpRight className="w-3 h-3 text-terminal-green" /> : <ArrowDownRight className="w-3 h-3 text-terminal-red" />
        )}
      </div>
      <div className="flex flex-col">
        <span className={cn("text-xl font-mono font-bold tracking-tight", valueClassName)}>{value}</span>
        {(subValue || change) && <span className="text-[9px] font-mono text-terminal-muted italic">{subValue || change}</span>}
      </div>
    </div>
  );
});
