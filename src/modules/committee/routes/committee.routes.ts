import { Router, Request, Response } from "express";
import { CommitteeService } from "../services/committee.service.ts";
import logger from "../../../lib/logger.ts";

export const committeeRouter = Router();
const committeeService = CommitteeService.getInstance();

// Sessions API
committeeRouter.get("/sessions", async (req: Request, res: Response) => {
  try {
    const list = await committeeService.getSessions();
    res.json(list);
  } catch (err: any) {
    logger.error({ error: err.message }, "Error in GET /sessions");
    res.status(500).json({ error: err.message });
  }
});

committeeRouter.post("/sessions", async (req: Request, res: Response) => {
  try {
    const { aiModelId, workspaceId, candidateId, correlationId } = req.body;
    const session = await committeeService.createSession(
      aiModelId || "gemini-1.5-pro",
      workspaceId || "wrk_rina_core",
      candidateId || "cand_default",
      correlationId || "corr_manual"
    );
    res.json(session);
  } catch (err: any) {
    logger.error({ error: err.message }, "Error in POST /sessions");
    res.status(500).json({ error: err.message });
  }
});

// Members API
committeeRouter.get("/members", async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.query;
    if (!sessionId) {
      return res.status(400).json({ error: "sessionId query parameter required" });
    }
    const list = await committeeService.getMembers(sessionId as string);
    res.json(list);
  } catch (err: any) {
    logger.error({ error: err.message }, "Error in GET /members");
    res.status(500).json({ error: err.message });
  }
});

// Votes API
committeeRouter.get("/votes", async (req: Request, res: Response) => {
  try {
    const votes = await committeeService.getVotes();
    res.json(votes);
  } catch (err: any) {
    logger.error({ error: err.message }, "Error in GET /votes");
    res.status(500).json({ error: err.message });
  }
});

// Consensus API
committeeRouter.get("/consensus", async (req: Request, res: Response) => {
  try {
    const consensus = await committeeService.getConsensus();
    res.json(consensus);
  } catch (err: any) {
    logger.error({ error: err.message }, "Error in GET /consensus");
    res.status(500).json({ error: err.message });
  }
});

// Decisions API
committeeRouter.get("/decisions", async (req: Request, res: Response) => {
  try {
    const decisions = await committeeService.getDecisions();
    res.json(decisions);
  } catch (err: any) {
    logger.error({ error: err.message }, "Error in GET /decisions");
    res.status(500).json({ error: err.message });
  }
});

// Certificates API
committeeRouter.get("/certificates", async (req: Request, res: Response) => {
  try {
    const certificates = await committeeService.getCertificates();
    res.json(certificates);
  } catch (err: any) {
    logger.error({ error: err.message }, "Error in GET /certificates");
    res.status(500).json({ error: err.message });
  }
});

// Runtime API
committeeRouter.get("/runtime", async (req: Request, res: Response) => {
  try {
    const list = await committeeService.getRuntimes();
    res.json(list);
  } catch (err: any) {
    logger.error({ error: err.message }, "Error in GET /runtime");
    res.status(500).json({ error: err.message });
  }
});

committeeRouter.post("/runtime", async (req: Request, res: Response) => {
  try {
    const { candidateId, aiModelId } = req.body;
    if (!candidateId) {
      return res.status(400).json({ error: "candidateId is required" });
    }
    const runtime = await committeeService.queueCommitteeSession(
      candidateId,
      aiModelId || "gemini-1.5-pro"
    );
    res.json(runtime);
  } catch (err: any) {
    logger.error({ error: err.message }, "Error in POST /runtime");
    res.status(500).json({ error: err.message });
  }
});

// Events API
committeeRouter.get("/events", async (req: Request, res: Response) => {
  try {
    const list = await committeeService.getEvents();
    res.json(list);
  } catch (err: any) {
    logger.error({ error: err.message }, "Error in GET /events");
    res.status(500).json({ error: err.message });
  }
});

// Audit API
committeeRouter.get("/audit", async (req: Request, res: Response) => {
  try {
    const audits = await committeeService.getAudits();
    res.json(audits);
  } catch (err: any) {
    logger.error({ error: err.message }, "Error in GET /audit");
    res.status(500).json({ error: err.message });
  }
});

// Validation API
committeeRouter.post("/validate", async (req: Request, res: Response) => {
  try {
    const { sessionId, candidateId } = req.body;
    if (!sessionId || !candidateId) {
      return res.status(400).json({ error: "sessionId and candidateId are required" });
    }
    const valResult = await committeeService.validateCommittee(sessionId, candidateId);
    res.json(valResult);
  } catch (err: any) {
    logger.error({ error: err.message }, "Error in POST /validate");
    res.status(500).json({ error: err.message });
  }
});

// Vote and Consensus API
committeeRouter.post("/vote-and-consensus", async (req: Request, res: Response) => {
  try {
    const { sessionId, candidateId, reasoningScore } = req.body;
    if (!sessionId || !candidateId) {
      return res.status(400).json({ error: "sessionId and candidateId are required" });
    }
    const result = await committeeService.runVotingAndConsensus(
      sessionId,
      candidateId,
      reasoningScore || 85
    );
    res.json(result);
  } catch (err: any) {
    logger.error({ error: err.message }, "Error in POST /vote-and-consensus");
    res.status(500).json({ error: err.message });
  }
});
