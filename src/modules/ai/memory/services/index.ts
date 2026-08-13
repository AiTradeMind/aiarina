import { MemoryRepository } from "../repositories/index.ts";
import { 
  MemorySession, 
  MemoryEvent, 
  MemoryPattern, 
  MemoryKnowledge,
  StoreMemoryRequest,
  SearchMemoryRequest
} from "../types/index.ts";
import { EventBusService } from "../../../events/services/index.ts";

export class MemoryService {
  private repo = new MemoryRepository();
  private eventBus = EventBusService.getInstance();

  async getSession(organizationId: string, userId: number): Promise<MemorySession> {
    let session = await this.repo.getActiveSession(userId, organizationId);
    if (!session) {
      session = await this.repo.createSession({
        organizationId,
        userId,
        startTime: new Date(),
        metadata: { source: 'AUTO_GENERATED' }
      });
    }
    return session;
  }

  async store(request: StoreMemoryRequest, organizationId: string, userId: number): Promise<MemoryEvent> {
    const session = await this.getSession(organizationId, userId);
    
    const event = await this.repo.createEvent({
      sessionId: session.id,
      type: request.type,
      sourceId: request.sourceId || null,
      data: request.data,
      timestamp: new Date()
    });

    // Simple pattern recognition simulation
    if (request.type === 'STRATEGY_RESULT' && request.data.pnl && parseFloat(request.data.pnl) < 0) {
      await this.eventBus.publish({
        eventType: 'AI_WARNING',
        source: 'AI_MEMORY_ENGINE',
        organizationId,
        userId,
        payload: { message: `Negative performance pattern detected for ${request.sourceId}`, data: request.data },
      });
    }

    return event;
  }

  async getMemory(organizationId: string): Promise<MemoryEvent[]> {
    return await this.repo.findEvents(organizationId);
  }

  async getMemoryDetail(id: number): Promise<MemoryEvent | null> {
    return await this.repo.findEventById(id);
  }

  async search(request: SearchMemoryRequest, organizationId: string): Promise<MemoryKnowledge[]> {
    return await this.repo.searchKnowledge(organizationId, request.query);
  }

  async getPatterns(organizationId: string): Promise<MemoryPattern[]> {
    return await this.repo.findPatterns(organizationId);
  }

  // Event handlers to automatically store memories
  async initSubscriptions() {
    // In a real app, this would be called during module initialization
    // We'll simulate by subscribing to the event bus
    // this.eventBus.subscribe('AI_DECISION', (event) => this.store({ type: 'AI_DECISION', data: event.payload }, event.organizationId, event.userId));
  }
}
