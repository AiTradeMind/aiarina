import { describe, it, expect } from "vitest";
import { forecastService } from "../services/ForecastService";

describe("Forecast Engine", () => {
  it("should run forecast", async () => {
    const config = { id: "test", entityId: "test", entityType: "AI" as const, params: {} };
    const result = await forecastService.runForecast(config);
    expect(result).toBeDefined();
    expect(result.entityId).toBe("test");
  });
});
