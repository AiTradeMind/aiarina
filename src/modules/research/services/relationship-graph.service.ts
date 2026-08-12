import { RELATIONSHIP_TYPES, RelationshipTypeValue } from "../constants/index.ts";
import { ResearchRelationship } from "../types/index.ts";

export class RelationshipGraphService {
  private static graphStore: Map<string, ResearchRelationship[]> = new Map();

  public addRelationship(
    sourceResearchId: string,
    targetResearchId: string,
    type: RelationshipTypeValue,
    strength: number = 1.0,
    metadata: Record<string, any> = {}
  ): ResearchRelationship {
    const relationshipId = `REL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const record: ResearchRelationship = {
      relationshipId,
      sourceResearchId,
      targetResearchId,
      type,
      strength,
      metadata,
      createdAt: new Date(),
    };

    const sourceList = RelationshipGraphService.graphStore.get(sourceResearchId) || [];
    sourceList.push(record);
    RelationshipGraphService.graphStore.set(sourceResearchId, sourceList);

    // Bi-directional lookup entry for target
    const targetList = RelationshipGraphService.graphStore.get(targetResearchId) || [];
    targetList.push(record);
    RelationshipGraphService.graphStore.set(targetResearchId, targetList);

    return record;
  }

  public getRelationships(researchId: string): ResearchRelationship[] {
    return RelationshipGraphService.graphStore.get(researchId) || [];
  }

  public getConnectedResearchIds(researchId: string): string[] {
    const rels = this.getRelationships(researchId);
    const connected = new Set<string>();
    rels.forEach((r) => {
      if (r.sourceResearchId !== researchId) connected.add(r.sourceResearchId);
      if (r.targetResearchId !== researchId) connected.add(r.targetResearchId);
    });
    return Array.from(connected);
  }
}
