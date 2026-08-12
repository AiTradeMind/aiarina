import { BrokerAdapterRegistry } from './BrokerAdapterRegistry';
import { BrokerId, ExchangeSegment } from './types';

export interface CommodityInstrumentMetadata {
  symbol: string;
  name: string;
  exchange: string;
  lotSize: string;
  tickSize: string;
  marginReq: string;
  expiry: string;
  settlementRules: string;
  tradingHours: string;
}

export interface ResolvedBrokerCapabilities {
  brokerId: string;
  brokerName: string;
  country: 'IN';
  active: boolean;
  supportedExchanges: string[];
  supportedSegments: ExchangeSegment[];
  supportedCommodityExchanges: string[];
  commodityExchangeLabel: string;
  hasCommoditySupport: boolean;
  commodityInstruments: CommodityInstrumentMetadata[];
  isLiveBrokerConnected: boolean;
  liveBrokerName: string;
}

export const BROKER_COMMODITY_CATALOG: Record<string, CommodityInstrumentMetadata[]> = {
  MCX: [
    { symbol: 'MCX_GOLD', name: 'Gold Futures (100g)', exchange: 'MCX', lotSize: '100 Grams', tickSize: '₹1.00', marginReq: '10.0%', expiry: '05-AUG-2026', settlementRules: 'Compulsory Delivery', tradingHours: '09:00 - 23:30 IST' },
    { symbol: 'MCX_SILVER', name: 'Silver Futures (30kg)', exchange: 'MCX', lotSize: '30 Kilograms', tickSize: '₹1.00', marginReq: '12.0%', expiry: '05-SEP-2026', settlementRules: 'Compulsory Delivery', tradingHours: '09:00 - 23:30 IST' },
    { symbol: 'MCX_CRUDE', name: 'Crude Oil Futures (100 Bbl)', exchange: 'MCX', lotSize: '100 Barrels', tickSize: '₹1.00', marginReq: '15.0%', expiry: '19-AUG-2026', settlementRules: 'Cash Settled', tradingHours: '09:00 - 23:30 IST' },
    { symbol: 'MCX_NATGAS', name: 'Natural Gas Futures (1250 MMBtu)', exchange: 'MCX', lotSize: '1250 MMBtu', tickSize: '₹0.10', marginReq: '15.0%', expiry: '25-AUG-2026', settlementRules: 'Cash Settled', tradingHours: '09:00 - 23:30 IST' },
  ],
  NCDEX: [
    { symbol: 'NCDEX_JEERA', name: 'Jeera Futures (3 MT)', exchange: 'NCDEX', lotSize: '3 Metric Tonnes', tickSize: '₹5.00', marginReq: '12.0%', expiry: '20-AUG-2026', settlementRules: 'Compulsory Delivery', tradingHours: '10:00 - 17:00 IST' },
    { symbol: 'NCDEX_DHANIYA', name: 'Coriander Futures (5 MT)', exchange: 'NCDEX', lotSize: '5 Metric Tonnes', tickSize: '₹2.00', marginReq: '10.0%', expiry: '20-SEP-2026', settlementRules: 'Compulsory Delivery', tradingHours: '10:00 - 17:00 IST' },
  ]
};

export class BrokerCapabilityRegistry {
  public static resolveCapabilities(brokerId?: string): ResolvedBrokerCapabilities {
    const registry = BrokerAdapterRegistry.getInstance();
    const activeId = brokerId || registry.getActiveBrokerId();
    
    let adapter;
    try {
      adapter = registry.getAdapter(activeId as BrokerId);
    } catch {
      adapter = registry.getAdapter('paper');
    }

    const caps = adapter.getCapabilities();
    const segments = caps.supportedSegments || [];

    const exchangeSet = new Set<string>();
    const commodityExchangesSet = new Set<string>();

    segments.forEach((seg) => {
      if (seg.startsWith('NSE')) exchangeSet.add('NSE');
      if (seg.startsWith('BSE')) exchangeSet.add('BSE');
      if (seg.startsWith('MCX') || seg === 'MCX_COMM') {
        exchangeSet.add('MCX');
        commodityExchangesSet.add('MCX');
      }
      if (seg.startsWith('NCDEX')) {
        exchangeSet.add('NCDEX');
        commodityExchangesSet.add('NCDEX');
      }
    });

    const supportedExchanges = Array.from(exchangeSet);
    const supportedCommodityExchanges = Array.from(commodityExchangesSet);
    const hasCommoditySupport = supportedCommodityExchanges.length > 0;

    let commodityExchangeLabel = 'NO CURRENT COMMODITY EXCHANGE';
    if (hasCommoditySupport) {
      commodityExchangeLabel = supportedCommodityExchanges.join(' / ');
    }

    const commodityInstruments: CommodityInstrumentMetadata[] = [];
    supportedCommodityExchanges.forEach((ex) => {
      if (BROKER_COMMODITY_CATALOG[ex]) {
        commodityInstruments.push(...BROKER_COMMODITY_CATALOG[ex]);
      }
    });

    const isLiveBrokerConnected = activeId !== 'paper' && activeId !== 'NO_CURRENT_LIVE_BROKER';

    return {
      brokerId: adapter.brokerId,
      brokerName: adapter.brokerName,
      country: 'IN',
      active: true,
      supportedExchanges,
      supportedSegments: segments,
      supportedCommodityExchanges,
      commodityExchangeLabel,
      hasCommoditySupport,
      commodityInstruments,
      isLiveBrokerConnected,
      liveBrokerName: isLiveBrokerConnected ? adapter.brokerName : 'NO CURRENT LIVE BROKER'
    };
  }
}
