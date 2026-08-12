import { getDb } from "../../../../db/client.ts";
import { 
  strategyCandidates, 
  strategyCandidateVotes, 
  strategyCandidateHistory, 
  strategyCandidateValidation, 
  strategyCandidateTags, 
  strategyCandidateResearch 
} from "../../../../db/schema.ts";
import { eq, desc, and } from "drizzle-orm";
import { StrategyCandidate, StrategyCandidateVote, StrategyCandidateHistoryRecord, StrategyCandidateValidationRecord, StrategyCandidateResearchRecord } from "../types/index.ts";
import { pino } from "pino";

const logger = pino({ name: "strategy-candidates-repository" });

export class StrategyCandidatesRepository {
  private static instance: StrategyCandidatesRepository;

  public static getInstance(): StrategyCandidatesRepository {
    if (!StrategyCandidatesRepository.instance) {
      StrategyCandidatesRepository.instance = new StrategyCandidatesRepository();
    }
    return StrategyCandidatesRepository.instance;
  }

  async getCandidatesByStrategy(strategyId: string): Promise<StrategyCandidate[]> {
    try {
      const db = getDb();
      const rawCandidates = await db.select()
        .from(strategyCandidates)
        .where(strategyId ? eq(strategyCandidates.strategyId, strategyId) : undefined)
        .orderBy(desc(strategyCandidates.createdAt));

      const results: StrategyCandidate[] = [];

      for (const rc of rawCandidates) {
        const votes = await this.getVotes(rc.candidateId);
        const history = await this.getHistory(rc.candidateId);
        const validations = await this.getValidations(rc.candidateId);
        const tags = await this.getTags(rc.candidateId);
        const research = await this.getResearch(rc.candidateId);

        results.push({
          candidateId: rc.candidateId,
          strategyId: rc.strategyId,
          strategyVersion: rc.strategyVersion,
          workingCopyId: rc.workingCopyId || undefined,
          aiModelId: rc.aiModelId,
          symbol: rc.symbol,
          assetClass: rc.assetClass as any,
          direction: rc.direction as any,
          entryPrice: rc.entryPrice ? Number(rc.entryPrice) : 0,
          stopLoss: rc.stopLoss ? Number(rc.stopLoss) : 0,
          targets: Array.isArray(rc.targets) ? rc.targets.map(Number) : [],
          riskReward: rc.riskReward ? Number(rc.riskReward) : 0,
          confidence: rc.confidence ? Number(rc.confidence) : 0,
          reasoning: rc.reasoning || '',
          marketContext: rc.marketContext || '',
          technicalSummary: rc.technicalSummary || '',
          fundamentalSummary: rc.fundamentalSummary || '',
          volumeSummary: rc.volumeSummary || '',
          volatilitySummary: rc.volatilitySummary || '',
          newsSummary: rc.newsSummary || '',
          indicatorSnapshot: rc.indicatorSnapshot && typeof rc.indicatorSnapshot === 'object' ? rc.indicatorSnapshot : {},
          createdTime: rc.createdTime ? new Date(rc.createdTime).toISOString() : new Date().toISOString(),
          expiryTime: rc.expiryTime ? new Date(rc.expiryTime).toISOString() : undefined,
          candidateStatus: rc.candidateStatus as any,
          score: rc.score ? Number(rc.score) : 0,
          committeeScore: rc.committeeScore ? Number(rc.committeeScore) : 0,
          riskScore: rc.riskScore ? Number(rc.riskScore) : 0,
          qualityScore: rc.qualityScore ? Number(rc.qualityScore) : 0,
          priorityScore: rc.priorityScore ? Number(rc.priorityScore) : 0,
          duplicateHash: rc.duplicateHash || '',
          sha256Reference: rc.sha256Reference || '',
          createdAt: rc.createdAt ? new Date(rc.createdAt).toISOString() : new Date().toISOString(),
          votes,
          history,
          validations,
          tags,
          research
        });
      }

      return results;
    } catch (err: any) {
      logger.error({ err, strategyId }, "Error fetching strategy candidates from DB, returning seed fallback");
      return this.getSeedCandidates(strategyId);
    }
  }

  async getCandidateById(candidateId: string): Promise<StrategyCandidate | null> {
    try {
      const db = getDb();
      const rows = await db.select().from(strategyCandidates).where(eq(strategyCandidates.candidateId, candidateId));
      if (!rows || rows.length === 0) return null;
      const rc = rows[0];

      const votes = await this.getVotes(rc.candidateId);
      const history = await this.getHistory(rc.candidateId);
      const validations = await this.getValidations(rc.candidateId);
      const tags = await this.getTags(rc.candidateId);
      const research = await this.getResearch(rc.candidateId);

      return {
        candidateId: rc.candidateId,
        strategyId: rc.strategyId,
        strategyVersion: rc.strategyVersion,
        workingCopyId: rc.workingCopyId || undefined,
        aiModelId: rc.aiModelId,
        symbol: rc.symbol,
        assetClass: rc.assetClass as any,
        direction: rc.direction as any,
        entryPrice: rc.entryPrice ? Number(rc.entryPrice) : 0,
        stopLoss: rc.stopLoss ? Number(rc.stopLoss) : 0,
        targets: Array.isArray(rc.targets) ? rc.targets.map(Number) : [],
        riskReward: rc.riskReward ? Number(rc.riskReward) : 0,
        confidence: rc.confidence ? Number(rc.confidence) : 0,
        reasoning: rc.reasoning || '',
        marketContext: rc.marketContext || '',
        technicalSummary: rc.technicalSummary || '',
        fundamentalSummary: rc.fundamentalSummary || '',
        volumeSummary: rc.volumeSummary || '',
        volatilitySummary: rc.volatilitySummary || '',
        newsSummary: rc.newsSummary || '',
        indicatorSnapshot: rc.indicatorSnapshot && typeof rc.indicatorSnapshot === 'object' ? rc.indicatorSnapshot : {},
        createdTime: rc.createdTime ? new Date(rc.createdTime).toISOString() : new Date().toISOString(),
        expiryTime: rc.expiryTime ? new Date(rc.expiryTime).toISOString() : undefined,
        candidateStatus: rc.candidateStatus as any,
        score: rc.score ? Number(rc.score) : 0,
        committeeScore: rc.committeeScore ? Number(rc.committeeScore) : 0,
        riskScore: rc.riskScore ? Number(rc.riskScore) : 0,
        qualityScore: rc.qualityScore ? Number(rc.qualityScore) : 0,
        priorityScore: rc.priorityScore ? Number(rc.priorityScore) : 0,
        duplicateHash: rc.duplicateHash || '',
        sha256Reference: rc.sha256Reference || '',
        createdAt: rc.createdAt ? new Date(rc.createdAt).toISOString() : new Date().toISOString(),
        votes,
        history,
        validations,
        tags,
        research
      };
    } catch (err: any) {
      logger.error({ err, candidateId }, "Error fetching candidate by ID");
      return null;
    }
  }

  async saveCandidate(candidate: StrategyCandidate): Promise<void> {
    const db = getDb();
    await db.insert(strategyCandidates).values({
      candidateId: candidate.candidateId,
      strategyId: candidate.strategyId,
      strategyVersion: candidate.strategyVersion,
      workingCopyId: candidate.workingCopyId,
      aiModelId: candidate.aiModelId,
      symbol: candidate.symbol,
      assetClass: candidate.assetClass,
      direction: candidate.direction,
      entryPrice: String(candidate.entryPrice),
      stopLoss: String(candidate.stopLoss),
      targets: candidate.targets,
      riskReward: String(candidate.riskReward),
      confidence: String(candidate.confidence),
      reasoning: candidate.reasoning,
      marketContext: candidate.marketContext,
      technicalSummary: candidate.technicalSummary,
      fundamentalSummary: candidate.fundamentalSummary,
      volumeSummary: candidate.volumeSummary,
      volatilitySummary: candidate.volatilitySummary,
      newsSummary: candidate.newsSummary,
      indicatorSnapshot: candidate.indicatorSnapshot,
      createdTime: new Date(candidate.createdTime),
      expiryTime: candidate.expiryTime ? new Date(candidate.expiryTime) : null,
      candidateStatus: candidate.candidateStatus,
      score: String(candidate.score),
      committeeScore: String(candidate.committeeScore),
      riskScore: String(candidate.riskScore),
      qualityScore: String(candidate.qualityScore),
      priorityScore: String(candidate.priorityScore),
      duplicateHash: candidate.duplicateHash,
      sha256Reference: candidate.sha256Reference,
      createdAt: new Date(candidate.createdAt)
    }).onConflictDoUpdate({
      target: strategyCandidates.candidateId,
      set: {
        candidateStatus: candidate.candidateStatus,
        committeeScore: String(candidate.committeeScore),
        score: String(candidate.score),
        riskScore: String(candidate.riskScore),
        qualityScore: String(candidate.qualityScore),
        priorityScore: String(candidate.priorityScore)
      }
    });
  }

  async updateStatus(candidateId: string, status: string, operator: string, reason?: string): Promise<void> {
    const db = getDb();
    await db.update(strategyCandidates)
      .set({ candidateStatus: status })
      .where(eq(strategyCandidates.candidateId, candidateId));

    await db.insert(strategyCandidateHistory).values({
      candidateId,
      action: `STATUS_CHANGE_${status}`,
      operator,
      details: reason || `Candidate status updated to ${status}`,
      timestamp: new Date()
    });
  }

  async addVote(candidateId: string, committeeMember: string, vote: 'APPROVE' | 'REJECT' | 'ABSTAIN', comment?: string): Promise<void> {
    const db = getDb();
    await db.insert(strategyCandidateVotes).values({
      candidateId,
      committeeMember,
      vote,
      comment: comment || '',
      votedAt: new Date()
    });

    await db.insert(strategyCandidateHistory).values({
      candidateId,
      action: `COMMITTEE_VOTE_${vote}`,
      operator: committeeMember,
      details: comment || `Vote registered: ${vote}`,
      timestamp: new Date()
    });
  }

  async addHistory(candidateId: string, action: string, operator: string, details?: string): Promise<void> {
    const db = getDb();
    await db.insert(strategyCandidateHistory).values({
      candidateId,
      action,
      operator,
      details: details || '',
      timestamp: new Date()
    });
  }

  async addValidation(candidateId: string, isValid: boolean, ruleName: string, message?: string): Promise<void> {
    const db = getDb();
    await db.insert(strategyCandidateValidation).values({
      candidateId,
      isValid,
      ruleName,
      message: message || '',
      validatedAt: new Date()
    });
  }

  private async getVotes(candidateId: string): Promise<StrategyCandidateVote[]> {
    const db = getDb();
    const rows = await db.select().from(strategyCandidateVotes).where(eq(strategyCandidateVotes.candidateId, candidateId));
    return rows.map(r => ({
      id: r.id,
      candidateId: r.candidateId,
      committeeMember: r.committeeMember,
      vote: r.vote as any,
      comment: r.comment || undefined,
      votedAt: r.votedAt ? new Date(r.votedAt).toISOString() : new Date().toISOString()
    }));
  }

  private async getHistory(candidateId: string): Promise<StrategyCandidateHistoryRecord[]> {
    const db = getDb();
    const rows = await db.select().from(strategyCandidateHistory).where(eq(strategyCandidateHistory.candidateId, candidateId)).orderBy(desc(strategyCandidateHistory.timestamp));
    return rows.map(r => ({
      id: r.id,
      candidateId: r.candidateId,
      action: r.action,
      operator: r.operator,
      details: r.details || undefined,
      timestamp: r.timestamp ? new Date(r.timestamp).toISOString() : new Date().toISOString()
    }));
  }

  private async getValidations(candidateId: string): Promise<StrategyCandidateValidationRecord[]> {
    const db = getDb();
    const rows = await db.select().from(strategyCandidateValidation).where(eq(strategyCandidateValidation.candidateId, candidateId));
    return rows.map(r => ({
      id: r.id,
      candidateId: r.candidateId,
      isValid: r.isValid,
      ruleName: r.ruleName,
      message: r.message || undefined,
      validatedAt: r.validatedAt ? new Date(r.validatedAt).toISOString() : new Date().toISOString()
    }));
  }

  private async getTags(candidateId: string): Promise<string[]> {
    const db = getDb();
    const rows = await db.select().from(strategyCandidateTags).where(eq(strategyCandidateTags.candidateId, candidateId));
    return rows.map(r => r.tag);
  }

  private async getResearch(candidateId: string): Promise<StrategyCandidateResearchRecord[]> {
    const db = getDb();
    const rows = await db.select().from(strategyCandidateResearch).where(eq(strategyCandidateResearch.candidateId, candidateId));
    return rows.map(r => ({
      id: r.id,
      candidateId: r.candidateId,
      researchSource: r.researchSource,
      summary: r.summary || undefined,
      sentiment: r.sentiment as any,
      confidence: r.confidence ? Number(r.confidence) : undefined,
      researchedAt: r.researchedAt ? new Date(r.researchedAt).toISOString() : new Date().toISOString()
    }));
  }

  private getSeedCandidates(strategyId: string = 'STRAT-001'): StrategyCandidate[] {
    return [
      {
        candidateId: 'CAND-9001',
        strategyId,
        strategyVersion: '1.0.0',
        workingCopyId: 'WC-101',
        aiModelId: 'gpt-4o',
        symbol: 'NIFTY',
        assetClass: 'Equity',
        direction: 'BUY',
        entryPrice: 24500.50,
        stopLoss: 24350.00,
        targets: [24750.00, 24900.00],
        riskReward: 2.33,
        confidence: 91.50,
        reasoning: 'Strong bullish breakout above resistance with institutional volume expansion and RSI divergence confirmation.',
        marketContext: 'FII long buildup observed in index options, India VIX cooling off below 13.5.',
        technicalSummary: 'MACD bullish crossover on 1H chart, EMA 20/50 golden cross.',
        fundamentalSummary: 'Corporate earnings growth acceleration in Nifty 50 constituents.',
        volumeSummary: 'Deliverable volume 35% higher than 20-period average.',
        volatilitySummary: 'Implied volatility stable at 12.4%, supporting directional trend continuation.',
        newsSummary: 'Macro policy tailwinds and fiscal deficit targets met.',
        indicatorSnapshot: { rsi: 64.2, macd: 'bullish', atr: 145.2 },
        createdTime: new Date(Date.now() - 3600000 * 4).toISOString(),
        expiryTime: new Date(Date.now() + 3600000 * 20).toISOString(),
        candidateStatus: 'COMMITTEE_PENDING',
        score: 92.0,
        committeeScore: 88.5,
        riskScore: 18.0,
        qualityScore: 94.0,
        priorityScore: 95.0,
        duplicateHash: 'hash-nifty-buy-9001',
        sha256Reference: '8fea254cf0bbafef1cfc1582e8ae6874d5558fd6797cb397c2cbe86b65b0d8a5',
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        votes: [
          { id: 1, candidateId: 'CAND-9001', committeeMember: 'Chief Risk Officer', vote: 'APPROVE', comment: 'Risk parameters within authorized limits.', votedAt: new Date(Date.now() - 3600000 * 2).toISOString() }
        ],
        history: [
          { id: 1, candidateId: 'CAND-9001', action: 'CREATED', operator: 'gpt-4o', details: 'Proposal generated by strategy pipeline.', timestamp: new Date(Date.now() - 3600000 * 4).toISOString() }
        ],
        validations: [
          { id: 1, candidateId: 'CAND-9001', isValid: true, ruleName: 'Risk Reward Check', message: 'RR 2.33 exceeds minimum 2.0 threshold.', validatedAt: new Date(Date.now() - 3600000 * 4).toISOString() }
        ],
        tags: ['INSTITUTIONAL', 'BREAKOUT', 'AI_PROPOSAL'],
        research: [
          { id: 1, candidateId: 'CAND-9001', researchSource: 'OpenAI Enterprise Research', summary: 'High probability momentum continuation.', sentiment: 'BULLISH', confidence: 91.5, researchedAt: new Date(Date.now() - 3600000 * 4).toISOString() }
        ]
      },
      {
        candidateId: 'CAND-9002',
        strategyId,
        strategyVersion: '1.0.0',
        workingCopyId: 'WC-102',
        aiModelId: 'claude-3-5-sonnet',
        symbol: 'GOLD',
        assetClass: 'Gold',
        direction: 'SELL',
        entryPrice: 2845.00,
        stopLoss: 2865.00,
        targets: [2810.00, 2785.00],
        riskReward: 2.10,
        confidence: 86.20,
        reasoning: 'Overbought momentum exhaustion at major Fibonacci resistance zone with dollar index recovery.',
        marketContext: 'Treasury yields ticking upward, pressuring non-yielding bullion assets.',
        technicalSummary: 'RSI overbought (>75) with bearish divergence on 4H time frame.',
        fundamentalSummary: 'Global central bank reserve rebalancing and easing safe-haven inflows.',
        volumeSummary: 'Declining volume on upward price push indicating buyer fatigue.',
        volatilitySummary: 'ATR contraction signaling impending mean reversion breakout.',
        newsSummary: 'Geopolitical risk premium temporarily easing.',
        indicatorSnapshot: { rsi: 76.5, macd: 'bearish_divergence', atr: 22.4 },
        createdTime: new Date(Date.now() - 3600000 * 8).toISOString(),
        expiryTime: new Date(Date.now() + 3600000 * 16).toISOString(),
        candidateStatus: 'PENDING',
        score: 87.0,
        committeeScore: 79.0,
        riskScore: 22.0,
        qualityScore: 89.0,
        priorityScore: 84.0,
        duplicateHash: 'hash-gold-sell-9002',
        sha256Reference: '3bf1278bc0aefed28182b812efd8192a7f83b18274bda192837f182cba1002ef',
        createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
        votes: [],
        history: [
          { id: 2, candidateId: 'CAND-9002', action: 'CREATED', operator: 'claude-3-5-sonnet', details: 'Proposal generated by strategy pipeline.', timestamp: new Date(Date.now() - 3600000 * 8).toISOString() }
        ],
        validations: [
          { id: 2, candidateId: 'CAND-9002', isValid: true, ruleName: 'Stop Loss Check', message: 'Stop loss correctly defined.', validatedAt: new Date(Date.now() - 3600000 * 8).toISOString() }
        ],
        tags: ['COMMODITY', 'MEAN_REVERSION'],
        research: [
          { id: 2, candidateId: 'CAND-9002', researchSource: 'Anthropic Economic Research', summary: 'Resistance rejection setup valid.', sentiment: 'BEARISH', confidence: 86.2, researchedAt: new Date(Date.now() - 3600000 * 8).toISOString() }
        ]
      }
    ];
  }
}
