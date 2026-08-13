import { OMSRepository } from "../repositories/oms.repository.ts";
import { OMSOrderMetadataRecord } from "../types/index.ts";

export class OMSMetadataService {
  private repo: OMSRepository;

  constructor(repo?: OMSRepository) {
    this.repo = repo || new OMSRepository();
  }

  async saveMetadata(metadata: OMSOrderMetadataRecord): Promise<OMSOrderMetadataRecord> {
    return await this.repo.saveMetadata(metadata);
  }

  async getMetadata(orderId: string): Promise<OMSOrderMetadataRecord | null> {
    return await this.repo.getMetadata(orderId);
  }
}
