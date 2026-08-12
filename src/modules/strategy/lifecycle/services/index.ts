import { LifecycleRepository } from "../repositories/index.ts";
import { RegistryService } from "../../registry/services/index.ts";
import { 
  StrategyLifecycle, StrategyStateHistory, StrategyActivationLog,
  StrategyRetirementLog, StrategyTransition
} from "../types/index.ts";

const VALID_TRANSITIONS = [
  { from: 'Draft', to: 'Registered', requiresApproval: false },
  { from: 'Registered', to: 'Review', requiresApproval: false },
  { from: 'Review', to: 'Testing', requiresApproval: true },
  { from: 'Testing', to: 'Paper Trading', requiresApproval: false },
  { from: 'Paper Trading', to: 'Approved', requiresApproval: true },
  { from: 'Approved', to: 'Active', requiresApproval: false },
  { from: 'Active', to: 'Paused', requiresApproval: false },
  { from: 'Paused', to: 'Active', requiresApproval: false },
  { from: 'Active', to: 'Suspended', requiresApproval: true },
  { from: 'Suspended', to: 'Active', requiresApproval: true },
  { from: 'Active', to: 'Deprecated', requiresApproval: false },
  { from: 'Deprecated', to: 'Retired', requiresApproval: false },
  { from: 'Retired', to: 'Archived', requiresApproval: false }
];

export class LifecycleService {
  private repo = new LifecycleRepository();
  private registryService = new RegistryService();

  async getLifecycles(): Promise<StrategyLifecycle[]> {
    return await this.repo.getLifecycles();
  }

  async getLifecycleByStrategyId(strategyId: string): Promise<any> {
    const lifecycle = await this.repo.getLifecycleByStrategyId(strategyId);
    if (!lifecycle) return null;

    const [history, activationLogs, retirementLogs] = await Promise.all([
      this.repo.getHistory(strategyId),
      this.repo.getActivationLogs(strategyId),
      this.repo.getRetirementLogs(strategyId)
    ]);

    return {
      ...lifecycle,
      history,
      activationLogs,
      retirementLogs
    };
  }

  async getHistory(strategyId: string): Promise<StrategyStateHistory[]> {
    return await this.repo.getHistory(strategyId);
  }

  async registerLifecycle(strategyId: string, version: string): Promise<{ success: boolean; data?: StrategyLifecycle; error?: string }> {
    const existing = await this.repo.getLifecycleByStrategyId(strategyId);
    if (existing) return { success: false, error: 'Lifecycle already exists' };

    const lifecycle: StrategyLifecycle = {
      id: crypto.randomUUID(),
      strategyId,
      currentState: 'Registered',
      previousState: 'Draft',
      createdTime: new Date(),
      activatedTime: null,
      pausedTime: null,
      retiredTime: null,
      currentVersion: version,
      approvalStatus: 'PENDING',
      approvalBy: null,
      approvalNotes: null,
      updatedTime: new Date()
    };

    await this.repo.createLifecycle(lifecycle);

    await this.repo.createStateHistory({
      id: crypto.randomUUID(),
      strategyId,
      oldState: 'Draft',
      newState: 'Registered',
      timestamp: new Date(),
      userId: 'SYSTEM',
      reason: 'Initial Registration',
      notes: null
    });

    return { success: true, data: lifecycle };
  }

  async transitionState(data: { strategyId: string; newState: string; userId: string; reason: string; notes?: string }): Promise<{ success: boolean; error?: string }> {
    const lifecycle = await this.repo.getLifecycleByStrategyId(data.strategyId);
    if (!lifecycle) return { success: false, error: 'Lifecycle not found' };

    const transition = VALID_TRANSITIONS.find(t => t.from === lifecycle.currentState && t.to === data.newState);
    if (!transition) {
       return { success: false, error: `Invalid transition from ${lifecycle.currentState} to ${data.newState}` };
    }

    // Additional validations before moving to specific states
    if (data.newState === 'Active') {
      const strategy = await this.registryService.getStrategyById(data.strategyId);
      if (!strategy) return { success: false, error: 'Strategy not found in registry' };
      if (!strategy.metadata || strategy.metadata.length === 0) return { success: false, error: 'Cannot activate without Metadata' };
      // if (!strategy.dependencies) ... could check more
    }

    const updates: Partial<StrategyLifecycle> = {
      previousState: lifecycle.currentState,
      currentState: data.newState,
      updatedTime: new Date()
    };

    if (data.newState === 'Active' && lifecycle.currentState !== 'Paused' && lifecycle.currentState !== 'Suspended') {
      updates.activatedTime = new Date();
    }
    if (data.newState === 'Paused') updates.pausedTime = new Date();
    if (data.newState === 'Retired') updates.retiredTime = new Date();

    await this.repo.updateLifecycle(lifecycle.id, updates);

    await this.repo.createStateHistory({
      id: crypto.randomUUID(),
      strategyId: data.strategyId,
      oldState: lifecycle.currentState,
      newState: data.newState,
      timestamp: new Date(),
      userId: data.userId,
      reason: data.reason,
      notes: data.notes || null
    });

    // Also update strategy registry status to keep it in sync
    let registryStatus = 'ACTIVE';
    if (data.newState === 'Paused' || data.newState === 'Suspended') registryStatus = 'INACTIVE';
    if (data.newState === 'Retired' || data.newState === 'Archived') registryStatus = 'RETIRED';
    
    await this.registryService.updateStrategy(data.strategyId, { status: registryStatus });

    return { success: true };
  }

  async activateStrategy(data: { strategyId: string; userId: string; notes?: string }): Promise<{ success: boolean; error?: string }> {
    const res = await this.transitionState({
      strategyId: data.strategyId,
      newState: 'Active',
      userId: data.userId,
      reason: 'Manual Activation',
      notes: data.notes
    });
    
    if (res.success) {
      const lifecycle = await this.repo.getLifecycleByStrategyId(data.strategyId);
      if (lifecycle) {
        await this.repo.createActivationLog({
          id: crypto.randomUUID(),
          strategyId: data.strategyId,
          version: lifecycle.currentVersion,
          activatedBy: data.userId,
          timestamp: new Date(),
          status: 'SUCCESS',
          notes: data.notes || null
        });
      }
    }
    return res;
  }

  async pauseStrategy(data: { strategyId: string; userId: string; reason: string }): Promise<{ success: boolean; error?: string }> {
    return await this.transitionState({
      strategyId: data.strategyId,
      newState: 'Paused',
      userId: data.userId,
      reason: data.reason
    });
  }

  async retireStrategy(data: { strategyId: string; userId: string; reason: string; notes?: string }): Promise<{ success: boolean; error?: string }> {
    const res = await this.transitionState({
      strategyId: data.strategyId,
      newState: 'Retired',
      userId: data.userId,
      reason: data.reason,
      notes: data.notes
    });
    
    if (res.success) {
      const lifecycle = await this.repo.getLifecycleByStrategyId(data.strategyId);
      if (lifecycle) {
        await this.repo.createRetirementLog({
          id: crypto.randomUUID(),
          strategyId: data.strategyId,
          version: lifecycle.currentVersion,
          retiredBy: data.userId,
          timestamp: new Date(),
          reason: data.reason,
          notes: data.notes || null
        });
      }
    }
    return res;
  }

  async seedInitialData(): Promise<void> {
    const strategies = await this.registryService.getStrategies();
    for (const strat of strategies) {
      const lf = await this.repo.getLifecycleByStrategyId(strat.id);
      if (!lf) {
        await this.registerLifecycle(strat.id, strat.version);
        if (strat.status === 'ACTIVE') {
           // forcefully transition to Active
           const lifecycle = await this.repo.getLifecycleByStrategyId(strat.id);
           if (lifecycle) {
             await this.repo.updateLifecycle(lifecycle.id, {
               previousState: 'Registered',
               currentState: 'Active',
               activatedTime: new Date()
             });
             await this.repo.createStateHistory({
                id: crypto.randomUUID(),
                strategyId: strat.id,
                oldState: 'Registered',
                newState: 'Active',
                timestamp: new Date(),
                userId: 'SYSTEM',
                reason: 'Seed',
                notes: null
             });
           }
        }
      }
    }
  }
}
