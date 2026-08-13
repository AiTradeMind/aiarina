import { Router } from "express";
import { AccountingController } from "../controllers/index.ts";
import { requireRole } from "../../../middleware/auth.ts";

export const accountingRouter = Router();
const ctrl = new AccountingController();

const allowedRoles = ["trader", "admin", "analyst", "system" as any];

accountingRouter.get("/dashboard", requireRole(allowedRoles), (req, res, next) => ctrl.getDashboard(req, res, next));
accountingRouter.get("/coa", requireRole(allowedRoles), (req, res, next) => ctrl.getChartOfAccounts(req, res, next));
accountingRouter.post("/coa", requireRole(allowedRoles), (req, res, next) => ctrl.createChartOfAccount(req, res, next));
accountingRouter.put("/coa/:id", requireRole(allowedRoles), (req, res, next) => ctrl.updateChartOfAccount(req, res, next));

accountingRouter.get("/journal", requireRole(allowedRoles), (req, res, next) => ctrl.getJournal(req, res, next));
accountingRouter.post("/post", requireRole(allowedRoles), (req, res, next) => ctrl.postJournalEntry(req, res, next));
accountingRouter.post("/journal/reverse/:id", requireRole(allowedRoles), (req, res, next) => ctrl.reverseJournalEntry(req, res, next));

accountingRouter.get("/ledger", requireRole(allowedRoles), (req, res, next) => ctrl.getLedger(req, res, next));
accountingRouter.get("/ledger/:id", requireRole(allowedRoles), (req, res, next) => ctrl.getLedgerAccount(req, res, next));

accountingRouter.get("/trial-balance", requireRole(allowedRoles), (req, res, next) => ctrl.getTrialBalance(req, res, next));
accountingRouter.get("/profit-loss", requireRole(allowedRoles), (req, res, next) => ctrl.getProfitLoss(req, res, next));
accountingRouter.get("/balance-sheet", requireRole(allowedRoles), (req, res, next) => ctrl.getBalanceSheet(req, res, next));

accountingRouter.get("/periods", requireRole(allowedRoles), (req, res, next) => ctrl.getAccountingPeriods(req, res, next));
accountingRouter.post("/periods", requireRole(allowedRoles), (req, res, next) => ctrl.createAccountingPeriod(req, res, next));
accountingRouter.post("/periods/close/:id", requireRole(allowedRoles), (req, res, next) => ctrl.closeAccountingPeriod(req, res, next));

accountingRouter.post("/reconciliation", requireRole(allowedRoles), (req, res, next) => ctrl.runReconciliation(req, res, next));
accountingRouter.post("/replay", requireRole(allowedRoles), (req, res, next) => ctrl.replayLedger(req, res, next));
accountingRouter.get("/health", requireRole(allowedRoles), (req, res, next) => ctrl.checkHealth(req, res, next));

accountingRouter.get("/config", requireRole(allowedRoles), (req, res, next) => ctrl.getSystemConfigs(req, res, next));
accountingRouter.post("/config", requireRole(allowedRoles), (req, res, next) => ctrl.setSystemConfig(req, res, next));
accountingRouter.get("/time", requireRole(allowedRoles), (req, res, next) => ctrl.getTime(req, res, next));

accountingRouter.get("/certificates", requireRole(allowedRoles), (req, res, next) => ctrl.getCertificates(req, res, next));
accountingRouter.get("/certificates/verify/:id", requireRole(allowedRoles), (req, res, next) => ctrl.verifyCertificate(req, res, next));

accountingRouter.get("/audit", requireRole(allowedRoles), (req, res, next) => ctrl.getAuditLogs(req, res, next));
accountingRouter.get("/inspector", requireRole(allowedRoles), (req, res, next) => ctrl.getInspector(req, res, next));
accountingRouter.post("/sync-ep15", requireRole(allowedRoles), (req, res, next) => ctrl.syncEP15Trades(req, res, next));
