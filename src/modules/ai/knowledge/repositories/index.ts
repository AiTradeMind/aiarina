import { getDb } from "../../../../db/client.ts";
import { 
  knowledgeNodes, knowledgeEdges, knowledgeCategories, 
  knowledgeRelationships, knowledgePaths, knowledgeSnapshots, knowledgeVersions 
} from "../../../../db/schema.ts";
import { eq, or, and, desc } from "drizzle-orm";
import { 
  KnowledgeNode, KnowledgeEdge, KnowledgeCategory, 
  KnowledgeRelationship, KnowledgePath, KnowledgeSnapshot, KnowledgeVersion 
} from "../types/index.ts";

export class KnowledgeRepository {
  async getNodes(): Promise<KnowledgeNode[]> {
    const db = await getDb();
    return await db.select().from(knowledgeNodes).orderBy(desc(knowledgeNodes.createdAt)) as KnowledgeNode[];
  }

  async getEdges(): Promise<KnowledgeEdge[]> {
    const db = await getDb();
    return await db.select().from(knowledgeEdges).orderBy(desc(knowledgeEdges.createdAt)) as KnowledgeEdge[];
  }

  async getRelationships(): Promise<KnowledgeRelationship[]> {
    const db = await getDb();
    return await db.select().from(knowledgeRelationships).orderBy(desc(knowledgeRelationships.createdAt)) as KnowledgeRelationship[];
  }

  async getSnapshots(): Promise<KnowledgeSnapshot[]> {
    const db = await getDb();
    return await db.select().from(knowledgeSnapshots).orderBy(desc(knowledgeSnapshots.timestamp)) as KnowledgeSnapshot[];
  }
  
  async searchNodes(query: string): Promise<KnowledgeNode[]> {
    const db = await getDb();
    const nodes = await db.select().from(knowledgeNodes) as KnowledgeNode[];
    return nodes.filter(n => n.name.toLowerCase().includes(query.toLowerCase()) || n.type.toLowerCase().includes(query.toLowerCase()));
  }

  async createNode(data: KnowledgeNode): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(knowledgeNodes).values(data);
  }

  async createEdge(data: KnowledgeEdge): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(knowledgeEdges).values(data);
  }

  async createCategory(data: KnowledgeCategory): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(knowledgeCategories).values(data);
  }
  
  async createRelationship(data: KnowledgeRelationship): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(knowledgeRelationships).values(data);
  }
  
  async createSnapshot(data: KnowledgeSnapshot): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(knowledgeSnapshots).values(data);
  }
}
