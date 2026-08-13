import { WalletRepository } from "../repositories/wallet.repository.ts";
import { LedgerEngineService } from "./ledger-engine.service.ts";

export class WalletHealthService {
  private static instance: WalletHealthService;
  private repository: WalletRepository;
  private ledgerEngine: LedgerEngineService;

  private constructor() {
    this.repository = WalletRepository.getInstance();
    this.ledgerEngine = LedgerEngineService.getInstance();
  }

  public static getInstance(): WalletHealthService {
    if (!WalletHealthService.instance) {
      WalletHealthService.instance = new WalletHealthService();
    }
    return WalletHealthService.instance;
  }

  public async getHealth(): Promise<Record<string, any>> {
    const wallets = await this.repository.getAllWalletAccounts();
    const activeCount = wallets.filter((w) => w.status === "ACTIVE").length;
    const frozenCount = wallets.filter((w) => w.status === "FROZEN").length;
    const lockedCount = wallets.filter((w) => w.status === "LOCKED").length;

    let totalCurrentBalance = 0;
    let totalAvailableBalance = 0;

    for (const w of wallets) {
      const bal = await this.repository.getWalletBalance(w.walletId);
      if (bal) {
        totalCurrentBalance += bal.currentBalance;
        totalAvailableBalance += bal.availableBalance;
      }
    }

    const ledgerCheck = await this.ledgerEngine.verifyImmutability();

    return {
      status: "HEALTHY",
      module: "WALLET_FOUNDATION",
      timestamp: new Date().toISOString(),
      summary: {
        totalWallets: wallets.length,
        activeWallets: activeCount,
        frozenWallets: frozenCount,
        lockedWallets: lockedCount,
        totalCurrentBalance,
        totalAvailableBalance,
      },
      ledgerDiagnostics: {
        totalEntries: ledgerCheck.totalEntries,
        immutabilityVerified: ledgerCheck.valid,
      },
      governanceIntegration: "ENABLED",
      businessRuleProhibitions: {
        allocatesCapital: false,
        executesTrades: false,
        createsMarketPositions: false,
      },
    };
  }
}
