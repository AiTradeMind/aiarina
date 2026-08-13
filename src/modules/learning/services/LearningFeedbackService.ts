import { learningRepository } from "../repositories/LearningRepository";
import { randomUUID } from "crypto";
import { FeedbackType } from "../types/index";

export class LearningFeedbackService {
  public async generateAndStoreFeedback(
    organizationId: string, 
    aiModelId: string | undefined, 
    strategyId: string | undefined, 
    feedbackType: FeedbackType, 
    title: string, 
    content: string, 
    metadata: Record<string, any>
  ): Promise<void> {
    await learningRepository.insertFeedback({
      id: `fb_${randomUUID().replace(/-/g, '').substring(0, 12)}`,
      organizationId,
      aiModelId,
      strategyId,
      feedbackType,
      title,
      content,
      metadata,
      createdAt: new Date()
    });
  }

  public async getFeedback(organizationId: string) {
    return await learningRepository.getFeedback(organizationId);
  }
}

export const learningFeedbackService = new LearningFeedbackService();
