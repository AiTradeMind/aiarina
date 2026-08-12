export interface KnowledgeNode {
  id: string;
  name: string;
  type: string;
  attributes: any;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface KnowledgeEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  edgeType: string;
  weight: number;
  attributes: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface KnowledgeCategory {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface KnowledgeRelationship {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
}

export interface KnowledgePath {
  id: string;
  startNodeId: string;
  endNodeId: string;
  pathLength: number;
  pathData: any;
  createdAt: Date;
}

export interface KnowledgeSnapshot {
  id: string;
  versionId: string;
  nodeCount: number;
  edgeCount: number;
  metrics: any;
  timestamp: Date;
}

export interface KnowledgeVersion {
  id: string;
  versionTag: string;
  description: string | null;
  createdAt: Date;
}
