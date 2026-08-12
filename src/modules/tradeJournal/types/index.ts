export interface TradeJournalEntry {
  tradeId: number;
  journalEntry: string;
  aiDecisionReference?: string;
  strategyReference?: string;
  committeeReference?: string;
}

export interface TradeFilterOptions {
  dateRange?: { start: Date; end: Date };
  status?: string;
  strategyReference?: string;
}
