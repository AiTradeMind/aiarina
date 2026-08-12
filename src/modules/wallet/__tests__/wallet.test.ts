import { describe, it, expect, beforeEach } from "vitest";
import { WalletService } from "../services/wallet.service.ts";
import { WalletRepository } from "../repositories/wallet.repository.ts";
import { LedgerEngineService } from "../services/ledger-engine.service.ts";
import { BalanceEngineService } from "../services/balance-engine.service.ts";

describe("Wallet Foundation Module (Phase 2.8)", () => {
  let walletService: WalletService;
  let walletRepository: WalletRepository;
  let ledgerEngine: LedgerEngineService;
  let balanceEngine: BalanceEngineService;

  beforeEach(() => {
    walletService = WalletService.getInstance();
    walletRepository = WalletRepository.getInstance();
    ledgerEngine = LedgerEngineService.getInstance();
    balanceEngine = BalanceEngineService.getInstance();
  });

  describe("Wallet Account Registry & Lifecycle", () => {
    it("should register a new Master Wallet account", async () => {
      const res = await walletService.createWallet({
        walletId: "WALLET-MASTER-01",
        name: "Enterprise Master Ledger",
        walletType: "MASTER_WALLET",
        currency: "USD",
        initialBalance: 500000,
        ownerId: "ENTERPRISE_TREASURY",
      });

      expect(res.success).toBe(true);
      expect(res.data?.walletId).toBe("WALLET-MASTER-01");
      expect(res.data?.walletType).toBe("MASTER_WALLET");
      expect(res.data?.status).toBe("ACTIVE");

      const fetched = await walletService.getWalletById("WALLET-MASTER-01");
      expect(fetched).not.toBeNull();
      expect(fetched?.name).toBe("Enterprise Master Ledger");
    });

    it("should register different wallet types", async () => {
      const types = [
        "AI_MODEL_WALLET",
        "STRATEGY_WALLET",
        "PAPER_TRADING_WALLET",
        "RESERVE_WALLET",
        "SYSTEM_WALLET",
        "TEST_WALLET",
        "CUSTOM_WALLET",
      ] as const;

      for (const t of types) {
        const id = `W-TYPE-${t}`;
        const res = await walletService.createWallet({
          walletId: id,
          name: `Wallet for ${t}`,
          walletType: t,
          initialBalance: 10000,
        });

        expect(res.success).toBe(true);
        expect(res.data?.walletType).toBe(t);
      }
    });

    it("should reject registering a duplicate wallet ID", async () => {
      await walletService.createWallet({
        walletId: "W-DUP-01",
        name: "Original Wallet",
        walletType: "SYSTEM_WALLET",
      });

      const res = await walletService.createWallet({
        walletId: "W-DUP-01",
        name: "Duplicate Wallet",
        walletType: "SYSTEM_WALLET",
      });

      expect(res.success).toBe(false);
      expect(res.failureReason).toContain("already registered");
    });
  });

  describe("Balance Engine & Transaction Engine", () => {
    it("should correctly handle deposit and update balance", async () => {
      await walletService.createWallet({
        walletId: "W-DEP-01",
        name: "Deposit Test Wallet",
        walletType: "PAPER_TRADING_WALLET",
        initialBalance: 1000,
      });

      const depRes = await walletService.deposit({
        walletId: "W-DEP-01",
        amount: 2500,
        notes: "Capital injection",
      });

      expect(depRes.success).toBe(true);

      const bal = await walletService.getBalance("W-DEP-01");
      expect(bal?.currentBalance).toBe(3500);
      expect(bal?.availableBalance).toBe(3500);
      expect(bal?.totalCredits).toBe(3500);
      expect(bal?.totalDebits).toBe(0);
      expect(bal?.netBalance).toBe(3500);
    });

    it("should correctly handle withdrawal and enforce available balance limits", async () => {
      await walletService.createWallet({
        walletId: "W-WITH-01",
        name: "Withdrawal Test Wallet",
        walletType: "STRATEGY_WALLET",
        initialBalance: 5000,
      });

      const withRes = await walletService.withdraw({
        walletId: "W-WITH-01",
        amount: 2000,
      });

      expect(withRes.success).toBe(true);

      const bal = await walletService.getBalance("W-WITH-01");
      expect(bal?.currentBalance).toBe(3000);
      expect(bal?.availableBalance).toBe(3000);
      expect(bal?.totalDebits).toBe(2000);

      // Attempt withdrawal exceeding available balance
      const failRes = await walletService.withdraw({
        walletId: "W-WITH-01",
        amount: 10000,
      });

      expect(failRes.success).toBe(false);
      expect(failRes.failureReason).toContain("INSUFFICIENT_FUNDS");
    });

    it("should lock and unlock funds accurately", async () => {
      await walletService.createWallet({
        walletId: "W-LOCK-01",
        name: "Lock Test Wallet",
        walletType: "RESERVE_WALLET",
        initialBalance: 10000,
      });

      const lockRes = await walletService.lockFunds({
        walletId: "W-LOCK-01",
        amount: 4000,
        reason: "Pending collateral verification",
      });

      expect(lockRes.success).toBe(true);

      let bal = await walletService.getBalance("W-LOCK-01");
      expect(bal?.availableBalance).toBe(6000);
      expect(bal?.lockedBalance).toBe(4000);
      expect(bal?.currentBalance).toBe(10000);

      const unlockRes = await walletService.unlockFunds({
        walletId: "W-LOCK-01",
        amount: 2500,
        reason: "Collateral released",
      });

      expect(unlockRes.success).toBe(true);

      bal = await walletService.getBalance("W-LOCK-01");
      expect(bal?.availableBalance).toBe(8500);
      expect(bal?.lockedBalance).toBe(1500);
    });
  });

  describe("Transfer Engine & Pipeline Execution", () => {
    it("should execute internal transfer between wallets", async () => {
      await walletService.createWallet({
        walletId: "W-SRC-TRANSFER",
        name: "Source Transfer Wallet",
        walletType: "MASTER_WALLET",
        initialBalance: 100000,
      });

      await walletService.createWallet({
        walletId: "W-DEST-TRANSFER",
        name: "Destination Transfer Wallet",
        walletType: "AI_MODEL_WALLET",
        initialBalance: 0,
      });

      const transferRes = await walletService.transfer({
        sourceWalletId: "W-SRC-TRANSFER",
        destinationWalletId: "W-DEST-TRANSFER",
        amount: 35000,
        notes: "Model allocation transfer",
      });

      expect(transferRes.success).toBe(true);
      expect(transferRes.pipelineStage).toBe("READY");

      const srcBal = await walletService.getBalance("W-SRC-TRANSFER");
      expect(srcBal?.availableBalance).toBe(65000);

      const destBal = await walletService.getBalance("W-DEST-TRANSFER");
      expect(destBal?.availableBalance).toBe(35000);
    });

    it("should prevent transfers from frozen wallets", async () => {
      await walletService.createWallet({
        walletId: "W-FROZEN-SRC",
        name: "Frozen Source Wallet",
        walletType: "TEST_WALLET",
        initialBalance: 50000,
      });

      await walletService.createWallet({
        walletId: "W-DEST-02",
        name: "Target Wallet",
        walletType: "TEST_WALLET",
        initialBalance: 0,
      });

      await walletService.freezeWallet("W-FROZEN-SRC", "Compliance audit under review");

      const transferRes = await walletService.transfer({
        sourceWalletId: "W-FROZEN-SRC",
        destinationWalletId: "W-DEST-02",
        amount: 10000,
      });

      expect(transferRes.success).toBe(false);
      expect(transferRes.failureReason).toContain("FROZEN");
    });
  });

  describe("Immutable Ledger Engine", () => {
    it("should generate sequential immutable ledger entries for all completed operations", async () => {
      await walletService.createWallet({
        walletId: "W-LEDGER-01",
        name: "Ledger Verification Wallet",
        walletType: "SYSTEM_WALLET",
        initialBalance: 20000,
      });

      await walletService.deposit({
        walletId: "W-LEDGER-01",
        amount: 5000,
      });

      await walletService.withdraw({
        walletId: "W-LEDGER-01",
        amount: 2000,
      });

      const entries = await walletService.getLedgerEntries("W-LEDGER-01");
      expect(entries.length).toBeGreaterThanOrEqual(2);

      const immutabilityCheck = await ledgerEngine.verifyImmutability("W-LEDGER-01");
      expect(immutabilityCheck.valid).toBe(true);
    });
  });

  describe("Business Rule Prohibition Enforcement", () => {
    it("should throw prohibition error if direct capital allocation is attempted", async () => {
      await expect(walletService.allocateCapital()).rejects.toThrow(
        "PROHIBITION_ERROR: Wallet Foundation cannot allocate capital."
      );
    });

    it("should throw prohibition error if direct trade execution is attempted", async () => {
      await expect(walletService.executeTrade()).rejects.toThrow(
        "PROHIBITION_ERROR: Wallet Foundation cannot execute trades."
      );
    });

    it("should throw prohibition error if direct market position creation or update is attempted", async () => {
      await expect(walletService.createMarketPosition()).rejects.toThrow(
        "PROHIBITION_ERROR: Wallet Foundation cannot create market positions."
      );

      await expect(walletService.updateMarketPosition()).rejects.toThrow(
        "PROHIBITION_ERROR: Wallet Foundation cannot update market positions."
      );
    });
  });

  describe("Wallet Health Diagnostics", () => {
    it("should report comprehensive wallet foundation health diagnostics", async () => {
      const health = await walletService.getHealth();

      expect(health.status).toBe("HEALTHY");
      expect(health.module).toBe("WALLET_FOUNDATION");
      expect(health.businessRuleProhibitions.allocatesCapital).toBe(false);
      expect(health.businessRuleProhibitions.executesTrades).toBe(false);
      expect(health.businessRuleProhibitions.createsMarketPositions).toBe(false);
      expect(health.ledgerDiagnostics.immutabilityVerified).toBe(true);
    });
  });
});
