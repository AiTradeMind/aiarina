import { TransactionSide } from "../../trading/types/index.ts";
import { EventBusService } from "../../events/services/index.ts";
import { executionCoordinator } from "./execution-coordinator.ts";
import { PaperTradingService } from "./index.ts";
import logger from "../../../lib/logger";

export interface AIVote {
  modelId: string;
  modelName: string;
  vote: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  weight: number;
  rationale: string;
}

export interface ConsensusReport {
  ticker: string;
  votes: AIVote[];
  consensusDecision: 'BUY' | 'SELL' | 'HOLD';
  confidenceScore: number;
  conflictDetected: boolean;
  priorityResolutionApplied: boolean;
  voteSummary: Record<'BUY' | 'SELL' | 'HOLD', number>;
  executionAttribution: string; // which models drove the final outcome
  timestamp: string;
}

export class MultiAIExecutor {
  private static instance: MultiAIExecutor;
  private eventBus = EventBusService.getInstance();

  private modelProfiles = [
    { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro (Value/Reasoning)", weight: 0.45 },
    { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash (Trend-Following)", weight: 0.35 },
    { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash (Momentum)", weight: 0.20 }
  ];

  public static getInstance(): MultiAIExecutor {
    if (!MultiAIExecutor.instance) {
      MultiAIExecutor.instance = new MultiAIExecutor();
    }
    return MultiAIExecutor.instance;
  }

  /**
   * Triggers a Multi-AI consensus voting process on a specific stock/ticker.
   * Compiles the consensus decision, resolves conflicts, and optionally auto-routes order.
   */
  async requestConsensus(ticker: string, currentPrice: number, organizationId: string, userId: number): Promise<ConsensusReport> {
    logger.info(`[MultiAIExecutor] Requesting consensus for ticker ${ticker} at price $${currentPrice}`);

    // Generate simulated intelligent responses from each model's point of view
    const votes: AIVote[] = this.modelProfiles.map(p => {
      // Determine deterministic confidence and signals based on ticker and price hash
      const hash = ticker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const isBullish = (hash + currentPrice) % 2 === 0;
      
      let confidence = 0.75 + ((hash % 20) / 100); // Deterministic 0.75-0.95
      let rationale = "";
      let vote: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';

      // Add character to model decisions
      if (p.id === 'gemini-1.5-pro') {
        // Value investor style
        if (currentPrice < 130) {
          vote = 'BUY';
          rationale = `Ticker ${ticker} displays positive cash-flow multiple margins. Price $${currentPrice} represents a strong support entry.`;
        } else if (currentPrice > 180) {
          vote = 'SELL';
          rationale = `Valuation multiple looks stretched at $${currentPrice}. Mean-reversion signals profit liquidation is optimal.`;
        } else {
          vote = 'HOLD';
          rationale = `Trading in neutral fair value range. Consolidating positions to hedge risk exposure.`;
        }
      } else if (p.id === 'gemini-2.0-flash') {
        // Trend style
        if (isBullish) {
          vote = 'BUY';
          rationale = `Moving average cross (50-EMA vs 200-EMA) confirms institutional bullish momentum on ${ticker}.`;
        } else {
          vote = 'HOLD';
          rationale = `Minor breakdown below channel support. Consolidating and waiting for volume confirmation.`;
        }
      } else {
        // Momentum style
        const momentum = isBullish ? 'BUY' : 'SELL';
        vote = momentum;
        if (momentum === 'BUY') {
          rationale = `RSI(14) breakout signals intense upward momentum. Acceleration-based buy limit triggered.`;
        } else {
          rationale = `Short-term momentum is exhausted. Price overbought; taking tactical profits.`;
        }
      }

      return {
        modelId: p.id,
        modelName: p.name,
        vote,
        confidence,
        weight: p.weight,
        rationale
      };
    });

    // Run Consensus resolution
    const report = this.resolveConsensus(ticker, votes);

    // Record decision and trigger Event
    await this.eventBus.publish({
      eventType: 'AI_CONSENSUS_COMPLETED',
      source: 'MULTI_AI_EXECUTOR',
      organizationId,
      userId,
      payload: { report },
      notify: {
        title: `AI Consensus: ${report.consensusDecision} ${ticker}`,
        message: `Consensus reached with confidence ${(report.confidenceScore * 100).toFixed(0)}%. Conflict: ${report.conflictDetected ? 'YES' : 'NO'}.`,
        type: report.consensusDecision === 'BUY' ? 'SUCCESS' : (report.consensusDecision === 'SELL' ? 'WARNING' : 'INFO')
      }
    });

    // If consensus is to trade, we can optionally submit order automatically!
    if (report.consensusDecision === 'BUY' || report.consensusDecision === 'SELL') {
      try {
        const paperService = new PaperTradingService();
        const side: TransactionSide = report.consensusDecision === 'BUY' ? 'BUY' : 'SELL';
        
        // Execute a small paper position automatically
        const quantity = ticker === 'RELIANCE' ? 0.05 : 10;
        
        logger.info(`[MultiAIExecutor] Routing consensus-driven order for ${quantity} ${ticker} (${side})`);
        
        // Use existing paperTradingService to validate risk and create order
        const order = await paperService.createOrder(organizationId, userId, {
          ticker,
          side,
          quantity,
          type: 'MARKET',
          stopLoss: 0,
          target: 0
        });

        report.executionAttribution += ` | Order #${order.id} automatically routed to Execution Coordinator.`;
      } catch (err: any) {
        logger.error(`[MultiAIExecutor] Failsafe order routing bypassed: ${err.message}`);
        report.executionAttribution += ` | Auto-route failed: ${err.message}`;
      }
    }

    return report;
  }

  private resolveConsensus(ticker: string, votes: AIVote[]): ConsensusReport {
    const voteSummary = { BUY: 0, SELL: 0, HOLD: 0 };
    const weightedScores = { BUY: 0, SELL: 0, HOLD: 0 };

    votes.forEach(v => {
      voteSummary[v.vote]++;
      // Score = Vote Weight * Individual Confidence
      weightedScores[v.vote] += v.weight * v.confidence;
    });

    // Check for conflict: If there are different votes casted (e.g. one BUY and one SELL)
    const activeVotes = Object.keys(voteSummary).filter(k => voteSummary[k as 'BUY'|'SELL'|'HOLD'] > 0);
    const conflictDetected = activeVotes.includes('BUY') && activeVotes.includes('SELL');

    // Find winning decision based on weighted score
    let consensusDecision: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
    let maxScore = 0;
    
    Object.entries(weightedScores).forEach(([decision, score]) => {
      if (score > maxScore) {
        maxScore = score;
        consensusDecision = decision as 'BUY' | 'SELL' | 'HOLD';
      }
    });

    // Priority resolution applied if there is conflict and we used weighting to break a tie
    // or if the highest vote count didn't align with weighted score
    const maxVoteCount = Math.max(...Object.values(voteSummary));
    const rawVoteWinner = Object.keys(voteSummary).find(k => voteSummary[k as 'BUY'|'SELL'|'HOLD'] === maxVoteCount);
    const priorityResolutionApplied = conflictDetected || (rawVoteWinner !== consensusDecision);

    // Calculate confidence score (normalized max score)
    const totalWeights = votes.reduce((sum, v) => sum + v.weight, 0);
    const confidenceScore = maxScore / totalWeights;

    // Compile Execution Attribution
    const attributionModels = votes
      .filter(v => v.vote === consensusDecision)
      .map(v => v.modelId.replace("gemini-", ""))
      .join(", ");
    
    const executionAttribution = `Decision driven by weighted consensus of [${attributionModels}].`;

    return {
      ticker,
      votes,
      consensusDecision,
      confidenceScore,
      conflictDetected,
      priorityResolutionApplied,
      voteSummary,
      executionAttribution,
      timestamp: new Date().toISOString()
    };
  }
}
export const multiAIExecutor = MultiAIExecutor.getInstance();
