import { describe, it, expect } from "vitest";
import { schedulerService } from "../services/SchedulerService";

describe("Scheduler Engine", () => {
  it("should get status", async () => {
    const result = await schedulerService.getStatus();
    expect(result.status).toBe("OK");
  });

  it("should create schedule", async () => {
    const result = await schedulerService.createSchedule({ name: "test-job", type: "CRON" });
    expect(result.name).toBe("test-job");
  });
});
