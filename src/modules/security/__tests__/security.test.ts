import { describe, it, expect } from "vitest";
import { securityService } from "../services/SecurityService";

describe("Security Platform", () => {
  it("should get status", async () => {
    const result = await securityService.getStatus();
    expect(result.status).toBe("HEALTHY");
  });

  it("should verify access", async () => {
    const result = await securityService.verifyAccess({ userId: "test" });
    expect(result.status).toBe("VERIFIED");
  });
});
