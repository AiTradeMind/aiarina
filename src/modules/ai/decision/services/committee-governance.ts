export type AIModelGovernanceStatus = 
  | 'CHAMPION_PRODUCTION' 
  | 'CHALLENGER_PAPER' 
  | 'QUARANTINED' 
  | 'DEMOTED_PAPER' 
  | 'SUSPENDED' 
  | 'RETIRED' 
  | 'BLACKLISTED';

export type CommitteeVoteAction = 'BUY' | 'SELL' | 'HOLD' | 'NO_TRADE' | 'WAIT';

export interface CommitteeVoter {
  modelId: string;
  displayName: string;
  provider: string;
  role: string;
  status: AIModelGovernanceStatus;
  csiScore: number; // Capital Survival Index 0-100
  winRatePercent: number; // e.g. 78.5
  accuracyPercent: number; // e.g. 84.2
  maxDrawdownPercent: number; // e.g. 1.8
  consistencyScore: number; // 0-100
  riskDisciplineScore: number; // 0-100
  healthScore: number; // 0-100
  recentPerformance: 'OUTPERFORMING' | 'STABLE' | 'UNDERPERFORMING' | 'CRITICAL';
}

export interface CommitteeVote {
  modelId: string;
  modelName: string;
  action: CommitteeVoteAction;
  confidence: number; // 0-100
  voterWeight: number; // Calculated dynamic weight based on CSI & Health
  rationale: string;
}

export interface CommitteeConsensusResult {
  ticker: string;
  totalVoters: number;
  votingWeightsTotal: number;
  actionVotes: Record<CommitteeVoteAction, { count: number; weightedVotes: number; percentage: number }>;
  finalConsensusAction: CommitteeVoteAction;
  weightedConfidence: number;
  approvedForExecution: boolean;
  rejectionReason?: string;
  votes: CommitteeVote[];
}

export interface ModelReportCard {
  modelId: string;
  name: string;
  rank: number;
  csiScore: number;
  winRate: number;
  accuracy: number;
  maxDrawdown: number;
  status: AIModelGovernanceStatus;
  committeeWeight: number;
  healthScore: {
    overall: number;
    runtime: number;
    decisionQuality: number;
    executionQuality: number;
    riskQuality: number;
    learningQuality: number;
    memoryQuality: number;
    governanceQuality: number;
  };
  quarantineHistoryCount: number;
  promotionEligibility: 'ELIGIBLE_FOR_CHAMPION' | 'STABLE_PRODUCTION' | 'PAPER_TESTING' | 'REQUIRES_QUARANTINE' | 'BLACKLISTED';
}

export class CommitteeGovernanceEngine {
  /**
   * Calculates the dynamic voting weight for an AI Model based on CSI, Accuracy, Win Rate, and Risk Discipline.
   */
  public calculateVoterWeight(voter: CommitteeVoter): number {
    if (voter.status === 'SUSPENDED' || voter.status === 'BLACKLISTED' || voter.status === 'RETIRED') {
      return 0; // No voting power for invalid status
    }

    const csiFactor = voter.csiScore * 0.35;
    const accuracyFactor = voter.accuracyPercent * 0.25;
    const winRateFactor = voter.winRatePercent * 0.20;
    const disciplineFactor = voter.riskDisciplineScore * 0.20;

    let baseWeight = (csiFactor + accuracyFactor + winRateFactor + disciplineFactor) / 100;

    // Challenger / Paper Models carry 50% voting weight compared to Production Champions
    if (voter.status === 'CHALLENGER_PAPER' || voter.status === 'DEMOTED_PAPER') {
      baseWeight *= 0.5;
    } else if (voter.status === 'QUARANTINED') {
      baseWeight *= 0.1;
    }

    return Number(baseWeight.toFixed(2));
  }

  /**
   * Resolves votes from all 28 AI Models into an institutional consensus.
   */
  public evaluateCommitteeConsensus(ticker: string, votes: CommitteeVote[], voters: Map<string, CommitteeVoter>): CommitteeConsensusResult {
    const actionVotes: Record<CommitteeVoteAction, { count: number; weightedVotes: number; percentage: number }> = {
      BUY: { count: 0, weightedVotes: 0, percentage: 0 },
      SELL: { count: 0, weightedVotes: 0, percentage: 0 },
      HOLD: { count: 0, weightedVotes: 0, percentage: 0 },
      NO_TRADE: { count: 0, weightedVotes: 0, percentage: 0 },
      WAIT: { count: 0, weightedVotes: 0, percentage: 0 }
    };

    let totalWeight = 0;
    const processedVotes: CommitteeVote[] = [];

    for (const vote of votes) {
      const voter = voters.get(vote.modelId) || {
        modelId: vote.modelId,
        displayName: vote.modelName,
        provider: 'OpenAI',
        role: 'Trader',
        status: 'CHAMPION_PRODUCTION',
        csiScore: 90,
        winRatePercent: 75,
        accuracyPercent: 80,
        maxDrawdownPercent: 1.5,
        consistencyScore: 85,
        riskDisciplineScore: 90,
        healthScore: 92,
        recentPerformance: 'STABLE'
      };

      const voterWeight = this.calculateVoterWeight(voter);
      processedVotes.push({ ...vote, voterWeight });

      if (voterWeight > 0) {
        actionVotes[vote.action].count += 1;
        actionVotes[vote.action].weightedVotes += voterWeight;
        totalWeight += voterWeight;
      }
    }

    // Calculate percentages
    let topAction: CommitteeVoteAction = 'NO_TRADE';
    let maxWeightedScore = -1;

    for (const actionKey of Object.keys(actionVotes) as CommitteeVoteAction[]) {
      const weighted = actionVotes[actionKey].weightedVotes;
      const pct = totalWeight > 0 ? (weighted / totalWeight) * 100 : 0;
      actionVotes[actionKey].percentage = Number(pct.toFixed(1));

      if (weighted > maxWeightedScore) {
        maxWeightedScore = weighted;
        topAction = actionKey;
      }
    }

    const topPct = actionVotes[topAction].percentage;
    const weightedConfidence = Number(topPct.toFixed(1));

    // Approval Rules: Consensus must be >= 60% for BUY/SELL, otherwise defaults to HOLD/NO_TRADE
    let approvedForExecution = false;
    let rejectionReason: string | undefined;

    if ((topAction === 'BUY' || topAction === 'SELL') && weightedConfidence >= 60.0) {
      approvedForExecution = true;
    } else if (topAction === 'BUY' || topAction === 'SELL') {
      rejectionReason = `Committee consensus ${weightedConfidence}% for ${topAction} is below required 60.0% threshold. Action reverted to HOLD/NO_TRADE for capital protection.`;
    } else {
      rejectionReason = `Committee voted ${topAction} (${weightedConfidence}% agreement). No active trade authorized.`;
    }

    return {
      ticker,
      totalVoters: votes.length,
      votingWeightsTotal: Number(totalWeight.toFixed(2)),
      actionVotes,
      finalConsensusAction: approvedForExecution ? topAction : 'NO_TRADE',
      weightedConfidence,
      approvedForExecution,
      rejectionReason,
      votes: processedVotes
    };
  }

  /**
   * Calculates overall AI Model Health Score across 7 dimensions.
   */
  public generateReportCard(voter: CommitteeVoter, rank: number): ModelReportCard {
    const runtime = voter.healthScore;
    const decisionQuality = Math.round((voter.accuracyPercent + voter.consistencyScore) / 2);
    const executionQuality = Math.round(voter.winRatePercent);
    const riskQuality = Math.round(voter.csiScore);
    const learningQuality = Math.round((voter.accuracyPercent + voter.csiScore) / 2);
    const memoryQuality = Math.round(voter.consistencyScore);
    const governanceQuality = voter.status === 'CHAMPION_PRODUCTION' ? 98 : voter.status === 'CHALLENGER_PAPER' ? 88 : 60;

    const overallHealth = Math.round(
      (runtime * 0.15) +
      (decisionQuality * 0.20) +
      (executionQuality * 0.15) +
      (riskQuality * 0.20) +
      (learningQuality * 0.10) +
      (memoryQuality * 0.10) +
      (governanceQuality * 0.10)
    );

    let promotionEligibility: ModelReportCard['promotionEligibility'] = 'STABLE_PRODUCTION';
    if (voter.csiScore >= 95 && voter.accuracyPercent >= 85) {
      promotionEligibility = 'ELIGIBLE_FOR_CHAMPION';
    } else if (voter.status === 'CHALLENGER_PAPER') {
      promotionEligibility = 'PAPER_TESTING';
    } else if (voter.csiScore < 70 || voter.maxDrawdownPercent > 4.0) {
      promotionEligibility = 'REQUIRES_QUARANTINE';
    } else if (voter.status === 'BLACKLISTED') {
      promotionEligibility = 'BLACKLISTED';
    }

    return {
      modelId: voter.modelId,
      name: voter.displayName,
      rank,
      csiScore: voter.csiScore,
      winRate: voter.winRatePercent,
      accuracy: voter.accuracyPercent,
      maxDrawdown: voter.maxDrawdownPercent,
      status: voter.status,
      committeeWeight: this.calculateVoterWeight(voter),
      healthScore: {
        overall: overallHealth,
        runtime,
        decisionQuality,
        executionQuality,
        riskQuality,
        learningQuality,
        memoryQuality,
        governanceQuality
      },
      quarantineHistoryCount: voter.status === 'QUARANTINED' ? 2 : 0,
      promotionEligibility
    };
  }
}
