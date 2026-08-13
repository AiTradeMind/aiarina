import { ProviderFactory } from '../../../infrastructure/providers/provider.factory';
import { AIDecisionResult } from '../../ai/decision/ai-decision.engine';
import { CommitteeConsensusResult } from '../../committee/services/ai-committee.engine';
import { RiskEnforcementEngine } from '../../risk/services/risk-enforcement.engine';
import { AIRuntimeMemoryService } from '../../ai/memory/ai-runtime-memory.service';
import logger from '../../../lib/logger';
import { BrokerOrderResult } from '../../../infrastructure/abstractions';

export interface PaperExecutionPipelineResult {
  pipelineAuditId: string;
  status: 'EXECUTED' | 'BLOCKED_BY_RISK' | 'SAFETY_HOLD' | 'ERROR';
  brokerOrder?: BrokerOrderResult;
  riskAuditId?: string;
  rejectionReasons?: string[];
  executedAt: Date;
}

export class PaperTradingPipelineService {
  private static instance: PaperTradingPipelineService;

  private constructor() {
    // Hard check at initialization time
    if (process.env.LIVE_TRADING_ENABLED === 'true') {
      logger.error('CRITICAL SAFETY ALERT: Live trading environment variable detected! Disabling real trading routing.');
    }
  }

  public static getInstance(): PaperTradingPipelineService {
    if (!PaperTradingPipelineService.instance) {
      PaperTradingPipelineService.instance = new PaperTradingPipelineService();
    }
    return PaperTradingPipelineService.instance;
  }

  public async processDecisionSignal(
    decision: AIDecisionResult | CommitteeConsensusResult,
    symbol: string,
    quantity: number,
    price: number
  ): Promise<PaperExecutionPipelineResult> {
    const pipelineAuditId = `ptr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const providerFactory = ProviderFactory.getInstance();
    const broker = providerFactory.getBrokerAdapter();
    const riskEngine = RiskEnforcementEngine.getInstance();
    const memoryService = AIRuntimeMemoryService.getInstance();

    // 1. Safety Check: Hard block live trading
    if (process.env.LIVE_TRADING_ENABLED === 'true') {
      throw new Error('CRITICAL SAFETY BLOCK: Live trading execution is strictly prohibited.');
    }

    // Determine signal
    const signal = 'finalSignal' in decision ? decision.finalSignal : decision.signal;

    if (signal === 'HOLD' || signal === 'NEUTRAL') {
      logger.info({ pipelineAuditId, signal, symbol }, 'Pipeline received HOLD/NEUTRAL. No trade executed.');
      return {
        pipelineAuditId,
        status: 'SAFETY_HOLD',
        executedAt: new Date()
      };
    }

    const side = signal === 'BUY' ? 'BUY' : 'SELL';

    // 2. Risk Enforcement Check
    const account = await broker.getAccountInfo();
    const positions = await broker.getPositions();

    const riskEval = riskEngine.evaluateRisk({
      symbol,
      side,
      quantity,
      price,
      account,
      positions
    });

    if (!riskEval.passed) {
      logger.warn({ pipelineAuditId, reasons: riskEval.blockedReasons }, 'Paper trade pipeline blocked by Risk Engine');
      return {
        pipelineAuditId,
        status: 'BLOCKED_BY_RISK',
        riskAuditId: riskEval.riskAuditId,
        rejectionReasons: riskEval.blockedReasons,
        executedAt: new Date()
      };
    }

    // 3. Virtual Order Execution via Sandbox Broker
    try {
      const brokerOrder = await broker.placeOrder({
        symbol,
        side,
        orderType: 'LIMIT',
        quantity: riskEval.approvedQuantity,
        price,
        timeInForce: 'GTC'
      });

      // 4. Record Trade in Memory & Audit Logs
      memoryService.recordTrade({
        orderId: brokerOrder.orderId,
        symbol: brokerOrder.symbol,
        side,
        quantity: brokerOrder.filledQuantity || quantity,
        price: brokerOrder.avgFillPrice || price
      });

      logger.info({ pipelineAuditId, orderId: brokerOrder.orderId, symbol, side, qty: brokerOrder.filledQuantity }, 'Paper trade successfully processed');

      return {
        pipelineAuditId,
        status: 'EXECUTED',
        brokerOrder,
        riskAuditId: riskEval.riskAuditId,
        executedAt: new Date()
      };
    } catch (err: any) {
      logger.error({ pipelineAuditId, error: err.message }, 'Error in Paper Trading execution pipeline');
      return {
        pipelineAuditId,
        status: 'ERROR',
        rejectionReasons: [err.message],
        executedAt: new Date()
      };
    }
  }
}
