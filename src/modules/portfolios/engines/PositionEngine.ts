import { positionRepository } from "../repositories/PositionRepository.ts";
import { IEnterprisePosition, IEnterprisePositionHistory } from "../types/index.ts";
import { randomUUID } from "crypto";

export class PositionEngine {
  public async openOrIncreasePosition(
    portfolioId: string, 
    organizationId: string, 
    symbol: string, 
    assetClass: string,
    quantity: string, 
    price: string,
    executionId: string
  ): Promise<{ position: IEnterprisePosition, action: 'OPEN' | 'SCALE_IN' | 'REOPEN' }> {
    
    const qty = parseFloat(quantity);
    const prc = parseFloat(price);
    
    let position = await positionRepository.getPosition(portfolioId, symbol);
    let action: 'OPEN' | 'SCALE_IN' | 'REOPEN' = 'OPEN';
    
    if (!position) {
      const id = `pos_${randomUUID().replace(/-/g, '').substring(0, 12)}`;
      position = await positionRepository.createPosition({
        id,
        portfolioId,
        organizationId,
        symbol,
        assetClass: assetClass as any,
        status: 'OPEN',
        openQuantity: quantity,
        averagePrice: price,
        currentMarketPrice: price,
        marketValue: (qty * prc).toString()
      });
      
      await positionRepository.addHistory({
        positionId: position.id,
        executionId,
        action: 'OPEN',
        quantity,
        price
      });
    } else {
      const isReopen = position.status === 'CLOSED';
      action = isReopen ? 'REOPEN' : 'SCALE_IN';
      
      const oldQty = parseFloat(position.openQuantity);
      const oldAvgPrice = parseFloat(position.averagePrice);
      
      const newQty = oldQty + qty;
      const newAvgPrice = ((oldQty * oldAvgPrice) + (qty * prc)) / newQty;
      
      position = await positionRepository.updatePosition(position.id, {
        status: 'OPEN',
        openQuantity: newQty.toString(),
        averagePrice: newAvgPrice.toString(),
        currentMarketPrice: price, // latest
        marketValue: (newQty * prc).toString()
      });
      
      await positionRepository.addHistory({
        positionId: position.id,
        executionId,
        action: isReopen ? 'REOPEN' : 'INCREASE',
        quantity,
        price
      });
    }
    
    return { position, action };
  }

  public async reduceOrClosePosition(
    portfolioId: string, 
    organizationId: string, 
    symbol: string, 
    quantity: string, 
    price: string,
    executionId: string
  ): Promise<{ position: IEnterprisePosition; realizedPnl: number; action: 'CLOSE' | 'PARTIAL_CLOSE' | 'SCALE_OUT'; entryPrice: number }> {
    
    const position = await positionRepository.getPosition(portfolioId, symbol);
    if (!position) {
      throw new Error(`Cannot reduce position. No position found for ${symbol}`);
    }
    
    if (position.status === 'CLOSED') {
      throw new Error(`Cannot reduce a closed position for ${symbol}`);
    }
    
    const qtyToReduce = parseFloat(quantity);
    const currentQty = parseFloat(position.openQuantity);
    const avgPrice = parseFloat(position.averagePrice);
    const prc = parseFloat(price);
    
    if (qtyToReduce > currentQty) {
      throw new Error(`Cannot reduce position by ${qtyToReduce}. Only ${currentQty} available.`);
    }
    
    const newQty = currentQty - qtyToReduce;
    const realizedPnlDelta = (prc - avgPrice) * qtyToReduce;
    const newRealizedPnl = parseFloat(position.realizedPnl) + realizedPnlDelta;
    
    const status = newQty === 0 ? 'CLOSED' : 'OPEN';
    const action = newQty === 0 ? 'CLOSE' : 'PARTIAL_CLOSE';
    
    const updatedPosition = await positionRepository.updatePosition(position.id, {
      status,
      openQuantity: newQty.toString(),
      currentMarketPrice: price,
      marketValue: (newQty * prc).toString(),
      realizedPnl: newRealizedPnl.toString()
    });
    
    await positionRepository.addHistory({
      positionId: position.id,
      executionId,
      action: newQty === 0 ? 'CLOSE' : 'REDUCE',
      quantity,
      price
    });
    
    return { position: updatedPosition, realizedPnl: realizedPnlDelta, action, entryPrice: avgPrice };
  }
}

export const positionEngine = new PositionEngine();
