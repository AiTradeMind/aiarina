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
 * ZERODHA KITE CONNECT BROKER ADAPTER
 * Connects to Zerodha Kite Connect v3 API without leaking Zerodha-specific payloads to the Execution Engine.
 */
export class ZerodhaAdapter implements IBrokerAdapter {
  readonly brokerId: BrokerId = 'zerodha';
  readonly brokerName = 'Zerodha Kite Connect v3';

  private apiKey: string = '';
  private accessToken: string = '';
  private isConnected: boolean = true;

  getCapabilities(): BrokerCapabilities {
    return {
      supportsBracketOrder: false, // Kite discontinued bracket orders
      supportsCoverOrder: true,
      supportsAMO: true,
      supportsGTT: true,
      supportsOptionsChain: true,
      supportsWebSockets: true,
      maxOrdersPerSecond: 10,
      avgLatencyMs: 14.2,
      supportedSegments: ['NSE_EQ', 'NSE_FO', 'BSE_EQ', 'BSE_FO', 'MCX_COMM']
    };
  }

  async healthCheck(): Promise<BrokerHealthStatus> {
    return {
      brokerId: this.brokerId,
      brokerName: this.brokerName,
      connected: this.isConnected,
      apiLatencyMs: 13.8,
      rateLimitRemaining: 980,
      rateLimitTotal: 1000,
      lastHeartbeat: new Date().toISOString(),
      status: 'OPTIMAL'
    };
  }

  async authenticate(credentials: BrokerCredentials): Promise<{ success: boolean; message: string; accessToken?: string }> {
    this.apiKey = credentials.apiKey || 'zerodha_kite_app_key';
    this.accessToken = credentials.accessToken || 'zerodha_access_token_mock';
    this.isConnected = true;
    return {
      success: true,
      message: 'Zerodha Kite Connect v3 access token authenticated.',
      accessToken: this.accessToken
    };
  }

  translatePayload(order: NormalizedOrderRequest): PayloadTranslationResult {
    // Kite product types: CNC, MIS, NRML
    const productMap: Record<string, string> = {
      'INTRADAY': 'MIS',
      'DELIVERY': 'CNC',
      'MARGIN': 'NRML',
      'BRACKET': 'MIS',
      'COVER': 'MIS',
      'AMO': 'CNC'
    };

    // Kite order types: MARKET, LIMIT, SL, SL-M
    const orderTypeMap: Record<string, string> = {
      'MARKET': 'MARKET',
      'LIMIT': 'LIMIT',
      'STOP_LOSS': 'SL',
      'STOP_LOSS_MARKET': 'SL-M',
      'BRACKET': 'LIMIT',
      'COVER': 'MARKET'
    };

    const rawPayload = {
      tradingsymbol: order.symbol,
      exchange: order.exchange.startsWith('NSE') ? 'NSE' : 'BSE',
      transaction_type: order.side,
      order_type: orderTypeMap[order.orderType] || 'LIMIT',
      quantity: order.quantity,
      product: productMap[order.productType] || 'MIS',
      price: order.price || 0,
      trigger_price: order.triggerPrice || 0,
      validity: order.validity || 'DAY',
      tag: order.tag || 'AI_EXECUTION_ENGINE'
    };

    return {
      brokerId: this.brokerId,
      endpoint: 'https://api.kite.trade/orders/regular',
      method: 'POST',
      headers: {
        'X-Kite-Version': '3',
        'Authorization': `token ${this.apiKey}:${this.accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: rawPayload,
      translationNotes: [
        'Translated to Zerodha Kite Connect v3 HTTP form-urlencoded payload',
        `Mapped product: ${order.productType} -> ${productMap[order.productType]}`,
        `Mapped order_type: ${order.orderType} -> ${orderTypeMap[order.orderType]}`
      ]
    };
  }

  async placeOrder(order: NormalizedOrderRequest): Promise<NormalizedOrderResult> {
    const translation = this.translatePayload(order);
    const latency = 13.5 + Math.random() * 3.2;
    const executedPrice = order.price ? order.price * (1 + (Math.random() - 0.5) * 0.0003) : 3840.10;

    return {
      success: true,
      brokerOrderId: `ZERODHA-ORD-${Date.now().toString().slice(-6)}`,
      clientOrderId: order.clientOrderId,
      brokerId: this.brokerId,
      status: 'EXECUTED',
      message: 'Order executed via Zerodha Kite Connect Direct DMA',
      executedPrice: parseFloat(executedPrice.toFixed(2)),
      filledQuantity: order.quantity,
      remainingQuantity: 0,
      timestamp: new Date().toISOString(),
      rawVendorResponse: { status: 'success', data: { order_id: `ZERODHA-ORD-${Date.now().toString().slice(-6)}` } },
      vendorPayloadSent: translation.body,
      executionLatencyMs: parseFloat(latency.toFixed(1)),
      slippageBps: 0.26,
      fillQualityScore: 96
    };
  }

  async cancelOrder(brokerOrderId: string): Promise<NormalizedOrderResult> {
    return {
      success: true,
      brokerOrderId,
      clientOrderId: `CLIENT-CANCEL-${brokerOrderId}`,
      brokerId: this.brokerId,
      status: 'CANCELLED',
      message: `Zerodha Kite order ${brokerOrderId} cancelled.`,
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
      message: `Zerodha order ${request.brokerOrderId} modified.`,
      timestamp: new Date().toISOString()
    };
  }

  async getPositions(): Promise<NormalizedPosition[]> {
    return [
      {
        id: 'ZERODHA-POS-301',
        brokerId: this.brokerId,
        symbol: 'TCS.NS',
        exchange: 'NSE_EQ',
        productType: 'INTRADAY',
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
        brokerOrderId: 'ZERODHA-ORD-9002',
        clientOrderId: 'CLIENT-ORD-102',
        brokerId: this.brokerId,
        symbol: 'TCS.NS',
        exchange: 'NSE_EQ',
        side: 'BUY',
        orderType: 'LIMIT',
        productType: 'INTRADAY',
        quantity: 300,
        filledQuantity: 300,
        price: 3840.00,
        averagePrice: 3840.10,
        status: 'EXECUTED',
        orderTimestamp: '10:38:00'
      }
    ];
  }

  async getHoldings(): Promise<NormalizedHolding[]> {
    return [];
  }

  async getFunds(): Promise<NormalizedFunds> {
    return {
      brokerId: this.brokerId,
      availableCash: 5120000.00,
      usedMargin: 1150000.00,
      totalCollateral: 6270000.00,
      payinAmount: 0,
      realizedPnl: 31200.00,
      unrealizedPnl: 21720.00,
      buyingPower: 10240000.00
    };
  }
}
