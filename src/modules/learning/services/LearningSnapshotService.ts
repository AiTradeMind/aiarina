import { learningRepository } from "../repositories/LearningRepository";
import { EntityType, SnapshotType } from "../types/index";

export class LearningSnapshotService {
  public async createSnapshot(
    organizationId: string,
    entityType: EntityType,
    entityId: string,
    snapshotType: SnapshotType,
    metrics: any
  ): Promise<void> {
    await learningRepository.insertSnapshot({
      organizationId,
      entityType,
      entityId,
      snapshotType,
      snapshotDate: new Date(),
      metrics
    });
  }

  public async getSnapshots(organizationId: string, entityType?: string, entityId?: string) {
    return await learningRepository.getSnapshots(organizationId, entityType, entityId);
  }
}

export const learningSnapshotService = new LearningSnapshotService();
