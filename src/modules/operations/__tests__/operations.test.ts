import { describe, it, expect } from "vitest";
import { operationsService } from "../services/OperationsService";

describe("Operations Engine", () => {
  it("should get dashboard", async () => {
    const result = await operationsService.getDashboard();
    expect(result.status).toBe("HEALTHY");
  });

  it("should get status", async () => {
    const result = await operationsService.getStatus();
    expect(result.status).toBe("HEALTHY");
  });
});
