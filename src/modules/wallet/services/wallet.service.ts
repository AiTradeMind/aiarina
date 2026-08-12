import { WalletRegistryService } from "./wallet-registry.service.ts";
import { WalletLifecycleService } from "./wallet-lifecycle.service.ts";
import { TransferEngineService } from "./transfer-engine.service.ts";
import { BalanceEngineService } from "./balance-engine.service.ts";
import { TransactionEngineService } from "./transaction-engine.service.ts";
import { LedgerEngineService } from "./ledger-engine.service.ts";
import { WalletHealthService } from "./wallet-health.service.ts";
import { WalletPipelineService } from "../pipeline/wallet-pipeline.service.ts";
import { WalletRepository } from "../repositories/wallet.repository.ts";
import { WalletValidator } from "../validators/wallet.validator.ts";
import {
  CreateWalletDTO,
  DepositDTO,
  WithdrawDTO,
  TransferDTO,
  LockFundsDTO,
  UnlockFundsDTO,
} from "../dtos/wallet.dto.ts";
import {
  WalletAccount,
  WalletBalance,
  WalletTransaction,
  LedgerEntry,
  WalletPipelineExecutionResult,
} from "../types/index.ts";

export class WalletService {
  private static instance: WalletService;
  private registryService: WalletRegistryService;
  private lifecycleService: WalletLifecycleService;
  private transferEngine: TransferEngineService;
  private balanceEngine: BalanceEngineService;
  private transactionEngine: TransactionEngineService;
  private ledgerEngine: LedgerEngineService;
  private healthService: WalletHealthService;
  private pipelineService: WalletPipelineService;
  private repository: WalletRepository;

  private constructor() {
    this.registryService = WalletRegistryService.getInstance();
    this.lifecycleService = WalletLifecycleService.getInstance();
    this.transferEngine = TransferEngineService.getInstance();
    this.balanceEngine = BalanceEngineService.getInstance();
    this.transactionEngine = TransactionEngineService.getInstance();
    this.ledgerEngine = LedgerEngineService.getInstance();
    this.healthService = WalletHealthService.getInstance();
    this.pipelineService = WalletPipelineService.getInstance();
    this.repository = WalletRepository.getInstance();
  }

  public static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  // --- Wallet Operations ---

  public async createWallet(dto: CreateWalletDTO): Promise<WalletPipelineExecutionResult<WalletAccount>> {
    return this.pipelineService.runPipeline(
      "CREATE_WALLET",
      {
        walletId: dto.walletId,
        amount: dto.initialBalance,
        actorRole: dto.ownerId || "SYSTEM",
      },
      async () => {
        return this.registryService.registerWallet(dto);
      }
    );
  }

  public async deposit(dto: DepositDTO): Promise<WalletPipelineExecutionResult<WalletTransaction>> {
    return this.pipelineService.runPipeline(
      "DEPOSIT",
      {
        walletId: dto.walletId,
        amount: dto.amount,
        actorId: dto.initiator,
      },
      async () => {
        WalletValidator.validateDeposit(dto);
        await this.balanceEngine.credit(dto.walletId, dto.amount);
        return this.transactionEngine.createTransaction({
          transactionType: "DEPOSIT",
          amount: dto.amount,
          referenceId: dto.referenceId,
          destinationWalletId: dto.walletId,
          initiator: dto.initiator || "SYSTEM",
          metadata: { notes: dto.notes, ...dto.metadata },
        });
      }
    );
  }

  public async withdraw(dto: WithdrawDTO): Promise<WalletPipelineExecutionResult<WalletTransaction>> {
    return this.pipelineService.runPipeline(
      "WITHDRAW",
      {
        walletId: dto.walletId,
        amount: dto.amount,
        actorId: dto.initiator,
      },
      async () => {
        WalletValidator.validateWithdraw(dto);
        await this.balanceEngine.debit(dto.walletId, dto.amount);
        return this.transactionEngine.createTransaction({
          transactionType: "WITHDRAW",
          amount: dto.amount,
          referenceId: dto.referenceId,
          sourceWalletId: dto.walletId,
          initiator: dto.initiator || "SYSTEM",
          metadata: { notes: dto.notes, ...dto.metadata },
        });
      }
    );
  }

  public async transfer(dto: TransferDTO): Promise<WalletPipelineExecutionResult<WalletTransaction>> {
    return this.pipelineService.runPipeline(
      "TRANSFER",
      {
        sourceWalletId: dto.sourceWalletId,
        destinationWalletId: dto.destinationWalletId,
        amount: dto.amount,
        actorId: dto.initiator,
      },
      async () => {
        return this.transferEngine.executeTransfer(dto);
      }
    );
  }

  public async lockFunds(dto: LockFundsDTO): Promise<WalletPipelineExecutionResult<WalletBalance>> {
    return this.pipelineService.runPipeline(
      "LOCK_FUNDS",
      {
        walletId: dto.walletId,
        amount: dto.amount,
        actorId: dto.initiator,
      },
      async () => {
        return this.lifecycleService.lockFunds(dto);
      }
    );
  }

  public async unlockFunds(dto: UnlockFundsDTO): Promise<WalletPipelineExecutionResult<WalletBalance>> {
    return this.pipelineService.runPipeline(
      "UNLOCK_FUNDS",
      {
        walletId: dto.walletId,
        amount: dto.amount,
        actorId: dto.initiator,
      },
      async () => {
        return this.lifecycleService.unlockFunds(dto);
      }
    );
  }

  public async freezeWallet(
    walletId: string,
    reason: string,
    actorId: string = "SYSTEM"
  ): Promise<WalletPipelineExecutionResult<WalletAccount>> {
    return this.pipelineService.runPipeline(
      "FREEZE_WALLET",
      { walletId, actorId },
      async () => {
        return this.lifecycleService.freezeWallet(walletId, reason, actorId);
      }
    );
  }

  public async unfreezeWallet(
    walletId: string,
    reason: string,
    actorId: string = "SYSTEM"
  ): Promise<WalletPipelineExecutionResult<WalletAccount>> {
    return this.pipelineService.runPipeline(
      "UNFREEZE_WALLET",
      { walletId, actorId },
      async () => {
        return this.lifecycleService.unfreezeWallet(walletId, reason, actorId);
      }
    );
  }

  // --- Read Operations ---

  public async getWalletById(walletId: string): Promise<WalletAccount | null> {
    return this.registryService.getWalletById(walletId);
  }

  public async getAllWallets(): Promise<WalletAccount[]> {
    return this.registryService.getAllWallets();
  }

  public async getBalance(walletId: string): Promise<WalletBalance | null> {
    return this.balanceEngine.getBalance(walletId);
  }

  public async getTransactions(
    walletId?: string,
    limit: number = 100
  ): Promise<WalletTransaction[]> {
    return this.transactionEngine.getTransactions(walletId, limit);
  }

  public async getLedgerEntries(
    walletId?: string,
    limit: number = 100
  ): Promise<LedgerEntry[]> {
    return this.ledgerEngine.getLedgerHistory(walletId, limit);
  }

  public async getHealth(): Promise<Record<string, any>> {
    return this.healthService.getHealth();
  }

  // --- BUSINESS PROHIBITION ENFORCEMENT ---
  // Wallet Foundation NEVER allocates capital, NEVER executes trades, NEVER creates market positions.

  public async allocateCapital(...args: any[]): Promise<never> {
    WalletValidator.validateProhibitionCall("allocateCapital");
    throw new Error("PROHIBITION_ERROR: Wallet Foundation cannot allocate capital.");
  }

  public async executeTrade(...args: any[]): Promise<never> {
    WalletValidator.validateProhibitionCall("executeTrade");
    throw new Error("PROHIBITION_ERROR: Wallet Foundation cannot execute trades.");
  }

  public async createMarketPosition(...args: any[]): Promise<never> {
    WalletValidator.validateProhibitionCall("createMarketPosition");
    throw new Error("PROHIBITION_ERROR: Wallet Foundation cannot create market positions.");
  }

  public async updateMarketPosition(...args: any[]): Promise<never> {
    WalletValidator.validateProhibitionCall("updateMarketPosition");
    throw new Error("PROHIBITION_ERROR: Wallet Foundation cannot update market positions.");
  }
}
