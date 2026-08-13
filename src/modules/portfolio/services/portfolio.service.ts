import { PortfolioRepository } from "../repositories/portfolio.repository.ts";
import { PortfolioValidator } from "../validators/portfolio.validator.ts";
import { PositionEngine } from "../engines/position.engine.ts";
import { HoldingEngine } from "../engines/holding.engine.ts";
import { MTMEngine } from "../engines/mtm.engine.ts";
import { PnLEngine } from "../engines/pnl.engine.ts";
import { ExposureEngine } from "../engines/exposure.engine.ts";
import { SnapshotEngine } from "../engines/snapshot.engine.ts";
import { PortfolioLifecycleManager } from "../lifecycle/portfolio-lifecycle.manager.ts";
import {
  OMSExecutionUpdate,
  PortfolioAccount,
  PortfolioPipelineResult,
  PortfolioPipelineStageLog,
  PortfolioPosition,
  PortfolioHolding,
  PortfolioExposureMetrics,
  PortfolioSnapshot,
  PortfolioPnLRecord,
  PortfolioEventRecord,
} from "../types/index.ts";

export class PortfolioService {
  private repository: PortfolioRepository;
  private lifecycleManager: PortfolioLifecycleManager;

  constructor() {
    this.repository = new PortfolioRepository();
    this.lifecycleManager = new PortfolioLifecycleManager();
  }

  /**
   * Main Ingestion Pipeline: Process OMS Execution Update
   */
  async processOMSExecution(
    execution: OMSExecutionUpdate,
    source: string = "OMS"
  ): Promise<PortfolioPipelineResult> {
    const startTime = Date.now();
    const stageLogs: PortfolioPipelineStageLog[] = [];
    const portfolioId = execution.portfolioId || "PF-MAIN-001";

    const addLog = (stage: string, passed: boolean, message: string) => {
      stageLogs.push({
        stage,
        passed,
        message,
        timestamp: new Date().toISOString(),
      });
    };

    try {
      // Stage 1: Receive OMS Execution
      addLog("RECEIVE_OMS_EXECUTION", true, `Received execution update for order '${execution.orderId}'`);

      // Stage 2: Validate Governance
      const govCheck = PortfolioValidator.validateGovernance(execution, source);
      addLog("VALIDATE_GOVERNANCE", govCheck.passed, govCheck.message);
      if (!govCheck.passed) {
        return this.failPipeline(portfolioId, stageLogs, govCheck.message, startTime, execution.orderId);
      }

      // Stage 3: Validate Portfolio Account
      const account = await this.repository.getOrCreateAccount(portfolioId);
      const portCheck = PortfolioValidator.validatePortfolio(account);
      addLog("VALIDATE_PORTFOLIO", portCheck.passed, portCheck.message);
      if (!portCheck.passed) {
        return this.failPipeline(portfolioId, stageLogs, portCheck.message, startTime, execution.orderId);
      }

      // Stage 4: Validate Position
      const existingPos = await this.repository.getPositionBySymbol(portfolioId, execution.symbol);
      const posCheck = PortfolioValidator.validatePositionUpdate(execution, existingPos);
      addLog("VALIDATE_POSITION", posCheck.passed, posCheck.message);
      if (!posCheck.passed) {
        return this.failPipeline(portfolioId, stageLogs, posCheck.message, startTime, execution.orderId);
      }

      // Stage 5: Update Position
      const { position: updatedPos, eventType } = PositionEngine.processExecution(execution, existingPos);
      addLog("UPDATE_POSITION", true, `Position updated: '${updatedPos.symbol}' status '${updatedPos.status}', qty ${updatedPos.netQuantity}`);

      // Stage 6: Update Holdings
      const currentPositions = await this.repository.getPositions(portfolioId);
      const otherPositions = currentPositions.filter((p) => p.symbol !== updatedPos.symbol);
      const allPositions = [...otherPositions, updatedPos];

      const holdings = HoldingEngine.generateHoldings(portfolioId, allPositions, account.totalValue);
      addLog("UPDATE_HOLDINGS", true, `Generated ${holdings.length} holding items`);

      // Stage 7: Recalculate MTM
      const mtmResult = MTMEngine.calculateMTM(allPositions, account.unrealizedPnl);
      addLog("RECALCULATE_MTM", true, `Calculated running MTM: ${mtmResult.runningMtm.toFixed(2)}`);

      // Stage 8: Recalculate PnL
      const pnlResult = PnLEngine.calculatePnL(allPositions);
      addLog("RECALCULATE_PNL", true, `PnL updated: Realized=${pnlResult.realizedPnl.toFixed(2)}, Unrealized=${pnlResult.unrealizedPnl.toFixed(2)}`);

      // Stage 9: Update Exposure
      const exposureResult = ExposureEngine.calculateExposure(allPositions, account.totalValue);
      addLog("UPDATE_EXPOSURE", true, `Gross Exposure=${exposureResult.grossExposure.toFixed(2)}, Net Exposure=${exposureResult.netExposure.toFixed(2)}`);

      // Updated Account Object
      const updatedAccount: PortfolioAccount = {
        ...account,
        unrealizedPnl: pnlResult.unrealizedPnl,
        realizedPnl: pnlResult.realizedPnl,
        grossExposure: exposureResult.grossExposure,
        netExposure: exposureResult.netExposure,
        totalValue: account.cashBalance + pnlResult.unrealizedPnl + pnlResult.realizedPnl,
      };

      // Stage 10: Create Snapshot
      const snapshot = SnapshotEngine.createSnapshot(updatedAccount, allPositions, "POSITION", {
        lastExecution: execution,
        mtmResult,
        pnlResult,
        exposureResult,
      });
      addLog("CREATE_SNAPSHOT", true, `Immutable snapshot created: '${snapshot.snapshotId}'`);

      // Stage 11: Persist
      await this.repository.savePosition(updatedPos);
      for (const hld of holdings) {
        await this.repository.saveHolding(hld);
      }
      await this.repository.updateAccount(portfolioId, updatedAccount);
      await this.repository.saveSnapshot(snapshot);

      // PnL record
      const dateStr = new Date().toISOString().split("T")[0];
      const pnlRecord: PortfolioPnLRecord = {
        pnlRecordId: `PNL-${portfolioId}-${updatedPos.symbol}-${Date.now()}`,
        portfolioId,
        positionId: updatedPos.positionId,
        symbol: updatedPos.symbol,
        dailyMtm: mtmResult.dailyMtm,
        runningMtm: mtmResult.runningMtm,
        realizedPnl: pnlResult.realizedPnl,
        unrealizedPnl: pnlResult.unrealizedPnl,
        totalPnl: pnlResult.totalPnl,
        date: dateStr,
      };
      await this.repository.savePnLRecord(pnlRecord);

      // Lifecycle event
      await this.lifecycleManager.emitEvent(portfolioId, eventType, {
        orderId: execution.orderId,
        symbol: execution.symbol,
        positionId: updatedPos.positionId,
        status: updatedPos.status,
      });

      addLog("PERSIST", true, "All database updates persisted successfully");

      // Stage 12: Ready
      addLog("READY", true, "Portfolio ingestion pipeline completed successfully");

      return {
        success: true,
        portfolioId,
        orderId: execution.orderId,
        positionId: updatedPos.positionId,
        stageLogs,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (error: any) {
      addLog("PIPELINE_ERROR", false, error.message);
      return this.failPipeline(portfolioId, stageLogs, error.message, startTime, execution.orderId);
    }
  }

  private failPipeline(
    portfolioId: string,
    stageLogs: PortfolioPipelineStageLog[],
    failureReason: string,
    startTime: number,
    orderId?: string
  ): PortfolioPipelineResult {
    return {
      success: false,
      portfolioId,
      orderId,
      stageLogs,
      failureReason,
      executionTimeMs: Date.now() - startTime,
    };
  }

  /**
   * Query API Methods
   */
  async getPortfolios(): Promise<PortfolioAccount[]> {
    const defaultAcc = await this.repository.getOrCreateAccount();
    return [defaultAcc];
  }

  async getPortfolio(portfolioId: string): Promise<PortfolioAccount | null> {
    return await this.repository.getAccount(portfolioId);
  }

  async getPositions(portfolioId: string = "PF-MAIN-001", status?: string): Promise<PortfolioPosition[]> {
    return await this.repository.getPositions(portfolioId, status);
  }

  async getHoldings(portfolioId: string = "PF-MAIN-001"): Promise<PortfolioHolding[]> {
    return await this.repository.getHoldings(portfolioId);
  }

  async getPnL(portfolioId: string = "PF-MAIN-001"): Promise<{
    summary: ReturnType<typeof PnLEngine.calculatePnL>;
    records: PortfolioPnLRecord[];
  }> {
    const positions = await this.repository.getPositions(portfolioId);
    const summary = PnLEngine.calculatePnL(positions);
    const records = await this.repository.getPnLRecords(portfolioId);
    return { summary, records };
  }

  async getExposure(portfolioId: string = "PF-MAIN-001"): Promise<PortfolioExposureMetrics> {
    const account = await this.repository.getOrCreateAccount(portfolioId);
    const positions = await this.repository.getPositions(portfolioId);
    return ExposureEngine.calculateExposure(positions, account.totalValue);
  }

  async getSnapshots(portfolioId: string = "PF-MAIN-001", limit: number = 100): Promise<PortfolioSnapshot[]> {
    return await this.repository.getSnapshots(portfolioId, limit);
  }

  async getHistory(portfolioId: string = "PF-MAIN-001", limit: number = 100): Promise<PortfolioEventRecord[]> {
    return await this.repository.getEvents(portfolioId, limit);
  }
}
