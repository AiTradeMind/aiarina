import { DUPLICATE_TYPES, DuplicateTypeValue } from "../constants/index.ts";
import { DuplicateDetectionResult, ResearchItem } from "../types/index.ts";

export class DuplicateDetectorService {
  /**
   * Detects duplicate content across existing research items.
   * Never deletes items automatically - only flags them.
   */
  public detectDuplicates(
    newItem: Partial<ResearchItem>,
    existingItems: ResearchItem[]
  ): DuplicateDetectionResult {
    if (!newItem.title && !newItem.content) {
      return { isDuplicate: false, similarityScore: 0 };
    }

    const newTitleClean = (newItem.title || "").toLowerCase().trim();
    const newContentClean = (newItem.content || "").toLowerCase().trim();

    for (const existing of existingItems) {
      if (existing.researchId === newItem.researchId) continue;

      const exTitleClean = (existing.title || "").toLowerCase().trim();
      const exContentClean = (existing.content || "").toLowerCase().trim();

      // Exact or near-exact title match
      if (newTitleClean && exTitleClean && newTitleClean === exTitleClean) {
        let duplicateType: DuplicateTypeValue = DUPLICATE_TYPES.RESEARCH;
        if (existing.category === "News") duplicateType = DUPLICATE_TYPES.NEWS;
        else if (existing.category === "Corporate Actions") duplicateType = DUPLICATE_TYPES.FILING;
        else if (existing.category === "Economic") duplicateType = DUPLICATE_TYPES.EVENT;

        return {
          isDuplicate: true,
          duplicateOf: existing.researchId,
          duplicateType,
          similarityScore: 1.0,
          reason: `Exact title match with research item ${existing.researchId}`,
        };
      }

      // Content similarity (Jaccard token index)
      const similarity = this.calculateJaccardSimilarity(newContentClean, exContentClean);
      if (similarity >= 0.85) {
        let duplicateType: DuplicateTypeValue = DUPLICATE_TYPES.RESEARCH;
        if (newItem.source && existing.source && newItem.source === existing.source) {
          duplicateType = DUPLICATE_TYPES.SOURCES;
        }

        return {
          isDuplicate: true,
          duplicateOf: existing.researchId,
          duplicateType,
          similarityScore: Number(similarity.toFixed(2)),
          reason: `High content similarity (${Math.round(similarity * 100)}%) with item ${existing.researchId}`,
        };
      }
    }

    return {
      isDuplicate: false,
      similarityScore: 0,
    };
  }

  private calculateJaccardSimilarity(textA: string, textB: string): number {
    if (!textA || !textB) return 0;
    const tokensA = new Set(textA.split(/\W+/).filter((t) => t.length > 2));
    const tokensB = new Set(textB.split(/\W+/).filter((t) => t.length > 2));

    if (tokensA.size === 0 || tokensB.size === 0) return 0;

    const intersection = new Set([...tokensA].filter((x) => tokensB.has(x)));
    const union = new Set([...tokensA, ...tokensB]);

    return intersection.size / union.size;
  }
}
