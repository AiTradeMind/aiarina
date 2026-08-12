import crypto from "crypto";
import { AuditReplayRecord, GovernanceSession } from "../types/governance.types.ts";
import { GovernanceRepository } from "../repositories/governance.repository.ts";
import { SafetyEngine } from "./safety.engine.ts";
import { PolicyEngine } from "./policy.engine.ts";
import { ExplainabilityEngine } from "./explainability.engine.ts";

export class AuditEngine {
  private repo = new GovernanceRepository();
  private safety = new SafetyEngine();
  private policy = new PolicyEngine();
  private explainability = new ExplainabilityEngine();

  /**
   * Generates a unique SHA-256 hash representing the immutable audit trail of a governance session.
   */
  public generateSessionHash(session: {
    userId?: number;
    organizationId?: string;
    requestPayload: any;
    responsePayload: any;
    policyCheckStatus: string;
    safetyCheckStatus: string;
    createdAt?: Date;
  }): string {
    const dataToHash = {
      userId: session.userId,
      organizationId: session.organizationId,
      requestPayload: session.requestPayload,
      responsePayload: session.responsePayload,
      policyCheckStatus: session.policyCheckStatus,
      safetyCheckStatus: session.safetyCheckStatus,
      createdAt: session.createdAt?.toISOString()
    };
    return crypto.createHash("sha256").update(JSON.stringify(dataToHash)).digest("hex");
  }

  /**
   * Replays a previous governance session to verify logical immutability and detect discrepancies.
   */
  public async replaySession(sessionId: number, triggerUserId?: number): Promise<AuditReplayRecord> {
    const originalSession: GovernanceSession = await this.repo.getSession(sessionId);
    if (!originalSession) {
      throw new Error(`Governance session ${sessionId} not found`);
    }

    const { requestPayload, responsePayload, auditHash: originalHash } = originalSession;

    // 1. Re-evaluate Safety
    const safetyResult = await this.safety.evaluateSafety(requestPayload, responsePayload);

    // 2. Re-evaluate Policies
    const policyResult = this.policy.evaluatePolicies({
      requestPayload,
      responsePayload
    });

    // 3. Re-evaluate Explainability
    const explainabilityResult = this.explainability.generateExplainabilityTrace({
      requestPayload,
      responsePayload
    });

    // 4. Construct a simulated replayed session to hash
    const replayedSessionState = {
      userId: originalSession.userId,
      organizationId: originalSession.organizationId,
      requestPayload,
      responsePayload,
      policyCheckStatus: policyResult.passed ? "PASSED" : "FAILED",
      safetyCheckStatus: safetyResult.passed ? "PASSED" : "FAILED",
      createdAt: originalSession.createdAt
    };

    const replayHash = this.generateSessionHash(replayedSessionState);
    const discrepancyDetected = originalHash !== replayHash;

    const replayRecord: AuditReplayRecord = {
      originalSessionId: sessionId,
      replayTriggeredBy: triggerUserId,
      replayStatus: "COMPLETED",
      discrepancyDetected,
      originalHash: originalHash || "MISSING",
      replayHash,
      notes: discrepancyDetected
        ? `Integrity warning: Replay state or hash does not match original session trail.`
        : `Integrity check successful: Replayed state and cryptographic hash are identical to the original session.`
    };

    // Save replay record to database
    await this.repo.createAuditReplay(replayRecord);

    return replayRecord;
  }
}
