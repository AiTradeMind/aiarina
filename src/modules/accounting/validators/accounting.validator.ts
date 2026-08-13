import { PostJournalEntryRequest, CreateAccountRequest } from "../types/index.ts";

export class AccountingValidator {
  static validateCreateAccount(req: CreateAccountRequest): void {
    if (!req.accountCode || typeof req.accountCode !== "string") {
      throw new Error("Account code is required and must be a string.");
    }
    if (!req.accountName || typeof req.accountName !== "string") {
      throw new Error("Account name is required and must be a string.");
    }
    const validTypes = ["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"];
    if (!req.accountType || !validTypes.includes(req.accountType)) {
      throw new Error(`Account type must be one of: ${validTypes.join(", ")}`);
    }
  }

  static validateJournalEntry(req: PostJournalEntryRequest): void {
    if (!req.description || typeof req.description !== "string") {
      throw new Error("Journal entry description is required.");
    }
    if (!req.entries || !Array.isArray(req.entries) || req.entries.length < 2) {
      throw new Error("Journal entry must contain at least two line items (Double-Entry constraint).");
    }

    let totalDebit = 0;
    let totalCredit = 0;

    for (const entry of req.entries) {
      if (!entry.accountId) {
        throw new Error("Each line item must specify a valid accountId.");
      }
      if (entry.amount <= 0) {
        throw new Error(`Line item amount must be positive. Received: ${entry.amount}`);
      }
      if (entry.transactionType === "DEBIT") totalDebit += entry.amount;
      else if (entry.transactionType === "CREDIT") totalCredit += entry.amount;
      else throw new Error(`Invalid transactionType '${entry.transactionType}'. Must be DEBIT or CREDIT.`);
    }

    if (Math.abs(totalDebit - totalCredit) > 0.0001) {
      throw new Error(`Double Entry Violation: Total Debits ($${totalDebit.toFixed(2)}) != Total Credits ($${totalCredit.toFixed(2)}).`);
    }
  }
}
