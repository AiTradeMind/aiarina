import React, { useState, useEffect, useMemo } from 'react';
import { 
  Settings as SettingsIcon,
  User,
  Monitor,
  Layout,
  Bell,
  Cpu,
  Activity,
  Shield,
  Save,
  RotateCcw,
  Key,
  Info,
  Server,
  Sliders,
  Check,
  Building,
  Lock,
  Globe,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  Terminal,
  Database,
  Radio
} from 'lucide-react';
import { cn } from '../lib/utils';
import { fetchApi } from '../lib/api';
import { motion, AnimatePresence } from 'motion/react';
import { SectionHeader, Panel, Toolbar } from './ui/Base';
import { SearchBar } from './ui/Table';
import { FormField, Input, Select, Switch } from './ui/Forms';
import { Button } from './ui/Button';
import { ENTERPRISE_AI_MODELS_REGISTRY } from '../data/aiModelsRegistry';
import { BrokerCapabilityRegistry } from '../modules/trading/adapters/BrokerCapabilityRegistry';

export type SettingsWorkspaceTab =
  | 'GENERAL'
  | 'PROFILE'
  | 'APPEARANCE'
  | 'NOTIFICATIONS'
  | 'SECURITY'
  | 'API_KEYS'
  | 'BROKER'
  | 'AI_PROVIDERS'
  | 'MARKET_CONFIGURATION'
  | 'WORKSPACE_PREFERENCES'
  | 'ABOUT';

const WORKSPACE_TABS: { id: SettingsWorkspaceTab; label: string; icon: any }[] = [
  { id: 'GENERAL', label: '1. GENERAL', icon: Sliders },
  { id: 'PROFILE', label: '2. PROFILE', icon: User },
  { id: 'APPEARANCE', label: '3. APPEARANCE', icon: Monitor },
  { id: 'NOTIFICATIONS', label: '4. NOTIFICATIONS', icon: Bell },
  { id: 'SECURITY', label: '5. SECURITY', icon: Shield },
  { id: 'API_KEYS', label: '6. API KEYS', icon: Key },
  { id: 'BROKER', label: '7. BROKER', icon: Server },
  { id: 'AI_PROVIDERS', label: '8. AI PROVIDERS', icon: Cpu },
  { id: 'MARKET_CONFIGURATION', label: '9. MARKET CONFIGURATION', icon: Globe },
  { id: 'WORKSPACE_PREFERENCES', label: '10. WORKSPACE PREFERENCES', icon: Layout },
  { id: 'ABOUT', label: '11. ABOUT', icon: Info },
];

export const SettingsWorkspace = React.memo(({ currentUser }: { currentUser?: any }) => {
  const safeUser = currentUser && !currentUser._isApiError ? currentUser : null;

  const [activeTab, setActiveTab] = useState<SettingsWorkspaceTab>('GENERAL');
  const [saveStatus, setSaveStatus] = useState<'IDLE' | 'SAVING' | 'SAVED'>('IDLE');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingTab, setIsLoadingTab] = useState(false);

  // Initial settings object
  const initialSettings = useMemo(() => ({
    // General
    username: typeof safeUser?.email === 'string' ? safeUser.email.split('@')[0] : 'Institutional_Trader_01',
    email: typeof safeUser?.email === 'string' ? safeUser.email : 'trader@arina-terminal.internal',
    language: 'EN-IN',
    currency: 'INR',
    marketRegion: 'INDIAN_MARKET_V1',
    timezone: 'Asia/Kolkata',

    // Profile
    traderName: 'Arina Lead Strategist',
    traderRole: 'QUANT_RESEARCHER',
    department: 'Quantitative Trading Desk (NSE/BSE/MCX)',
    digitalSignatureKey: 'SIG-ARINA-SEBI-2026-X901',

    // Appearance & Workspace
    theme: 'DARK_BLOOMBERG',
    density: 'HIGH',
    fontSize: 'REGULAR',
    defaultWorkspace: 'DASHBOARD',

    // AI Settings & Providers
    aiModel: 'GEMINI_2.5_PRO',
    aiTemperature: 0.7,
    aiStreaming: true,
    aiSystemPrompt: 'You are an institutional financial analyst and quantitative strategist specializing in Indian financial markets.',
    aiContextWindow: '32768',

    // Broker Settings
    brokerPrimaryConnection: 'NO_CURRENT_LIVE_BROKER',
    brokerRoutingStrategy: 'SMART_ORDER_ROUTING',
    brokerFailoverMode: 'AUTOMATIC',
    brokerApiGatewayEnv: 'SANDBOX',

    // API Keys
    apiGeminiKey: '••••••••••••••••',
    apiBrokerKey: '••••••••••••••••',
    apiBrokerSecret: '••••••••••••••••',
    apiWebhookUrl: 'https://api.arina-terminal.internal/v1/webhooks',
    apiRateQuota: '5000',

    // Notifications
    notificationsEnabled: true,
    notificationsOrderAlerts: true,
    notificationsAiSignals: true,
    notificationsRiskBreaches: true,
    notificationsEmailDigest: 'DAILY',

    // Telegram Gateway Settings
    telegramEnabled: true,
    telegramBotToken: '',
    telegramChatId: '',
    telegramTradingAlerts: true,
    telegramDailySummary: true,
    telegramMuteHoursEnabled: false,
    telegramMuteStart: '22:00',
    telegramMuteEnd: '06:00',

    // Security Settings
    twoFactorEnabled: true,
    securitySessionTimeout: '60',
    securityIpWhitelist: true,
    securityAuditLogLevel: 'VERBOSE',

    // Workspace Preferences
    chartType: 'CANDLESTICK',
    orderTypeDefault: 'LIMIT',
    hotkeysEnabled: true
  }), [safeUser]);

  const [settings, setSettings] = useState(initialSettings);

  const [telegramStatus, setTelegramStatus] = useState<'CONNECTED' | 'DISCONNECTED' | 'VERIFYING' | 'ERROR' | 'NOT_CONFIGURED'>('NOT_CONFIGURED');
  const [telegramBotName, setTelegramBotName] = useState<string | undefined>(undefined);
  const [telegramNotice, setTelegramNotice] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Security Module Canonical States
  const [mfaState, setMfaState] = useState<'NOT_CONFIGURED' | 'CONFIGURED' | 'ENABLED' | 'DISABLED'>('NOT_CONFIGURED');
  const [ipWhitelistStatus, setIpWhitelistStatus] = useState<'NOT_CONFIGURED' | 'DISABLED' | 'ACTIVE'>('NOT_CONFIGURED');
  const [ipWhitelistRanges, setIpWhitelistRanges] = useState<string>('');
  const [overallSecurityStatus, setOverallSecurityStatus] = useState<'CONFIGURED' | 'PARTIALLY_CONFIGURED' | 'NOT_CONFIGURED'>('NOT_CONFIGURED');
  const [securityNotice, setSecurityNotice] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // API Keys Module Canonical States
  const [apiKeyStates, setApiKeyStates] = useState<Record<string, { status: string; maskedValue: string; updatedAt?: string; verifiedAt?: string }>>({
    gemini: { status: 'NOT_CONFIGURED', maskedValue: 'NOT_CONFIGURED' },
    brokerKey: { status: 'NOT_CONFIGURED', maskedValue: 'NOT_CONFIGURED' },
    brokerSecret: { status: 'NOT_CONFIGURED', maskedValue: 'NOT_CONFIGURED' },
    webhook: { status: 'NOT_CONFIGURED', maskedValue: 'NOT_CONFIGURED' }
  });
  const [apiKeyInputs, setApiKeyInputs] = useState<Record<string, string>>({
    gemini: '',
    brokerKey: '',
    brokerSecret: '',
    webhook: ''
  });
  const [apiKeyNotice, setApiKeyNotice] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const fetchApiKeyStates = async () => {
    try {
      const res: any = await fetchApi('/api/settings/apikeys');
      if (res && res.data) {
        setApiKeyStates(res.data);
      }
    } catch (e) {
      console.warn('Failed to fetch API key states', e);
    }
  };

  const handleSaveApiKey = async (type: string) => {
    try {
      const val = apiKeyInputs[type];
      if (!val || !val.trim()) {
        setApiKeyNotice({ type: 'error', message: 'Please enter a valid credential value.' });
        return;
      }
      const res: any = await fetchApi('/api/settings/apikeys', {
        method: 'POST',
        body: JSON.stringify({ type, value: val })
      });
      if (res && res.success) {
        setApiKeyNotice({ type: 'success', message: `${type} credential saved securely.` });
        setApiKeyInputs(s => ({ ...s, [type]: '' }));
        fetchApiKeyStates();
      } else {
        setApiKeyNotice({ type: 'error', message: res.error || 'Failed to save credential.' });
      }
    } catch (e) {
      setApiKeyNotice({ type: 'error', message: 'Failed to save credential.' });
    }
  };

  const handleVerifyApiKey = async (type: string) => {
    try {
      const res: any = await fetchApi('/api/settings/apikeys/verify', {
        method: 'POST',
        body: JSON.stringify({ type })
      });
      if (res && res.success) {
        setApiKeyNotice({ type: 'success', message: `${type} verification status: ${res.data.status}` });
        fetchApiKeyStates();
      }
    } catch (e) {
      setApiKeyNotice({ type: 'error', message: 'Failed to verify credential.' });
    }
  };

  const handleRotateApiKey = async (type: string) => {
    try {
      const res: any = await fetchApi('/api/settings/apikeys/rotate', {
        method: 'POST',
        body: JSON.stringify({ type })
      });
      if (res && res.success) {
        setApiKeyNotice({ type: 'info', message: `${type} credential rotated / reset.` });
        fetchApiKeyStates();
      }
    } catch (e) {
      setApiKeyNotice({ type: 'error', message: 'Failed to rotate credential.' });
    }
  };

  const handleDeleteApiKey = async (type: string) => {
    try {
      const res: any = await fetchApi('/api/settings/apikeys/delete', {
        method: 'POST',
        body: JSON.stringify({ type })
      });
      if (res && res.success) {
        setApiKeyNotice({ type: 'info', message: `${type} credential deleted.` });
        fetchApiKeyStates();
      }
    } catch (e) {
      setApiKeyNotice({ type: 'error', message: 'Failed to delete credential.' });
    }
  };

  // Dynamically resolve broker capability metadata
  const brokerCapabilities = useMemo(() => {
    return BrokerCapabilityRegistry.resolveCapabilities(settings.brokerPrimaryConnection);
  }, [settings.brokerPrimaryConnection]);

  const fetchSecuritySettings = async () => {
    try {
      const res: any = await fetchApi('/api/settings/security');
      if (res && res.data) {
        const data = res.data;
        setSettings(s => ({
          ...s,
          twoFactorEnabled: data.twoFactorEnabled ?? false,
          securitySessionTimeout: String(data.securitySessionTimeout || '60'),
          securityIpWhitelist: data.securityIpWhitelist ?? false,
          securityAuditLogLevel: data.securityAuditLogLevel || 'VERBOSE'
        }));
        setMfaState(data.mfaState || 'NOT_CONFIGURED');
        setIpWhitelistStatus(data.ipWhitelistStatus || 'NOT_CONFIGURED');
        setIpWhitelistRanges(Array.isArray(data.ipWhitelistRanges) ? data.ipWhitelistRanges.join(', ') : '');
        setOverallSecurityStatus(data.overallSecurityStatus || 'NOT_CONFIGURED');
      }
    } catch (e) {
      console.warn('Failed to load security settings', e);
    }
  };

  const updateSecuritySettingsInBackend = async (partial: any) => {
    try {
      const ranges = ipWhitelistRanges.split(',').map(s => s.trim()).filter(Boolean);
      const payload = {
        ...partial,
        ipWhitelistRanges: partial.ipWhitelistRanges !== undefined ? partial.ipWhitelistRanges : ranges
      };
      const res: any = await fetchApi('/api/settings/security', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res && res.data) {
        setMfaState(res.data.mfaState);
        setIpWhitelistStatus(res.data.ipWhitelistStatus);
        setOverallSecurityStatus(res.data.overallSecurityStatus);
      }
    } catch (e) {
      console.warn('Failed to update security settings', e);
    }
  };

  const handleConfigureTotp2FA = async () => {
    try {
      const res: any = await fetchApi('/api/settings/security/mfa/configure', {
        method: 'POST',
        body: JSON.stringify({ totpSecret: 'JBSWY3DPEHPK3PXP' })
      });
      if (res && res.data) {
        setMfaState(res.data.mfaState);
        setSecurityNotice({ type: 'success', message: 'TOTP 2FA secret configured successfully.' });
        fetchSecuritySettings();
      }
    } catch (e) {
      setSecurityNotice({ type: 'error', message: 'Failed to configure TOTP 2FA.' });
    }
  };

  const handleTestLogoutSession = async () => {
    try {
      await fetchApi('/api/settings/security/session/logout', {
        method: 'POST',
        body: JSON.stringify({ sessionId: 'CURRENT_TEST_SESSION' })
      });
      setSecurityNotice({ type: 'info', message: 'Session invalidation triggered. Server verified session termination.' });
    } catch (e) {
      setSecurityNotice({ type: 'error', message: 'Failed to terminate session.' });
    }
  };

  const fetchNotificationSettings = async () => {
    try {
      const res: any = await fetchApi('/api/notifications/settings');
      if (res && res.data && res.data.settings) {
        const data = res.data.settings;
        setSettings(s => ({
          ...s,
          notificationsEnabled: data.globalSystemNotifications ?? data.notificationsEnabled ?? true,
          notificationsOrderAlerts: data.orderExecutionAlerts ?? data.notificationsOrderAlerts ?? true,
          telegramEnabled: data.telegramGatewayEnabled ?? data.telegramEnabled ?? true,
          telegramBotToken: data.maskedBotToken || '',
          telegramChatId: data.telegramTargetChatId || data.chatId || '',
          telegramTradingAlerts: data.tradeAlertsEnabled ?? data.tradingAlertsEnabled ?? true,
          telegramDailySummary: data.dailyTradingSummaryEnabled ?? data.dailySummaryEnabled ?? true,
          telegramMuteHoursEnabled: data.muteHoursEnabled ?? data.muteHours?.enabled ?? false,
          telegramMuteStart: data.muteHoursStart || data.muteHours?.start || '22:00',
          telegramMuteEnd: data.muteHoursEnd || data.muteHours?.end || '06:00',
        }));
        setTelegramStatus(data.connectionStatus || 'NOT_CONFIGURED');
        setTelegramBotName(data.botName);
      }
    } catch (e) {
      console.warn('Failed to load notification settings', e);
    }
  };

  useEffect(() => {
    if (safeUser) {
      setSettings(s => ({
        ...s,
        username: typeof safeUser.email === 'string' ? safeUser.email.split('@')[0] : s.username,
        email: typeof safeUser.email === 'string' ? safeUser.email : s.email
      }));
    }
    fetchNotificationSettings();
    fetchSecuritySettings();
    fetchApiKeyStates();
  }, [safeUser]);

  const handleTabChange = (tab: SettingsWorkspaceTab) => {
    if (tab === activeTab) return;
    setIsLoadingTab(true);
    setActiveTab(tab);
    if (tab === 'NOTIFICATIONS') {
      fetchNotificationSettings();
    }
    if (tab === 'SECURITY') {
      fetchSecuritySettings();
    }
    if (tab === 'API_KEYS') {
      fetchApiKeyStates();
    }
    setTimeout(() => {
      setIsLoadingTab(false);
    }, 80);
  };

  const handleResetDefaults = () => {
    if (confirm('Reset ALL Settings configuration to default values? (Note: This ONLY resets Settings workspace preferences and does NOT modify trades, orders, positions, or research history).')) {
      setSettings(initialSettings);
      alert('Settings workspace configuration reset to defaults.');
    }
  };

  const handleSaveSettings = async () => {
    setSaveStatus('SAVING');
    try {
      await fetchApi('/api/settings/system', {
        method: 'POST',
        body: JSON.stringify({ settings })
      });
      await fetchApi('/api/settings/workspace', {
        method: 'POST',
        body: JSON.stringify({ workspaceId: 'DEFAULT', preferences: { density: settings.density, defaultWorkspace: settings.defaultWorkspace } })
      });
      await fetchApi('/api/notifications/telegram/config', {
        method: 'POST',
        body: JSON.stringify({
          globalSystemNotifications: settings.notificationsEnabled,
          orderExecutionAlerts: settings.notificationsOrderAlerts,
          telegramGatewayEnabled: settings.telegramEnabled,
          telegramBotToken: settings.telegramBotToken,
          telegramTargetChatId: settings.telegramChatId,
          tradeAlertsEnabled: settings.telegramTradingAlerts,
          dailyTradingSummaryEnabled: settings.telegramDailySummary,
          muteHoursEnabled: settings.telegramMuteHoursEnabled,
          muteHoursStart: settings.telegramMuteStart,
          muteHoursEnd: settings.telegramMuteEnd,
        })
      });
      setSaveStatus('SAVED');
      setTimeout(() => setSaveStatus('IDLE'), 2000);
    } catch (error) {
      setSaveStatus('IDLE');
      alert('Failed to save settings');
    }
  };

  // Telegram helper methods
  const handleVerifyTelegram = async () => {
    setTelegramStatus('VERIFYING');
    setTelegramNotice(null);
    try {
      // First update configuration with any new input values
      await fetchApi('/api/notifications/telegram/config', {
        method: 'POST',
        body: JSON.stringify({
          telegramGatewayEnabled: settings.telegramEnabled,
          telegramBotToken: settings.telegramBotToken,
          telegramTargetChatId: settings.telegramChatId,
          tradeAlertsEnabled: settings.telegramTradingAlerts,
          dailyTradingSummaryEnabled: settings.telegramDailySummary,
          muteHoursEnabled: settings.telegramMuteHoursEnabled,
          muteHoursStart: settings.telegramMuteStart,
          muteHoursEnd: settings.telegramMuteEnd,
        })
      });

      const res: any = await fetchApi('/api/notifications/telegram/verify', { method: 'POST' });
      if (res && res.data) {
        if (res.data.settings) {
          setTelegramStatus(res.data.settings.connectionStatus || 'NOT_CONFIGURED');
          setTelegramBotName(res.data.settings.botName);
          if (res.data.settings.maskedBotToken) {
            setSettings(s => ({ ...s, telegramBotToken: res.data.settings.maskedBotToken }));
          }
        }
        if (res.data.verification && res.data.verification.ok) {
          setTelegramNotice({ type: 'success', message: `Telegram Bot Verified Successfully! Bot Name: ${res.data.verification.botName || res.data.settings?.botName || '@ArinaBot'}` });
        } else if (res.data.verification) {
          setTelegramNotice({ type: 'error', message: res.data.verification.description || res.message || 'Verification failed' });
        }
      } else {
        setTelegramStatus('NOT_CONFIGURED');
        setTelegramNotice({ type: 'error', message: res?.message || 'Verification failed' });
      }
    } catch (e: any) {
      setTelegramStatus('ERROR');
      setTelegramNotice({ type: 'error', message: e.message || 'Verification call failed' });
    }
  };

  const handleSendTestTelegram = async () => {
    setTelegramNotice(null);
    try {
      // First update configuration with any new input values
      await fetchApi('/api/notifications/telegram/config', {
        method: 'POST',
        body: JSON.stringify({
          telegramGatewayEnabled: settings.telegramEnabled,
          telegramBotToken: settings.telegramBotToken,
          telegramTargetChatId: settings.telegramChatId,
          tradeAlertsEnabled: settings.telegramTradingAlerts,
          dailyTradingSummaryEnabled: settings.telegramDailySummary,
          muteHoursEnabled: settings.telegramMuteHoursEnabled,
          muteHoursStart: settings.telegramMuteStart,
          muteHoursEnd: settings.telegramMuteEnd,
        })
      });

      const res: any = await fetchApi('/api/notifications/telegram/test', { method: 'POST' });
      if (res && res.status === 'ok') {
        setTelegramNotice({ type: 'success', message: `Test message dispatched successfully to Telegram target!` });
      } else {
        setTelegramNotice({ type: 'error', message: res?.message || 'Failed to dispatch test alert' });
      }
    } catch (e: any) {
      setTelegramNotice({ type: 'error', message: e.message || 'Failed to dispatch test message' });
    }
  };

  const handleDisconnectTelegram = async () => {
    setTelegramNotice(null);
    try {
      const res: any = await fetchApi('/api/notifications/telegram/disconnect', { method: 'POST' });
      if (res && res.data) {
        setTelegramStatus('NOT_CONFIGURED');
        setTelegramBotName(undefined);
        setSettings(s => ({ ...s, telegramBotToken: '', telegramChatId: '' }));
        setTelegramNotice({ type: 'info', message: 'Telegram Gateway Disconnected & Credentials Cleared' });
      }
    } catch (e: any) {
      setTelegramNotice({ type: 'error', message: e.message || 'Failed to disconnect Telegram' });
    }
  };

  const filteredTabs = WORKSPACE_TABS.filter(t =>
    t.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-terminal-bg text-white font-sans selection:bg-terminal-amber/30">
      
      {/* 1. TOP SETTINGS HEADER */}
      <div className="border-b border-terminal-border bg-black/40 px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-terminal-muted tracking-wider uppercase mb-1">
            <span>AI ARINA OS</span>
            <span>/</span>
            <span>SYSTEM & INFRASTRUCTURE</span>
            <span>/</span>
            <span className="text-terminal-amber font-bold">SETTINGS</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold tracking-tight text-white uppercase flex items-center gap-2">
              <SettingsIcon className="w-4 h-4 text-terminal-amber" />
              SYSTEM & WORKSPACE CONFIGURATION
            </h1>
            <span className="px-2 py-0.5 bg-terminal-green/10 border border-terminal-green/30 text-terminal-green text-[9px] font-mono font-bold rounded">
              VERIFIED
            </span>
          </div>
        </div>

        {/* STATUS BADGES & ACTIONS */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-3 font-mono text-[9px] border-r border-terminal-border pr-4 text-terminal-muted">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-terminal-green animate-pulse" />
              <span>ENV: PRODUCTION</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-terminal-blue" />
              <span>API: HEALTHY</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-terminal-amber" />
              <span>SCOPE: INDIA V1</span>
            </div>
          </div>

          <SearchBar 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter Settings..." 
            className="w-44" 
          />

          <Button variant="ghost" size="xs" onClick={handleResetDefaults} className="text-terminal-muted hover:text-white">
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset Defaults
          </Button>

          <Button 
            variant="primary" 
            size="xs" 
            onClick={handleSaveSettings} 
            disabled={saveStatus === 'SAVING'}
            className="bg-terminal-amber text-black hover:bg-terminal-amber/90 font-bold"
          >
            {saveStatus === 'SAVING' ? (
              <RotateCcw className="w-3 h-3 mr-1 animate-spin" />
            ) : saveStatus === 'SAVED' ? (
              <Check className="w-3 h-3 mr-1 text-black" />
            ) : (
              <Save className="w-3 h-3 mr-1" />
            )}
            {saveStatus === 'SAVING' ? 'Saving...' : saveStatus === 'SAVED' ? 'Saved' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* 2. TOP WORKSPACE TAB BAR */}
      <div className="bg-black/60 border-b border-terminal-border flex items-center px-4 overflow-x-auto scrollbar-none shrink-0 gap-1 py-1">
        {filteredTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase font-mono tracking-wider transition-all rounded-t whitespace-nowrap border-b-2 shrink-0",
                isActive 
                  ? "bg-terminal-amber/15 text-terminal-amber border-terminal-amber font-bold shadow-[0_2px_8px_rgba(245,158,11,0.15)]" 
                  : "text-terminal-muted border-transparent hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. MAIN CONTENT AREA + RIGHT INSPECTOR */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* CENTER WORKSPACE FORM CONTENT */}
        <div className="flex-1 flex flex-col overflow-y-auto p-6 bg-black/10">
          <div className="max-w-3xl mx-auto w-full">
            <div className="mb-4 pb-2 border-b border-terminal-border/60 flex items-center justify-between">
              <div>
                <h2 className="text-xs font-mono font-bold text-terminal-amber uppercase tracking-wider flex items-center gap-2">
                  {WORKSPACE_TABS.find(t => t.id === activeTab)?.label} PREFERENCES
                </h2>
                <p className="text-[10px] text-terminal-muted font-sans">
                  Canonical OS configuration parameters for active user session.
                </p>
              </div>
              <span className="text-[9px] font-mono text-terminal-muted italic">
                CONFIG_NODE: {activeTab.toLowerCase()}_v1
              </span>
            </div>

            {isLoadingTab ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <div className="w-6 h-6 border-2 border-terminal-amber border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] uppercase tracking-widest font-mono text-terminal-muted">Loading workspace configuration...</span>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="space-y-4"
                >
                  {/* WORKSPACE 1: GENERAL */}
                  {activeTab === 'GENERAL' && (
                    <div className="space-y-4">
                      <FormField label="User Identity" description="Internal platform identifier for audit trails and session tracking.">
                        <Input value={settings.username} onChange={(e) => setSettings({ ...settings, username: e.target.value })} />
                      </FormField>
                      <FormField label="Primary Email" description="Used for security alerts and critical market notifications.">
                        <Input value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} />
                      </FormField>
                      <FormField label="System Language" description="Preferred locale for data formatting, numbers, and labels.">
                        <Select 
                          value={settings.language} 
                          onChange={(val) => setSettings({ ...settings, language: val })} 
                          options={[
                            { label: 'English (India) — EN-IN', value: 'EN-IN' },
                          ]}
                        />
                      </FormField>
                      <FormField label="Base Currency" description="Reporting currency for accounting and position valuation.">
                        <Select 
                          value={settings.currency} 
                          onChange={(val) => setSettings({ ...settings, currency: val })} 
                          options={[
                            { label: 'INR — Indian Rupee (₹)', value: 'INR' },
                          ]}
                        />
                      </FormField>
                      <FormField label="Market Region Scope" description="Active financial market scope for AI ARINA V1.">
                        <Select 
                          value={settings.marketRegion} 
                          onChange={(val) => setSettings({ ...settings, marketRegion: val })} 
                          options={[
                            { label: 'INDIAN MARKET — V1 (NSE / BSE / MCX)', value: 'INDIAN_MARKET_V1' },
                          ]}
                        />
                      </FormField>
                      <FormField label="Primary Timezone" description="Market session alignment for exchange schedules.">
                        <Select 
                          value={settings.timezone} 
                          onChange={(val) => setSettings({ ...settings, timezone: val })} 
                          options={[
                            { label: 'Asia/Kolkata (IST — UTC+5:30)', value: 'Asia/Kolkata' },
                          ]}
                        />
                      </FormField>
                    </div>
                  )}

                  {/* WORKSPACE 2: PROFILE */}
                  {activeTab === 'PROFILE' && (
                    <div className="space-y-4">
                      <FormField label="Trader Name / Handle" description="Formal display name associated with algorithmic trades.">
                        <Input value={settings.traderName} onChange={(e) => setSettings({ ...settings, traderName: e.target.value })} />
                      </FormField>
                      <FormField label="Institutional Role" description="Role authorization for execution engines and risk overrides.">
                        <Select 
                          value={settings.traderRole} 
                          onChange={(val) => setSettings({ ...settings, traderRole: val })} 
                          options={[
                            { label: 'Quantitative Researcher & Developer', value: 'QUANT_RESEARCHER' },
                            { label: 'Portfolio Manager & Desk Lead', value: 'FUND_MANAGER' },
                            { label: 'Risk & Compliance Officer', value: 'RISK_OFFICER' },
                            { label: 'Automated Execution Engine', value: 'EXECUTION_ENGINE' },
                          ]}
                        />
                      </FormField>
                      <FormField label="Trading Desk / Organization" description="Organizational desk for multi-portfolio ledger accounting.">
                        <Input value={settings.department} onChange={(e) => setSettings({ ...settings, department: e.target.value })} />
                      </FormField>
                      <FormField label="Digital Compliance Key" description="Cryptographic digital signature appended to strategy deployments.">
                        <Input value={settings.digitalSignatureKey} disabled className="bg-black/50 text-terminal-amber font-mono" />
                      </FormField>
                    </div>
                  )}

                  {/* WORKSPACE 3: APPEARANCE */}
                  {activeTab === 'APPEARANCE' && (
                    <div className="space-y-4">
                      <FormField label="Terminal Color Palette" description="High-contrast visual environment designed for extended operational sessions.">
                        <Select 
                          value={settings.theme} 
                          onChange={(val) => setSettings({ ...settings, theme: val })} 
                          options={[
                            { label: 'Dark Bloomberg Terminal (Default)', value: 'DARK_BLOOMBERG' },
                            { label: 'Terminal High Contrast Dark', value: 'HIGH_CONTRAST' },
                          ]}
                        />
                      </FormField>
                      <FormField label="Grid Information Density" description="Controls padding and row height across data tables and order books.">
                        <Select 
                          value={settings.density} 
                          onChange={(val) => setSettings({ ...settings, density: val })} 
                          options={[
                            { label: 'High Density (Institutional Grid)', value: 'HIGH' },
                            { label: 'Medium Density (Standard Operational)', value: 'MEDIUM' },
                            { label: 'Compact Throughput', value: 'COMPACT' },
                          ]}
                        />
                      </FormField>
                      <FormField label="Monospace Font Size" description="Global font size scale for metrics, quotes, and log feeds.">
                        <Select 
                          value={settings.fontSize} 
                          onChange={(val) => setSettings({ ...settings, fontSize: val })} 
                          options={[
                            { label: 'Regular Monospace (11px)', value: 'REGULAR' },
                            { label: 'Compact Dense (10px)', value: 'COMPACT' },
                            { label: 'Large Readable (12px)', value: 'LARGE' },
                          ]}
                        />
                      </FormField>
                    </div>
                  )}

                  {/* WORKSPACE 4: NOTIFICATIONS */}
                  {activeTab === 'NOTIFICATIONS' && (
                    <div className="space-y-4">
                      <FormField label="Global System Notifications" description="Master switch for internal toast alerts and audio notifications.">
                        <Switch checked={settings.notificationsEnabled} onChange={(val) => setSettings({ ...settings, notificationsEnabled: val })} />
                      </FormField>
                      <FormField label="Order Execution Alerts" description="Notify immediately when buy/sell orders complete or cancel.">
                        <Switch checked={settings.notificationsOrderAlerts} onChange={(val) => setSettings({ ...settings, notificationsOrderAlerts: val })} />
                      </FormField>

                      <div className="pt-4 border-t border-[#1e293b] mt-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Bell className="w-4 h-4 text-terminal-amber" />
                          <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Enterprise Telegram Notification Gateway</h4>
                          {telegramStatus === 'CONNECTED' && (
                            <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[9px] px-2 py-0.5 font-mono font-bold rounded flex items-center gap-1">
                              <Check className="w-3 h-3" /> CONNECTED {telegramBotName ? `(${telegramBotName})` : ''}
                            </span>
                          )}
                          {telegramStatus === 'VERIFYING' && (
                            <span className="bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[9px] px-2 py-0.5 font-mono font-bold rounded animate-pulse">
                              VERIFYING...
                            </span>
                          )}
                          {telegramStatus === 'INVALID_TOKEN' && (
                            <span className="bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[9px] px-2 py-0.5 font-mono font-bold rounded">
                              INVALID TOKEN
                            </span>
                          )}
                          {telegramStatus === 'ERROR' && (
                            <span className="bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[9px] px-2 py-0.5 font-mono font-bold rounded">
                              CONNECTION ERROR
                            </span>
                          )}
                          {telegramStatus === 'NOT_CONFIGURED' && (
                            <span className="bg-slate-500/15 text-slate-400 border border-slate-500/30 text-[9px] px-2 py-0.5 font-mono font-bold rounded">
                              NOT CONFIGURED
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 mb-4 font-sans leading-relaxed">
                          Telegram is an external notification channel (NOT a trading interface). Only Trade Alerts & Daily Summaries are dispatched over Telegram. All internal AI models, strategy logic, stop loss, and risk parameters are strictly stripped.
                        </p>

                        <div className="space-y-4 bg-[#060810] p-3 border border-[#1e293b] rounded-sm">
                          <FormField label="Enable Telegram Gateway" description="Activate background Telegram Bot API dispatch.">
                            <Switch checked={settings.telegramEnabled} onChange={(val) => setSettings({ ...settings, telegramEnabled: val })} />
                          </FormField>
                          
                          <FormField label="Telegram Bot Token" description="Stored securely in backend environment. Masked on frontend.">
                            <Input 
                              type="password" 
                              value={settings.telegramBotToken} 
                              onChange={(e) => setSettings({ ...settings, telegramBotToken: e.target.value })} 
                              placeholder="7891234560:AAFx..."
                            />
                          </FormField>

                          <FormField label="Target Chat ID / Channel" description="Telegram Chat ID or public channel username (e.g., -100987654321).">
                            <Input 
                              value={settings.telegramChatId} 
                              onChange={(e) => setSettings({ ...settings, telegramChatId: e.target.value })} 
                              placeholder="-100987654321"
                            />
                          </FormField>

                          <FormField label="Trade Alerts Channel" description="Dispatch BUY/SELL/EXIT/REJECTED executions over Telegram.">
                            <Switch checked={settings.telegramTradingAlerts} onChange={(val) => setSettings({ ...settings, telegramTradingAlerts: val })} />
                          </FormField>

                          <FormField label="Daily Trading Summary" description="Send automated performance report once daily after Market Close.">
                            <Switch checked={settings.telegramDailySummary} onChange={(val) => setSettings({ ...settings, telegramDailySummary: val })} />
                          </FormField>

                          <FormField label="Mute Hours" description="Suppress Telegram dispatches during configured off-market hours.">
                            <div className="flex items-center gap-3 w-full">
                              <Switch checked={settings.telegramMuteHoursEnabled} onChange={(val) => setSettings({ ...settings, telegramMuteHoursEnabled: val })} />
                              {settings.telegramMuteHoursEnabled && (
                                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-300">
                                  <span>Start:</span>
                                  <input 
                                    type="time" 
                                    value={settings.telegramMuteStart} 
                                    onChange={(e) => setSettings({ ...settings, telegramMuteStart: e.target.value })}
                                    className="bg-[#0b0f19] border border-[#1e293b] text-white px-2 py-1 rounded text-[10px]"
                                  />
                                  <span>End:</span>
                                  <input 
                                    type="time" 
                                    value={settings.telegramMuteEnd} 
                                    onChange={(e) => setSettings({ ...settings, telegramMuteEnd: e.target.value })}
                                    className="bg-[#0b0f19] border border-[#1e293b] text-white px-2 py-1 rounded text-[10px]"
                                  />
                                </div>
                              )}
                            </div>
                          </FormField>

                          {/* Notice Banner */}
                          {telegramNotice && (
                            <div className={cn(
                              "p-2.5 rounded text-[11px] font-mono flex items-center gap-2 border",
                              telegramNotice.type === 'success' && "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
                              telegramNotice.type === 'error' && "bg-rose-500/10 border-rose-500/30 text-rose-400",
                              telegramNotice.type === 'info' && "bg-blue-500/10 border-blue-500/30 text-blue-400"
                            )}>
                              <Info className="w-4 h-4 shrink-0" />
                              <span>{telegramNotice.message}</span>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="pt-3 border-t border-[#1e293b] flex flex-wrap gap-2">
                            <Button variant="secondary" size="xs" onClick={handleVerifyTelegram} disabled={telegramStatus === 'VERIFYING'}>
                              Verify Bot Token
                            </Button>
                            <Button variant="secondary" size="xs" onClick={handleSendTestTelegram}>
                              Dispatch Test Alert
                            </Button>
                            <Button variant="ghost" size="xs" onClick={handleDisconnectTelegram} className="text-rose-400 hover:text-rose-300">
                              Disconnect
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* WORKSPACE 5: SECURITY */}
                  {activeTab === 'SECURITY' && (
                    <div className="space-y-5">
                      {securityNotice && (
                        <div className={cn(
                          "p-3 rounded text-xs font-mono flex justify-between items-center",
                          securityNotice.type === 'success' ? "bg-terminal-green/10 border border-terminal-green/40 text-terminal-green" :
                          securityNotice.type === 'error' ? "bg-rose-500/10 border border-rose-500/40 text-rose-400" :
                          "bg-terminal-blue/10 border border-terminal-blue/40 text-terminal-blue"
                        )}>
                          <span>{securityNotice.message}</span>
                          <button onClick={() => setSecurityNotice(null)} className="text-terminal-muted hover:text-white font-bold ml-2">×</button>
                        </div>
                      )}

                      {/* OVERALL SECURITY STATUS HEADER CARD */}
                      <div className="p-3 bg-black/60 border border-terminal-border rounded-sm flex items-center justify-between font-mono text-xs">
                        <div>
                          <div className="text-terminal-muted uppercase text-[10px]">Security Infrastructure Policy Enforcement</div>
                          <div className="text-white font-bold text-sm flex items-center gap-2 mt-0.5">
                            <Shield className="w-4 h-4 text-terminal-amber" />
                            <span>SECURITY POLICY ENGINE</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={cn(
                            "px-2 py-1 rounded text-[10px] font-bold border uppercase tracking-wider",
                            overallSecurityStatus === 'CONFIGURED' 
                              ? "bg-terminal-green/20 text-terminal-green border-terminal-green/40"
                              : overallSecurityStatus === 'PARTIALLY_CONFIGURED'
                              ? "bg-terminal-amber/20 text-terminal-amber border-terminal-amber/40"
                              : "bg-rose-500/20 text-rose-400 border-rose-500/40"
                          )}>
                            {overallSecurityStatus}
                          </span>
                        </div>
                      </div>

                      {/* 1. TWO-FACTOR AUTHENTICATION */}
                      <div className="p-4 bg-black/40 border border-terminal-border rounded-sm space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
                              <span>Two-Factor Authentication (TOTP 2FA)</span>
                              <span className={cn(
                                "px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase",
                                mfaState === 'ENABLED' ? "bg-terminal-green/20 text-terminal-green border-terminal-green/40" :
                                mfaState === 'CONFIGURED' ? "bg-terminal-blue/20 text-terminal-blue border-terminal-blue/40" :
                                mfaState === 'DISABLED' ? "bg-amber-500/20 text-amber-400 border-amber-500/40" :
                                "bg-zinc-800 text-zinc-400 border-zinc-700"
                              )}>
                                {mfaState}
                              </span>
                            </div>
                            <p className="text-[10px] text-terminal-muted mt-1 font-sans">
                              Require TOTP multi-factor verification upon session launch. Active enforcement requires a configured TOTP secret.
                            </p>
                          </div>
                          <Switch 
                            checked={settings.twoFactorEnabled} 
                            onChange={(val) => {
                              const newMfaState = val ? (mfaState === 'NOT_CONFIGURED' ? 'CONFIGURED' : 'ENABLED') : (mfaState === 'NOT_CONFIGURED' ? 'NOT_CONFIGURED' : 'DISABLED');
                              setSettings({ ...settings, twoFactorEnabled: val });
                              updateSecuritySettingsInBackend({ twoFactorEnabled: val, mfaState: newMfaState });
                            }} 
                          />
                        </div>

                        {mfaState === 'NOT_CONFIGURED' && (
                          <div className="p-2.5 bg-black/60 border border-terminal-border rounded text-[10px] font-mono flex items-center justify-between">
                            <span className="text-terminal-amber">TOTP Authenticator is not yet configured for this account.</span>
                            <Button variant="outline" size="xs" onClick={handleConfigureTotp2FA} className="text-terminal-amber border-terminal-amber/40">
                              Configure TOTP Secret
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* 2. SESSION INACTIVITY TIMEOUT */}
                      <div className="p-4 bg-black/40 border border-terminal-border rounded-sm space-y-3">
                        <FormField label="Session Inactivity Timeout" description="Server-side session activity enforcement. Sessions automatically expire after specified minutes of inactivity.">
                          <Select 
                            value={settings.securitySessionTimeout} 
                            onChange={(val) => {
                              setSettings({ ...settings, securitySessionTimeout: val });
                              updateSecuritySettingsInBackend({ securitySessionTimeout: val });
                            }} 
                            options={[
                              { label: '15 Minutes (High Security)', value: '15' },
                              { label: '30 Minutes', value: '30' },
                              { label: '60 Minutes (Standard)', value: '60' },
                              { label: '120 Minutes', value: '120' },
                            ]}
                          />
                        </FormField>
                        <div className="flex justify-between items-center pt-1 border-t border-terminal-border/40 text-[10px] font-mono">
                          <span className="text-terminal-muted">Server-Side Inactivity Enforcement: ACTIVE ({settings.securitySessionTimeout}m timeout)</span>
                          <Button variant="ghost" size="xs" onClick={handleTestLogoutSession} className="text-rose-400 hover:text-rose-300">
                            Invalidate Session & Test Logout
                          </Button>
                        </div>
                      </div>

                      {/* 3. IP WHITELIST ENFORCER */}
                      <div className="p-4 bg-black/40 border border-terminal-border rounded-sm space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
                              <span>IP Whitelist Enforcer</span>
                              <span className={cn(
                                "px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase",
                                ipWhitelistStatus === 'ACTIVE' ? "bg-terminal-green/20 text-terminal-green border-terminal-green/40" :
                                ipWhitelistStatus === 'DISABLED' ? "bg-zinc-800 text-zinc-400 border-zinc-700" :
                                "bg-amber-500/20 text-amber-400 border-amber-500/40"
                              )}>
                                {ipWhitelistStatus}
                              </span>
                            </div>
                            <p className="text-[10px] text-terminal-muted mt-1 font-sans">
                              Restrict API execution strictly to Whitelisted CIDRs. Displays NOT_CONFIGURED when no IP ranges are specified.
                            </p>
                          </div>
                          <Switch 
                            checked={settings.securityIpWhitelist} 
                            onChange={(val) => {
                              setSettings({ ...settings, securityIpWhitelist: val });
                              updateSecuritySettingsInBackend({ securityIpWhitelist: val });
                            }} 
                          />
                        </div>

                        {settings.securityIpWhitelist && (
                          <div className="space-y-2 pt-2 border-t border-terminal-border/40">
                            <FormField label="Permitted Whitelist CIDRs / IP Addresses" description="Comma-separated list of allowed IPs or CIDR subnets (e.g., 127.0.0.1, 10.0.0.0/8).">
                              <Input 
                                value={ipWhitelistRanges} 
                                onChange={(e) => {
                                  setIpWhitelistRanges(e.target.value);
                                  const ranges = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                  updateSecuritySettingsInBackend({ ipWhitelistRanges: ranges });
                                }}
                                placeholder="e.g. 127.0.0.1, 192.168.1.0/24" 
                              />
                            </FormField>
                          </div>
                        )}
                      </div>

                      {/* 4. AUDIT LOG DETAIL LEVEL */}
                      <div className="p-4 bg-black/40 border border-terminal-border rounded-sm space-y-3">
                        <FormField label="Audit Log Detail Level" description="Verbosity level for cryptographically signed security audit logs. Sensitive secrets are automatically redacted.">
                          <Select 
                            value={settings.securityAuditLogLevel} 
                            onChange={(val) => {
                              setSettings({ ...settings, securityAuditLogLevel: val });
                              updateSecuritySettingsInBackend({ securityAuditLogLevel: val });
                            }} 
                            options={[
                              { label: 'Verbose (All Events & API Signatures)', value: 'VERBOSE' },
                              { label: 'Standard (Trades & System Errors)', value: 'STANDARD' },
                              { label: 'Critical Only (Security Violations)', value: 'CRITICAL_ONLY' },
                            ]}
                          />
                        </FormField>
                        <div className="p-2 bg-black/60 border border-terminal-border rounded text-[9px] font-mono text-terminal-muted">
                          AUTOMATIC SECRET REDACTION GUARANTEE: API keys, broker secrets, passwords, TOTP secrets, Telegram bot tokens, and session tokens are strictly masked in all audit logs.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* WORKSPACE 6: API KEYS */}
                  {activeTab === 'API_KEYS' && (
                    <div className="space-y-5">
                      {apiKeyNotice && (
                        <div className={cn(
                          "p-3 rounded text-xs font-mono flex justify-between items-center",
                          apiKeyNotice.type === 'success' ? "bg-terminal-green/10 border border-terminal-green/40 text-terminal-green" :
                          apiKeyNotice.type === 'error' ? "bg-rose-500/10 border border-rose-500/40 text-rose-400" :
                          "bg-terminal-blue/10 border border-terminal-blue/40 text-terminal-blue"
                        )}>
                          <span>{apiKeyNotice.message}</span>
                          <button onClick={() => setApiKeyNotice(null)} className="text-terminal-muted hover:text-white font-bold ml-2">×</button>
                        </div>
                      )}

                      <div className="p-3 bg-black/60 border border-terminal-border rounded-sm space-y-1 font-mono text-xs">
                        <div className="text-terminal-muted uppercase text-[10px]">Secure Credential Vault Policy</div>
                        <div className="text-white font-bold text-sm flex items-center gap-2">
                          <Shield className="w-4 h-4 text-terminal-cyan" />
                          <span>CREDENTIAL MASKING & SECURITY ENFORCEMENT</span>
                        </div>
                        <p className="text-[10px] text-terminal-muted font-sans pt-1">
                          Secrets are never stored in plaintext state or exposed via GET endpoints. Adding broker credentials does NOT alter Paper Trading, Chart A, Chart B, or activate live broker execution.
                        </p>
                      </div>

                      {/* 1. GEMINI AI API KEY */}
                      <div className="p-4 bg-black/40 border border-terminal-border rounded-sm space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
                              <span>Gemini AI API Key</span>
                              <span className={cn(
                                "px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase",
                                apiKeyStates.gemini.status === 'VERIFIED' ? "bg-terminal-green/20 text-terminal-green border-terminal-green/40" :
                                apiKeyStates.gemini.status === 'CONFIGURED' ? "bg-terminal-blue/20 text-terminal-blue border-terminal-blue/40" :
                                apiKeyStates.gemini.status === 'INVALID' ? "bg-rose-500/20 text-rose-400 border-rose-500/40" :
                                "bg-zinc-800 text-zinc-400 border-zinc-700"
                              )}>
                                {apiKeyStates.gemini.status}
                              </span>
                            </div>
                            <p className="text-[10px] text-terminal-muted mt-1 font-sans">
                              Masked Value: <code className="text-white font-mono">{apiKeyStates.gemini.maskedValue}</code>
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="xs" onClick={() => handleVerifyApiKey('gemini')} className="text-terminal-cyan border-terminal-cyan/40">Verify</Button>
                            <Button variant="outline" size="xs" onClick={() => handleRotateApiKey('gemini')} className="text-terminal-amber border-terminal-amber/40">Rotate</Button>
                            <Button variant="ghost" size="xs" onClick={() => handleDeleteApiKey('gemini')} className="text-rose-400">Delete</Button>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2 border-t border-terminal-border/40">
                          <Input 
                            type="password"
                            placeholder="Enter new Gemini API Key..."
                            value={apiKeyInputs.gemini}
                            onChange={(e) => setApiKeyInputs({ ...apiKeyInputs, gemini: e.target.value })}
                          />
                          <Button size="sm" onClick={() => handleSaveApiKey('gemini')}>Save</Button>
                        </div>
                      </div>

                      {/* 2. PRIMARY BROKER API KEY */}
                      <div className="p-4 bg-black/40 border border-terminal-border rounded-sm space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
                              <span>Primary Broker API Key</span>
                              <span className={cn(
                                "px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase",
                                apiKeyStates.brokerKey.status === 'VERIFIED' ? "bg-terminal-green/20 text-terminal-green border-terminal-green/40" :
                                apiKeyStates.brokerKey.status === 'CONFIGURED' ? "bg-terminal-blue/20 text-terminal-blue border-terminal-blue/40" :
                                apiKeyStates.brokerKey.status === 'INVALID' ? "bg-rose-500/20 text-rose-400 border-rose-500/40" :
                                "bg-zinc-800 text-zinc-400 border-zinc-700"
                              )}>
                                {apiKeyStates.brokerKey.status}
                              </span>
                            </div>
                            <p className="text-[10px] text-terminal-muted mt-1 font-sans">
                              Masked Value: <code className="text-white font-mono">{apiKeyStates.brokerKey.maskedValue}</code>
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="xs" onClick={() => handleVerifyApiKey('brokerKey')} className="text-terminal-cyan border-terminal-cyan/40">Verify</Button>
                            <Button variant="outline" size="xs" onClick={() => handleRotateApiKey('brokerKey')} className="text-terminal-amber border-terminal-amber/40">Rotate</Button>
                            <Button variant="ghost" size="xs" onClick={() => handleDeleteApiKey('brokerKey')} className="text-rose-400">Delete</Button>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2 border-t border-terminal-border/40">
                          <Input 
                            type="password"
                            placeholder="Enter Primary Broker API Key..."
                            value={apiKeyInputs.brokerKey}
                            onChange={(e) => setApiKeyInputs({ ...apiKeyInputs, brokerKey: e.target.value })}
                          />
                          <Button size="sm" onClick={() => handleSaveApiKey('brokerKey')}>Save</Button>
                        </div>
                      </div>

                      {/* 3. PRIMARY BROKER SECRET */}
                      <div className="p-4 bg-black/40 border border-terminal-border rounded-sm space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
                              <span>Primary Broker Secret</span>
                              <span className={cn(
                                "px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase",
                                apiKeyStates.brokerSecret.status === 'VERIFIED' ? "bg-terminal-green/20 text-terminal-green border-terminal-green/40" :
                                apiKeyStates.brokerSecret.status === 'CONFIGURED' ? "bg-terminal-blue/20 text-terminal-blue border-terminal-blue/40" :
                                apiKeyStates.brokerSecret.status === 'INVALID' ? "bg-rose-500/20 text-rose-400 border-rose-500/40" :
                                "bg-zinc-800 text-zinc-400 border-zinc-700"
                              )}>
                                {apiKeyStates.brokerSecret.status}
                              </span>
                            </div>
                            <p className="text-[10px] text-terminal-muted mt-1 font-sans">
                              High-sensitivity secret key. Never returned in GET responses after save.
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="xs" onClick={() => handleVerifyApiKey('brokerSecret')} className="text-terminal-cyan border-terminal-cyan/40">Verify</Button>
                            <Button variant="outline" size="xs" onClick={() => handleRotateApiKey('brokerSecret')} className="text-terminal-amber border-terminal-amber/40">Rotate</Button>
                            <Button variant="ghost" size="xs" onClick={() => handleDeleteApiKey('brokerSecret')} className="text-rose-400">Delete</Button>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2 border-t border-terminal-border/40">
                          <Input 
                            type="password"
                            placeholder="Enter Primary Broker Secret..."
                            value={apiKeyInputs.brokerSecret}
                            onChange={(e) => setApiKeyInputs({ ...apiKeyInputs, brokerSecret: e.target.value })}
                          />
                          <Button size="sm" onClick={() => handleSaveApiKey('brokerSecret')}>Save</Button>
                        </div>
                      </div>

                      {/* 4. WEBHOOK ALERT ENDPOINT */}
                      <div className="p-4 bg-black/40 border border-terminal-border rounded-sm space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
                              <span>Webhook Alert Endpoint (SSRF Protected)</span>
                              <span className={cn(
                                "px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase",
                                apiKeyStates.webhook.status === 'VERIFIED' ? "bg-terminal-green/20 text-terminal-green border-terminal-green/40" :
                                apiKeyStates.webhook.status === 'CONFIGURED' ? "bg-terminal-blue/20 text-terminal-blue border-terminal-blue/40" :
                                apiKeyStates.webhook.status === 'INVALID' ? "bg-rose-500/20 text-rose-400 border-rose-500/40" :
                                "bg-zinc-800 text-zinc-400 border-zinc-700"
                              )}>
                                {apiKeyStates.webhook.status}
                              </span>
                            </div>
                            <p className="text-[10px] text-terminal-muted mt-1 font-sans">
                              Target endpoint for notifications and risk payloads. Validated against SSRF.
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="xs" onClick={() => handleVerifyApiKey('webhook')} className="text-terminal-cyan border-terminal-cyan/40">Verify</Button>
                            <Button variant="outline" size="xs" onClick={() => handleRotateApiKey('webhook')} className="text-terminal-amber border-terminal-amber/40">Reset</Button>
                            <Button variant="ghost" size="xs" onClick={() => handleDeleteApiKey('webhook')} className="text-rose-400">Delete</Button>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2 border-t border-terminal-border/40">
                          <Input 
                            placeholder="https://api.example.com/webhook"
                            value={apiKeyInputs.webhook}
                            onChange={(e) => setApiKeyInputs({ ...apiKeyInputs, webhook: e.target.value })}
                          />
                          <Button size="sm" onClick={() => handleSaveApiKey('webhook')}>Save</Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* WORKSPACE 7: BROKER */}
                  {activeTab === 'BROKER' && (
                    <div className="space-y-4">
                      <FormField label="Primary Connection" description="Target brokerage adapter integration for order routing.">
                        <Select 
                          value={settings.brokerPrimaryConnection} 
                          onChange={(val) => setSettings({ ...settings, brokerPrimaryConnection: val })} 
                          options={[
                            { label: 'NO CURRENT LIVE BROKER', value: 'NO_CURRENT_LIVE_BROKER' },
                            { label: 'Zerodha Kite API Adapter (NSE / BSE / MCX)', value: 'zerodha' },
                            { label: 'Angel One SmartAPI Adapter (NSE / BSE / MCX)', value: 'angelone' },
                            { label: 'Dhan HQ API Adapter (NSE / BSE / MCX)', value: 'dhan' },
                            { label: 'Upstox Developer API Adapter (NSE / BSE / MCX)', value: 'upstox' },
                            { label: 'Fyers API Adapter (NSE / BSE / MCX)', value: 'fyers' },
                          ]}
                        />
                      </FormField>

                      {/* DYNAMIC BROKER CAPABILITIES CARD */}
                      <Panel headerProps={{ title: 'Broker Capabilities & Supported Exchanges', icon: Server }} className="bg-black/40 rounded-sm">
                        <div className="p-4 space-y-3 font-mono text-xs">
                          <div className="flex justify-between items-center pb-2 border-b border-terminal-border">
                            <span className="text-terminal-muted uppercase">Active Adapter:</span>
                            <span className="font-bold text-terminal-amber">{brokerCapabilities.brokerName}</span>
                          </div>
                          <div className="flex justify-between items-center pb-2 border-b border-terminal-border">
                            <span className="text-terminal-muted uppercase">Connection Status:</span>
                            {brokerCapabilities.isLiveBrokerConnected ? (
                              <span className="text-terminal-green font-bold flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-terminal-green animate-pulse" />
                                CONNECTED & VERIFIED
                              </span>
                            ) : (
                              <span className="text-terminal-muted font-bold">NO CURRENT LIVE BROKER</span>
                            )}
                          </div>
                          <div className="flex justify-between items-center pb-2 border-b border-terminal-border">
                            <span className="text-terminal-muted uppercase">Supported Exchanges:</span>
                            <span className="font-bold text-white">
                              {brokerCapabilities.supportedExchanges.join(' / ') || 'NONE'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center pb-2 border-b border-terminal-border">
                            <span className="text-terminal-muted uppercase">Commodity Exchanges:</span>
                            <span className="font-bold text-terminal-amber">
                              {brokerCapabilities.commodityExchangeLabel}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-terminal-muted uppercase">Country Target:</span>
                            <span className="font-bold text-white">India (IN — SEBI Regulated)</span>
                          </div>
                        </div>
                      </Panel>

                      <FormField label="Order Routing Strategy" description="Algorithmic routing policy for execution order dispatch.">
                        <Select 
                          value={settings.brokerRoutingStrategy} 
                          onChange={(val) => setSettings({ ...settings, brokerRoutingStrategy: val })} 
                          options={[
                            { label: 'Smart Order Routing (SOR)', value: 'SMART_ORDER_ROUTING' },
                            { label: 'Direct Exchange Access (DMA)', value: 'DMA' },
                          ]}
                        />
                      </FormField>
                      <FormField label="Broker Failover Policy" description="Action to take if primary broker FIX connection drops.">
                        <Select 
                          value={settings.brokerFailoverMode} 
                          onChange={(val) => setSettings({ ...settings, brokerFailoverMode: val })} 
                          options={[
                            { label: 'Automatic (Failover to Backup Broker)', value: 'AUTOMATIC' },
                            { label: 'Manual Approval Prompt', value: 'MANUAL' },
                            { label: 'Halt Execution Engine', value: 'HALT' },
                          ]}
                        />
                      </FormField>
                    </div>
                  )}

                  {/* WORKSPACE 8: AI PROVIDERS */}
                  {activeTab === 'AI_PROVIDERS' && (
                    <div className="space-y-4">
                      <FormField label="Primary Inference Engine" description="Primary LLM model from canonical AI Model Registry.">
                        <Select 
                          value={settings.aiModel} 
                          onChange={(val) => setSettings({ ...settings, aiModel: val })} 
                          options={[
                            { label: 'Gemini 2.5 Pro (Canonical AI Registry)', value: 'GEMINI_2.5_PRO' },
                            { label: 'Gemini 2.5 Flash (Ultra-Low Latency)', value: 'GEMINI_2.5_FLASH' },
                            { label: 'GPT-4o Enterprise (High Reasoning)', value: 'GPT4O' },
                            { label: 'Claude 3.5 Sonnet (Quant Code Generation)', value: 'CLAUDE_3.5_SONNET' },
                          ]}
                        />
                      </FormField>
                      <FormField label="Inference Temperature" description="Controls creativity vs strict determinism in strategy output.">
                        <div className="flex items-center gap-4">
                          <input 
                            type="range" min="0" max="1" step="0.1" 
                            value={settings.aiTemperature} 
                            onChange={(e) => setSettings({ ...settings, aiTemperature: parseFloat(e.target.value) })}
                            className="flex-1 accent-terminal-amber bg-white/10 h-1 rounded-full appearance-none cursor-pointer"
                          />
                          <span className="text-xs font-mono font-bold w-8 text-terminal-amber">{settings.aiTemperature}</span>
                        </div>
                      </FormField>
                      <FormField label="Streaming Output" description="Stream tokens in real-time as strategy reasoning executes.">
                        <Switch checked={settings.aiStreaming} onChange={(val) => setSettings({ ...settings, aiStreaming: val })} />
                      </FormField>
                      <FormField label="System Prompt Persona" description="Global instructions injected into all agent reasoning cycles.">
                        <Input value={settings.aiSystemPrompt} onChange={(e) => setSettings({ ...settings, aiSystemPrompt: e.target.value })} />
                      </FormField>

                      {/* CANONICAL AI MODELS REGISTRY INSPECTOR */}
                      <Panel headerProps={{ title: 'Canonical AI Models Registry', icon: Cpu }} className="bg-black/40 rounded-sm mt-4">
                        <div className="p-3 space-y-2 text-[10px] font-mono">
                          <div className="text-terminal-muted mb-2">
                            Synchronized with ENTERPRISE_AI_MODELS_REGISTRY ({ENTERPRISE_AI_MODELS_REGISTRY.length} Models Registered):
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {ENTERPRISE_AI_MODELS_REGISTRY.slice(0, 4).map((m) => (
                              <div key={m.id} className="p-2 bg-black/60 border border-terminal-border rounded flex justify-between items-center">
                                <div>
                                  <div className="font-bold text-white">{m.name}</div>
                                  <div className="text-[9px] text-terminal-muted">{m.provider} • {m.category}</div>
                                </div>
                                <span className="px-1.5 py-0.5 bg-terminal-blue/20 text-terminal-blue border border-terminal-blue/40 rounded text-[8px] font-bold">
                                  {m.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </Panel>
                    </div>
                  )}

                  {/* WORKSPACE 9: MARKET CONFIGURATION */}
                  {activeTab === 'MARKET_CONFIGURATION' && (
                    <div className="space-y-4">
                      <Panel headerProps={{ title: 'Active Market Scope (India-Only V1)', icon: Globe }} className="bg-black/40 rounded-sm">
                        <div className="p-4 space-y-3 font-mono text-xs">
                          <div className="flex justify-between items-center pb-2 border-b border-terminal-border">
                            <span className="text-terminal-muted uppercase">Target Region:</span>
                            <span className="font-bold text-white">India (IN)</span>
                          </div>
                          <div className="flex justify-between items-center pb-2 border-b border-terminal-border">
                            <span className="text-terminal-muted uppercase">Market Scope:</span>
                            <span className="font-bold text-terminal-amber">Indian Market — V1</span>
                          </div>
                          <div className="flex justify-between items-center pb-2 border-b border-terminal-border">
                            <span className="text-terminal-muted uppercase">Reporting Currency:</span>
                            <span className="font-bold text-white">INR (₹ — Indian Rupee)</span>
                          </div>
                          <div className="flex justify-between items-center pb-2 border-b border-terminal-border">
                            <span className="text-terminal-muted uppercase">Primary Timezone:</span>
                            <span className="font-bold text-white">Asia/Kolkata (IST — UTC+5:30)</span>
                          </div>
                          <div className="flex justify-between items-center pb-2 border-b border-terminal-border">
                            <span className="text-terminal-muted uppercase">Equity Exchanges:</span>
                            <span className="font-bold text-white">Broker-supported NSE / BSE</span>
                          </div>
                          <div className="flex justify-between items-center pb-2 border-b border-terminal-border">
                            <span className="text-terminal-muted uppercase">ETF Segments:</span>
                            <span className="font-bold text-white">Broker-supported Indian ETF Segments</span>
                          </div>
                          <div className="flex justify-between items-center pb-2 border-b border-terminal-border">
                            <span className="text-terminal-muted uppercase">Commodity Exchanges:</span>
                            <span className="font-bold text-terminal-amber">
                              {brokerCapabilities.commodityExchangeLabel}
                            </span>
                          </div>
                          <div className="flex justify-between items-center pt-1">
                            <span className="text-terminal-muted uppercase">Foreign Markets (US/EU):</span>
                            <span className="font-bold text-rose-400">NOT ACTIVE IN V1 (India-Only Enforced)</span>
                          </div>
                        </div>
                      </Panel>

                      {/* DYNAMIC COMMODITY INSTRUMENTS INSPECTOR */}
                      <Panel headerProps={{ title: 'Broker-Supported Commodity Instruments', icon: Database }} className="bg-black/40 rounded-sm">
                        <div className="p-3">
                          {brokerCapabilities.commodityInstruments.length > 0 ? (
                            <div className="space-y-2">
                              {brokerCapabilities.commodityInstruments.map((inst) => (
                                <div key={inst.symbol} className="p-2.5 bg-black/60 border border-terminal-border rounded flex justify-between items-center text-xs font-mono">
                                  <div>
                                    <div className="font-bold text-terminal-amber">{inst.name}</div>
                                    <div className="text-[10px] text-terminal-muted">Exchange: {inst.exchange} • Lot: {inst.lotSize} • Tick: {inst.tickSize}</div>
                                  </div>
                                  <div className="text-right text-[10px]">
                                    <div className="text-white font-bold">Margin: {inst.marginReq}</div>
                                    <div className="text-terminal-muted">Expiry: {inst.expiry}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="py-6 text-center text-terminal-muted font-mono text-xs">
                              NO CURRENT COMMODITY INSTRUMENTS
                            </div>
                          )}
                        </div>
                      </Panel>
                    </div>
                  )}

                  {/* WORKSPACE 10: WORKSPACE PREFERENCES */}
                  {activeTab === 'WORKSPACE_PREFERENCES' && (
                    <div className="space-y-4">
                      <FormField label="Default Launch Workspace" description="Primary workspace rendered when opening the AI ARINA OS.">
                        <Select 
                          value={settings.defaultWorkspace} 
                          onChange={(val) => setSettings({ ...settings, defaultWorkspace: val })} 
                          options={[
                            { label: '01. Dashboard Workspace', value: 'DASHBOARD' },
                            { label: '02. Market Workspace', value: 'MARKET' },
                            { label: '03. Paper Trading Workspace', value: 'PAPER_TRADING' },
                            { label: '04. Research Workspace', value: 'RESEARCH' },
                            { label: '05. AI Intelligence Workspace', value: 'AI_INTELLIGENCE' },
                          ]}
                        />
                      </FormField>
                      <FormField label="Default Charting Style" description="Primary candlestick/OHLC chart visualization mode.">
                        <Select 
                          value={settings.chartType} 
                          onChange={(val) => setSettings({ ...settings, chartType: val })} 
                          options={[
                            { label: 'Candlestick Chart', value: 'CANDLESTICK' },
                            { label: 'OHLC Bars', value: 'OHLC_BARS' },
                            { label: 'Line / Area Chart', value: 'LINE_AREA' },
                          ]}
                        />
                      </FormField>
                      <FormField label="Keyboard Hotkeys" description="Enable global terminal hotkeys for rapid workspace switching.">
                        <Switch checked={settings.hotkeysEnabled} onChange={(val) => setSettings({ ...settings, hotkeysEnabled: val })} />
                      </FormField>
                    </div>
                  )}

                  {/* WORKSPACE 11: ABOUT */}
                  {activeTab === 'ABOUT' && (
                    <div className="space-y-4">
                      <Panel headerProps={{ title: 'System Architecture & Version Metadata', icon: Info }} className="bg-black/40 rounded-sm">
                        <div className="p-4 space-y-3 font-mono text-xs">
                          <div className="flex justify-between items-center pb-2 border-b border-terminal-border">
                            <span className="text-terminal-muted uppercase">Platform Title:</span>
                            <span className="font-bold text-terminal-amber">AI ARINA OS V1 — Enterprise AI Research & Paper Trading Platform</span>
                          </div>
                          <div className="flex justify-between items-center pb-2 border-b border-terminal-border">
                            <span className="text-terminal-muted uppercase">Core Version:</span>
                            <span className="font-bold text-white">v1.0.0-PROD (Build SHA: 2026.08.09)</span>
                          </div>
                          <div className="flex justify-between items-center pb-2 border-b border-terminal-border">
                            <span className="text-terminal-muted uppercase">Market Alignment:</span>
                            <span className="font-bold text-terminal-green">India Only — NSE, BSE, Broker-Supported Commodity Exchanges</span>
                          </div>
                          <div className="flex justify-between items-center pb-2 border-b border-terminal-border">
                            <span className="text-terminal-muted uppercase">Architecture:</span>
                            <span className="font-bold text-white">Unified AI Intelligence, Market Data & Paper Trading Architecture</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-terminal-muted uppercase">Regulatory Compliance:</span>
                            <span className="font-bold text-terminal-amber">India V1 — Regulatory Controls Configured</span>
                          </div>
                        </div>
                      </Panel>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* RIGHT-SIDE INSPECTOR */}
        <div className="w-80 border-l border-terminal-border bg-black/40 p-4 shrink-0 flex flex-col gap-4 overflow-y-auto">
          <SectionHeader title="INSPECTOR" icon={Activity} />

          {/* PANEL 1: ACTIVE PROFILE */}
          <Panel headerProps={{ title: "Active Profile", icon: User }} className="bg-black/40 rounded-sm">
            <div className="p-3 space-y-2 text-[10px] font-mono">
              <div className="flex justify-between text-slate-300">
                <span className="text-terminal-muted uppercase">ACCOUNT:</span>
                <span className="font-bold text-white truncate max-w-[140px]">{settings.email}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-terminal-muted uppercase">ROLE:</span>
                <span className="font-bold text-terminal-amber">{settings.traderRole}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-terminal-muted uppercase">TIER:</span>
                <span className="font-bold text-terminal-green">Enterprise Tier 1</span>
              </div>
            </div>
          </Panel>

          {/* PANEL 2: LIVE CONFIGURATION */}
          <Panel headerProps={{ title: "Live Configuration", icon: SettingsIcon }} className="bg-black/40 rounded-sm">
            <div className="p-3 space-y-2 text-[10px] font-mono">
              <div className="flex justify-between">
                <span className="text-terminal-muted uppercase">LANGUAGE:</span>
                <span className="font-bold text-white">EN-IN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-terminal-muted uppercase">CURRENCY:</span>
                <span className="font-bold text-white">INR (₹)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-terminal-muted uppercase">MARKET:</span>
                <span className="font-bold text-terminal-amber">INDIAN MARKET — V1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-terminal-muted uppercase">TIMEZONE:</span>
                <span className="font-bold text-white">Asia/Kolkata</span>
              </div>
              <div className="flex justify-between">
                <span className="text-terminal-muted uppercase">EQUITY:</span>
                <span className="font-bold text-white">NSE / BSE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-terminal-muted uppercase">ETF:</span>
                <span className="font-bold text-white">NSE / BSE ETF</span>
              </div>
              <div className="flex justify-between">
                <span className="text-terminal-muted uppercase">COMMODITY:</span>
                <span className="font-bold text-terminal-amber truncate max-w-[120px]">
                  {brokerCapabilities.commodityExchangeLabel}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-terminal-muted uppercase">AI MODEL:</span>
                <span className="font-bold text-terminal-blue">{settings.aiModel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-terminal-muted uppercase">LIVE BROKER:</span>
                <span className="font-bold text-terminal-amber truncate max-w-[120px]">
                  {brokerCapabilities.isLiveBrokerConnected ? brokerCapabilities.liveBrokerName : 'NO CURRENT LIVE BROKER'}
                </span>
              </div>
            </div>
          </Panel>

          {/* PANEL 3: SYSTEM INTEGRITY & SECURITY POLICY STATUS */}
          <Panel headerProps={{ title: "System Integrity & Security", icon: Shield }} className="bg-black/40 rounded-sm">
            <div className="p-3 space-y-2 text-[10px] font-mono">
              <div className="flex justify-between">
                <span className="text-terminal-muted uppercase">SECURITY STATUS:</span>
                <span className={cn(
                  "font-bold uppercase",
                  overallSecurityStatus === 'CONFIGURED' ? "text-terminal-green" :
                  overallSecurityStatus === 'PARTIALLY_CONFIGURED' ? "text-terminal-amber" :
                  "text-rose-400"
                )}>
                  {overallSecurityStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-terminal-muted uppercase">2FA STATUS:</span>
                <span className={cn(
                  "font-bold uppercase",
                  mfaState === 'ENABLED' ? "text-terminal-green" :
                  mfaState === 'CONFIGURED' ? "text-terminal-blue" :
                  "text-terminal-muted"
                )}>
                  {mfaState}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-terminal-muted uppercase">IP WHITELIST:</span>
                <span className={cn(
                  "font-bold uppercase",
                  ipWhitelistStatus === 'ACTIVE' ? "text-terminal-green" :
                  ipWhitelistStatus === 'DISABLED' ? "text-terminal-muted" :
                  "text-terminal-amber"
                )}>
                  {ipWhitelistStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-terminal-muted uppercase">SESSION TIMEOUT:</span>
                <span className="font-bold text-white">{settings.securitySessionTimeout} Minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-terminal-muted uppercase">AUDIT LEVEL:</span>
                <span className="font-bold text-terminal-blue">{settings.securityAuditLogLevel}</span>
              </div>
            </div>
          </Panel>
        </div>

      </div>
    </div>
  );
});
