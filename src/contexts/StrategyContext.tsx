import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchApi } from '../lib/api';

export type StrategyStage = 
  | 'LIBRARY' 
  | 'BUILDER' 
  | 'PARAMETERS' 
  | 'CANDIDATES' 
  | 'RANKING' 
  | 'RUNTIME' 
  | 'VERSION' 
  | 'AUDIT' 
  | 'INSPECTOR';

export type StrategyStatus = 
  | 'DRAFT' 
  | 'BUILDING' 
  | 'CONFIGURED' 
  | 'CANDIDATE' 
  | 'RANKED' 
  | 'ACTIVE_RUNTIME' 
  | 'VERSIONED' 
  | 'AUDITED' 
  | 'CERTIFIED' 
  | 'ENABLED' 
  | 'DISABLED';

export interface ActiveStrategy {
  id: string; // Strategy ID (e.g., "STRAT-001")
  strategyId: string;
  name: string;
  category: string;
  version: string;
  isCertified: boolean;
  certifiedBy?: string;
  certifiedDate?: string;
  currentStage: StrategyStage;
  currentStatus: StrategyStatus;
  description: string;
  rules: string[];
  riskLevel: string;
  marketType: string;
  instrumentType: string;
  timeframe: string;
  tags?: string[];
  sha256Reference?: string;
  parametersData?: Record<string, any>;
  candidateData?: any;
  rankingData?: any;
  runtimeData?: any;
  versionData?: any;
  auditLogs?: any[];
  updatedTime?: string;
  createdBy?: string;
}

interface StrategyContextType {
  activeStrategy: ActiveStrategy | null;
  activeStrategyId: string | null;
  activeStage: StrategyStage;
  setActiveStrategy: (strategy: ActiveStrategy) => void;
  updateActiveStrategy: (updates: Partial<ActiveStrategy>) => void;
  setStage: (stage: StrategyStage) => void;
  instantiateTemplate: (template: any) => Promise<ActiveStrategy>;
  saveBuilderCopy: (builderData: any) => Promise<ActiveStrategy>;
  clearActiveStrategy: () => void;
  refreshActiveStrategy: () => Promise<void>;
  availableStrategies: ActiveStrategy[];
  isLoading: boolean;
}

const STORAGE_KEY = 'ai_arina_active_strategy_context_v32';

const defaultStrategy: ActiveStrategy = {
  id: 'STRAT-001',
  strategyId: 'STRAT-001',
  name: 'NIFTY Alpha Trend Momentum',
  category: 'Trend Following',
  version: '1.0.0',
  isCertified: true,
  certifiedBy: 'ARINA_QUANT_COMMITTEE',
  certifiedDate: '2026-08-01',
  currentStage: 'BUILDER',
  currentStatus: 'ENABLED',
  description: 'Institutional dual EMA trend-following strategy with dynamic ATR volatility filters and Z-Score sigma signals.',
  rules: [
    'Fast EMA (9) crosses above Slow EMA (21) for bullish entry',
    'Z-Score of price deviation >= 1.5 sigma',
    'ATR Volatility Multiplier set to 2.0x for dynamic stop trailing',
    'Session Filter: NSE Trading Hours 09:15 - 15:15 IST'
  ],
  riskLevel: 'MEDIUM',
  marketType: 'EQUITY',
  instrumentType: 'SPOT',
  timeframe: '15M',
  tags: ['INSTITUTIONAL', 'NIFTY', 'MOMENTUM'],
  sha256Reference: '8fea254cf0bbafef1cfc1582e8ae6874d5558fd6797cb397c2cbe86b65b0d8a5',
  updatedTime: new Date().toISOString()
};

const StrategyContext = createContext<StrategyContextType | undefined>(undefined);

export const StrategyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeStrategy, setActiveStrategyState] = useState<ActiveStrategy | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.id || parsed.strategyId) && parsed.name) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to restore active strategy from localStorage", e);
    }
    return defaultStrategy;
  });

  const [availableStrategies, setAvailableStrategies] = useState<ActiveStrategy[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync active strategy to localStorage
  useEffect(() => {
    if (activeStrategy) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(activeStrategy));
      } catch (e) {
        console.error("Failed to save active strategy to localStorage", e);
      }
    }
  }, [activeStrategy]);

  // Sync active strategy to backend API on change
  useEffect(() => {
    if (activeStrategy) {
      fetchApi('/api/strategy/active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activeStrategy })
      }).catch((err) => console.warn("Failed syncing active strategy to server", err));
    }
  }, [activeStrategy]);

  const activeStage = activeStrategy?.currentStage || 'BUILDER';
  const activeStrategyId = activeStrategy?.id || activeStrategy?.strategyId || null;

  const setActiveStrategy = useCallback((strategy: ActiveStrategy) => {
    setActiveStrategyState(strategy);
  }, []);

  const updateActiveStrategy = useCallback((updates: Partial<ActiveStrategy>) => {
    setActiveStrategyState(prev => {
      const current = prev || defaultStrategy;
      const updated = {
        ...current,
        ...updates,
        updatedTime: new Date().toISOString()
      };
      return updated;
    });
  }, []);

  const setStage = useCallback((stage: StrategyStage) => {
    updateActiveStrategy({ currentStage: stage });
  }, [updateActiveStrategy]);

  // Instantiate template from Library into Builder Working Copy
  const instantiateTemplate = useCallback(async (template: any): Promise<ActiveStrategy> => {
    setIsLoading(true);
    try {
      let resultData = template;
      try {
        const res = await fetchApi<any>(`/api/strategy/library/${template.id}/use`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetName: `${template.name} (Working Copy)` })
        });
        if (res && res.data) {
          resultData = res.data;
        }
      } catch (e) {
        console.warn("Using fallback instantiation for template", e);
      }

      const workingCopyId = resultData.id || resultData.strategyId || `STRAT-WC-${Date.now().toString(36).toUpperCase()}`;
      const workingCopy: ActiveStrategy = {
        id: workingCopyId,
        strategyId: resultData.strategyId || workingCopyId,
        name: resultData.name || template.name,
        category: resultData.category || template.category || 'Trend Following',
        version: resultData.version || template.version || '1.0.0-wc',
        isCertified: false, // Working copy is created as draft working copy
        certifiedBy: template.certifiedBy || undefined,
        certifiedDate: template.certifiedDate || undefined,
        currentStage: 'BUILDER',
        currentStatus: 'BUILDING',
        description: resultData.description || template.description || '',
        rules: Array.isArray(resultData.rules) ? resultData.rules : (template.rules || []),
        riskLevel: resultData.riskLevel || template.riskLevel || 'MEDIUM',
        marketType: resultData.marketType || template.marketType || 'EQUITY',
        instrumentType: resultData.instrumentType || template.instrumentType || 'SPOT',
        timeframe: resultData.timeframe || template.timeframe || '15M',
        tags: Array.isArray(resultData.tags) ? resultData.tags : ['WORKING_COPY', 'INSTANTIATED'],
        sha256Reference: resultData.sha256Reference || `sha256-${Math.random().toString(16).substring(2, 10)}${Date.now().toString(16)}`,
        updatedTime: new Date().toISOString(),
        createdBy: 'ENTERPRISE_STRATEGY_BUILDER'
      };

      setActiveStrategyState(workingCopy);
      return workingCopy;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save Builder Copy
  const saveBuilderCopy = useCallback(async (builderData: any): Promise<ActiveStrategy> => {
    setIsLoading(true);
    try {
      const updated: ActiveStrategy = {
        ...(activeStrategy || defaultStrategy),
        id: builderData.id || activeStrategy?.id || 'STRAT-001',
        strategyId: builderData.strategyId || activeStrategy?.strategyId || 'STRAT-001',
        name: builderData.name || activeStrategy?.name || 'Untitled Strategy',
        category: builderData.category || activeStrategy?.category || 'Trend Following',
        description: builderData.description || activeStrategy?.description || '',
        rules: builderData.rules || activeStrategy?.rules || [],
        riskLevel: builderData.riskLevel || activeStrategy?.riskLevel || 'MEDIUM',
        timeframe: builderData.timeframe || activeStrategy?.timeframe || '15M',
        marketType: builderData.marketType || activeStrategy?.marketType || 'EQUITY',
        instrumentType: builderData.instrumentType || activeStrategy?.instrumentType || 'SPOT',
        tags: builderData.tags || activeStrategy?.tags || ['CONFIGURED'],
        currentStage: 'PARAMETERS', // Auto advances to Parameters stage
        currentStatus: 'CONFIGURED',
        sha256Reference: `sha256-${Math.random().toString(36).substring(2, 10)}-${Date.now().toString(16)}`,
        updatedTime: new Date().toISOString()
      };

      setActiveStrategyState(updated);
      return updated;
    } finally {
      setIsLoading(false);
    }
  }, [activeStrategy]);

  const clearActiveStrategy = useCallback(() => {
    setActiveStrategyState(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const refreshActiveStrategy = useCallback(async () => {
    if (!activeStrategyId) return;
    try {
      const res = await fetchApi<any>(`/api/strategy/builder/${activeStrategyId}`);
      if (res && res.data) {
        updateActiveStrategy(res.data);
      }
    } catch (e) {
      console.warn("Could not refresh active strategy from backend", e);
    }
  }, [activeStrategyId, updateActiveStrategy]);

  return (
    <StrategyContext.Provider
      value={{
        activeStrategy,
        activeStrategyId,
        activeStage,
        setActiveStrategy,
        updateActiveStrategy,
        setStage,
        instantiateTemplate,
        saveBuilderCopy,
        clearActiveStrategy,
        refreshActiveStrategy,
        availableStrategies,
        isLoading
      }}
    >
      {children}
    </StrategyContext.Provider>
  );
};

export const useStrategyContext = () => {
  const context = useContext(StrategyContext);
  if (!context) {
    throw new Error('useStrategyContext must be used within a StrategyProvider');
  }
  return context;
};
