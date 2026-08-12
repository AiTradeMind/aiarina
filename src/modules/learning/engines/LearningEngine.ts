export class LearningEngine {
  public computeScores(records: any[]): {
    learningScore: number;
    improvementScore: number;
    successRate: number;
  } {
    if (!records || records.length === 0) {
      return { learningScore: 50, improvementScore: 0, successRate: 0 };
    }

    const successCount = records.filter(r => r.result === 'SUCCESS').length;
    const successRate = successCount / records.length;
    const learningScore = Math.min(100, Math.max(0, successRate * 100 + 15));
    const improvementScore = records.length > 5 ? 12.5 : 5.0;

    return {
      learningScore,
      improvementScore,
      successRate
    };
  }
}

export const learningEngine = new LearningEngine();
