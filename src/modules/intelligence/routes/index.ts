import { Router, Request, Response } from "express";
import { IntelligenceService } from "../services/intelligence.service.ts";
import logger from "../../../lib/logger.ts";

export const intelligenceRouter = Router();
const service = IntelligenceService.getInstance();

// Helper to extract or fallback to latest session ID
async function resolveSessionId(req: Request): Promise<string> {
  const qSessionId = req.query.sessionId as string;
  if (qSessionId) return qSessionId;

  // Otherwise, fetch latest session
  const sessions = await service.getAllSessions();
  if (sessions.length > 0) {
    return sessions[0].id;
  }
  
  // Or create a quick one on the fly for ease of use
  const newSess = await service.createSession("gemini-1.5-flash", "AI_INTELLIGENCE", "corr_auto");
  await service.queueJob(newSess.id, 50);
  return newSess.id;
}

// POST /api/intelligence/session
intelligenceRouter.post("/intelligence/session", async (req: Request, res: Response) => {
  try {
    const { aiModelId = "gemini-1.5-flash", priority = 50, correlationId } = req.body;
    logger.info({ aiModelId, priority }, "Initiating Enterprise Intelligence Session");

    const session = await service.createSession(aiModelId, "AI_INTELLIGENCE", correlationId);
    const runtime = await service.queueJob(session.id, Number(priority));

    res.status(201).json({
      success: true,
      session,
      runtime
    });
  } catch (error: any) {
    logger.error({ error: error.message }, "Error creating intelligence session");
    res.status(500).json({ error: error.message });
  }
});

// GET /api/intelligence/context
intelligenceRouter.get("/intelligence/context", async (req: Request, res: Response) => {
  try {
    const sessionId = await resolveSessionId(req);
    const context = await service.getContext(sessionId);
    
    if (!context) {
      return res.status(404).json({ error: `Context not found for session ${sessionId}` });
    }

    res.json(context);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/intelligence/reasoning
intelligenceRouter.get("/intelligence/reasoning", async (req: Request, res: Response) => {
  try {
    const sessionId = await resolveSessionId(req);
    const reasoning = await service.getReasoning(sessionId);

    if (!reasoning) {
      return res.status(404).json({ error: `Reasoning not found for session ${sessionId}` });
    }

    res.json(reasoning);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/intelligence/confidence
intelligenceRouter.get("/intelligence/confidence", async (req: Request, res: Response) => {
  try {
    const sessionId = await resolveSessionId(req);
    const confidence = await service.getConfidence(sessionId);

    if (!confidence) {
      return res.status(404).json({ error: `Confidence scores not found for session ${sessionId}` });
    }

    res.json(confidence);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/intelligence/hypothesis
intelligenceRouter.get("/intelligence/hypothesis", async (req: Request, res: Response) => {
  try {
    const sessionId = await resolveSessionId(req);
    const hypothesis = await service.getHypothesis(sessionId);

    if (!hypothesis) {
      return res.status(404).json({ error: `Hypothesis not found for session ${sessionId}` });
    }

    res.json(hypothesis);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/intelligence/graphs
intelligenceRouter.get("/intelligence/graphs", async (req: Request, res: Response) => {
  try {
    const sessionId = await resolveSessionId(req);
    const graphs = await service.getGraphs(sessionId);

    if (!graphs) {
      return res.status(404).json({ error: `Graphs not found for session ${sessionId}` });
    }

    res.json(graphs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/intelligence/runtime
intelligenceRouter.get("/intelligence/runtime", async (req: Request, res: Response) => {
  try {
    const sessionId = await resolveSessionId(req);
    const runtime = await service.getRuntimeStatus(sessionId);

    if (!runtime) {
      return res.status(404).json({ error: `Runtime status not found for session ${sessionId}` });
    }

    res.json(runtime);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/intelligence/sessions (convenience for dashboard)
intelligenceRouter.get("/intelligence/sessions", async (req: Request, res: Response) => {
  try {
    const sessions = await service.getAllSessions();
    res.json(sessions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/intelligence/audits (convenience for audit table)
intelligenceRouter.get("/intelligence/audits", async (req: Request, res: Response) => {
  try {
    const sessionId = req.query.sessionId as string;
    const audits = await service.getAudits(sessionId);
    res.json(audits);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/intelligence/events (convenience for live event streams)
intelligenceRouter.get("/intelligence/events", async (req: Request, res: Response) => {
  try {
    const sessionId = req.query.sessionId as string;
    const events = await service.getEvents(sessionId);
    res.json(events);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/intelligence/validate (convenience for validation)
intelligenceRouter.get("/intelligence/validate", async (req: Request, res: Response) => {
  try {
    const validation = await service.validateIntelligence();
    res.json(validation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/intelligence/reset (Module-Local Reset)
intelligenceRouter.post("/intelligence/reset", async (req: Request, res: Response) => {
  try {
    const { confirm, resetState } = req.body || {};
    const result = await service.resetIntelligenceTestData({
      confirm: Boolean(confirm),
      resetState: resetState || "OFF"
    });
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || "AI Intelligence reset failed"
    });
  }
});
