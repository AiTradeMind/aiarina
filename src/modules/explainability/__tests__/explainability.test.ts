import { describe, it, expect } from "vitest";
import { explainabilityService } from "../services/ExplainabilityService";

describe("Explainability Engine", () => {
  it("should explain decision", async () => {
    const result = await explainabilityService.getExplanation("test-decision");
    expect(result).toBeDefined();
    expect(result.decisionId).toBe("test-decision");
  });
});
