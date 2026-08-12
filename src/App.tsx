import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { 
  Home,
  LayoutDashboard, 
  BarChart2,
  BarChart3, 
  Cpu, 
  ShieldCheck, 
  Terminal, 
  Settings,
  Bell,
  Search,
  Activity,
  Receipt,
  Database,
  Globe,
  Zap,
  Activity as Heartbeat,
  Cpu as AIProcessor,
  Server,
  Cloud,
  Trophy,
  RefreshCcw,
  Rocket,
  Award,
  Wallet,
  Power,
  Landmark, 
  BookOpen, 
  Shield, 
  PieChart, 
  Network, 
  Scale, 
  Users, 
  ShieldAlert, 
  Boxes, 
  HardDrive, 
  Clock,
  FileCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { format } from 'date-fns';
import { WorkspaceShell, WorkspaceType } from './components/WorkspaceShell';
import { LoadingOverlay, ErrorBoundary } from './components/ui/Feedback';

import { HomeWorkspace } from './components/HomeWorkspace';

// Lazy load non-Home workspaces to avoid request burst / HTTP 429 on initial page load
const DashboardWorkspace = React.lazy(() => import('./components/DashboardWorkspace').then(m => ({ default: m.DashboardWorkspace })));
const MarketWorkspace = React.lazy(() => import('./components/MarketWorkspace').then(m => ({ default: m.MarketWorkspace })));
const SchedulerWorkspace = React.lazy(() => import('./components/SchedulerWorkspace').then(m => ({ default: m.SchedulerWorkspace })));
const GatewayWorkspace = React.lazy(() => import('./components/GatewayWorkspace').then(m => ({ default: m.GatewayWorkspace })));
const SecurityWorkspace = React.lazy(() => import('./components/SecurityWorkspace').then(m => ({ default: m.SecurityWorkspace })));
const ReleasesWorkspace = React.lazy(() => import('./components/ReleasesWorkspace').then(m => ({ default: m.ReleasesWorkspace })));
const CertificationWorkspace = React.lazy(() => import('./components/CertificationWorkspace').then(m => ({ default: m.CertificationWorkspace })));
const TradingWorkspace = React.lazy(() => import('./components/TradingWorkspace').then(m => ({ default: m.TradingWorkspace })));
const PaperTradingWorkspace = React.lazy(() => import('./components/PaperTradingWorkspace').then(m => ({ default: m.PaperTradingWorkspace })));
const AIWorkspace = React.lazy(() => import('./components/AIWorkspace').then(m => ({ default: m.AIWorkspace })));
const ResearchWorkspace = React.lazy(() => import('./components/ResearchWorkspace').then(m => ({ default: m.ResearchWorkspace })));
const AnalyticsWorkspace = React.lazy(() => import('./components/AnalyticsWorkspace').then(m => ({ default: m.AnalyticsWorkspace })));
const AIStrategyWorkspace = React.lazy(() => import('./components/AIStrategyWorkspace').then(m => ({ default: m.AIStrategyWorkspace })));
const AdministrationWorkspace = React.lazy(() => import('./components/AdministrationWorkspace').then(m => ({ default: m.AdministrationWorkspace })));
const SettingsWorkspace = React.lazy(() => import('./components/SettingsWorkspace').then(m => ({ default: m.SettingsWorkspace })));
const LeaderboardWorkspace = React.lazy(() => import('./components/LeaderboardWorkspace').then(m => ({ default: m.LeaderboardWorkspace })));
const LifecycleWorkspace = React.lazy(() => import('./components/LifecycleWorkspace').then(m => ({ default: m.LifecycleWorkspace })));
const FundManagerWorkspace = React.lazy(() => import('./components/FundManagerWorkspace').then(m => ({ default: m.FundManagerWorkspace })));
const FinanceWorkspace = React.lazy(() => import('./components/FinanceWorkspace').then(m => ({ default: m.FinanceWorkspace })));
const ControlPlaneWorkspace = React.lazy(() => import('./components/ControlPlaneWorkspace').then(m => ({ default: m.ControlPlaneWorkspace })));
const IntegrationValidationWorkspace = React.lazy(() => import('./components/IntegrationValidationWorkspace').then(m => ({ default: m.IntegrationValidationWorkspace })));
const NotificationsWorkspace = React.lazy(() => import('./components/NotificationsWorkspace').then(m => ({ default: m.NotificationsWorkspace })));
const CommitteeWorkspace = React.lazy(() => import('./components/CommitteeWorkspace'));
const AIIntelligenceWorkspace = React.lazy(() => import('./components/AIIntelligenceWorkspace').then(m => ({ default: m.AIIntelligenceWorkspace })));
const AIMemoryWorkspace = React.lazy(() => import('./components/AIMemoryWorkspace').then(m => ({ default: m.AIMemoryWorkspace })));
const AIExplainabilityWorkspace = React.lazy(() => import('./components/AIExplainabilityWorkspace').then(m => ({ default: m.AIExplainabilityWorkspace })));

import { fetchApi } from './lib/api';
import { useSystemData, useUser } from './hooks/useSystemData';
import { AuthProvider } from './contexts/AuthContext';
import { StrategyProvider } from './contexts/StrategyContext';

export default function App() {
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceType>('HOME');
  const { data, isLoading, refetch } = useSystemData(activeWorkspace, 0); 
  const { data: user } = useUser();

  const {
    portfolio,
    balance,
    positions = [],
    orders = [],
    models = [],
    recommendations = [],
    analytics,
    riskEvents = [],
    researchReports = [],
    researchHistory = [],
    builders = [],
    aiProviders,
    aiHistory = [],
    aiPatterns = [],
    aiMemory = [],
    aiLearning = [],
    aiUsage = [],
    aiHealth,
    brainStatus,
    brainTasks = [],
    leaderboard,
    performanceTests = [],
    performanceBenchmarks = [],
    performanceReports = [],
    funds = [],
    fundAllocations = [],
    fundRecommendations = [],
    fundHistory = [],
    seasons = [],
    tournaments = [],
    matches = [],
    scoreboards = [],
    evolutionProfiles = [],
    evolutionPatterns = [],
    evolutionHistory = [],
    knowledgeNodes = [],
    knowledgeEdges = [],
    knowledgeSnapshots = [],
    collabs = [],
    collabSessions = [],
    health,
    events = [],
    notifications = [],
    trades = []
  } = data || {};

  const systemStatus = health || { status: 'ok' };

  const navItems: { id: WorkspaceType, label: string, icon: any, disabled?: boolean }[] = [
    { id: 'HOME', label: 'Home', icon: Home },
    { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'MARKET', label: 'Market', icon: BarChart2 },
    { id: 'RESEARCH', label: 'Research', icon: BookOpen },
    { id: 'AI', label: 'AI Intelligence', icon: Cpu },
    { id: 'PAPER_TRADING', label: 'Paper Trading', icon: Terminal },
    { id: 'AI_MEMORY', label: 'AI Memory', icon: Database },
    { id: 'STRATEGY', label: 'Strategy', icon: Zap },
    { id: 'TRADING', label: 'Trading', icon: Activity },
    { id: 'FINANCE', label: 'Finance', icon: Landmark },
    { id: 'LIFECYCLE', label: 'AI Lifecycle', icon: RefreshCcw },
    { id: 'ANALYTICS', label: 'Analytics', icon: BarChart3 },
    { id: 'ADMINISTRATION', label: 'Administration', icon: Shield },
    { id: 'CONTROL_PLANE', label: 'Control Plane', icon: Power },
    { id: 'CERTIFICATION', label: 'Certification & QA', icon: Award },
    { id: 'INTEGRATION', label: 'Integration & RC', icon: ShieldCheck },
    { id: 'AI_EXPLAINABILITY', label: 'Explainability OS', icon: FileCheck },
    { id: 'NOTIFICATIONS', label: 'Alerts', icon: Bell },
    { id: 'SETTINGS', label: 'Settings', icon: Settings },
  ];
  
  // (In App component body, update navItems imports)
  // Need to import Trophy and RefreshCcw as well!

  
  
  
  
  
  
  
  
  
  
  
  
  

  if (isLoading && !data) {
    return <LoadingOverlay message="Orchestrating AI ARINA Kernel..." />;
  }

  return (
    <AuthProvider>
      <StrategyProvider>
        <ErrorBoundary>
          <WorkspaceShell
          activeWorkspace={activeWorkspace}
          onWorkspaceChange={setActiveWorkspace}
          navItems={navItems}
          systemStatus={systemStatus}
          portfolio={portfolio}
          balance={balance}
          notificationsCount={notifications.length}
        >
          <ErrorBoundary>
            <Suspense fallback={<LoadingOverlay message="Loading Workspace..." />}>
              {activeWorkspace === 'HOME' && <HomeWorkspace />}
              {activeWorkspace === 'DASHBOARD' && (
                <DashboardWorkspace 
                  events={events} 
                  portfolio={portfolio} 
                  balance={balance} 
                  trades={trades}
                  positions={positions}
                  orders={orders}
                  recommendations={recommendations}
                  models={models}
                  analytics={analytics}
                  riskEvents={riskEvents}
                  systemStatus={systemStatus}
                  notifications={notifications}
                  onNavigate={(ws: any) => setActiveWorkspace(ws)}
                />
              )}
          {activeWorkspace === 'NOTIFICATIONS' && (
            <NotificationsWorkspace onNavigate={(ws: any) => setActiveWorkspace(ws)} />
          )}
          {activeWorkspace === 'MARKET' && <MarketWorkspace recommendations={recommendations} />}

          {activeWorkspace === 'TRADING' && <TradingWorkspace portfolio={portfolio} positions={positions} orders={orders} onRefresh={refetch} />}
          {activeWorkspace === 'PAPER_TRADING' && <PaperTradingWorkspace />}
          {activeWorkspace === 'AI' && <AIIntelligenceWorkspace />}
          {activeWorkspace === 'AI_INTELLIGENCE' && <AIIntelligenceWorkspace />}
          {activeWorkspace === 'RESEARCH' && <ResearchWorkspace reports={researchReports} history={researchHistory} />}
          {activeWorkspace === 'ANALYTICS' && <AnalyticsWorkspace analytics={analytics}
              riskEvents={riskEvents} trades={trades} performanceTests={performanceTests} performanceBenchmarks={performanceBenchmarks} performanceReports={performanceReports} />}
          {activeWorkspace === 'ADMINISTRATION' && <AdministrationWorkspace systemStatus={systemStatus} currentUser={user} />}
          {activeWorkspace === 'STRATEGY' && <AIStrategyWorkspace />}
          {activeWorkspace === 'LEADERBOARD' && <LeaderboardWorkspace leaderboard={leaderboard} tournaments={tournaments} seasons={seasons} matches={matches} scoreboards={scoreboards} models={models} />}
          {activeWorkspace === 'LIFECYCLE' && <LifecycleWorkspace history={evolutionHistory} />}
          {(activeWorkspace === 'FINANCE' || activeWorkspace === 'FUND_MANAGER' || activeWorkspace === 'ACCOUNTING') && (
            <FinanceWorkspace funds={funds} fundAllocations={fundAllocations} fundHistory={fundHistory} balance={balance} trades={trades} onRefresh={refetch} />
          )}
          {activeWorkspace === 'CONTROL_PLANE' && <ControlPlaneWorkspace />}
          {activeWorkspace === 'INTEGRATION' && <IntegrationValidationWorkspace />}
          {activeWorkspace === 'AI_MEMORY' && <AIMemoryWorkspace showToast={() => {}} />}
          {activeWorkspace === 'CONSTITUTION' && (
            <AIWorkspace 
              onRefresh={refetch}
              models={models} 
              recommendations={recommendations}
              providers={aiProviders}
              history={aiHistory}
              patterns={aiPatterns}
              usage={aiUsage}
              health={aiHealth}
              brainStatus={brainStatus}
              brainTasks={brainTasks}
              evolutionProfiles={evolutionProfiles}
              evolutionPatterns={evolutionPatterns}
              evolutionHistory={evolutionHistory}
              knowledgeNodes={knowledgeNodes}
              knowledgeEdges={knowledgeEdges}
              knowledgeSnapshots={knowledgeSnapshots}
              collabs={collabs}
              collabSessions={collabSessions}
              initialTab="CONSTITUTION"
            />
          )}
          {activeWorkspace === 'COMMITTEE' && (
            <AIWorkspace 
              onRefresh={refetch}
              models={models} 
              recommendations={recommendations}
              providers={aiProviders}
              history={aiHistory}
              patterns={aiPatterns}
              usage={aiUsage}
              health={aiHealth}
              brainStatus={brainStatus}
              brainTasks={brainTasks}
              evolutionProfiles={evolutionProfiles}
              evolutionPatterns={evolutionPatterns}
              evolutionHistory={evolutionHistory}
              knowledgeNodes={knowledgeNodes}
              knowledgeEdges={knowledgeEdges}
              knowledgeSnapshots={knowledgeSnapshots}
              collabs={collabs}
              collabSessions={collabSessions}
              initialTab="COMMITTEE"
            />
          )}
          {activeWorkspace === 'EXECUTION' && (
            <AIWorkspace 
              onRefresh={refetch}
              models={models} 
              recommendations={recommendations}
              providers={aiProviders}
              history={aiHistory}
              patterns={aiPatterns}
              usage={aiUsage}
              health={aiHealth}
              brainStatus={brainStatus}
              brainTasks={brainTasks}
              evolutionProfiles={evolutionProfiles}
              evolutionPatterns={evolutionPatterns}
              evolutionHistory={evolutionHistory}
              knowledgeNodes={knowledgeNodes}
              knowledgeEdges={knowledgeEdges}
              knowledgeSnapshots={knowledgeSnapshots}
              collabs={collabs}
              collabSessions={collabSessions}
              initialTab="DECISION_ENGINE"
            />
          )}
          {activeWorkspace === 'QA' && <CertificationWorkspace initialTab="qa" />}
          {activeWorkspace === 'GENESIS' && <AdministrationWorkspace systemStatus={systemStatus} currentUser={user} initialTab="GENESIS" />}
          {activeWorkspace === 'AI_ACTIVATION' && <LifecycleWorkspace history={evolutionHistory} initialTab="ACTIVATION" />}
          {activeWorkspace === 'INDIAN_MARKET' && <MarketWorkspace recommendations={recommendations} initialTab="INDIAN_MARKET" />}
          {activeWorkspace === 'OMS' && <TradingWorkspace portfolio={portfolio} positions={positions} orders={orders} onRefresh={refetch} initialTab="OMS" />}
          {activeWorkspace === 'PMS' && <TradingWorkspace portfolio={portfolio} positions={positions} orders={orders} onRefresh={refetch} initialTab="PMS" />}
          {activeWorkspace === 'RMS' && <TradingWorkspace portfolio={portfolio} positions={positions} orders={orders} onRefresh={refetch} initialTab="RMS" />}
          {activeWorkspace === 'PAPER_EXECUTION' && <PaperTradingWorkspace initialTopMode="PAPER_EXECUTION" />}
          {activeWorkspace === 'TRADE_JOURNAL' && <PaperTradingWorkspace initialTopMode="TRADE_JOURNAL" />}
          {activeWorkspace === 'OPERATIONS' && <AdministrationWorkspace systemStatus={systemStatus} currentUser={user} initialTab="OPERATIONS" />}
          {activeWorkspace === 'REPORTING' && <AnalyticsWorkspace analytics={analytics} riskEvents={riskEvents} trades={trades} performanceTests={performanceTests} performanceBenchmarks={performanceBenchmarks} performanceReports={performanceReports} initialTab="REPORTS" />}
          {activeWorkspace === 'AI_GOVERNANCE' && (
            <AIWorkspace 
              onRefresh={refetch}
              models={models} 
              recommendations={recommendations}
              providers={aiProviders}
              history={aiHistory}
              patterns={aiPatterns}
              usage={aiUsage}
              health={aiHealth}
              brainStatus={brainStatus}
              brainTasks={brainTasks}
              evolutionProfiles={evolutionProfiles}
              evolutionPatterns={evolutionPatterns}
              evolutionHistory={evolutionHistory}
              knowledgeNodes={knowledgeNodes}
              knowledgeEdges={knowledgeEdges}
              knowledgeSnapshots={knowledgeSnapshots}
              collabs={collabs}
              collabSessions={collabSessions}
              initialTab="COMMITTEE"
            />
          )}
          {activeWorkspace === 'COMPLIANCE' && <AdministrationWorkspace systemStatus={systemStatus} currentUser={user} initialTab="COMPLIANCE" />}
          {activeWorkspace === 'OBSERVABILITY' && <ControlPlaneWorkspace initialTab="OBSERVABILITY" />}
          {activeWorkspace === 'BACKUP' && <AdministrationWorkspace systemStatus={systemStatus} currentUser={user} initialTab="BACKUP" />}
          {activeWorkspace === 'SCHEDULER' && <ControlPlaneWorkspace initialTab="SCHEDULER" />}
          {activeWorkspace === 'GATEWAY' && <ControlPlaneWorkspace initialTab="GATEWAY" />}
          {activeWorkspace === 'SECURITY' && <AdministrationWorkspace systemStatus={systemStatus} currentUser={user} initialTab="SECURITY" />}
          {activeWorkspace === 'RELEASES' && <ControlPlaneWorkspace initialTab="RELEASES" />}
          {activeWorkspace === 'CERTIFICATION' && <CertificationWorkspace />}
          {activeWorkspace === 'TREASURY' && <FundManagerWorkspace initialTab="TREASURY" />}
          {activeWorkspace === 'SETTINGS' && <SettingsWorkspace currentUser={user} />}
          {activeWorkspace === 'AI_EXPLAINABILITY' && <AIExplainabilityWorkspace showToast={(msg) => console.log(msg)} />}
            </Suspense>
          </ErrorBoundary>
        </WorkspaceShell>
      </ErrorBoundary>
    </StrategyProvider>
  </AuthProvider>
);
}
