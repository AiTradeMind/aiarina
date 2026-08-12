import { AIDecisionResult } from '../../ai/decision/ai-decision.engine';
import logger from '../../../lib/logger';

export enum VotingMethod {
  MAJORITY = 'MAJORITY',
  WEIGHTED = 'WEIGHTED',
  CONSENSUS = 'CONSENSUS'
}

export interface ModelVote {
  modelId: string;
  weight: number;
  decision: AIDecisionResult;
}

export interface CommitteeConsensusResult {
  committeeAuditId: string;
  finalSignal: 'BUY' | 'SELL' | 'HOLD' | 'NEUTRAL';
  consensusConfidence: number;
  votingMethod: VotingMethod;
  totalVotes: number;
  votesBreakdown: Record<string, number>;
  minorityReport?: string;
  individualVotes: ModelVote[];
  timestamp: Date;
}

export class AICommitteeEngine {
  private static instance: AICommitteeEngine;
  private auditHistory: CommitteeConsensusResult[] = [];

  private constructor() {}

  public static getInstance(): AICommitteeEngine {
    if (!AICommitteeEngine.instance) {
      AICommitteeEngine.instance = new AICommitteeEngine();
    }
    return AICommitteeEngine.instance;
  }

  public evaluateCommittee(
    votes: ModelVote[],
    method: VotingMethod = VotingMethod.MAJORITY
  ): CommitteeConsensusResult {
    const committeeAuditId = `cmt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    logger.info({ committeeAuditId, voteCount: votes.length, method }, 'Starting AI Committee evaluation');

    if (!votes || votes.length === 0) {
      throw new Error('AI Committee evaluation failed: No model votes provided.');
    }

    const tally: Record<string, number> = { BUY: 0, SELL: 0, HOLD: 0, NEUTRAL: 0 };
    let totalWeight = 0;

    for (const vote of votes) {
      const weight = method === VotingMethod.WEIGHTED ? vote.weight : 1;
      const sig = vote.decision.signal;
      tally[sig] = (tally[sig] || 0) + weight;
      totalWeight += weight;
    }

    let winningSignal: 'BUY' | 'SELL' | 'HOLD' | 'NEUTRAL' = 'NEUTRAL';
    let maxTally = -1;

    for (const [sig, score] of Object.entries(tally)) {
      if (score > maxTally) {
        maxTally = score;
        winningSignal = sig as any;
      }
    }

    // Consensus Verification
    if (method === VotingMethod.CONSENSUS && maxTally < totalWeight) {
      logger.warn({ committeeAuditId }, 'Consensus voting failed to achieve 100% agreement. Defaulting to NEUTRAL safety.');
      winningSignal = 'NEUTRAL';
    }

    // Minority Report Generation
    const minorityVotes = votes.filter(v => v.decision.signal !== winningSignal);
    let minorityReport: string | undefined;

    if (minorityVotes.length > 0) {
      minorityReport = minorityVotes
        .map(mv => `[${mv.modelId}] Voted ${mv.decision.signal}: ${mv.decision.explanation}`)
        .join(' | ');
    }

    const consensusConfidence = Number((maxTally / Math.max(totalWeight, 1)).toFixed(2));

    const result: CommitteeConsensusResult = {
      committeeAuditId,
      finalSignal: winningSignal,
      consensusConfidence,
      votingMethod: method,
      totalVotes: votes.length,
      votesBreakdown: tally,
      minorityReport,
      individualVotes: votes,
      timestamp: new Date()
    };

    this.auditHistory.push(result);
    if (this.auditHistory.length > 500) {
      this.auditHistory.shift();
    }

    return result;
  }

  public getCommitteeAuditHistory(): CommitteeConsensusResult[] {
    return [...this.auditHistory];
  }
}
