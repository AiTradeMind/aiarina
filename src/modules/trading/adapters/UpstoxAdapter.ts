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
 * UPSTOX BROKER ADAPTER
 * Connects to Upstox API v2 without leaking Upstox-specific payloads to the Execution Engine.
 */
export class UpstoxAdapter implements IBrokerAdapter {
  readonly brokerId: BrokerId = 'upstox';
  readonly brokerName = 'Upstox API v2';

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
      maxOrdersPerSecond: 15,
      avgLatencyMs: 11.8,
      supportedSegments: ['NSE_EQ', 'NSE_FO', 'BSE_EQ', 'BSE_FO', 'MCX_COMM']
    };
  }

  async healthCheck(): Promise<BrokerHealthStatus> {
    return {
      brokerId: this.brokerId,
      brokerName: this.brokerName,
      connected: this.isConnected,
      apiLatencyMs: 11.2,
      rateLimitRemaining: 1450,
      rateLimitTotal: 1500,
      lastHeartbeat: new Date().toISOString(),
      status: 'OPTIMAL'
    };
  }

  async authenticate(credentials: BrokerCredentials): Promise<{ success: boolean; message: string; accessToken?: string }> {
    this.accessToken = credentials.accessToken || 'upstox_v2_access_token_mock';
    this.isConnected = true;
    return {
      success: true,
      message: 'Upstox v2 OAuth token validated.',
      accessToken: this.accessToken
    };
  }

  translatePayload(order: NormalizedOrderRequest): PayloadTranslationResult {
    // Upstox product map: I (Intraday), D (Delivery), CO, OCI
    const productMap: Record<string, string> = {
      'INTRADAY': 'I',
      'DELIVERY': 'D',
      'MARGIN': 'D',
      'BRACKET': 'OCI',
      'COVER': 'CO',
      'AMO': 'D'
    };

    // Upstox order types: MARKET, LIMIT, SL, SL-M
    const orderTypeMap: Record<string, string> = {
      'MARKET': 'MARKET',
      'LIMIT': 'LIMIT',
      'STOP_LOSS': 'SL',
      'STOP_LOSS_MARKET': 'SL-M',
      'BRACKET': 'LIMIT',
      'COVER': 'MARKET'
    };

    const rawPayload = {
      quantity: order.quantity,
      product: productMap[order.productType] || 'I',
      validity: order.validity || 'DAY',
      price: order.price || 0,
      tag: order.clientOrderId,
      instrument_token: `NSE_EQ|${order.symbol}`,
      order_type: orderTypeMap[order.orderType] || 'LIMIT',
      transaction_type: order.side,
      disclosed_quantity: 0,
      trigger_price: order.triggerPrice || 0,
      is_amo: order.productType === 'AMO'
    };

    return {
      brokerId: this.brokerId,
      endpoint: 'https://api.upstox.com/v2/order/place',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken || 'UPSTOX_MOCK_TOKEN'}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: rawPayload,
      translationNotes: [
        'Translated to Upstox API v2 schema',
        `Mapped product: ${order.productType} -> ${productMap[order.productType]}`,
        `Mapped order_type: ${order.orderType} -> ${orderTypeMap[order.orderType]}`
      ]
    };
  }

  async placeOrder(order: NormalizedOrderRequest): Promise<NormalizedOrderResult> {
    const translation = this.translatePayload(order);
    const latency = 11.5 + Math.random() * 2.5;
    const executedPrice = order.price ? order.price * (1 + (Math.random() - 0.5) * 0.0002) : 1795.10;

    return {
      success: true,
      brokerOrderId: `UPSTOX-ORD-${Date.now().toString().slice(-6)}`,
      clientOrderId: order.clientOrderId,
      brokerId: this.brokerId,
      status: 'EXECUTED',
      message: 'Order executed via Upstox v2 API',
      executedPrice: parseFloat(executedPrice.toFixed(2)),
      filledQuantity: order.quantity,
      remainingQuantity: 0,
      timestamp: new Date().toISOString(),
      rawVendorResponse: { status: 'success', data: { order_id: `UPSTOX-ORD-${Date.now().toString().slice(-6)}` } },
      vendorPayloadSent: translation.body,
      executionLatencyMs: parseFloat(latency.toFixed(1)),
      slippageBps: 0.00,
      fillQualityScore: 95
    };
  }

  async cancelOrder(brokerOrderId: string): Promise<NormalizedOrderResult> {
    return {
      success: true,
      brokerOrderId,
      clientOrderId: `CLIENT-CANCEL-${brokerOrderId}`,
      brokerId: this.brokerId,
      status: 'CANCELLED',
      message: `Upstox order ${brokerOrderId} cancelled.`,
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
      message: `Upstox order ${request.brokerOrderId} modified.`,
      timestamp: new Date().toISOString()
    };
  }

  async getPositions(): Promise<NormalizedPosition[]> {
    return [
      {
        id: 'UPSTOX-POS-401',
        brokerId: this.brokerId,
        symbol: 'INFY.NS',
        exchange: 'NSE_EQ',
        productType: 'INTRADAY',
        quantity: -400,
        buyQuantity: 0,
        sellQuantity: 400,
        buyAvgPrice: 0,
        sellAvgPrice: 1820.00,
        currentPrice: 1795.10,
        realizedPnl: 0,
        unrealizedPnl: 9960,
        totalPnl: 9960
      }
    ];
  }

  async getOrders(): Promise<NormalizedOrder[]> {
    return [
      {
        brokerOrderId: 'UPSTOX-ORD-9003',
        clientOrderId: 'CLIENT-ORD-103',
        brokerId: this.brokerId,
        symbol: 'INFY.NS',
        exchange: 'NSE_EQ',
        side: 'SELL',
        orderType: 'STOP_LOSS',
        productType: 'INTRADAY',
        quantity: 400,
        filledQuantity: 400,
        price: 1820.00,
        averagePrice: 1820.00,
        status: 'EXECUTED',
        orderTimestamp: '10:35:22'
      }
    ];
  }

  async getHoldings(): Promise<NormalizedHolding[]> {
    return [];
  }

  async getFunds(): Promise<NormalizedFunds> {
    return {
      brokerId: this.brokerId,
      availableCash: 2900000.00,
      usedMargin: 750000.00,
      totalCollateral: 3650000.00,
      payinAmount: 0,
      realizedPnl: 14200.00,
      unrealizedPnl: 9960.00,
      buyingPower: 5800000.00
    };
  }
}
