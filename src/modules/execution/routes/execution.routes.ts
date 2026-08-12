import { Router, Request, Response } from "express";
import { getDb } from "../../../db/client.ts";
import { eq, desc } from "drizzle-orm";
import { 
  decisionPackagesTable,
  executionAuthorizationTable,
  executionQueueTable,
  executionContextTable,
  executionCertificateTable,
  executionAuditTable,
  executionEventsTable,
  committeeDecisionsTable
} from "../../../db/schema.ts";
import { ExecutionService } from "../services/execution.service.ts";
import logger from "../../../lib/logger.ts";

export const executionRouter = Router();

// Helper to get active user ID
const getUserId = (req: Request) => {
  return "usertestmine2@gmail.com"; // Standard authenticated user fallback
};

// GET /api/execution/dashboard - Consolidated Dashboard Data
executionRouter.get("/dashboard", async (req: Request, res: Response) => {
  const db = getDb();
  try {
    const packages = await db.select().from(decisionPackagesTable).orderBy(desc(decisionPackagesTable.createdAt)).limit(100);
    const authorizations = await db.select().from(executionAuthorizationTable).orderBy(desc(executionAuthorizationTable.createdAt)).limit(50);
    const queue = await db.select().from(executionQueueTable).orderBy(desc(executionQueueTable.updatedAt)).limit(100);
    const contexts = await db.select().from(executionContextTable).orderBy(desc(executionContextTable.createdAt)).limit(50);
    const certificates = await db.select().from(executionCertificateTable).orderBy(desc(executionCertificateTable.createdAt)).limit(50);
    const audits = await db.select().from(executionAuditTable).orderBy(desc(executionAuditTable.createdAt)).limit(100);
    
    // Fetch pending committee decisions that haven't been intaken yet
    const pendingDecisions = await db.select().from(committeeDecisionsTable)
      .where(eq(committeeDecisionsTable.status, "APPROVED"))
      .orderBy(desc(committeeDecisionsTable.createdAt));

    res.json({
      success: true,
      packages,
      authorizations,
      queue,
      contexts,
      certificates,
      audits,
      pendingDecisions
    });
  } catch (err: any) {
    logger.error({ error: err.message }, "Failed to get execution dashboard");
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/execution/intake
executionRouter.post("/intake", async (req: Request, res: Response) => {
  const { decisionId, candidateId, status, sessionId } = req.body;
  if (!decisionId || !candidateId || !status) {
    return res.status(400).json({ success: false, error: "Missing required parameters: decisionId, candidateId, status" });
  }

  try {
    const service = ExecutionService.getInstance();
    const result = await service.intakeDecision(decisionId, candidateId, status, sessionId || "sess_unknown");
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/execution/authorize
executionRouter.post("/authorize", async (req: Request, res: Response) => {
  const { packageId, enqueue } = req.body;
  if (!packageId) {
    return res.status(400).json({ success: false, error: "Missing required parameter: packageId" });
  }

  try {
    const service = ExecutionService.getInstance();
    const authResult = await service.authorizeExecution(packageId);
    
    if (authResult.success && authResult.authorized && enqueue) {
      const qResult = await service.enqueueExecution(packageId);
      return res.json({
        success: true,
        authorized: true,
        reason: authResult.reason,
        queued: qResult.success,
        queueId: qResult.queueId,
        error: qResult.error
      });
    }

    res.json(authResult);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/execution/queue - Enqueue a decision package manually
executionRouter.post("/queue", async (req: Request, res: Response) => {
  const { packageId, priority } = req.body;
  if (!packageId) {
    return res.status(400).json({ success: false, error: "Missing required parameter: packageId" });
  }

  try {
    const service = ExecutionService.getInstance();
    const result = await service.enqueueExecution(packageId, priority || 5);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/execution/package
executionRouter.get("/package", async (req: Request, res: Response) => {
  const db = getDb();
  try {
    const list = await db.select().from(decisionPackagesTable).orderBy(desc(decisionPackagesTable.createdAt));
    res.json({ success: true, packages: list });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/execution/context
executionRouter.get("/context", async (req: Request, res: Response) => {
  const db = getDb();
  try {
    const list = await db.select().from(executionContextTable).orderBy(desc(executionContextTable.createdAt));
    res.json({ success: true, contexts: list });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/execution/queue
executionRouter.get("/queue", async (req: Request, res: Response) => {
  const db = getDb();
  try {
    const list = await db.select().from(executionQueueTable).orderBy(desc(executionQueueTable.updatedAt));
    res.json({ success: true, queue: list });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/execution/certificate
executionRouter.get("/certificate", async (req: Request, res: Response) => {
  const db = getDb();
  try {
    const list = await db.select().from(executionCertificateTable).orderBy(desc(executionCertificateTable.createdAt));
    res.json({ success: true, certificates: list });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/workspace/preferences
executionRouter.get("/preferences", async (req: Request, res: Response) => {
  const userId = getUserId(req);
  try {
    const service = ExecutionService.getInstance();
    const prefs = await service.getPreferences(userId);
    res.json({ success: true, preferences: prefs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/workspace/preferences
executionRouter.post("/preferences", async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const prefs = req.body;
  try {
    const service = ExecutionService.getInstance();
    const updated = await service.savePreferences(userId, prefs);
    res.json({ success: true, preferences: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/execution/qa - Run verification report
executionRouter.get("/qa", async (req: Request, res: Response) => {
  try {
    const service = ExecutionService.getInstance();
    const report = await service.runQAVerification();
    res.json({ success: true, report });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
