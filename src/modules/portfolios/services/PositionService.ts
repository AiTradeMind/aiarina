import { positionRepository } from "../repositories/PositionRepository.ts";
import { positionEngine } from "../engines/PositionEngine.ts";
import { IEnterprisePosition } from "../types/index.ts";

export class PositionService {
  public async getPosition(portfolioId: string, symbol: string): Promise<IEnterprisePosition | null> {
    return await positionRepository.getPosition(portfolioId, symbol);
  }

  public async getPositions(portfolioId: string, status?: string): Promise<IEnterprisePosition[]> {
    return await positionRepository.getPositions(portfolioId, status);
  }
}

export const positionService = new PositionService();
