import { StrategyRuntimeSession, RuntimeOverview, EMPTY_RUNTIME_OVERVIEW, RuntimeState, RuntimePriority } from '../types/index.ts';

export class StrategyRuntimeRepository {
  private sessionsStore: Map<string, StrategyRuntimeSession[]> = new Map();

  constructor() {
    this.seedDefaultSessions('STRAT-001');
  }

  private seedDefaultSessions(strategyId: string) {
    if (this.sessionsStore.has(strategyId)) return;

    const seedSessions: StrategyRuntimeSession[] = [
      {
        sessionId: 'RUN-5001',
        strategyId: strategyId,
        strategyName: 'NIFTY Alpha Trend Momentum',
        candidateId: 'CAND-7841',
        aiModelId: 'gpt-4o',
        market: 'NSE / India',
        asset: 'Index / Equity',
        symbol: 'NIFTY',
        direction: 'BUY',
        runtimeState: 'RUNNING',
        queuePosition: 1,
        priority: 'CRITICAL',
        latencyMs: 14.2,
        health: 'HEALTHY',
        healthScore: 98,
        confidence: 94,
        executionReadinessScore: 98,
        riskScore: 24,
        createdTime: new Date(Date.now() - 3600000 * 3).toISOString(),
        startTime: new Date(Date.now() - 3600000 * 2).toISOString(),
        updatedTime: new Date(Date.now() - 60000 * 5).toISOString(),
        cpuUsagePercent: 12.4,
        memoryUsageMb: 248.5,
        queueDelayMs: 45,
        validationChecks: [
          { id: 'v1', ruleName: 'Committee Approved', passed: true, message: 'Approved by Chief Risk Officer' },
          { id: 'v2', ruleName: 'Ranking Score Valid', passed: true, message: 'Score 94.2 ≥ 80 minimum' },
          { id: 'v3', ruleName: 'Parameters Locked', passed: true, message: 'SHA256 parameter signature verified' },
          { id: 'v4', ruleName: 'Working Copy Exists', passed: true, message: 'Active version v1.0.0 validated' }
        ],
        strategySnapshot: { id: strategyId, name: 'NIFTY Alpha Trend Momentum', version: '1.0.0' },
        parametersSnapshot: { stopLossPct: 1.5, takeProfitPct: 3.5, maxPositionSize: 500000 },
        rankingSnapshot: { rankingId: 'RANK-1001', finalScore: 94.2, tier: 'Enterprise Grade' },
        candidateSnapshot: { candidateId: 'CAND-7841', aiReasoning: 'Institutional volume spike & MACD expansion' },
        metrics: {
          queueTimeMs: 120,
          runtimeDurationSec: 7200,
          validationSuccessRate: 100,
          heartbeatCount: 1440
        },
        logs: [
          { id: 'l1', timestamp: new Date(Date.now() - 7200000).toLocaleTimeString(), level: 'INFO', message: 'Runtime session successfully initialized from Ranking pipeline.' },
          { id: 'l2', timestamp: new Date(Date.now() - 3600000).toLocaleTimeString(), level: 'SUCCESS', message: 'All 4 enterprise validation checks passed without errors.' },
          { id: 'l3', timestamp: new Date(Date.now() - 60000).toLocaleTimeString(), level: 'SUCCESS', message: 'Heartbeat signal synchronized with Paper Trading Engine bridge.' }
        ],
        sha256Reference: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        history: [
          { id: 'h1', action: 'CREATED', operator: 'Ranking Pipeline Handoff', timestamp: new Date(Date.now() - 3600000 * 3).toISOString(), details: 'Queued automatically from Ranking' },
          { id: 'h2', action: 'STARTED', operator: 'Automated Supervisor', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), details: 'Transitioned to RUNNING state' }
        ]
      },
      {
        sessionId: 'RUN-5002',
        strategyId: strategyId,
        strategyName: 'NIFTY Alpha Trend Momentum',
        candidateId: 'CAND-9233',
        aiModelId: 'claude-3-5-sonnet',
        market: 'NSE / India',
        asset: 'Equity',
        symbol: 'RELIANCE',
        direction: 'BUY',
        runtimeState: 'READY',
        queuePosition: 2,
        priority: 'HIGH',
        latencyMs: 18.6,
        health: 'HEALTHY',
        healthScore: 95,
        confidence: 91,
        executionReadinessScore: 95,
        riskScore: 28,
        createdTime: new Date(Date.now() - 3600000 * 2).toISOString(),
        startTime: new Date(Date.now() - 3600000 * 1).toISOString(),
        updatedTime: new Date(Date.now() - 60000 * 15).toISOString(),
        cpuUsagePercent: 8.1,
        memoryUsageMb: 194.2,
        queueDelayMs: 60,
        validationChecks: [
          { id: 'v1', ruleName: 'Committee Approved', passed: true, message: 'Approved by Senior PM' },
          { id: 'v2', ruleName: 'Ranking Score Valid', passed: true, message: 'Score 90.5' },
          { id: 'v3', ruleName: 'Parameters Locked', passed: true, message: 'Locked' },
          { id: 'v4', ruleName: 'Working Copy Exists', passed: true, message: 'Valid' }
        ],
        strategySnapshot: { id: strategyId, name: 'NIFTY Alpha Trend Momentum', version: '1.0.0' },
        parametersSnapshot: { stopLossPct: 2.0, takeProfitPct: 4.0 },
        rankingSnapshot: { rankingId: 'RANK-1002', finalScore: 90.5, tier: 'Tier A+' },
        candidateSnapshot: { candidateId: 'CAND-9233', aiReasoning: 'Breakout above 52-week consolidation' },
        metrics: {
          queueTimeMs: 180,
          runtimeDurationSec: 3600,
          validationSuccessRate: 100,
          heartbeatCount: 720
        },
        logs: [
          { id: 'l4', timestamp: new Date(Date.now() - 3600000).toLocaleTimeString(), level: 'INFO', message: 'Session prepared and loaded into READY state.' }
        ],
        sha256Reference: 'f2c72b2298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b911',
        history: [
          { id: 'h3', action: 'CREATED', operator: 'Ranking Pipeline', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), details: 'Initialized' }
        ]
      },
      {
        sessionId: 'RUN-5003',
        strategyId: strategyId,
        strategyName: 'NIFTY Alpha Trend Momentum',
        candidateId: 'CAND-4021',
        aiModelId: 'gemini-1.5-pro',
        market: 'MCX / India',
        asset: 'Commodity / Gold',
        symbol: 'GOLD_AUG_FUT',
        direction: 'BUY',
        runtimeState: 'QUEUED',
        queuePosition: 3,
        priority: 'NORMAL',
        latencyMs: 22.4,
        health: 'HEALTHY',
        healthScore: 92,
        confidence: 88,
        executionReadinessScore: 92,
        riskScore: 32,
        createdTime: new Date(Date.now() - 3600000 * 1).toISOString(),
        startTime: new Date().toISOString(),
        updatedTime: new Date().toISOString(),
        cpuUsagePercent: 4.5,
        memoryUsageMb: 142.0,
        queueDelayMs: 120,
        validationChecks: [
          { id: 'v1', ruleName: 'Committee Approved', passed: true, message: 'Pending final review' }
        ],
        strategySnapshot: { id: strategyId, name: 'Gold Commodity Tracker' },
        parametersSnapshot: { stopLossPct: 1.2 },
        rankingSnapshot: { rankingId: 'RANK-1003', finalScore: 87.8, tier: 'Tier A' },
        candidateSnapshot: { candidateId: 'CAND-4021', aiReasoning: 'Safe-haven demand uptick' },
        metrics: {
          queueTimeMs: 240,
          runtimeDurationSec: 0,
          validationSuccessRate: 100,
          heartbeatCount: 0
        },
        logs: [
          { id: 'l5', timestamp: new Date().toLocaleTimeString(), level: 'INFO', message: 'Enqueued in runtime priority queue.' }
        ],
        sha256Reference: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
        history: [
          { id: 'h4', action: 'ENQUEUED', operator: 'Ranking Pipeline', timestamp: new Date(Date.now() - 3600000 * 1).toISOString(), details: 'Added to queue position 3' }
        ]
      }
    ];

    this.sessionsStore.set(strategyId, seedSessions);
  }

  public async getSessions(strategyId: string): Promise<RuntimeOverview> {
    const sessions = this.sessionsStore.get(strategyId) || [];
    return this.buildOverview(sessions);
  }

  public async getSessionById(sessionId: string): Promise<StrategyRuntimeSession | null> {
    for (const sessions of this.sessionsStore.values()) {
      const found = sessions.find(s => s.sessionId === sessionId);
      if (found) return found;
    }
    return null;
  }

  public async createSession(strategyId: string, data: any): Promise<RuntimeOverview> {
    const sessions = this.sessionsStore.get(strategyId) || [];
    const newSession: StrategyRuntimeSession = {
      sessionId: `RUN-${Math.floor(1000 + Math.random() * 9000)}`,
      strategyId,
      strategyName: data.strategyName || 'Enterprise Strategy',
      candidateId: data.candidateId || 'CAND-NEW',
      aiModelId: data.aiModelId || 'gpt-4o',
      market: data.market || 'NSE / India',
      asset: data.asset || 'Equity',
      symbol: data.symbol || 'NIFTY',
      direction: data.direction || 'BUY',
      runtimeState: 'QUEUED',
      queuePosition: sessions.length + 1,
      priority: data.priority || 'NORMAL',
      latencyMs: 15.0,
      health: 'HEALTHY',
      healthScore: 95,
      confidence: 90,
      executionReadinessScore: 95,
      riskScore: 25,
      createdTime: new Date().toISOString(),
      startTime: new Date().toISOString(),
      updatedTime: new Date().toISOString(),
      cpuUsagePercent: 5.0,
      memoryUsageMb: 150.0,
      queueDelayMs: 30,
      validationChecks: [
        { id: 'v1', ruleName: 'Committee Approved', passed: true, message: 'Automated check passed' },
        { id: 'v2', ruleName: 'Ranking Verified', passed: true, message: 'Valid ranking' }
      ],
      strategySnapshot: { id: strategyId },
      parametersSnapshot: data.parametersSnapshot || {},
      rankingSnapshot: data.rankingSnapshot || {},
      candidateSnapshot: data.candidateSnapshot || {},
      metrics: { queueTimeMs: 30, runtimeDurationSec: 0, validationSuccessRate: 100, heartbeatCount: 0 },
      logs: [{ id: `l-${Date.now()}`, timestamp: new Date().toLocaleTimeString(), level: 'INFO', message: 'Session created and enqueued.' }],
      sha256Reference: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      history: [{ id: `h-${Date.now()}`, action: 'CREATED', operator: data.operator || 'Enterprise Supervisor', timestamp: new Date().toISOString(), details: 'Manual session creation' }]
    };

    sessions.push(newSession);
    this.sessionsStore.set(strategyId, sessions);
    return this.buildOverview(sessions);
  }

  public async retrySession(sessionId: string, operator: string): Promise<RuntimeOverview> {
    return this.updateSessionState(sessionId, 'QUEUED', operator, 'Retried session from failure center');
  }

  public async cancelSession(sessionId: string, operator: string): Promise<RuntimeOverview> {
    return this.updateSessionState(sessionId, 'CANCELLED', operator, 'Session cancelled by operator');
  }

  public async archiveSession(sessionId: string, operator: string): Promise<RuntimeOverview> {
    return this.updateSessionState(sessionId, 'EXPIRED', operator, 'Session archived');
  }

  public async updateSessionState(sessionId: string, newState: RuntimeState, operator: string, comment?: string): Promise<RuntimeOverview> {
    for (const [stratId, sessions] of this.sessionsStore.entries()) {
      const idx = sessions.findIndex(s => s.sessionId === sessionId);
      if (idx !== -1) {
        sessions[idx].runtimeState = newState;
        sessions[idx].updatedTime = new Date().toISOString();
        sessions[idx].history.push({
          id: `h-${Date.now()}`,
          action: `STATE_${newState}`,
          operator,
          timestamp: new Date().toISOString(),
          details: comment || `Runtime state updated to ${newState}`
        });
        sessions[idx].logs.push({
          id: `l-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          level: newState === 'FAILED' ? 'ERROR' : newState === 'RUNNING' ? 'SUCCESS' : 'INFO',
          message: `Session state transitioned to ${newState}: ${comment || 'Manual override'}`
        });
        this.sessionsStore.set(stratId, sessions);
        return this.buildOverview(sessions);
      }
    }
    throw new Error(`Runtime session ${sessionId} not found`);
  }

  public async updatePriority(sessionId: string, priority: RuntimePriority, operator: string): Promise<RuntimeOverview> {
    for (const [stratId, sessions] of this.sessionsStore.entries()) {
      const idx = sessions.findIndex(s => s.sessionId === sessionId);
      if (idx !== -1) {
        sessions[idx].priority = priority;
        sessions[idx].updatedTime = new Date().toISOString();
        sessions[idx].history.push({
          id: `h-${Date.now()}`,
          action: `PRIORITY_${priority}`,
          operator,
          timestamp: new Date().toISOString(),
          details: `Priority changed to ${priority}`
        });
        this.sessionsStore.set(stratId, sessions);
        return this.buildOverview(sessions);
      }
    }
    throw new Error(`Session ${sessionId} not found`);
  }

  public async bulkOperation(strategyId: string, operation: string, sessionIds: string[], operator: string): Promise<RuntimeOverview> {
    const sessions = this.sessionsStore.get(strategyId) || [];
    for (const id of sessionIds) {
      const session = sessions.find(s => s.sessionId === id);
      if (session) {
        if (operation === 'PAUSE') {
          session.runtimeState = 'PAUSED';
        } else if (operation === 'RESUME') {
          session.runtimeState = 'RUNNING';
        } else if (operation === 'CANCEL') {
          session.runtimeState = 'CANCELLED';
        } else if (operation === 'ARCHIVE') {
          session.runtimeState = 'EXPIRED';
        }
        session.updatedTime = new Date().toISOString();
        session.history.push({
          id: `h-${Date.now()}-${Math.random()}`,
          action: `BULK_${operation}`,
          operator,
          timestamp: new Date().toISOString(),
          details: `Bulk operation executed: ${operation}`
        });
      }
    }
    this.sessionsStore.set(strategyId, sessions);
    return this.buildOverview(sessions);
  }

  public async getWorkers() {
    return [
      { workerId: 'WORKER-01', name: 'Enterprise Runtime Node A', status: 'IDLE', cpu: 12.4, ram: 24.5, heartbeat: new Date().toLocaleTimeString(), healthScore: 98, currentSession: 'RUN-5001' },
      { workerId: 'WORKER-02', name: 'Enterprise Runtime Node B', status: 'BUSY', cpu: 45.2, ram: 52.1, heartbeat: new Date().toLocaleTimeString(), healthScore: 96, currentSession: 'RUN-5002' },
      { workerId: 'WORKER-03', name: 'Enterprise Runtime Node C', status: 'MAINTENANCE', cpu: 2.1, ram: 12.0, heartbeat: new Date().toLocaleTimeString(), healthScore: 90, currentSession: null }
    ];
  }

  public async getQueue(strategyId: string) {
    const overview = await this.getSessions(strategyId);
    return overview.sessions.filter(s => s.runtimeState === 'QUEUED' || s.runtimeState === 'PREPARING');
  }

  private buildOverview(sessions: StrategyRuntimeSession[]): RuntimeOverview {
    const total = sessions.length;
    const activeSessionsCount = sessions.filter(s => s.runtimeState === 'RUNNING' || s.runtimeState === 'READY').length;
    const queuedCount = sessions.filter(s => s.runtimeState === 'QUEUED' || s.runtimeState === 'PREPARING').length;
    const runningCount = sessions.filter(s => s.runtimeState === 'RUNNING').length;
    const pausedCount = sessions.filter(s => s.runtimeState === 'PAUSED').length;
    const completedCount = sessions.filter(s => s.runtimeState === 'COMPLETED').length;
    const rejectedOrFailedCount = sessions.filter(s => s.runtimeState === 'FAILED' || s.runtimeState === 'CANCELLED' || s.runtimeState === 'EXPIRED').length;

    const averageRuntimeHealth = total ? Math.round(sessions.reduce((acc, s) => acc + s.healthScore, 0) / total) : 0;
    const averageConfidence = total ? Math.round(sessions.reduce((acc, s) => acc + s.confidence, 0) / total) : 0;
    const averageLatencyMs = total ? parseFloat((sessions.reduce((acc, s) => acc + s.latencyMs, 0) / total).toFixed(1)) : 0;
    const averageRisk = total ? parseFloat((sessions.reduce((acc, s) => acc + s.riskScore, 0) / total).toFixed(1)) : 0;
    const averageExecutionReadiness = total ? parseFloat((sessions.reduce((acc, s) => acc + s.executionReadinessScore, 0) / total).toFixed(1)) : 0;

    return {
      sessions: sessions.sort((a, b) => a.queuePosition - b.queuePosition),
      statistics: {
        activeSessionsCount,
        queuedCount,
        runningCount,
        pausedCount,
        completedCount,
        rejectedOrFailedCount,
        averageRuntimeHealth,
        averageConfidence,
        averageLatencyMs,
        averageRisk,
        averageExecutionReadiness
      }
    };
  }
}

export const strategyRuntimeRepository = new StrategyRuntimeRepository();
