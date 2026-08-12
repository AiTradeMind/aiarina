import { describe, it, expect } from "vitest";
import { recommendationService } from "../services/RecommendationService";

describe("Recommendation Engine", () => {
  it("should generate recommendation", async () => {
    const result = await recommendationService.getRecommendations("test-entity", "AI");
    expect(result).toBeDefined();
    expect(result.entityId).toBe("test-entity");
  });
});
