export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
export type TransactionType = 'DEBIT' | 'CREDIT';
export type JournalEntryStatus = 'DRAFT' | 'POSTED' | 'REVERSED';
export type PeriodType = 'DAILY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
export type PeriodStatus = 'OPEN' | 'CLOSED';
export type StatementType = 'PROFIT_LOSS' | 'BALANCE_SHEET';

export interface ChartOfAccount {
  id: number;
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  currency: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string | Date;
}

export interface CreateAccountRequest {
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  currency?: string;
  description?: string;
}

export interface JournalEntryLine {
  accountId: number;
  transactionType: TransactionType;
  amount: number;
}

export interface PostJournalEntryRequest {
  tradeId?: number;
  description: string;
  entries: JournalEntryLine[];
  entryDate?: string;
}

export interface LedgerTransaction {
  id: number;
  journalEntryId: number;
  accountId: number;
  transactionType: TransactionType;
  amount: number;
  balanceAfter?: number | null;
  transactionDate: string | Date;
  accountCode?: string;
  accountName?: string;
}

export interface JournalEntry {
  id: number;
  entryNumber: string;
  tradeId?: number | null;
  description: string | null;
  entryDate: string | Date;
  status: JournalEntryStatus;
  totalDebit: number;
  totalCredit: number;
  createdAt: string | Date;
  lines?: LedgerTransaction[];
}

export interface GeneralLedgerAccount {
  id: number;
  accountId: number;
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  currentBalance: number;
  lastUpdated: string | Date;
}

export interface TrialBalanceAccount {
  accountId: number;
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  debitBalance: number;
  creditBalance: number;
  netBalance: number;
}

export interface TrialBalanceResult {
  periodId?: number | null;
  periodName?: string;
  isBalanced: boolean;
  totalDebit: number;
  totalCredit: number;
  variance: number;
  accounts: TrialBalanceAccount[];
  generatedAt: string;
}

export interface FinancialStatementLine {
  accountId: number;
  accountCode: string;
  accountName: string;
  amount: number;
}

export interface ProfitLossStatement {
  periodId?: number | null;
  periodName?: string;
  revenues: FinancialStatementLine[];
  expenses: FinancialStatementLine[];
  totalRevenue: number;
  totalExpense: number;
  netIncome: number;
  generatedAt: string;
}

export interface BalanceSheetStatement {
  periodId?: number | null;
  periodName?: string;
  assets: FinancialStatementLine[];
  liabilities: FinancialStatementLine[];
  equity: FinancialStatementLine[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  isBalanced: boolean;
  variance: number;
  generatedAt: string;
}

export interface AccountingPeriod {
  id: number;
  periodName: string;
  periodType: PeriodType;
  startDate: string | Date;
  endDate: string | Date;
  status: PeriodStatus;
  closedAt?: string | Date | null;
  createdAt: string | Date;
}

export interface AccountingCertificate {
  id: number;
  referenceId: number;
  referenceType: string;
  sha256Certificate: string;
  integrityHash: string;
  digitalSignature: string;
  generatedAt: string | Date;
}

export interface AccountingAuditLog {
  id: number;
  action: string;
  entityType: string;
  entityId?: number | null;
  details?: string | null;
  auditTime: string | Date;
}

export interface AccountingPeriodFilter {
  periodId?: number;
}

