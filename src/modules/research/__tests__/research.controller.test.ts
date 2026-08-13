import { describe, it, expect, beforeEach, vi } from "vitest";
import { ResearchCenterController } from "../controllers/research-center.controller.ts";
import { RESEARCH_CATEGORIES, RESEARCH_STATUSES } from "../constants/index.ts";

function createMockRes() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe("ResearchCenterController", () => {
  let controller: ResearchCenterController;

  beforeEach(() => {
    controller = new ResearchCenterController();
  });

  it("should handle GET /research/categories", async () => {
    const req: any = {};
    const res = createMockRes();
    const next = vi.fn();

    await controller.getCategories(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.any(Array),
      })
    );
  });

  it("should handle GET /research/status", async () => {
    const req: any = {};
    const res = createMockRes();
    const next = vi.fn();

    await controller.getStatuses(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.arrayContaining(["DRAFT", "COLLECTING", "PROCESSING", "READY", "ARCHIVED", "FAILED"]),
      })
    );
  });

  it("should handle POST /research and create a research item", async () => {
    const req: any = {
      body: {
        title: "Controller Integration Test",
        content: "Testing Express route handler for research item creation.",
        category: RESEARCH_CATEGORIES.NEWS,
        status: RESEARCH_STATUSES.READY,
        tags: ["integration", "test"],
      },
      headers: { "x-user-id": "ADMIN" },
    };
    const res = createMockRes();
    const next = vi.fn();

    await controller.createResearch(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          title: "Controller Integration Test",
        }),
      })
    );
  });

  it("should handle GET /research with filter parameters", async () => {
    const req: any = {
      query: {
        keyword: "Integration",
        category: RESEARCH_CATEGORIES.NEWS,
        status: RESEARCH_STATUSES.READY,
      },
    };
    const res = createMockRes();
    const next = vi.fn();

    await controller.getResearchItems(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.any(Array),
      })
    );
  });
});
