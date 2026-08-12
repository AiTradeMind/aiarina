import { 
  StrategyRepository, 
  StrategyRuleRepository, 
  StrategyExecutionRepository, 
  StrategyResultRepository 
} from "../repositories/index.ts";
import { 
  Strategy, 
  EvaluateStrategyRequest, 
  StrategyExecutionAction,
  StrategyExecution
} from "../types/index.ts";
import { EventBusService } from "../../events/services/index.ts";
import { RiskService } from "../../risk/services/index.ts";

export class StrategyService {
  private strategyRepo = new StrategyRepository();
  private ruleRepo = new StrategyRuleRepository();
  private executionRepo = new StrategyExecutionRepository();
  private resultRepo = new StrategyResultRepository();
  private eventBus = EventBusService.getInstance();
  private riskService = new RiskService();

  async getStrategies(organizationId: string): Promise<Strategy[]> {
    return await this.strategyRepo.findAll(organizationId);
  }

  async createStrategy(data: any): Promise<Strategy> {
    return await this.strategyRepo.create(data);
  }

  async updateStrategy(id: number, organizationId: string, data: any): Promise<void> {
    await this.strategyRepo.update(id, organizationId, data);
  }

  async getResults(organizationId: string) {
    return await this.resultRepo.findAll(organizationId);
  }

  async evaluate(request: EvaluateStrategyRequest, organizationId: string): Promise<StrategyExecution> {
    const startTime = Date.now();
    
    // 1. Find matching strategy
    const allStrategies = await this.strategyRepo.findAll(organizationId);
    const strategy = allStrategies.find(s => s.type === request.type && s.isActive);

    if (!strategy) {
      return await this.recordDefaultExecution(request, organizationId, startTime);
    }

    // 2. Evaluate Strategy Rules
    const rules = await this.ruleRepo.findByStrategyId(strategy.id);
    let finalAction: StrategyExecutionAction = 'ALLOW';
    let rationale = `Evaluated by strategy: ${strategy.name}. `;
    let modifiedData = null;

    for (const rule of rules) {
      if (!rule.isActive) continue;
      
      const pass = this.evaluateCondition(rule.condition, request.input);
      if (pass) {
        finalAction = rule.action;
        rationale += `Rule matched: ${rule.name} -> ${rule.action}. `;
        if (finalAction === 'REJECT') break;
      }
    }

    // 3. Final Confidence Check
    if (request.input.confidence && parseFloat(request.input.confidence) < parseFloat(strategy.confidenceThreshold)) {
      finalAction = 'REJECT';
      rationale += `Confidence ${request.input.confidence} below threshold ${strategy.confidenceThreshold}. `;
    }

    // 4. Risk Engine Integration
    if (finalAction === 'ALLOW' && request.input.ticker && request.input.quantity) {
      try {
        const riskResult = await this.riskService.validateOrder({
          organizationId,
          userId: request.userId,
          orderRequest: {
            ticker: request.input.ticker,
            side: request.input.side as any,
            quantity: parseFloat(request.input.quantity),
            type: 'MARKET',
          }
        });

        if (!riskResult.passed) {
          finalAction = 'REJECT';
          rationale += `Blocked by Risk Engine: ${riskResult.message}. `;
        } else {
          rationale += `Passed Risk Engine validation. `;
        }
      } catch (error: any) {
        finalAction = 'REJECT';
        rationale += `Risk Engine error: ${error.message}. `;
      }
    }

    const execution = await this.executionRepo.create({
      strategyId: strategy.id,
      organizationId,
      decisionId: request.decisionId || null,
      inputData: request.input,
      outputAction: finalAction,
      modifiedData,
      rationale,
      latencyMs: Date.now() - startTime,
    });

    // 4. Publish Events
    if (finalAction === 'ALLOW') {
      await this.eventBus.publish({
        eventType: 'STRATEGY_APPROVED',
        source: 'STRATEGY_ENGINE',
        organizationId,
        payload: { strategyId: strategy.id, action: finalAction, input: request.input },
      });
    } else if (finalAction === 'REJECT') {
      await this.eventBus.publish({
        eventType: 'STRATEGY_REJECTED',
        source: 'STRATEGY_ENGINE',
        organizationId,
        payload: { strategyId: strategy.id, action: finalAction, rationale },
      });
    }

    return execution;
  }

  private evaluateCondition(condition: string, input: any): boolean {
    // Simple mock DSL evaluation. In production this would be a sandbox VM
    try {
      if (condition === 'true') return true;
      if (condition.includes('ticker ===')) {
        const ticker = condition.split('===')[1].trim().replace(/'/g, '');
        return input.ticker === ticker;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  private async recordDefaultExecution(request: EvaluateStrategyRequest, organizationId: string, startTime: number): Promise<StrategyExecution> {
    return await this.executionRepo.create({
      strategyId: null,
      organizationId,
      decisionId: request.decisionId || null,
      inputData: request.input,
      outputAction: 'ALLOW',
      rationale: 'No active strategy found for type. Defaulting to ALLOW.',
      latencyMs: Date.now() - startTime,
    });
  }
}
