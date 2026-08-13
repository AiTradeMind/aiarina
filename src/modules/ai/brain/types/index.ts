export interface Brain {
  id: string;
  name: string;
  status: 'ONLINE' | 'OFFLINE' | 'PROCESSING' | 'ANALYZING';
  mode: 'STANDARD' | 'DEEP' | 'RAPID' | 'CONSENSUS';
  activeTasks: number;
  systemLoad: number;
  createdAt: string;
  updatedAt: string;
}

export interface BrainSession {
  id: string;
  brainId: string;
  status: 'ACTIVE' | 'COMPLETED' | 'FAILED';
  context: string;
  createdAt: string;
  completedAt: string | null;
}

export interface BrainTask {
  id: string;
  sessionId: string;
  type: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  complexity: number;
  status: 'PENDING' | 'ANALYZING' | 'ASSIGNED' | 'COLLECTING' | 'SCORING' | 'COMPLETED' | 'FAILED';
  intent: string;
  requiredExpertise: string[];
  estimatedTokens: number | null;
  estimatedCost: number | null;
  estimatedDuration: number | null;
  confidenceTarget: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface BrainReasoning {
  id: string;
  taskId: string;
  step: number;
  logic: string;
  conclusion: string;
  confidence: number;
  timestamp: string;
}

export interface BrainConsensus {
  id: string;
  taskId: string;
  requiredModels: number;
  achievedModels: number;
  consensusScore: number | null;
  status: 'GATHERING' | 'REACHED' | 'FAILED' | 'CONFLICT';
  resolution: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BrainAssignment {
  id: string;
  taskId: string;
  modelId: string;
  role: 'PRIMARY' | 'SECONDARY' | 'CRITIC' | 'VERIFIER';
  status: 'PENDING' | 'EXECUTING' | 'COMPLETED' | 'FAILED';
  assignedAt: string;
  completedAt: string | null;
  response: string | null;
  score: number | null;
}

export interface BrainHistory {
  id: string;
  brainId: string;
  eventType: string;
  eventData: string;
  timestamp: string;
}

export interface TaskAnalyzeRequest {
  intent: string;
  context: any;
  options?: {
    mode?: 'STANDARD' | 'DEEP' | 'RAPID' | 'CONSENSUS';
  };
}

export interface BrainTaskAssignmentRequest {
  taskId: string;
  modelId: string;
  role: 'PRIMARY' | 'SECONDARY' | 'CRITIC' | 'VERIFIER';
}
