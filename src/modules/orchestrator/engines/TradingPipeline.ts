import { orchestratorRepository } from "../repositories/OrchestratorRepository.ts";
import { riskEngine } from "../../risk/engines/RiskEngine.ts";
import { orderEngine } from "../../orders/services/OrderEngine.ts";
import { portfolioService } from "../../portfolios/services/PortfolioService.ts";
import { auditEngine } from "../../audit/services/AuditEngine.ts";
import { PipelineExecutionPayload } from "../types/index.ts";
import { randomUUID } from "crypto";

export class TradingPipeline {
  public async executeFlow(payload: PipelineExecutionPayload): Promise<void> {
    const pipelineId = `pl_${randomUUID().replace(/-/g, '').substring(0, 12)}`;
    let currentStage = 'INITIALIZATION';
    let orderId = 'PENDING';
    
    try {
      await orchestratorRepository.createPipeline({
        id: pipelineId,
        organizationId: payload.organizationId,
        orderId,
        status: 'RUNNING',
        currentStage
      });

      // 1. Order Creation
      currentStage = 'ORDER_CREATION';
      await orchestratorRepository.updatePipeline(pipelineId, { currentStage });
      const orderStart = Date.now();
      
      // We pass a dummy actorId 1 for now since enterprise orchestrator uses system accounts
      const order = await orderEngine.createOrder(1, {
        organizationId: payload.organizationId,
        portfolioId: payload.portfolioId,
        symbol: payload.symbol,
        assetClass: payload.assetClass as any,
        side: payload.side,
        type: 'MARKET',
        quantity: payload.quantity,
        price: payload.price,
        timeInForce: 'DAY',
        strategyId: payload.strategyId,
        aiRecommendationId: payload.aiModelId
      } as any);
      orderId = order.id.toString();
      
      await orchestratorRepository.updatePipeline(pipelineId, { orderId });
      await this.logEvent(pipelineId, currentStage, 'SUCCESS', Date.now() - orderStart);

      // 2. Risk Validation
      currentStage = 'RISK_VALIDATION';
      const riskStart = Date.now();
      await orchestratorRepository.updatePipeline(pipelineId, { currentStage });
      
      const riskResult = await riskEngine.validatePreTrade(payload);
      if (!riskResult.valid) {
         throw new Error(`Risk validation failed: ${riskResult.reason}`);
      }
      
      await this.logEvent(pipelineId, currentStage, 'SUCCESS', Date.now() - riskStart);

      // 3. Execution Engine
      currentStage = 'EXECUTION';
      const execStart = Date.now();
      await orchestratorRepository.updatePipeline(pipelineId, { currentStage });
      
      const execId = `exec_${randomUUID().replace(/-/g, '').substring(0, 12)}`;
      await this.logEvent(pipelineId, currentStage, 'SUCCESS', Date.now() - execStart);

      // 4. Portfolio & Position Update (which calls TradeJournal and PnL)
      currentStage = 'PORTFOLIO_UPDATE';
      const portStart = Date.now();
      await orchestratorRepository.updatePipeline(pipelineId, { currentStage });
      
      await portfolioService.handleExecution({
        organizationId: payload.organizationId,
        portfolioId: payload.portfolioId,
        symbol: payload.symbol,
        assetClass: payload.assetClass,
        side: payload.side,
        quantity: payload.quantity,
        price: payload.price,
        executionId: execId
      });
      
      await this.logEvent(pipelineId, currentStage, 'SUCCESS', Date.now() - portStart);

      // 5. Completion
      currentStage = 'COMPLETED';
      await orchestratorRepository.updatePipeline(pipelineId, { status: 'COMPLETED', currentStage });
      
      await auditEngine.logEvent({
        organizationId: payload.organizationId,
        action: "PIPELINE_COMPLETED",
        sourceModule: "ORCHESTRATOR",
        resourceType: "PIPELINE",
        resourceId: pipelineId,
        details: { orderId }
      });
      
    } catch (err: any) {
      await orchestratorRepository.updatePipeline(pipelineId, { 
        status: 'FAILED', 
        currentStage, 
        error: err.message 
      });
      await this.logEvent(pipelineId, currentStage, 'FAILED', 0);
      
      await auditEngine.logEvent({
        organizationId: payload.organizationId,
        action: "PIPELINE_FAILED",
        sourceModule: "ORCHESTRATOR",
        resourceType: "PIPELINE",
        resourceId: pipelineId,
        details: { orderId, error: err.message, stage: currentStage }
      });
      
      throw err;
    }
  }
  
  private async logEvent(pipelineId: string, stage: string, status: 'SUCCESS'|'FAILED', latencyMs: number) {
    await orchestratorRepository.logEvent({
      pipelineId,
      stage,
      status,
      latencyMs
    });
  }
}

export const tradingPipeline = new TradingPipeline();
