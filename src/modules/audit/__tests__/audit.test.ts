import { describe, it, expect } from "vitest";
import { auditService } from "../services/AuditService";

describe("Audit Engine", () => {
  it("should get status", async () => {
    const result = await auditService.getStatus();
    expect(result.status).toBe("OK");
  });

  it("should log event", async () => {
    const result = await auditService.logEvent({ eventType: "TEST_EVENT", eventDetails: { key: "value" } });
    expect(result.eventType).toBe("TEST_EVENT");
    expect(result.status).toBe("RECORDED");
  });
});
