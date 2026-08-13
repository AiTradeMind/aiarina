import { FundRepository } from "../repositories/fund.repository.ts";
import { FundAccount, FundTransaction } from "../types/index.ts";
import logger from "../../../lib/logger.ts";

export class FundLifecycleService {
  private static instance: FundLifecycleService;
  private repository: FundRepository;

  private constructor() {
    this.repository = FundRepository.getInstance();
  }

  public static getInstance(): FundLifecycleService {
    if (!FundLifecycleService.instance) {
      FundLifecycleService.instance = new FundLifecycleService();
    }
    return FundLifecycleService.instance;
  }

  public async freezeFund(fundId: string, reason: string, actorId: string = "SYSTEM"): Promise<FundAccount> {
    const account = await this.repository.getAccountById(fundId);
    if (!account) {
      throw new Error(`LIFECYCLE_ERROR: Fund '${fundId}' not found.`);
    }

    if (account.status === "FROZEN") {
      return account;
    }

    account.status = "FROZEN";
    account.frozenCapital = account.availableCapital;
    account.availableCapital = 0;

    const updated = await this.repository.saveAccount(account);

    const tx: FundTransaction = {
      transactionId: `TX-FREEZE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      fundId,
      operation: "FREEZE",
      amount: account.frozenCapital,
      status: "SUCCESS",
      actorId,
      metadata: { reason },
    };
    await this.repository.saveTransaction(tx);

    logger.warn({ fundId, reason, actorId }, "Fund Account FROZEN");

    return updated;
  }

  public async unfreezeFund(fundId: string, reason: string, actorId: string = "SYSTEM"): Promise<FundAccount> {
    const account = await this.repository.getAccountById(fundId);
    if (!account) {
      throw new Error(`LIFECYCLE_ERROR: Fund '${fundId}' not found.`);
    }

    if (account.status !== "FROZEN") {
      return account;
    }

    account.status = "ACTIVE";
    account.availableCapital += account.frozenCapital;
    account.frozenCapital = 0;

    const updated = await this.repository.saveAccount(account);

    const tx: FundTransaction = {
      transactionId: `TX-UNFREEZE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      fundId,
      operation: "UNFREEZE",
      amount: account.availableCapital,
      status: "SUCCESS",
      actorId,
      metadata: { reason },
    };
    await this.repository.saveTransaction(tx);

    logger.info({ fundId, reason, actorId }, "Fund Account UNFROZEN");

    return updated;
  }

  public async archiveFund(fundId: string, actorId: string = "SYSTEM"): Promise<FundAccount> {
    const account = await this.repository.getAccountById(fundId);
    if (!account) {
      throw new Error(`LIFECYCLE_ERROR: Fund '${fundId}' not found.`);
    }

    if (account.allocatedCapital > 0 || account.reservedCapital > 0) {
      throw new Error(`LIFECYCLE_ERROR: Cannot archive fund '${fundId}' with active allocations or reservations.`);
    }

    account.status = "ARCHIVED";
    const updated = await this.repository.saveAccount(account);

    const tx: FundTransaction = {
      transactionId: `TX-ARCHIVE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      fundId,
      operation: "ARCHIVE",
      amount: account.totalCapital,
      status: "SUCCESS",
      actorId,
    };
    await this.repository.saveTransaction(tx);

    logger.info({ fundId, actorId }, "Fund Account ARCHIVED");

    return updated;
  }
}
