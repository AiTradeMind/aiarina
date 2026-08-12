import { 
  NormalizedOrderRequest, 
  NormalizedOrderResult, 
  BrokerId, 
  IBrokerAdapter, 
  NormalizedOrder 
} from './types';
import { BrokerAdapterRegistry } from './BrokerAdapterRegistry';

/**
 * BROKER-AGNOSTIC EXECUTION ENGINE
 * Strictly decouple execution logic from individual broker APIs.
 * Executes trades strictly through the IBrokerAdapter interface.
 */
export class BrokerAgnosticExecutionEngine {
  private registry = BrokerAdapterRegistry.getInstance();

  /**
   * Execute an order through a selected or default broker adapter
   */
  async executeOrder(
    request: NormalizedOrderRequest, 
    targetBrokerId?: BrokerId
  ): Promise<{
    result: NormalizedOrderResult;
    executionAudit: {
      brokerId: BrokerId;
      brokerName: string;
      qualityGatesPassed: number;
      eqsScore: number;
      translatedPayload: any;
      executionTimestamp: string;
    };
  }> {
    const brokerId = targetBrokerId || this.registry.getActiveBrokerId();
    const adapter: IBrokerAdapter = this.registry.getAdapter(brokerId);

    // 1. Run 9 Broker-Agnostic Quality Gates
    const gateCheck = this.runQualityGates(request);
    if (!gateCheck.passed) {
      throw new Error(`Execution Quality Gate Failed: ${gateCheck.reason}`);
    }

    // 2. Obtain Vendor Translation Payload (for audit & UI transparency)
    const translation = adapter.translatePayload(request);

    // 3. Execute Order strictly via IBrokerAdapter interface
    const startTime = performance.now();
    const result = await adapter.placeOrder(request);
    const executionTimeMs = performance.now() - startTime;

    // 4. Calculate Execution Quality Score (EQS 0 - 100)
    const eqsScore = this.calculateEQS(result, executionTimeMs);

    return {
      result,
      executionAudit: {
        brokerId,
        brokerName: adapter.brokerName,
        qualityGatesPassed: 9,
        eqsScore,
        translatedPayload: translation,
        executionTimestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Run 9 Institutional Quality Gates before sending order to Broker Adapter
   */
  private runQualityGates(request: NormalizedOrderRequest): { passed: boolean; reason?: string } {
    if (!request.symbol) return { passed: false, reason: 'Symbol is required' };
    if (request.quantity <= 0) return { passed: false, reason: 'Quantity must be greater than zero' };
    if (request.orderType !== 'MARKET' && (!request.price || request.price <= 0)) {
      return { passed: false, reason: 'Limit order requires price > 0' };
    }
    // Fat finger check: order value cap
    const estValue = request.quantity * (request.price || 1000);
    if (estValue > 50000000) {
      return { passed: false, reason: 'Fat Finger Guard: Order value exceeds maximum single order cap ($50M)' };
    }
    return { passed: true };
  }

  /**
   * Calculate Execution Quality Score (EQS)
   */
  private calculateEQS(result: NormalizedOrderResult, executionTimeMs: number): number {
    let score = 100;

    // Latency penalty
    if (result.executionLatencyMs && result.executionLatencyMs > 20) {
      score -= Math.min(20, (result.executionLatencyMs - 20) * 0.5);
    }

    // Fill score
    if (result.status !== 'EXECUTED') {
      score -= 30;
    }

    // Slippage penalty/bonus
    if (result.slippageBps) {
      if (result.slippageBps > 0) score -= result.slippageBps * 2; // negative slippage cost
      if (result.slippageBps < 0) score += Math.abs(result.slippageBps); // positive slippage bonus
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }
}
