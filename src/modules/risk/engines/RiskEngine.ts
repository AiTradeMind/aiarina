import { riskRepository } from "../repositories/RiskRepository.ts";
import { IRiskPolicy, IRiskMetric, PreTradeValidationPayload } from "../types/index.ts";

export class RiskEngine {
  public async validatePreTrade(payload: PreTradeValidationPayload): Promise<{ valid: boolean; reason?: string }> {
    // Check Portfolio Level Limits
    const portfolioPolicies = await riskRepository.getPolicies('PORTFOLIO', payload.portfolioId);
    const portfolioMetrics = await riskRepository.getMetric('PORTFOLIO', payload.portfolioId);
    
    const qty = parseFloat(payload.quantity);
    const prc = parseFloat(payload.price);
    const orderValue = qty * prc;

    for (const policy of portfolioPolicies) {
      if (policy.riskType === 'EXPOSURE' && portfolioMetrics) {
        const currentExposure = parseFloat(portfolioMetrics.currentExposure);
        const limitValue = parseFloat(policy.limitValue);
        if (currentExposure + orderValue > limitValue) {
          await this.logViolation(payload.organizationId, 'PORTFOLIO', payload.portfolioId, 'EXPOSURE', `Exposure limit breached. Current: ${currentExposure}, Order: ${orderValue}, Limit: ${limitValue}`);
          if (policy.action === 'BLOCK') return { valid: false, reason: "Portfolio exposure limit breached." };
        }
      }
    }

    // Check Strategy Level Limits
    if (payload.strategyId) {
      const stratPolicies = await riskRepository.getPolicies('STRATEGY', payload.strategyId);
      const stratMetrics = await riskRepository.getMetric('STRATEGY', payload.strategyId);
      
      for (const policy of stratPolicies) {
        if (policy.riskType === 'EXPOSURE' && stratMetrics) {
          const currentExposure = parseFloat(stratMetrics.currentExposure);
          const limitValue = parseFloat(policy.limitValue);
          if (currentExposure + orderValue > limitValue) {
            await this.logViolation(payload.organizationId, 'STRATEGY', payload.strategyId, 'EXPOSURE', `Strategy exposure limit breached.`);
            if (policy.action === 'BLOCK') return { valid: false, reason: "Strategy exposure limit breached." };
          }
        }
      }
    }

    // Check AI Level Limits
    if (payload.aiModelId) {
      const aiPolicies = await riskRepository.getPolicies('AI_MODEL', payload.aiModelId);
      const aiMetrics = await riskRepository.getMetric('AI_MODEL', payload.aiModelId);
      
      for (const policy of aiPolicies) {
        if (policy.riskType === 'CONSECUTIVE_LOSSES' && aiMetrics) {
          if (aiMetrics.consecutiveLosses >= parseInt(policy.limitValue)) {
            await this.logViolation(payload.organizationId, 'AI_MODEL', payload.aiModelId, 'CONSECUTIVE_LOSSES', `AI Model blocked due to consecutive losses.`);
            if (policy.action === 'BLOCK') return { valid: false, reason: "AI Model blocked due to consecutive losses." };
          }
        }
        
        if (policy.riskType === 'DAILY_LOSS' && aiMetrics) {
           const dailyLoss = parseFloat(aiMetrics.dailyLoss);
           const limitValue = parseFloat(policy.limitValue);
           if (dailyLoss > limitValue) {
             await this.logViolation(payload.organizationId, 'AI_MODEL', payload.aiModelId, 'DAILY_LOSS', `AI Model daily loss limit breached.`);
             if (policy.action === 'BLOCK') return { valid: false, reason: "AI Model daily loss limit breached." };
           }
        }
      }
    }

    return { valid: true };
  }

  private async logViolation(orgId: string, entityType: string, entityId: string, riskType: string, message: string) {
    await riskRepository.logEvent({
      organizationId: orgId,
      entityType,
      entityId,
      riskType,
      message
    });
  }
}

export const riskEngine = new RiskEngine();
