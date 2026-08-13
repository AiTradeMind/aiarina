import { CONFIDENCE_LEVELS, ConfidenceLevelValue } from "../constants/index.ts";
import { QualityScoreResult, ResearchItem } from "../types/index.ts";

export interface ConfidenceHistoryRecord {
  confidence: ConfidenceLevelValue;
  timestamp: Date;
  reason: string;
}

export class QualityScoringService {
  private static confidenceHistory: Map<string, ConfidenceHistoryRecord[]> = new Map();

  public calculateQualityScore(
    item: Partial<ResearchItem>,
    evidenceCount: number = 0,
    sourceReliability: number = 80,
    validationPassed: boolean = true
  ): QualityScoreResult {
    // 1. Completeness (0-100)
    let completeness = 0;
    if (item.title && item.title.trim().length > 5) completeness += 30;
    if (item.content && item.content.trim().length > 20) completeness += 40;
    if (item.summary) completeness += 15;
    if (item.author) completeness += 15;

    // 2. Metadata Coverage (0-100)
    let metadataCoverage = 0;
    if (item.tags && item.tags.length > 0) metadataCoverage += Math.min(50, item.tags.length * 15);
    if (item.metadata && Object.keys(item.metadata).length > 0) {
      metadataCoverage += Math.min(50, Object.keys(item.metadata).length * 15);
    }

    // 3. Evidence Strength (0-100)
    const evidenceStrength = Math.min(100, evidenceCount * 25 + 25);

    // 4. Source Reliability (0-100)
    const normalizedSourceReliability = Math.max(0, Math.min(100, sourceReliability));

    // 5. Validation Result (0-100)
    const validationResult = validationPassed ? 100 : 30;

    // Final Weighted Score
    const finalQualityScore = Number(
      (
        completeness * 0.25 +
        metadataCoverage * 0.20 +
        evidenceStrength * 0.25 +
        normalizedSourceReliability * 0.15 +
        validationResult * 0.15
      ).toFixed(2)
    );

    return {
      completeness,
      metadataCoverage,
      evidenceStrength,
      sourceReliability: normalizedSourceReliability,
      validationResult,
      finalQualityScore,
    };
  }

  public deriveConfidenceLevel(qualityScore: number, evidenceCount: number): ConfidenceLevelValue {
    if (qualityScore >= 90 && evidenceCount >= 3) return CONFIDENCE_LEVELS.VERIFIED;
    if (qualityScore >= 80) return CONFIDENCE_LEVELS.VERY_HIGH;
    if (qualityScore >= 65) return CONFIDENCE_LEVELS.HIGH;
    if (qualityScore >= 45) return CONFIDENCE_LEVELS.MEDIUM;
    return CONFIDENCE_LEVELS.LOW;
  }

  public recordConfidence(
    researchId: string,
    confidence: ConfidenceLevelValue,
    reason: string = "Automated quality scoring update"
  ) {
    const history = QualityScoringService.confidenceHistory.get(researchId) || [];
    history.push({
      confidence,
      timestamp: new Date(),
      reason,
    });
    QualityScoringService.confidenceHistory.set(researchId, history);
  }

  public getConfidenceHistory(researchId: string): ConfidenceHistoryRecord[] {
    return QualityScoringService.confidenceHistory.get(researchId) || [];
  }
}
