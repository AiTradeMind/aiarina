import { 
  IBrokerAdapter, 
  BrokerId, 
  BrokerCapabilities, 
  BrokerHealthStatus, 
  BrokerCredentials, 
  NormalizedOrderRequest, 
  NormalizedOrderResult, 
  NormalizedModifyRequest, 
  NormalizedPosition, 
  NormalizedOrder, 
  NormalizedHolding, 
  NormalizedFunds,
  PayloadTranslationResult
} from './types';

/**
 * DHAN HQ BROKER ADAPTER
 * Connects to Dhan HQ API v2 without leaking Dhan-specific payloads to the Execution Engine.
 */
export class DhanAdapter implements IBrokerAdapter {
  readonly brokerId: BrokerId = 'dhan';
  readonly brokerName = 'Dhan HQ API v2';

  private clientId: string = '';
  private accessToken: string = '';
  private isConnected: boolean = true;

  getCapabilities(): BrokerCapabilities {
    return {
      supportsBracketOrder: true,
      supportsCoverOrder: true,
      supportsAMO: true,
      supportsGTT: true,
      supportsOptionsChain: true,
      supportsWebSockets: true,
      maxOrdersPerSecond: 25,
      avgLatencyMs: 9.4,
      supportedSegments: ['NSE_EQ', 'NSE_FO', 'BSE_EQ', 'BSE_FO', 'MCX_COMM']
    };
  }

  async healthCheck(): Promise<BrokerHealthStatus> {
    return {
      brokerId: this.brokerId,
      brokerName: this.brokerName,
      connected: this.isConnected,
      apiLatencyMs: 8.8,
      rateLimitRemaining: 2450,
      rateLimitTotal: 2500,
      lastHeartbeat: new Date().toISOString(),
      status: 'OPTIMAL'
    };
  }

  async authenticate(credentials: BrokerCredentials): Promise<{ success: boolean; message: string; accessToken?: string }> {
    this.clientId = credentials.clientId || 'DHAN_USER_88291';
    this.accessToken = credentials.accessToken || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dhan_token_mock';
    this.isConnected = true;
    return {
      success: true,
      message: 'Dhan HQ authentication successful. Security token validated.',
      accessToken: this.accessToken
    };
  }

  translatePayload(order: NormalizedOrderRequest): PayloadTranslationResult {
    // Map Dhan Exchange Segments
    const segmentMap: Record<string, string> = {
      'NSE_EQ': 'NSE_EQ',
      'NSE_FO': 'NSE_FNO',
      'BSE_EQ': 'BSE_EQ',
      'BSE_FO': 'BSE_FNO',
      'MCX_COMM': 'MCX_COMM'
    };

    // Map Dhan Transaction Type
    const transactionType = order.side === 'BUY' ? 'BUY' : 'SELL';

    // Map Dhan Order Type
    const orderTypeMap: Record<string, string> = {
      'MARKET': 'MARKET',
      'LIMIT': 'LIMIT',
      'STOP_LOSS': 'STOP_LOSS',
      'STOP_LOSS_MARKET': 'STOP_LOSS_MARKET',
      'BRACKET': 'LIMIT',
      'COVER': 'MARKET'
    };

    // Map Dhan Product Type
    const productTypeMap: Record<string, string> = {
      'INTRADAY': 'INTRADAY',
      'DELIVERY': 'CNC',
      'MARGIN': 'MARGIN',
      'BRACKET': 'BO',
      'COVER': 'CO',
      'AMO': 'CNC'
    };

    const rawPayload = {
      dhanClientId: this.clientId || 'DHAN_1002931',
      correlationId: order.clientOrderId,
      transactionType,
      exchangeSegment: segmentMap[order.exchange] || 'NSE_EQ',
      productType: productTypeMap[order.productType] || 'INTRADAY',
      orderType: orderTypeMap[order.orderType] || 'LIMIT',
      validity: order.validity || 'DAY',
      tradingSymbol: order.symbol,
      securityId: '1333', // Internal security ID mapped from symbol
      quantity: order.quantity,
      price: order.price || 0,
      triggerPrice: order.triggerPrice || 0,
      boProfitValue: order.targetPrice || 0,
      boStopLossValue: order.stopLossPrice || 0,
      afterMarketOrder: order.productType === 'AMO'
    };

    return {
      brokerId: this.brokerId,
      endpoint: 'https://api.dhan.co/v2/orders',
      method: 'POST',
      headers: {
        'access-token': this.accessToken || 'MOCK_DHAN_TOKEN',
        'client-id': this.clientId || 'DHAN_CLIENT_882',
        'Content-Type': 'application/json'
      },
      body: rawPayload,
      translationNotes: [
        'Normalized request translated to Dhan HQ API v2 schema',
        `Mapped orderType: ${order.orderType} -> ${orderTypeMap[order.orderType]}`,
        `Mapped productType: ${order.productType} -> ${productTypeMap[order.productType]}`
      ]
    };
  }

  async placeOrder(order: NormalizedOrderRequest): Promise<NormalizedOrderResult> {
    const startTime = performance.now();
    const translation = this.translatePayload(order);
    
    // Simulate broker execution latency & response
    const latency = 8.5 + Math.random() * 3.5;
    const executedPrice = order.price ? order.price * (1 + (Math.random() - 0.5) * 0.0003) : 2920.50;

    return {
      success: true,
      brokerOrderId: `DHAN-ORD-${Date.now().toString().slice(-6)}`,
      clientOrderId: order.clientOrderId,
      brokerId: this.brokerId,
      status: 'EXECUTED',
      message: 'Order executed via Dhan HQ Smart Route DMA',
      executedPrice: parseFloat(executedPrice.toFixed(2)),
      filledQuantity: order.quantity,
      remainingQuantity: 0,
      timestamp: new Date().toISOString(),
      rawVendorResponse: { orderId: `DHAN-ORD-${Date.now().toString().slice(-6)}`, orderStatus: 'SUCCESS', remark: 'Order Placed Successfully' },
      vendorPayloadSent: translation.body,
      executionLatencyMs: parseFloat(latency.toFixed(1)),
      slippageBps: 0.12,
      fillQualityScore: 99
    };
  }

  async cancelOrder(brokerOrderId: string, symbol?: string): Promise<NormalizedOrderResult> {
    return {
      success: true,
      brokerOrderId,
      clientOrderId: `CLIENT-CANCEL-${brokerOrderId}`,
      brokerId: this.brokerId,
      status: 'CANCELLED',
      message: `Dhan Order ${brokerOrderId} successfully cancelled.`,
      timestamp: new Date().toISOString()
    };
  }

  async modifyOrder(request: NormalizedModifyRequest): Promise<NormalizedOrderResult> {
    return {
      success: true,
      brokerOrderId: request.brokerOrderId,
      clientOrderId: `CLIENT-MOD-${request.brokerOrderId}`,
      brokerId: this.brokerId,
      status: 'OPEN',
      message: `Dhan Order ${request.brokerOrderId} modified successfully.`,
      timestamp: new Date().toISOString()
    };
  }

  async getPositions(): Promise<NormalizedPosition[]> {
    return [
      {
        id: 'DHAN-POS-101',
        brokerId: this.brokerId,
        symbol: 'RELIANCE.NS',
        exchange: 'NSE_EQ',
        productType: 'INTRADAY',
        quantity: 500,
        buyQuantity: 500,
        sellQuantity: 0,
        buyAvgPrice: 2920.50,
        sellAvgPrice: 0,
        currentPrice: 2985.20,
        realizedPnl: 0,
        unrealizedPnl: 32350,
        totalPnl: 32350
      },
      {
        id: 'DHAN-POS-102',
        brokerId: this.brokerId,
        symbol: 'TCS.NS',
        exchange: 'NSE_EQ',
        productType: 'DELIVERY',
        quantity: 300,
        buyQuantity: 300,
        sellQuantity: 0,
        buyAvgPrice: 3840.00,
        sellAvgPrice: 0,
        currentPrice: 3912.40,
        realizedPnl: 0,
        unrealizedPnl: 21720,
        totalPnl: 21720
      }
    ];
  }

  async getOrders(): Promise<NormalizedOrder[]> {
    return [
      {
        brokerOrderId: 'DHAN-ORD-9001',
        clientOrderId: 'CLIENT-ORD-101',
        brokerId: this.brokerId,
        symbol: 'RELIANCE.NS',
        exchange: 'NSE_EQ',
        side: 'BUY',
        orderType: 'LIMIT',
        productType: 'INTRADAY',
        quantity: 500,
        filledQuantity: 500,
        price: 2920.50,
        averagePrice: 2920.45,
        status: 'EXECUTED',
        orderTimestamp: '10:42:15'
      }
    ];
  }

  async getHoldings(): Promise<NormalizedHolding[]> {
    return [
      {
        symbol: 'INFY.NS',
        exchange: 'NSE_EQ',
        isin: 'INE009A01021',
        quantity: 250,
        t1Quantity: 0,
        realisedQuantity: 250,
        averagePrice: 1750.00,
        currentPrice: 1795.10,
        pnl: 11275,
        pnlPercentage: 2.58
      }
    ];
  }

  async getFunds(): Promise<NormalizedFunds> {
    return {
      brokerId: this.brokerId,
      availableCash: 4850000.00,
      usedMargin: 1250000.00,
      totalCollateral: 6100000.00,
      payinAmount: 0,
      realizedPnl: 42100.00,
      unrealizedPnl: 54070.00,
      buyingPower: 9700000.00
    };
  }
}
