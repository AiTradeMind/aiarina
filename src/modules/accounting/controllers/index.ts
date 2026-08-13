import { Response, NextFunction } from "express";
import { AccountingService } from "../services/index.ts";
import { AuthenticatedRequest } from "../../../middleware/auth.ts";
import { timeService } from "../../system/services/time.service.ts";
import { systemConfigService } from "../../system/services/system-config.service.ts";

const accountingService = new AccountingService();

export class AccountingController {
  async getDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await accountingService.getDashboard();
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getChartOfAccounts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await accountingService.getChartOfAccounts();
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async createChartOfAccount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await accountingService.createChartOfAccount(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateChartOfAccount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await accountingService.updateChartOfAccount(id, req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getJournal(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const tradeId = req.query.tradeId ? parseInt(req.query.tradeId as string, 10) : undefined;
      const status = req.query.status as string | undefined;
      const search = req.query.search as string | undefined;
      const result = await accountingService.getJournal({ tradeId, status, search });
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async postJournalEntry(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await accountingService.postJournalEntry(req.body);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async reverseJournalEntry(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const reason = req.body.reason;
      const result = await accountingService.reverseJournalEntry(id, reason);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getLedger(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const accountId = req.query.accountId ? parseInt(req.query.accountId as string, 10) : undefined;
      const result = await accountingService.getLedger(accountId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getLedgerAccount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await accountingService.getLedger(id);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getTrialBalance(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const periodId = req.query.periodId ? parseInt(req.query.periodId as string, 10) : undefined;
      const result = await accountingService.getTrialBalance(periodId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getProfitLoss(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const periodId = req.query.periodId ? parseInt(req.query.periodId as string, 10) : undefined;
      const result = await accountingService.getProfitLoss(periodId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getBalanceSheet(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const periodId = req.query.periodId ? parseInt(req.query.periodId as string, 10) : undefined;
      const result = await accountingService.getBalanceSheet(periodId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAccountingPeriods(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await accountingService.getAccountingPeriods();
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async createAccountingPeriod(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await accountingService.createAccountingPeriod(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async closeAccountingPeriod(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await accountingService.closeAccountingPeriod(id);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async runReconciliation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await accountingService.runReconciliation();
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async replayLedger(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await accountingService.replayLedger();
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async checkHealth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await accountingService.checkHealth();
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getSystemConfigs(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await systemConfigService.getAllConfigs();
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async setSystemConfig(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { key, category, value, isLocked } = req.body;
      const result = await systemConfigService.setConfig(key, category, value, isLocked);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getTime(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = timeService.getSystemTimes();
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getCertificates(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await accountingService.getCertificates();
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async verifyCertificate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await accountingService.verifyCertificate(id);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAuditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query.query as string | undefined;
      const result = await accountingService.getAuditLogs(query);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getInspector(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await accountingService.getInspectorDiagnostics();
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async syncEP15Trades(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await accountingService.syncEP15Trades();
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
