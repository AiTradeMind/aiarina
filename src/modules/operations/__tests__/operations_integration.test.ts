import { describe, it, expect } from "vitest";
import { operationsEngine } from "../engines/OperationsEngine";
import { monitoringEngine } from "../../monitoring/engines/MonitoringEngine";

describe("Operations Integration", () => {
  it("should aggregate monitoring data", async () => {
    const dashboard = await operationsEngine.getDashboard();
    const status = await monitoringEngine.getSystemHealth();
    expect(dashboard.status).toBe("HEALTHY");
    expect(status.status).toBe("HEALTHY");
  });
});
