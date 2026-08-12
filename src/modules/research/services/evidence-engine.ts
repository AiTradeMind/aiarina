export type CredibilityLevel = 'VERY_HIGH' | 'HIGH' | 'MEDIUM' | 'LOW' | 'VERY_LOW';

export interface ResearchSourceCredibility {
  sourceName: string;
  category: 'EXCHANGE_FILING' | 'REGULATOR' | 'COMPANY_REPORT' | 'NEWS_WIRE' | 'ANALYST_REPORT' | 'SOCIAL_MEDIA';
  trustScore: number; // 0 - 100
  authority: CredibilityLevel;
  freshnessScore: number; // 0 - 100
  accuracyHistory: number; // 0 - 100
  reliability: CredibilityLevel;
}

export interface FakeNewsEvaluation {
  headline: string;
  isRumor: boolean;
  isClickbait: boolean;
  isManipulated: boolean;
  isDuplicate: boolean;
  credibilityScore: number; // 0 - 100
  verdict: 'VERIFIED_FACT' | 'UNCONFIRMED_RUMOR' | 'MANIPULATED_CLICKBAIT' | 'DUPLICATE_STORY';
}

export interface ContradictionDetail {
  id: string;
  conflictType: 'NEWS_VS_RESEARCH' | 'TECHNICAL_VS_FUNDAMENTAL' | 'MANAGEMENT_VS_FILINGS';
  description: string;
  sourceA: string;
  sourceB: string;
  aiExplanation: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface DebateArguments {
  bullCase: string[];
  bearCase: string[];
  neutralCase: string[];
  counterArguments: string[];
  finalBalancedView: string;
}

export interface RiskCategoryAssessment {
  governanceRisk: number; // 0-100
  debtRisk: number;
  liquidityRisk: number;
  operatorRisk: number;
  regulatoryRisk: number;
  legalRisk: number;
  macroRisk: number;
  compositeRiskScore: number;
}

export interface ResearchQualityGateResult {
  rrsScore: number; // Research Reliability Score 0-100
  isPassed: boolean;
  evidenceComplete: boolean;
  hasCriticalContradictions: boolean;
  rejectionReason?: string;
}

export class ResearchEvidenceEngine {
  /**
   * Source Credibility Engine
   */
  public getSourceCredibility(sourceType: ResearchSourceCredibility['category']): ResearchSourceCredibility {
    switch (sourceType) {
      case 'EXCHANGE_FILING':
      case 'REGULATOR':
        return {
          sourceName: 'NSE/BSE/SEBI Official Gate',
          category: sourceType,
          trustScore: 99,
          authority: 'VERY_HIGH',
          freshnessScore: 95,
          accuracyHistory: 99.5,
          reliability: 'VERY_HIGH'
        };
      case 'COMPANY_REPORT':
        return {
          sourceName: 'Audited Annual / 10-K Report',
          category: sourceType,
          trustScore: 95,
          authority: 'VERY_HIGH',
          freshnessScore: 90,
          accuracyHistory: 98.0,
          reliability: 'VERY_HIGH'
        };
      case 'NEWS_WIRE':
        return {
          sourceName: 'Reuters / Bloomberg Institutional Wire',
          category: sourceType,
          trustScore: 88,
          authority: 'HIGH',
          freshnessScore: 98,
          accuracyHistory: 92.0,
          reliability: 'HIGH'
        };
      case 'ANALYST_REPORT':
        return {
          sourceName: 'Tier-1 Brokerage Research',
          category: sourceType,
          trustScore: 72,
          authority: 'MEDIUM',
          freshnessScore: 85,
          accuracyHistory: 78.0,
          reliability: 'MEDIUM'
        };
      case 'SOCIAL_MEDIA':
      default:
        return {
          sourceName: 'Unverified Social / Forum Wire',
          category: 'SOCIAL_MEDIA',
          trustScore: 25,
          authority: 'VERY_LOW',
          freshnessScore: 99,
          accuracyHistory: 30.0,
          reliability: 'VERY_LOW'
        };
    }
  }

  /**
   * Evaluates headline for Fake News, Rumors, Clickbait
   */
  public evaluateFakeNews(headline: string, sourceCategory: ResearchSourceCredibility['category']): FakeNewsEvaluation {
    const isRumor = headline.toLowerCase().includes('rumor') || headline.toLowerCase().includes('sources say') || headline.toLowerCase().includes('unconfirmed');
    const isClickbait = headline.includes('!') || headline.toLowerCase().includes('shocking') || headline.toLowerCase().includes('exploded');
    
    let credibilityScore = 90;
    if (sourceCategory === 'SOCIAL_MEDIA') credibilityScore -= 50;
    if (isRumor) credibilityScore -= 30;
    if (isClickbait) credibilityScore -= 20;

    credibilityScore = Math.max(10, credibilityScore);

    let verdict: FakeNewsEvaluation['verdict'] = 'VERIFIED_FACT';
    if (isClickbait) verdict = 'MANIPULATED_CLICKBAIT';
    else if (isRumor || credibilityScore < 50) verdict = 'UNCONFIRMED_RUMOR';

    return {
      headline,
      isRumor,
      isClickbait,
      isManipulated: isClickbait,
      isDuplicate: false,
      credibilityScore,
      verdict
    };
  }

  /**
   * Calculates Research Reliability Score (RRS)
   */
  public calculateRRS(
    sourceCredibility: number,
    evidenceCompleteness: number,
    factValidationScore: number,
    freshnessScore: number,
    consistencyScore: number
  ): number {
    const rrs = (
      sourceCredibility * 0.30 +
      evidenceCompleteness * 0.25 +
      factValidationScore * 0.20 +
      freshnessScore * 0.15 +
      consistencyScore * 0.10
    );
    return Number(rrs.toFixed(1));
  }

  /**
   * Evaluates Research Quality Gate for Analytics Forwarding
   */
  public evaluateQualityGate(rrsScore: number, evidenceComplete: boolean, contradictions: ContradictionDetail[]): ResearchQualityGateResult {
    const hasCritical = contradictions.some(c => c.severity === 'HIGH');
    const isPassed = rrsScore >= 80.0 && evidenceComplete && !hasCritical;

    let rejectionReason: string | undefined;
    if (!isPassed) {
      if (rrsScore < 80.0) rejectionReason = `RRS Score (${rrsScore}) below mandatory 80.0 threshold.`;
      else if (!evidenceComplete) rejectionReason = `Evidence package incomplete. Missing verified filings or financial statements.`;
      else if (hasCritical) rejectionReason = `Critical contradictions detected between news claims and verified exchange filings.`;
    }

    return {
      rrsScore,
      isPassed,
      evidenceComplete,
      hasCriticalContradictions: hasCritical,
      rejectionReason
    };
  }

  // Phase 2.2A Enterprise Evidence Upgrade
  private static evidenceStore: Map<string, Array<{
    evidenceId: string;
    researchId: string;
    evidenceType: string;
    evidenceSource: string;
    confidence: number;
    reliability: string;
    verification: 'VERIFIED' | 'UNVERIFIED' | 'DISPUTED';
    timestamp: Date;
    metadata: Record<string, any>;
  }>> = new Map();

  public addEvidence(
    researchId: string,
    evidence: {
      evidenceType: string;
      evidenceSource: string;
      confidence?: number;
      reliability?: string;
      verification?: 'VERIFIED' | 'UNVERIFIED' | 'DISPUTED';
      metadata?: Record<string, any>;
    }
  ) {
    const evidenceId = `EVI-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const record = {
      evidenceId,
      researchId,
      evidenceType: evidence.evidenceType,
      evidenceSource: evidence.evidenceSource,
      confidence: evidence.confidence ?? 85,
      reliability: evidence.reliability ?? 'HIGH',
      verification: evidence.verification ?? 'VERIFIED',
      timestamp: new Date(),
      metadata: evidence.metadata || {},
    };

    const existing = ResearchEvidenceEngine.evidenceStore.get(researchId) || [];
    existing.push(record);
    ResearchEvidenceEngine.evidenceStore.set(researchId, existing);

    return record;
  }

  public getEvidenceByResearchId(researchId: string) {
    return ResearchEvidenceEngine.evidenceStore.get(researchId) || [];
  }

  public getEvidenceCount(researchId: string): number {
    return (ResearchEvidenceEngine.evidenceStore.get(researchId) || []).length;
  }
}
