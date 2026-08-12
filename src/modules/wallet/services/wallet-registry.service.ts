import { WalletRepository } from "../repositories/wallet.repository.ts";
import { BalanceEngineService } from "./balance-engine.service.ts";
import { WalletMetadataService } from "./wallet-metadata.service.ts";
import { CreateWalletDTO } from "../dtos/wallet.dto.ts";
import { WalletAccount } from "../types/index.ts";
import { WalletValidator } from "../validators/wallet.validator.ts";
import logger from "../../../lib/logger.ts";

export class WalletRegistryService {
  private static instance: WalletRegistryService;
  private repository: WalletRepository;
  private balanceEngine: BalanceEngineService;
  private metadataService: WalletMetadataService;

  private constructor() {
    this.repository = WalletRepository.getInstance();
    this.balanceEngine = BalanceEngineService.getInstance();
    this.metadataService = WalletMetadataService.getInstance();
  }

  public static getInstance(): WalletRegistryService {
    if (!WalletRegistryService.instance) {
      WalletRegistryService.instance = new WalletRegistryService();
    }
    return WalletRegistryService.instance;
  }

  public async registerWallet(dto: CreateWalletDTO): Promise<WalletAccount> {
    WalletValidator.validateCreateWallet(dto);

    const existing = await this.repository.getWalletAccountById(dto.walletId);
    if (existing) {
      throw new Error(`WALLET_ALREADY_EXISTS: Wallet ID '${dto.walletId}' is already registered.`);
    }

    const account: WalletAccount = {
      walletId: dto.walletId,
      name: dto.name,
      walletType: dto.walletType,
      status: "ACTIVE",
      currency: dto.currency || "USD",
      ownerId: dto.ownerId || "SYSTEM",
      parentWalletId: dto.parentWalletId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const saved = await this.repository.saveWalletAccount(account);

    // Initialize balance
    const initialBal = dto.initialBalance || 0;
    await this.balanceEngine.initializeBalance(saved.walletId, initialBal);

    // Initialize default metadata
    await this.metadataService.saveMetadata({
      walletId: saved.walletId,
      riskTier: "LOW",
      dailyTransferLimit: 1000000,
      maxBalanceLimit: 100000000,
      tags: [saved.walletType.toLowerCase()],
      customRules: {},
    });

    logger.info(
      { walletId: saved.walletId, walletType: saved.walletType, initialBalance: initialBal },
      "Wallet Account Successfully Registered"
    );

    return saved;
  }

  public async getWalletById(walletId: string): Promise<WalletAccount | null> {
    return this.repository.getWalletAccountById(walletId);
  }

  public async getAllWallets(): Promise<WalletAccount[]> {
    return this.repository.getAllWalletAccounts();
  }
}
