import { PortfolioRepository } from "../repositories/portfolio.repository.ts";
import { PortfolioEventRecord, PortfolioEventType } from "../types/index.ts";

export class PortfolioLifecycleManager {
  private repository: PortfolioRepository;

  constructor() {
    this.repository = new PortfolioRepository();
  }

  /**
   * Emit audit event for lifecycle tracking
   */
  async emitEvent(
    portfolioId: string,
    eventType: PortfolioEventType,
    payload: Record<string, any>
  ): Promise<PortfolioEventRecord> {
    const eventId = `EVT-${portfolioId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const event: PortfolioEventRecord = {
      eventId,
      portfolioId,
      eventType,
      payload,
    };

    return await this.repository.recordEvent(event);
  }
}
