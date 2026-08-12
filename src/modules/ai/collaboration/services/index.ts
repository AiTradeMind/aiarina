import { CollaborationRepository } from "../repositories/index.ts";
import { 
  AiCollaboration, CollaborationSession, CollaborationMember,
  CollaborationTask, CollaborationMessage, CollaborationResult,
  CollaborationConsensus, CollaborationHistory
} from "../types/index.ts";

export class CollaborationService {
  private repo = new CollaborationRepository();

  async getCollaborations(): Promise<AiCollaboration[]> {
    return await this.repo.getCollaborations();
  }

  async getSessions(collaborationId?: string): Promise<CollaborationSession[]> {
    return await this.repo.getSessions(collaborationId);
  }

  async getMembers(sessionId: string): Promise<CollaborationMember[]> {
    return await this.repo.getMembers(sessionId);
  }

  async getTasks(sessionId: string): Promise<CollaborationTask[]> {
    return await this.repo.getTasks(sessionId);
  }

  async getMessages(sessionId: string): Promise<CollaborationMessage[]> {
    return await this.repo.getMessages(sessionId);
  }

  async getResults(sessionId: string): Promise<CollaborationResult[]> {
    return await this.repo.getResults(sessionId);
  }

  async getConsensus(sessionId: string): Promise<CollaborationConsensus[]> {
    return await this.repo.getConsensus(sessionId);
  }

  async getHistory(sessionId: string): Promise<CollaborationHistory[]> {
    return await this.repo.getHistory(sessionId);
  }

  async createCollaboration(data: Partial<AiCollaboration>): Promise<{ success: boolean; data?: AiCollaboration }> {
    const collab: AiCollaboration = {
      id: data.id || crypto.randomUUID(),
      name: data.name || 'New Collaboration',
      type: data.type || 'CONSENSUS',
      status: data.status || 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await this.repo.createCollaboration(collab);
    return { success: true, data: collab };
  }

  async startSession(data: { collaborationId: string; objective: string; models: { id: string; role: string }[] }): Promise<{ success: boolean; data?: CollaborationSession }> {
    const session: CollaborationSession = {
      id: crypto.randomUUID(),
      collaborationId: data.collaborationId,
      objective: data.objective,
      status: 'IN_PROGRESS',
      startTime: new Date(),
      endTime: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await this.repo.createSession(session);

    for (const model of data.models) {
      await this.repo.createMember({
        id: crypto.randomUUID(),
        sessionId: session.id,
        modelId: model.id,
        role: model.role,
        status: 'ACTIVE',
        joinedAt: new Date()
      });
    }

    await this.repo.createHistory({
      id: crypto.randomUUID(),
      sessionId: session.id,
      action: 'SESSION_STARTED',
      details: { objective: session.objective, modelCount: data.models.length },
      timestamp: new Date()
    });

    return { success: true, data: session };
  }

  async finalizeSession(sessionId: string, resultData: Partial<CollaborationResult>, consensusData: Partial<CollaborationConsensus>): Promise<{ success: boolean }> {
    const result: CollaborationResult = {
      id: crypto.randomUUID(),
      sessionId,
      finalRecommendation: resultData.finalRecommendation || null,
      supportingEvidence: resultData.supportingEvidence || [],
      participatingModels: resultData.participatingModels || [],
      executionTimeMs: resultData.executionTimeMs || null,
      cost: resultData.cost || null,
      tokenUsage: resultData.tokenUsage || {},
      consensusSummary: resultData.consensusSummary || null,
      createdAt: new Date()
    };
    await this.repo.createResult(result);

    const consensus: CollaborationConsensus = {
      id: crypto.randomUUID(),
      sessionId,
      agreementScore: consensusData.agreementScore || 0,
      conflictScore: consensusData.conflictScore || 0,
      confidence: consensusData.confidence || 0,
      majorityDecision: consensusData.majorityDecision || null,
      minorityOpinion: consensusData.minorityOpinion || null,
      escalationRequired: consensusData.escalationRequired || false,
      createdAt: new Date()
    };
    await this.repo.createConsensus(consensus);

    await this.repo.createHistory({
      id: crypto.randomUUID(),
      sessionId,
      action: 'SESSION_FINALIZED',
      details: { resultId: result.id, consensusId: consensus.id },
      timestamp: new Date()
    });

    return { success: true };
  }

  async seedInitialData(): Promise<void> {
    const collabs = await this.repo.getCollaborations();
    if (collabs.length > 0) return;

    const collabId = crypto.randomUUID();
    await this.repo.createCollaboration({
      id: collabId,
      name: "Alpha Strategies Consensus Network",
      type: "CONSENSUS",
      status: "ACTIVE",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const sessionId = crypto.randomUUID();
    await this.startSession({
      collaborationId: collabId,
      objective: "Evaluate Q3 Market Volatility and recommend hedging strategies.",
      models: [
        { id: "gpt-4o", role: "COORDINATOR" },
        { id: "claude-3-opus", role: "ANALYST" },
        { id: "gemini-1.5-pro", role: "RISK_ADVISOR" },
        { id: "llama-3-70b", role: "RESEARCHER" }
      ]
    });

    await this.repo.createTask({
      id: crypto.randomUUID(),
      sessionId,
      memberId: null,
      description: "Analyze macro indicators for Q3",
      status: "COMPLETED",
      resultData: { findings: "High probability of interest rate fluctuation" },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await this.finalizeSession(sessionId, {
      finalRecommendation: "Increase portfolio allocation to defensive sectors by 15%",
      consensusSummary: "All models agreed on high volatility, differing slightly on sector allocations.",
      participatingModels: ["gpt-4o", "claude-3-opus", "gemini-1.5-pro", "llama-3-70b"],
      executionTimeMs: 14500,
      cost: 0.25,
      tokenUsage: { input: 12000, output: 4500 }
    }, {
      agreementScore: 0.88,
      conflictScore: 0.12,
      confidence: 0.92,
      majorityDecision: "Hedge required",
      minorityOpinion: "Hold cash reserves instead of defensive rotation",
      escalationRequired: false
    });
  }
}
