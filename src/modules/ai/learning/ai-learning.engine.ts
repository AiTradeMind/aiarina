import logger from '../../../lib/logger';
import { AIRuntimeMemoryService } from '../memory/ai-runtime-memory.service';

export interface LearningRecord {
  learningId: string;
  decisionId: string;
  strategyId: string;
  symbol: string;
  predictedSignal: string;
  actualOutcome: 'WIN' | 'LOSS' | 'NEUTRAL';
  pnlDelta: number;
  confidenceCalibration: number; // discrepancy between confidence and outcome
  learningScore: number;
  timestamp: Date;
}

export class AILearningEngine {
  private static instance: AILearningEngine;
  private learningHistory: LearningRecord[] = [];

  private constructor() {}

  public static getInstance(): AILearningEngine {
    if (!AILearningEngine.instance) {
      AILearningEngine.instance = new AILearningEngine();
    }
    return AILearningEngine.instance;
  }

  public processTradeOutcome(
    decisionId: string,
    strategyId: string,
    symbol: string,
    predictedSignal: string,
    confidence: number,
    realizedPnL: number
  ): LearningRecord {
    const learningId = `lrn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const outcome = realizedPnL > 0 ? 'WIN' : realizedPnL < 0 ? 'LOSS' : 'NEUTRAL';
    
    // Confidence calibration: if high confidence and win -> high calibration score
    const isCorrect = (predictedSignal === 'BUY' && realizedPnL > 0) || (predictedSignal === 'SELL' && realizedPnL > 0);
    const calibrationDelta = isCorrect ? confidence : (1 - confidence);
    const learningScore = Math.max(0, Math.min(100, Math.round(calibrationDelta * 100)));

    const record: LearningRecord = {
      learningId,
      decisionId,
      strategyId,
      symbol: symbol.toUpperCase(),
      predictedSignal,
      actualOutcome: outcome,
      pnlDelta: realizedPnL,
      confidenceCalibration: calibrationDelta,
      learningScore,
      timestamp: new Date()
    };

    this.learningHistory.push(record);
    if (this.learningHistory.length > 1000) {
      this.learningHistory.shift();
    }

    logger.info({ learningId, strategyId, outcome, learningScore }, 'AI Learning record processed from trade outcome');
    return record;
  }

  public getLearningHistory(strategyId?: string): LearningRecord[] {
    if (strategyId) {
      return this.learningHistory.filter(l => l.strategyId === strategyId);
    }
    return [...this.learningHistory];
  }

  public getAverageLearningScore(strategyId?: string): number {
    const records = this.getLearningHistory(strategyId);
    if (records.length === 0) return 75; // default baseline score
    const sum = records.reduce((acc, r) => acc + r.learningScore, 0);
    return Math.round(sum / records.length);
  }
}
