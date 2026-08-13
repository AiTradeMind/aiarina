import { describe, it, expect } from "vitest";
import { reportingService } from "../services/ReportingService";

describe("Reporting Engine", () => {
  it("should generate report", async () => {
    const result = await reportingService.getReport("performance");
    expect(result).toBeDefined();
    expect(result.type).toBe("performance");
  });
});
