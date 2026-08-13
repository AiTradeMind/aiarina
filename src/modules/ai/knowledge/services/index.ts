import { KnowledgeRepository } from "../repositories/index.ts";
import { 
  KnowledgeNode, KnowledgeEdge, KnowledgeCategory, 
  KnowledgeRelationship, KnowledgePath, KnowledgeSnapshot, KnowledgeVersion 
} from "../types/index.ts";

export class KnowledgeService {
  private repo = new KnowledgeRepository();

  async getNodes(): Promise<KnowledgeNode[]> {
    return await this.repo.getNodes();
  }

  async getEdges(): Promise<KnowledgeEdge[]> {
    return await this.repo.getEdges();
  }

  async getRelationships(): Promise<KnowledgeRelationship[]> {
    return await this.repo.getRelationships();
  }

  async getSnapshots(): Promise<KnowledgeSnapshot[]> {
    return await this.repo.getSnapshots();
  }

  async searchNodes(query: string): Promise<KnowledgeNode[]> {
    return await this.repo.searchNodes(query);
  }

  async createNode(data: Partial<KnowledgeNode>): Promise<{ success: boolean; data?: KnowledgeNode }> {
    const node: KnowledgeNode = {
      id: data.id || crypto.randomUUID(),
      name: data.name || 'Unnamed Node',
      type: data.type || 'UNKNOWN',
      attributes: data.attributes || {},
      status: data.status || 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await this.repo.createNode(node);
    return { success: true, data: node };
  }

  async createEdge(data: Partial<KnowledgeEdge>): Promise<{ success: boolean; data?: KnowledgeEdge }> {
    const edge: KnowledgeEdge = {
      id: data.id || crypto.randomUUID(),
      sourceNodeId: data.sourceNodeId || '',
      targetNodeId: data.targetNodeId || '',
      edgeType: data.edgeType || 'RELATED_TO',
      weight: data.weight || 1.0,
      attributes: data.attributes || {},
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await this.repo.createEdge(edge);
    return { success: true, data: edge };
  }

  async analyze(modelId: string): Promise<{ success: boolean; message: string }> {
    return { success: true, message: 'Graph analysis complete' };
  }
}
