export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
  errors: string[];
  timestamp: string;
}

export interface StrategyBuilder {
  id: string;
  strategyId: string;
  name: string;
  category?: string | null;
  tags?: string[] | null;
  description?: string | null;
  riskLevel?: string | null;
  marketType?: string | null;
  instrumentType?: string | null;
  timeframe?: string | null;
  status?: string;
  version: string;
  approvalStatus?: string;
  sha256Reference?: string | null;
  rules?: string[] | null;
  createdBy?: string;
  updatedBy?: string;
  createdTime: Date;
  updatedTime: Date;
}

export interface StrategyBlock {
  id: string;
  builderId: string;
  blockType: string;
  name: string;
  description: string | null;
  createdTime: Date;
}

export interface StrategyConnection {
  id: string;
  builderId: string;
  sourceBlockId: string;
  targetBlockId: string;
  sourcePort: string | null;
  targetPort: string | null;
  createdTime: Date;
}

export interface StrategyLayout {
  id: string;
  builderId: string;
  blockId: string;
  positionX: number;
  positionY: number;
  width: number | null;
  height: number | null;
  isCollapsed: boolean | null;
  createdTime: Date;
}

export interface StrategyParameter {
  id: string;
  blockId: string;
  key: string;
  value: string;
  valueType: string;
  createdTime: Date;
}

export interface StrategyValidation {
  id: string;
  builderId: string;
  isValid: boolean;
  errors: any;
  warnings: any;
  validatedTime: Date;
}

export interface StrategyBuilderHistory {
  id: string;
  builderId: string;
  snapshot: any;
  userId: string | null;
  reason: string | null;
  createdTime: Date;
}
