export interface DecisionExplanation {
  id: string;
  decisionId: string;
  explanation: string;
  confidenceScore: number;
  createdAt: Date;
}

export interface DecisionEvidence {
  id: string;
  decisionId: string;
  evidenceData: Record<string, any>;
  createdAt: Date;
}
