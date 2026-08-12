import { ProviderFactory } from '../../../infrastructure/providers/provider.factory';
import { AIRuntimeMemoryService } from '../memory/ai-runtime-memory.service';
import logger from '../../../lib/logger';

export interface AIDecisionRequest {
  strategyId: string;
  symbol: string;
  timeframe: string;
  customParameters?: Record<string, any>;
}

export interface AIDecisionResult {
  decisionAuditId: string;
  strategyId: string;
  symbol: string;
  signal: 'BUY' | 'SELL' | 'HOLD' | 'NEUTRAL';
  confidence: number;
  explanation: string;
  suggestedQuantity: number;
  suggestedPrice: number;
  marketContext: any;
  timestamp: Date;
}

export class AIDecisionEngine {
  private static instance: AIDecisionEngine;

  private constructor() {}

  public static getInstance(): AIDecisionEngine {
    if (!AIDecisionEngine.instance) {
      AIDecisionEngine.instance = new AIDecisionEngine();
    }
    return AIDecisionEngine.instance;
  }

  public async evaluateDecision(request: AIDecisionRequest): Promise<AIDecisionResult> {
    const providerFactory = ProviderFactory.getInstance();
    const marketProvider = providerFactory.getMarketDataProvider();
    const aiGateway = providerFactory.getAIGatewayProvider();
    const broker = providerFactory.getBrokerAdapter();
    const memoryService = AIRuntimeMemoryService.getInstance();

    const auditId = `dec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    logger.info({ auditId, strategyId: request.strategyId, symbol: request.symbol }, 'Starting AI Decision Pipeline evaluation');

    // 1. Gather Market Context
    const quote = await marketProvider.getQuote(request.symbol);
    const candles = await marketProvider.getHistoricalCandles(
      request.symbol,
      request.timeframe,
      new Date(Date.now() - 3600000 * 24),
      new Date()
    );

    // 2. Gather Portfolio Context
    const account = await broker.getAccountInfo();
    const positions = await broker.getPositions();
    const activePosition = positions.find(p => p.symbol === request.symbol.toUpperCase());

    // 3. Gather Memory Context
    const recentDecisions = memoryService.getRecentDecisions(request.symbol, 3);
    const regime = memoryService.getMarketRegime(request.symbol);

    // 4. Construct AI Prompt Context
    const promptMessages = [
      {
        role: 'system' as const,
        content: `You are AI ARINA Enterprise Strategy Decision Engine. Analyze the market context and generate an optimal trading decision. Return JSON with keys: signal ("BUY", "SELL", "HOLD", "NEUTRAL"), confidence (0.0 to 1.0), explanation (string), suggestedQuantity (number), suggestedPrice (number).`
      },
      {
        role: 'user' as const,
        content: JSON.stringify({
          strategyId: request.strategyId,
          symbol: request.symbol,
          quote: { last: quote.lastPrice, bid: quote.bid, ask: quote.ask, volume: quote.volume24h },
          recentCandlesCount: candles.length,
          marketRegime: regime,
          portfolio: { availableBalance: account.balance, unrealizedPnL: account.unrealizedPnL },
          activePosition: activePosition ? { side: activePosition.side, qty: activePosition.quantity, pnl: activePosition.unrealizedPnL } : null,
          recentDecisions: recentDecisions.map(d => ({ signal: d.signal, conf: d.confidence, exp: d.explanation }))
        })
      }
    ];

    // 5. Execute AI Generation with Circuit Breaker Protection
    const circuitBreaker = providerFactory.getAICircuitBreaker();
    const aiResult = await circuitBreaker.execute(async () => {
      return await aiGateway.generateCompletion(promptMessages, {
        temperature: 0.2
      });
    }, async () => {
      // Fallback decision if AI circuit breaker trips
      return {
        content: JSON.stringify({
          signal: 'NEUTRAL',
          confidence: 0.5,
          explanation: 'AI Circuit Breaker active. Default safety neutral decision applied.',
          suggestedQuantity: 0,
          suggestedPrice: quote.lastPrice
        }),
        model: 'fallback-safety',
        finishReason: 'fallback'
      };
    });

    // 6. Parse AI Output
    let parsedDecision: any = {};
    try {
      const cleanedJson = aiResult.content.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedDecision = JSON.parse(cleanedJson);
    } catch {
      // Fallback string parser
      const isBuy = aiResult.content.toUpperCase().includes('BUY');
      const isSell = aiResult.content.toUpperCase().includes('SELL');
      parsedDecision = {
        signal: isBuy ? 'BUY' : isSell ? 'SELL' : 'NEUTRAL',
        confidence: 0.7,
        explanation: aiResult.content.slice(0, 150),
        suggestedQuantity: 1,
        suggestedPrice: quote.lastPrice
      };
    }

    const result: AIDecisionResult = {
      decisionAuditId: auditId,
      strategyId: request.strategyId,
      symbol: request.symbol.toUpperCase(),
      signal: parsedDecision.signal || 'NEUTRAL',
      confidence: Math.min(Math.max(parsedDecision.confidence || 0.5, 0), 1),
      explanation: parsedDecision.explanation || 'Evaluated successfully.',
      suggestedQuantity: parsedDecision.suggestedQuantity || 1,
      suggestedPrice: parsedDecision.suggestedPrice || quote.lastPrice,
      marketContext: { quote, regime },
      timestamp: new Date()
    };

    // 7. Store in Memory
    memoryService.recordDecision(
      request.strategyId,
      request.symbol,
      result.signal,
      result.confidence,
      result.explanation,
      result.marketContext
    );

    return result;
  }
}
