import { tradeRepository } from "../repositories/TradeRepository.ts";
import { tradeJournalEngine } from "../engines/TradeJournalEngine.ts";
import { tradeValidator } from "../validators/TradeValidator.ts";
import { auditEngine } from "../../audit/services/AuditEngine.ts";

export class TradeService {
  public async getTrades(portfolioId: string, status?: string) {
    return await tradeRepository.getTradesByPortfolio(portfolioId, status);
  }

  public async getTrade(id: string, organizationId: string) {
    const trade = await tradeRepository.getTradeById(id, organizationId);
    if (!trade) {
      throw new Error("Trade not found or cross-tenant access denied.");
    }
    return trade;
  }

  public async getPnlSnapshots(portfolioId: string) {
    return await tradeRepository.getPnlSnapshots(portfolioId);
  }

  public async getStatistics(portfolioId: string) {
    return await tradeRepository.getTradeStatistics(portfolioId);
  }
}

export const tradeService = new TradeService();
