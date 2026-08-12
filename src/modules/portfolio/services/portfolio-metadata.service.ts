import { PortfolioRepository } from "../repositories/portfolio.repository.ts";
import { PortfolioMetadataRecord } from "../types/index.ts";

export class PortfolioMetadataService {
  private repository: PortfolioRepository;

  constructor() {
    this.repository = new PortfolioRepository();
  }

  async getMetadata(portfolioId: string): Promise<PortfolioMetadataRecord | null> {
    return await this.repository.getMetadata(portfolioId);
  }

  async saveMetadata(meta: PortfolioMetadataRecord): Promise<PortfolioMetadataRecord> {
    return await this.repository.saveMetadata(meta);
  }
}
