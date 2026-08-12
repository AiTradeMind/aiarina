import { RegistryRepository } from "../repositories/index.ts";
import { 
  StrategyRegistry, StrategyCategory, StrategyTemplate,
  StrategyCapabilities
} from "../types/index.ts";

export class RegistryService {
  private repo = new RegistryRepository();

  async getStrategies(): Promise<StrategyRegistry[]> {
    return await this.repo.getStrategies();
  }

  async getStrategyById(id: string): Promise<any> {
    const strategy = await this.repo.getStrategyById(id);
    if (!strategy) return null;
    
    const [tags, dependencies, metadata, capabilities] = await Promise.all([
      this.repo.getTags(id),
      this.repo.getDependencies(id),
      this.repo.getMetadata(id),
      this.repo.getCapabilities(id)
    ]);
    
    return {
      ...strategy,
      tags,
      dependencies,
      metadata,
      capabilities
    };
  }

  async getCategories(): Promise<StrategyCategory[]> {
    return await this.repo.getCategories();
  }

  async getTemplates(): Promise<StrategyTemplate[]> {
    return await this.repo.getTemplates();
  }

  async registerStrategy(data: any): Promise<{ success: boolean; data?: StrategyRegistry }> {
    const id = data.id || crypto.randomUUID();
    const strategy: StrategyRegistry = {
      id,
      name: data.name,
      displayName: data.displayName,
      category: data.category,
      description: data.description || null,
      version: data.version || '1.0.0',
      status: data.status || 'ACTIVE',
      owner: data.owner || 'system',
      createdBy: data.createdBy || 'system',
      riskLevel: data.riskLevel || 'MEDIUM',
      complexity: data.complexity || 1,
      supportedMarkets: data.supportedMarkets || [],
      supportedInstruments: data.supportedInstruments || [],
      minimumCapital: data.minimumCapital || null,
      maximumCapital: data.maximumCapital || null,
      preferredTimeframe: data.preferredTimeframe || null,
      preferredSession: data.preferredSession || null,
      createdTime: new Date(),
      updatedTime: new Date()
    };
    
    await this.repo.createStrategy(strategy);
    
    const caps: StrategyCapabilities = {
      id: crypto.randomUUID(),
      strategyId: id,
      supportsPaperTrading: data.capabilities?.supportsPaperTrading || false,
      supportsAi: data.capabilities?.supportsAi || false,
      supportsAutomation: data.capabilities?.supportsAutomation || false,
      supportsReplay: data.capabilities?.supportsReplay || false,
      supportsBacktesting: data.capabilities?.supportsBacktesting || false,
      supportsPortfolio: data.capabilities?.supportsPortfolio || false,
      supportsMultiAsset: data.capabilities?.supportsMultiAsset || false,
      supportsMultiTimeframe: data.capabilities?.supportsMultiTimeframe || false,
      createdTime: new Date(),
      updatedTime: new Date()
    };
    await this.repo.createCapabilities(caps);

    return { success: true, data: strategy };
  }

  async updateStrategy(id: string, data: Partial<StrategyRegistry>): Promise<{ success: boolean }> {
    await this.repo.updateStrategy(id, { ...data, updatedTime: new Date() });
    return { success: true };
  }

  async deleteStrategy(id: string): Promise<{ success: boolean }> {
    await this.repo.deleteStrategy(id);
    return { success: true };
  }

  async seedInitialData(): Promise<void> {
    const categories = await this.repo.getCategories();
    if (categories.length === 0) {
      await this.repo.createCategory({ id: crypto.randomUUID(), name: "Trend Following", description: "Follows market trends", createdTime: new Date() });
      await this.repo.createCategory({ id: crypto.randomUUID(), name: "Mean Reversion", description: "Reverts to mean", createdTime: new Date() });
      await this.repo.createCategory({ id: crypto.randomUUID(), name: "AI Strategy", description: "AI managed", createdTime: new Date() });
      await this.repo.createCategory({ id: crypto.randomUUID(), name: "Scalping", description: "Quick trades", createdTime: new Date() });
      await this.repo.createCategory({ id: crypto.randomUUID(), name: "Technical Analysis", description: "Indicator based", createdTime: new Date() });
    }
    
    const strategies = await this.repo.getStrategies();
    if (strategies.length === 0) {
      const strategyList = [
        { name: "trend_following", displayName: "Trend Following", category: "Trend Following", description: "Standard trend follower" },
        { name: "momentum", displayName: "Momentum", category: "Trend Following", description: "Momentum tracker" },
        { name: "mean_reversion", displayName: "Mean Reversion", category: "Mean Reversion", description: "Mean reversion strategy" },
        { name: "breakout", displayName: "Breakout", category: "Trend Following", description: "Breakout strategy" },
        { name: "scalping", displayName: "Scalping", category: "Scalping", description: "Scalping strategy" },
        { name: "swing", displayName: "Swing", category: "Trend Following", description: "Swing strategy" },
        { name: "intraday", displayName: "Intraday", category: "Trend Following", description: "Intraday strategy" },
        { name: "vwap", displayName: "VWAP", category: "Technical Analysis", description: "VWAP strategy" },
        { name: "orb", displayName: "ORB", category: "Trend Following", description: "Opening Range Breakout" },
        { name: "ema", displayName: "EMA", category: "Technical Analysis", description: "EMA crossover" },
        { name: "rsi", displayName: "RSI", category: "Technical Analysis", description: "RSI strategy" },
        { name: "macd", displayName: "MACD", category: "Technical Analysis", description: "MACD strategy" },
        { name: "supertrend", displayName: "SuperTrend", category: "Technical Analysis", description: "SuperTrend strategy" },
        { name: "bollinger", displayName: "Bollinger", category: "Technical Analysis", description: "Bollinger Bands" },
        { name: "volume_profile", displayName: "Volume Profile", category: "Technical Analysis", description: "Volume Profile" },
        { name: "smart_money", displayName: "Smart Money", category: "AI Strategy", description: "Smart Money AI" },
        { name: "options", displayName: "Options", category: "AI Strategy", description: "Options Strategy" },
        { name: "futures", displayName: "Futures", category: "AI Strategy", description: "Futures Strategy" },
        { name: "sector_rotation", displayName: "Sector Rotation", category: "Trend Following", description: "Sector Rotation" },
        { name: "pairs", displayName: "Pairs", category: "Mean Reversion", description: "Pairs Trading" },
        { name: "volatility", displayName: "Volatility", category: "Mean Reversion", description: "Volatility Strategy" },
        { name: "hybrid_ai", displayName: "Hybrid AI", category: "AI Strategy", description: "Hybrid AI Strategy" }
      ];

      for (const s of strategyList) {
        await this.registerStrategy({
          ...s,
          version: "1.0.0",
          status: "ACTIVE",
          owner: "SYSTEM",
          createdBy: "SYSTEM",
          riskLevel: "MEDIUM",
          complexity: 3,
          supportedMarkets: ["CRYPTO", "EQUITY"],
          supportedInstruments: ["SPOT", "PERP"],
          capabilities: { supportsAi: s.category === "AI Strategy", supportsPaperTrading: true, supportsBacktesting: true }
        });
      }
    }
  }
}
