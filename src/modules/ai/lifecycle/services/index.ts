import { LifecycleRepository } from "../repositories/index.ts";
import { AIModelLifecycle, AIModelStateHistory } from "../types/index.ts";
import { randomUUID } from "crypto";
import { EvaluationService } from "./evaluation.ts";
import { LearningService } from "./learning.ts";

const VALID_TRANSITIONS = [
  { from: 'Draft', to: 'Training', requiresApproval: false },
  { from: 'Training', to: 'Validation', requiresApproval: true },
  { from: 'Validation', to: 'Paper Trading', requiresApproval: true },
  { from: 'Paper Trading', to: 'Evaluation', requiresApproval: false },
  { from: 'Evaluation', to: 'Candidate', requiresApproval: true },
  { from: 'Candidate', to: 'Production', requiresApproval: true },
  { from: 'Production', to: 'Monitoring', requiresApproval: false },
  { from: 'Monitoring', to: 'Learning', requiresApproval: false },
  { from: 'Monitoring', to: 'Suspended', requiresApproval: true },
  { from: 'Learning', to: 'Production', requiresApproval: false },
  { from: 'Suspended', to: 'Production', requiresApproval: true },
  { from: 'Production', to: 'Retired', requiresApproval: false },
  { from: 'Retired', to: 'Archived', requiresApproval: false }
];

export class LifecycleService {
  private repo = new LifecycleRepository();
  private evalService = new EvaluationService();
  private learningService = new LearningService();

  async getLifecycles(): Promise<AIModelLifecycle[]> {
    return await this.repo.getLifecycles();
  }

  async getLifecycleByModelId(modelId: number): Promise<any> {
    const lifecycle = await this.repo.getLifecycleByModelId(modelId);
    if (!lifecycle) return null;

    const [history, activationLogs, retirementLogs] = await Promise.all([
      this.repo.getHistory(modelId),
      this.repo.getActivationLogs(modelId),
      this.repo.getRetirementLogs(modelId)
    ]);

    return {
      ...lifecycle,
      history,
      activationLogs,
      retirementLogs
    };
  }

  async registerModelLifecycle(modelId: number, version: string): Promise<{ success: boolean; error?: string }> {
    const lifecycle: AIModelLifecycle = {
      id: randomUUID(),
      modelId,
      currentState: 'Draft',
      previousState: null,
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
      id: randomUUID(),
      modelId,
      oldState: null,
      newState: 'Draft',
      timestamp: new Date(),
      userId: 'SYSTEM',
      reason: 'Initial Registration',
      notes: null
    });

    return { success: true };
  }

  async transitionState(data: { modelId: number; newState: string; userId: string; reason: string; notes?: string }): Promise<{ success: boolean; error?: string }> {
    const lifecycle = await this.repo.getLifecycleByModelId(data.modelId);
    if (!lifecycle) return { success: false, error: 'Lifecycle not found' };

    const transition = VALID_TRANSITIONS.find(t => t.from === lifecycle.currentState && t.to === data.newState);
    if (!transition) {
       return { success: false, error: `Invalid transition from ${lifecycle.currentState} to ${data.newState}` };
    }

    const updates: Partial<AIModelLifecycle> = {
      previousState: lifecycle.currentState,
      currentState: data.newState,
      updatedTime: new Date()
    };

    if (data.newState === 'Production') updates.activatedTime = new Date();
    if (data.newState === 'Retired') updates.retiredTime = new Date();

    await this.repo.updateLifecycle(lifecycle.id, updates);

    await this.repo.createStateHistory({
      id: randomUUID(),
      modelId: data.modelId,
      oldState: lifecycle.currentState,
      newState: data.newState,
      timestamp: new Date(),
      userId: data.userId,
      reason: data.reason,
      notes: data.notes || null
    });

    return { success: true };
  }

  async runPromotionCheck(modelId: number, organizationId: string): Promise<void> {
    const evaluation = await this.evalService.evaluateModel(modelId, organizationId);
    if (evaluation.accuracy > 80) {
        await this.transitionState({ modelId, newState: 'Candidate', userId: 'SYSTEM', reason: 'Auto-promotion due to high accuracy' });
    }
    await this.learningService.processLearning(modelId, organizationId);
  }
}
