import logger from '../../../lib/logger';

export interface KnowledgeNode {
  id: string;
  type: 'AI_MODEL' | 'STRATEGY' | 'MARKET' | 'TRADE' | 'RISK' | 'COMMITTEE';
  label: string;
  properties: Record<string, any>;
  version: string;
  expiresAt?: Date;
}

export interface KnowledgeEdge {
  source: string;
  target: string;
  relation: string;
  weight: number;
}

export class KnowledgeGraphEngine {
  private static instance: KnowledgeGraphEngine;
  private nodes: Map<string, KnowledgeNode> = new Map();
  private edges: KnowledgeEdge[] = [];

  private constructor() {
    this.seedDefaultGraph();
  }

  public static getInstance(): KnowledgeGraphEngine {
    if (!KnowledgeGraphEngine.instance) {
      KnowledgeGraphEngine.instance = new KnowledgeGraphEngine();
    }
    return KnowledgeGraphEngine.instance;
  }

  private seedDefaultGraph(): void {
    this.addNode({
      id: 'ai_claude_sonnet',
      type: 'AI_MODEL',
      label: 'Claude 3.5 Sonnet',
      properties: { trustScore: 94, reputation: 'HIGH' },
      version: '3.5'
    });
    this.addNode({
      id: 'strat_momentum',
      type: 'STRATEGY',
      label: 'Enterprise Momentum Alpha',
      properties: { target: 'BTC-USD', timeframe: '1h' },
      version: '1.2.0'
    });
    this.addNode({
      id: 'market_btc',
      type: 'MARKET',
      label: 'BTC-USD Spot / Perp',
      properties: { volatility: 'MEDIUM', regime: 'BULLISH' },
      version: '1.0'
    });

    this.addEdge('ai_claude_sonnet', 'strat_momentum', 'EVALUATES', 0.95);
    this.addEdge('strat_momentum', 'market_btc', 'TARGETS', 1.0);
  }

  public addNode(node: KnowledgeNode): void {
    this.nodes.set(node.id, node);
    logger.debug({ nodeId: node.id, type: node.type }, 'Knowledge node added');
  }

  public addEdge(source: string, target: string, relation: string, weight: number): void {
    this.edges.push({ source, target, relation, weight });
  }

  public getGraphSummary(): { nodes: KnowledgeNode[]; edges: KnowledgeEdge[] } {
    return {
      nodes: Array.from(this.nodes.values()),
      edges: this.edges
    };
  }

  public semanticSearch(query: string): KnowledgeNode[] {
    const q = query.toLowerCase();
    return Array.from(this.nodes.values()).filter(
      n => n.label.toLowerCase().includes(q) || n.type.toLowerCase().includes(q)
    );
  }
}
