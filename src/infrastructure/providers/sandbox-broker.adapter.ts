import {
  IBrokerAdapter,
  BrokerAccountInfo,
  BrokerOrderRequest,
  BrokerOrderResult,
  BrokerPosition
} from '../abstractions';
import logger from '../../lib/logger';

export class SandboxBrokerAdapter implements IBrokerAdapter {
  readonly brokerId = 'sandbox-paper-broker';
  readonly name = 'Enterprise Indian Market Sandbox Broker Adapter';

  private account: BrokerAccountInfo = {
    accountId: 'SBX-ACCT-9001',
    brokerId: 'sandbox-paper-broker',
    currency: 'INR',
    balance: 10000000.00, // ₹1 Cr Sandbox capital
    availableMargin: 10000000.00,
    usedMargin: 0,
    unrealizedPnL: 0
  };

  private orders: Map<string, BrokerOrderResult> = new Map();
  private positions: Map<string, BrokerPosition> = new Map();

  constructor() {
    // Safety verification: Live trading MUST be explicitly disabled
    if (process.env.LIVE_TRADING_ENABLED === 'true') {
      logger.error('CRITICAL SAFETY BLOCK: Live trading environment detected in Sandbox Broker initialization!');
    }
  }

  async getAccountInfo(): Promise<BrokerAccountInfo> {
    this.recalculatePnL();
    return { ...this.account };
  }

  async placeOrder(request: BrokerOrderRequest): Promise<BrokerOrderResult> {
    // Safety check: Block real order routing
    if (process.env.LIVE_TRADING_ENABLED === 'true') {
      throw new Error('CRITICAL SAFETY VIOLATION: Real order placement is strictly disabled in Sandbox mode.');
    }

    const orderId = `SBX_ORD_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const fillPrice = request.price || (request.symbol.includes('BTC') ? 65000 : 150.00);

    const result: BrokerOrderResult = {
      orderId,
      clientOrderId: request.clientOrderId || orderId,
      symbol: request.symbol.toUpperCase(),
      status: 'FILLED',
      filledQuantity: request.quantity,
      avgFillPrice: fillPrice,
      createdAt: new Date()
    };

    this.orders.set(orderId, result);
    this.updatePosition(request.symbol.toUpperCase(), request.side, request.quantity, fillPrice);

    logger.info({ orderId, symbol: request.symbol, side: request.side, qty: request.quantity, fillPrice }, 'Sandbox order executed safely');
    return result;
  }

  async cancelOrder(orderId: string, symbol: string): Promise<boolean> {
    const order = this.orders.get(orderId);
    if (!order) return false;

    if (order.status === 'PENDING' || order.status === 'ACCEPTED') {
      order.status = 'CANCELLED';
      this.orders.set(orderId, order);
      logger.info({ orderId, symbol }, 'Sandbox order cancelled');
      return true;
    }
    return false;
  }

  async getPositions(): Promise<BrokerPosition[]> {
    this.recalculatePnL();
    return Array.from(this.positions.values());
  }

  async getOpenOrders(symbol?: string): Promise<BrokerOrderResult[]> {
    const all = Array.from(this.orders.values());
    return all.filter(o => 
      (o.status === 'PENDING' || o.status === 'ACCEPTED') &&
      (!symbol || o.symbol === symbol.toUpperCase())
    );
  }

  async healthCheck(): Promise<{ isHealthy: boolean; latencyMs: number }> {
    const start = Date.now();
    return { isHealthy: true, latencyMs: Date.now() - start };
  }

  private updatePosition(symbol: string, side: 'BUY' | 'SELL', qty: number, price: number) {
    const existing = this.positions.get(symbol);

    if (!existing) {
      if (side === 'BUY') {
        this.positions.set(symbol, {
          symbol,
          side: 'LONG',
          quantity: qty,
          entryPrice: price,
          markPrice: price,
          unrealizedPnL: 0,
          realizedPnL: 0
        });
      } else {
        this.positions.set(symbol, {
          symbol,
          side: 'SHORT',
          quantity: qty,
          entryPrice: price,
          markPrice: price,
          unrealizedPnL: 0,
          realizedPnL: 0
        });
      }
    } else {
      if ((existing.side === 'LONG' && side === 'BUY') || (existing.side === 'SHORT' && side === 'SELL')) {
        const totalQty = existing.quantity + qty;
        const avgPrice = (existing.entryPrice * existing.quantity + price * qty) / totalQty;
        existing.quantity = totalQty;
        existing.entryPrice = avgPrice;
      } else {
        const remainingQty = existing.quantity - qty;
        if (remainingQty <= 0) {
          this.positions.delete(symbol);
        } else {
          existing.quantity = remainingQty;
        }
      }
    }

    this.recalculatePnL();
  }

  private recalculatePnL() {
    let totalUnrealized = 0;
    for (const pos of this.positions.values()) {
      const mockMark = pos.entryPrice * (1 + (Math.random() - 0.48) * 0.02);
      pos.markPrice = Number(mockMark.toFixed(2));
      pos.unrealizedPnL = pos.side === 'LONG'
        ? (pos.markPrice - pos.entryPrice) * pos.quantity
        : (pos.entryPrice - pos.markPrice) * pos.quantity;
      totalUnrealized += pos.unrealizedPnL;
    }
    this.account.unrealizedPnL = totalUnrealized;
    this.account.usedMargin = Array.from(this.positions.values()).reduce((acc, p) => acc + p.quantity * p.entryPrice * 0.1, 0);
    this.account.availableMargin = this.account.balance - this.account.usedMargin + totalUnrealized;
  }
}
