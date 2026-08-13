export interface MemorySession {
  id: number;
  organizationId: string | null;
  userId: number | null;
  startTime: string;
  endTime: string | null;
  metadata: any;
}

export interface MemoryEvent {
  id: number;
  sessionId: number | null;
  type: string;
  sourceId: string | null;
  data: any;
  timestamp: string;
}

export interface MemoryPattern {
  id: number;
  organizationId: string | null;
  name: string;
  description: string | null;
  patternType: string;
  logic: any;
  confidence: string | null;
  createdAt: string;
}

export interface MemoryFeedback {
  id: number;
  eventId: number | null;
  userId: number | null;
  rating: number | null;
  comment: string | null;
  createdAt: string;
}

export interface MemoryKnowledge {
  id: number;
  organizationId: string | null;
  key: string;
  value: any;
  tags: any;
  updatedAt: string;
}

export interface StoreMemoryRequest {
  type: string;
  sourceId?: string;
  data: any;
  sessionId?: number;
}

export interface SearchMemoryRequest {
  query: string;
  type?: string;
  tags?: string[];
  limit?: number;
}
