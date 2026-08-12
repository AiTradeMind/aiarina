import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '../lib/api';

export const useSystemData = (activeWorkspace: string, interval = 0) => { // Disable polling by default
  return useQuery({
    queryKey: ['systemData', activeWorkspace],
    retry: false,
    refetchOnWindowFocus: false, // Disable refetch on window focus
    staleTime: 300000, // 5 minutes stale time
    queryFn: async ({ signal }) => {
      // Core data needed for layout
      const corePromises = [
        fetchApi('/api/health', { signal }).catch(() => null),
        fetchApi('/api/notifications', { signal }).catch(() => null),
        fetchApi('/api/trading/portfolio', { signal }).catch(() => null),
        fetchApi('/api/trading/portfolio/balance', { signal }).catch(() => null)
      ];

      // Dashboard & general data
      const dashboardPromises = activeWorkspace === 'DASHBOARD' ? [
        fetchApi('/api/events', { signal }).catch(() => null),
        fetchApi('/api/trading/trades', { signal }).catch(() => null),
        fetchApi('/api/trading/positions', { signal }).catch(() => null),
        fetchApi('/api/trading/orders', { signal }).catch(() => null),
        fetchApi('/api/ai/recommendations', { signal }).catch(() => null),
        fetchApi('/api/ai/models', { signal }).catch(() => null),
        fetchApi('/api/analytics/dashboard', { signal }).catch(() => null),
        fetchApi('/api/risk/events', { signal }).catch(() => null),
      ] : [null, null, null, null, null, null, null, null];

      // AI Workspace data
      const aiPromises = activeWorkspace === 'AI' ? [
        fetchApi('/api/ai/providers', { signal }).catch(() => null),
        fetchApi('/api/ai/history', { signal }).catch(() => null),
        fetchApi('/api/ai/memory/patterns', { signal }).catch(() => null),
        fetchApi('/api/ai/memory', { signal }).catch(() => null),
        fetchApi('/api/ai/learning', { signal }).catch(() => null),
        fetchApi('/api/ai/usage', { signal }).catch(() => null),
        fetchApi('/api/ai/health', { signal }).catch(() => null),
        fetchApi('/api/ai/brain/status', { signal }).catch(() => null),
        fetchApi('/api/ai/brain/tasks', { signal }).catch(() => null),
        fetchApi('/api/ai/leaderboard', { signal }).catch(() => null),
        fetchApi('/api/ai/performance/tests', { signal }).catch(() => null),
        fetchApi('/api/ai/performance/benchmarks', { signal }).catch(() => null),
        fetchApi('/api/ai/performance/reports', { signal }).catch(() => null),
        fetchApi('/api/ai/fund', { signal }).catch(() => null),
        fetchApi('/api/ai/fund/allocations', { signal }).catch(() => null),
        fetchApi('/api/ai/fund/recommendations', { signal }).catch(() => null),
        fetchApi('/api/ai/fund/history', { signal }).catch(() => null),
        fetchApi('/api/ai/tournament/seasons', { signal }).catch(() => null),
        fetchApi('/api/ai/tournament', { signal }).catch(() => null),
        fetchApi('/api/ai/tournament/matches', { signal }).catch(() => null),
        fetchApi('/api/ai/tournament/scoreboard', { signal }).catch(() => null),
        fetchApi('/api/ai/evolution', { signal }).catch(() => null),
        fetchApi('/api/ai/evolution/patterns', { signal }).catch(() => null),
        fetchApi('/api/ai/evolution/history', { signal }).catch(() => null),
        fetchApi('/api/ai/knowledge/nodes', { signal }).catch(() => null),
        fetchApi('/api/ai/knowledge/edges', { signal }).catch(() => null),
        fetchApi('/api/ai/knowledge/snapshots', { signal }).catch(() => null),
        fetchApi('/api/ai/collaboration', { signal }).catch(() => null),
        fetchApi('/api/ai/collaboration/sessions', { signal }).catch(() => null)
      ] : Array(29).fill(null);

      // Other workspaces
      const otherPromises = [
        activeWorkspace === 'RESEARCH' ? fetchApi('/api/research', { signal }).catch(() => null) : null,
        activeWorkspace === 'RESEARCH' ? fetchApi('/api/research/history', { signal }).catch(() => null) : null,
        activeWorkspace === 'BUILDER' ? fetchApi('/api/strategy/builder', { signal }).catch(() => null) : null,
      ];

      const allPromises = [
        ...corePromises,
        ...dashboardPromises,
        ...aiPromises,
        ...otherPromises
      ];

      const settledResults = await Promise.allSettled(allPromises);
      const results = settledResults.map(r => r.status === 'fulfilled' ? r.value : null);
      
      const [
        healthRes, notifRes, portRes, balRes,
        eventsRes, tradesRes, posRes, ordersRes, recRes, modRes, analyticsRes, riskEventsRes,
        aiProvidersRes, aiHistoryRes, aiPatternsRes, aiMemoryRes, aiLearningRes, aiUsageRes, aiHealthRes, 
        brainStatusRes, brainTasksRes, leaderboardRes, testsRes, benchmarksRes, 
        reportsRes, fundsRes, allocationsRes, recsRes, fundHistoryRes, seasonsRes, tourneyRes, 
        matchesRes, scoreboardsRes, evoProfRes, evoPatRes, evoHistRes, knNodesRes, 
        knEdgesRes, knSnapRes, collabRes, collabSessRes,
        researchRes, researchHistoryRes, buildersRes
      ] = results;

      const resolveArrayData = (res: any) => {
        if (!res) return [];
        if (res._isApiError) return [];
        if (Array.isArray(res)) return res;
        if (res.data && Array.isArray(res.data)) return res.data;
        if (res.items && Array.isArray(res.items)) return res.items;
        if (res.list && Array.isArray(res.list)) return res.list;
        if (res.rankings && Array.isArray(res.rankings)) return res.rankings;
        return [];
      };
      
      return {
        health: healthRes,
        notifications: resolveArrayData(notifRes),
        portfolio: portRes,
        balance: balRes,
        
        events: resolveArrayData(eventsRes),
        trades: resolveArrayData(tradesRes),
        positions: resolveArrayData(posRes),
        orders: resolveArrayData(ordersRes),
        recommendations: resolveArrayData(recRes),
        models: resolveArrayData(modRes),
        analytics: analyticsRes,
        riskEvents: resolveArrayData(riskEventsRes),
        
        aiProviders: aiProvidersRes,
        aiHistory: resolveArrayData(aiHistoryRes),
        aiPatterns: resolveArrayData(aiPatternsRes),
        aiMemory: resolveArrayData(aiMemoryRes),
        aiLearning: resolveArrayData(aiLearningRes),
        aiUsage: resolveArrayData(aiUsageRes),
        aiHealth: aiHealthRes,
        brainStatus: brainStatusRes,
        brainTasks: resolveArrayData(brainTasksRes),
        leaderboard: leaderboardRes,
        performanceTests: resolveArrayData(testsRes),
        performanceBenchmarks: resolveArrayData(benchmarksRes),
        performanceReports: resolveArrayData(reportsRes),
        funds: resolveArrayData(fundsRes),
        fundAllocations: resolveArrayData(allocationsRes),
        fundRecommendations: resolveArrayData(recsRes),
        fundHistory: resolveArrayData(fundHistoryRes),
        seasons: resolveArrayData(seasonsRes),
        tournaments: resolveArrayData(tourneyRes),
        matches: resolveArrayData(matchesRes),
        scoreboards: resolveArrayData(scoreboardsRes),
        evolutionProfiles: resolveArrayData(evoProfRes),
        evolutionPatterns: resolveArrayData(evoPatRes),
        evolutionHistory: resolveArrayData(evoHistRes),
        knowledgeNodes: resolveArrayData(knNodesRes),
        knowledgeEdges: resolveArrayData(knEdgesRes),
        knowledgeSnapshots: resolveArrayData(knSnapRes),
        collabs: resolveArrayData(collabRes),
        collabSessions: resolveArrayData(collabSessRes),

        researchReports: resolveArrayData(researchRes),
        researchHistory: resolveArrayData(researchHistoryRes),
        builders: resolveArrayData(buildersRes),
      };
    },
    refetchInterval: interval,
  });
};

export const useUser = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: async ({ signal }) => {
      try {
        const res = await fetchApi('/api/auth/me', { signal });
        if (!res || res._isApiError) return null;
        return res;
      } catch (err) {
        return null;
      }
    },
    staleTime: Infinity,
  });
};
