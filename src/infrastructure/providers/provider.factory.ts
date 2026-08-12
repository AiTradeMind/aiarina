import {
  IMarketDataProvider,
  IAIGatewayProvider,
  INotificationProvider,
  IStorageProvider,
  IBrokerAdapter
} from '../abstractions';
import { EnterpriseMarketDataProvider } from './market-data.provider';
import { EnterpriseAIGatewayProvider } from './ai-gateway.provider';
import { MultiChannelNotificationProvider } from './notification.provider';
import { EnterpriseStorageProvider } from './storage.provider';
import { SandboxBrokerAdapter } from './sandbox-broker.adapter';
import { CircuitBreaker } from '../resilience/circuit-breaker';
import logger from '../../lib/logger';

export class ProviderFactory {
  private static instance: ProviderFactory;

  private marketDataProvider: IMarketDataProvider;
  private backupMarketDataProvider?: IMarketDataProvider;

  private aiGatewayProvider: IAIGatewayProvider;
  private backupAIGatewayProvider?: IAIGatewayProvider;

  private notificationProvider: INotificationProvider;
  private storageProvider: IStorageProvider;
  private brokerAdapter: IBrokerAdapter;

  private marketCircuitBreaker: CircuitBreaker;
  private aiCircuitBreaker: CircuitBreaker;

  private constructor() {
    this.marketDataProvider = new EnterpriseMarketDataProvider();
    this.aiGatewayProvider = new EnterpriseAIGatewayProvider();
    this.notificationProvider = new MultiChannelNotificationProvider();
    this.storageProvider = new EnterpriseStorageProvider();
    this.brokerAdapter = new SandboxBrokerAdapter();

    this.marketCircuitBreaker = new CircuitBreaker({ name: 'market-data-circuit-breaker' });
    this.aiCircuitBreaker = new CircuitBreaker({ name: 'ai-gateway-circuit-breaker' });
  }

  public static getInstance(): ProviderFactory {
    if (!ProviderFactory.instance) {
      ProviderFactory.instance = new ProviderFactory();
    }
    return ProviderFactory.instance;
  }

  public getMarketDataProvider(): IMarketDataProvider {
    return this.marketDataProvider;
  }

  public setMarketDataProvider(provider: IMarketDataProvider, backup?: IMarketDataProvider): void {
    logger.info({ providerId: provider.providerId }, 'Registering primary Market Data Provider');
    this.marketDataProvider = provider;
    if (backup) {
      this.backupMarketDataProvider = backup;
      logger.info({ backupProviderId: backup.providerId }, 'Registering backup Market Data Provider');
    }
  }

  public getAIGatewayProvider(): IAIGatewayProvider {
    return this.aiGatewayProvider;
  }

  public setAIGatewayProvider(provider: IAIGatewayProvider, backup?: IAIGatewayProvider): void {
    logger.info({ providerId: provider.providerId }, 'Registering primary AI Gateway Provider');
    this.aiGatewayProvider = provider;
    if (backup) {
      this.backupAIGatewayProvider = backup;
      logger.info({ backupProviderId: backup.providerId }, 'Registering backup AI Gateway Provider');
    }
  }

  public getNotificationProvider(): INotificationProvider {
    return this.notificationProvider;
  }

  public setNotificationProvider(provider: INotificationProvider): void {
    logger.info({ channel: provider.channel }, 'Registering new Notification Provider');
    this.notificationProvider = provider;
  }

  public getStorageProvider(): IStorageProvider {
    return this.storageProvider;
  }

  public setStorageProvider(provider: IStorageProvider): void {
    logger.info({ providerId: provider.providerId }, 'Registering new Storage Provider');
    this.storageProvider = provider;
  }

  public getBrokerAdapter(): IBrokerAdapter {
    return this.brokerAdapter;
  }

  public setBrokerAdapter(adapter: IBrokerAdapter): void {
    logger.info({ brokerId: adapter.brokerId }, 'Registering Broker Adapter');
    this.brokerAdapter = adapter;
  }

  public getMarketCircuitBreaker(): CircuitBreaker {
    return this.marketCircuitBreaker;
  }

  public getAICircuitBreaker(): CircuitBreaker {
    return this.aiCircuitBreaker;
  }

  public async validateAllProvidersHealth(): Promise<Record<string, { isHealthy: boolean; details?: any }>> {
    const [market, ai, notif, storage, broker] = await Promise.all([
      this.marketDataProvider.healthCheck().catch(e => ({ isHealthy: false, error: e.message })),
      this.aiGatewayProvider.healthCheck().catch(e => ({ isHealthy: false, error: e.message })),
      this.notificationProvider.healthCheck().catch(e => ({ isHealthy: false, error: e.message })),
      this.storageProvider.healthCheck().catch(e => ({ isHealthy: false, error: e.message })),
      this.brokerAdapter.healthCheck().catch(e => ({ isHealthy: false, error: e.message }))
    ]);

    return {
      marketData: market,
      aiGateway: ai,
      notification: notif,
      storage,
      brokerAdapter: broker,
      circuitBreakers: {
        isHealthy: this.marketCircuitBreaker.getState() !== 'OPEN' && this.aiCircuitBreaker.getState() !== 'OPEN',
        details: {
          market: this.marketCircuitBreaker.getMetrics(),
          ai: this.aiCircuitBreaker.getMetrics()
        }
      }
    };
  }
}
