import { learningRepository } from "../repositories/LearningRepository";
import { randomUUID } from "crypto";

export class LearningQueue {
  public async enqueue(organizationId: string, sourceModule: any, eventType: string, payload: any): Promise<void> {
    await learningRepository.pushQueue({
      id: `lq_${randomUUID().replace(/-/g, '').substring(0, 12)}`,
      organizationId,
      sourceModule,
      eventType,
      payload,
      status: 'PENDING',
      attempts: 0,
      createdAt: new Date()
    });
  }

  public async processQueue(): Promise<number> {
    const pending = await learningRepository.getQueuePending();
    let processed = 0;

    for (const item of pending) {
      try {
        await learningRepository.updateQueueStatus(item.id, 'PROCESSING');
        // Process item logic here (e.g. trigger learning update)
        await learningRepository.updateQueueStatus(item.id, 'COMPLETED');
        processed++;
      } catch (err: any) {
        await learningRepository.updateQueueStatus(item.id, 'FAILED', err.message);
      }
    }

    return processed;
  }
}

export const learningQueue = new LearningQueue();
