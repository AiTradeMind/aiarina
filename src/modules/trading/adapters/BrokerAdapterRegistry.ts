import { IBrokerAdapter, BrokerId, BrokerHealthStatus, BrokerCredentials } from './types';
import { DhanAdapter } from './DhanAdapter';
import { AngelOneAdapter } from './AngelOneAdapter';
import { ZerodhaAdapter } from './ZerodhaAdapter';
import { UpstoxAdapter } from './UpstoxAdapter';
import { FyersAdapter } from './FyersAdapter';
import { PaperTradingAdapter } from './PaperTradingAdapter';

/**
 * BROKER ADAPTER REGISTRY
 * Singleton Registry that manages all broker adapters.
 * Execution Engine resolves adapters from here without knowing broker specifics!
 */
export class BrokerAdapterRegistry {
  private static instance: BrokerAdapterRegistry;
  private adapters: Map<BrokerId, IBrokerAdapter> = new Map();
  private activeBrokerId: BrokerId = 'paper'; // Default fallback is Paper Trading

  private constructor() {
    this.registerDefaults();
  }

  public static getInstance(): BrokerAdapterRegistry {
    if (!BrokerAdapterRegistry.instance) {
      BrokerAdapterRegistry.instance = new BrokerAdapterRegistry();
    }
    return BrokerAdapterRegistry.instance;
  }

  private registerDefaults() {
    this.registerAdapter(new PaperTradingAdapter());
    this.registerAdapter(new DhanAdapter());
    this.registerAdapter(new AngelOneAdapter());
    this.registerAdapter(new ZerodhaAdapter());
    this.registerAdapter(new UpstoxAdapter());
    this.registerAdapter(new FyersAdapter());
  }

  public registerAdapter(adapter: IBrokerAdapter) {
    this.adapters.set(adapter.brokerId, adapter);
  }

  public getAdapter(brokerId?: BrokerId): IBrokerAdapter {
    const targetId = brokerId || this.activeBrokerId;
    const adapter = this.adapters.get(targetId);
    if (!adapter) {
      throw new Error(`Broker Adapter for '${targetId}' is not registered in BrokerAdapterRegistry.`);
    }
    return adapter;
  }

  public getActiveBrokerId(): BrokerId {
    return this.activeBrokerId;
  }

  public setActiveBrokerId(brokerId: BrokerId) {
    if (!this.adapters.has(brokerId)) {
      throw new Error(`Cannot set active broker to unregistered brokerId '${brokerId}'.`);
    }
    this.activeBrokerId = brokerId;
  }

  public getAllAdapters(): IBrokerAdapter[] {
    return Array.from(this.adapters.values());
  }

  public async checkAllHealth(): Promise<BrokerHealthStatus[]> {
    const healthList: BrokerHealthStatus[] = [];
    for (const adapter of this.adapters.values()) {
      try {
        const status = await adapter.healthCheck();
        healthList.push(status);
      } catch (err: any) {
        healthList.push({
          brokerId: adapter.brokerId,
          brokerName: adapter.brokerName,
          connected: false,
          apiLatencyMs: 999,
          rateLimitRemaining: 0,
          rateLimitTotal: 0,
          lastHeartbeat: new Date().toISOString(),
          status: 'DISCONNECTED',
          errorDetails: err?.message || 'Health check failed'
        });
      }
    }
    return healthList;
  }
}
