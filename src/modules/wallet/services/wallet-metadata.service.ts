import { WalletRepository } from "../repositories/wallet.repository.ts";
import { WalletMetadataInfo } from "../types/index.ts";

export class WalletMetadataService {
  private static instance: WalletMetadataService;
  private repository: WalletRepository;

  private constructor() {
    this.repository = WalletRepository.getInstance();
  }

  public static getInstance(): WalletMetadataService {
    if (!WalletMetadataService.instance) {
      WalletMetadataService.instance = new WalletMetadataService();
    }
    return WalletMetadataService.instance;
  }

  public async saveMetadata(metadata: WalletMetadataInfo): Promise<WalletMetadataInfo> {
    return this.repository.saveMetadata(metadata);
  }

  public async getMetadata(walletId: string): Promise<WalletMetadataInfo | null> {
    return this.repository.getMetadata(walletId);
  }
}
