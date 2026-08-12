import { describe, it, expect } from "vitest";
import { notificationService } from "../services/NotificationService";

describe("Notification Engine", () => {
  it("should get status", async () => {
    const result = await notificationService.getStatus();
    expect(result.status).toBe("OK");
  });

  it("should send notification", async () => {
    const result = await notificationService.sendNotification({ message: "test-notification", priority: "INFO" });
    expect(result.message).toBe("test-notification");
    expect(result.status).toBe("PENDING");
  });
});
