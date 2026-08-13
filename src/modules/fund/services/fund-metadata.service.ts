import { FundRepository } from "../repositories/fund.repository.ts";
import { FundMetadataInfo } from "../types/index.ts";

export class FundMetadataService {
  private static instance: FundMetadataService;
  private repository: FundRepository;

  private constructor() {
    this.repository = FundRepository.getInstance();
  }

  public static getInstance(): FundMetadataService {
    if (!FundMetadataService.instance) {
      FundMetadataService.instance = new FundMetadataService();
    }
    return FundMetadataService.instance;
  }

  public async setMetadata(info: FundMetadataInfo): Promise<FundMetadataInfo> {
    return this.repository.saveMetadata(info);
  }

  public async getMetadata(fundId: string): Promise<FundMetadataInfo | null> {
    return this.repository.getMetadata(fundId);
  }
}
