import { describe, it, expect } from "vitest";
import { WalletHardeningEngine } from "../services/wallet-hardening.service.ts";

describe("Wallet Hardening Engine", () => {
  const engine = WalletHardeningEngine.getInstance();

  it("should verify ledger integrity correctly", () => {
    const res = engine.verifyLedgerIntegrity(1000, 250, 150, 1100);
    expect(res.isValid).toBe(true);
    expect(res.expectedClosing).toBe(1100);
  });

  it("should detect invalid ledger integrity", () => {
    const res = engine.verifyLedgerIntegrity(1000, 250, 150, 1200);
    expect(res.isValid).toBe(false);
    expect(res.drift).toBe(100);
  });
});
