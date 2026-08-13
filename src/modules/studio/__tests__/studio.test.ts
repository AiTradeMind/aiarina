import { describe, it, expect } from "vitest";
import { studioService } from "../services/StudioService";

describe("Studio Engine", () => {
  it("should get dashboard data", async () => {
    const result = await studioService.getStudioData("dashboard");
    expect(result).toBeDefined();
    expect(result.type).toBe("dashboard");
  });
});
