import { MarketplaceRepository } from "../repositories";
import { v4 as uuidv4 } from "uuid";

export class MarketplaceService {
  private repository: MarketplaceRepository;

  constructor() {
    this.repository = new MarketplaceRepository();
  }

  async getMarketplaces() {
    return this.repository.getMarketplaces();
  }

  async getPublications() {
    return this.repository.getPublications();
  }

  async getTemplates() {
    return this.repository.getTemplates();
  }

  async getFeatured() {
    return this.repository.getFeatured();
  }

  async getReviews(publicationId?: string) {
    return this.repository.getReviews(publicationId);
  }

  async getUsageStatistics() {
    return this.repository.getUsageStatistics();
  }

  async publishStrategy(data: any) {
    const id = uuidv4();
    return this.repository.createPublication({ id, ...data });
  }

  async installStrategy(data: any) {
    const id = uuidv4();
    return this.repository.createInstallation({ id, ...data });
  }

  async cloneStrategy(data: any) {
    // A clone is similar to an install but might create a new detached registry entry.
    // For now, record the install/clone.
    const id = uuidv4();
    return this.repository.createInstallation({ id, ...data });
  }
}
