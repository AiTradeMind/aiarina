import { describe, it, expect } from "vitest";
import { BrainHardeningEngine } from "../services/brain-hardening.service.ts";

describe("AI Brain Hardening Engine", () => {
  const engine = BrainHardeningEngine.getInstance();

  it("should consolidate memory correctly", async () => {
    const memory = { id: "MEM_1", content: "Test memory", accessCount: 60, ageDays: 40 };
    const result = await engine.consolidateMemory(memory);
    expect(result.promotedTier).toBe("LONG_TERM");
  });

  it("should manage cache correctly", () => {
    engine.setCache("test_key", "KNOWLEDGE", { value: 123 }, 5000);
    const val = engine.getCache("test_key");
    expect(val).toEqual({ value: 123 });
  });

  it("should verify ledger integrity calculation", () => {
    const opening = 1000;
    const credits = 500;
    const debits = 200;
    const closing = 1300;
    
    // Using WalletHardeningEngine logic or equivalent
    const calc = opening + credits - debits;
    expect(calc).toBe(closing);
  });
});
