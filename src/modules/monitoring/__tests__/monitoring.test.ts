import { describe, it, expect } from "vitest";
import { monitoringService } from "../services/MonitoringService";

describe("Monitoring Engine", () => {
  it("should get system health", async () => {
    const result = await monitoringService.getHealth();
    expect(result.status).toBe("HEALTHY");
  });

  it("should get metrics", async () => {
    const result = await monitoringService.getMetrics();
    expect(result.cpu).toBe(20);
  });
});
