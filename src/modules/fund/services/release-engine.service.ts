import { FundRepository } from "../repositories/fund.repository.ts";
import { FundAccount, FundReservation, FundAllocation, FundTransaction } from "../types/index.ts";
import { ReleaseCapitalDTO } from "../dtos/fund.dto.ts";
import logger from "../../../lib/logger.ts";

export class ReleaseEngineService {
  private static instance: ReleaseEngineService;
  private repository: FundRepository;

  private constructor() {
    this.repository = FundRepository.getInstance();
  }

  public static getInstance(): ReleaseEngineService {
    if (!ReleaseEngineService.instance) {
      ReleaseEngineService.instance = new ReleaseEngineService();
    }
    return ReleaseEngineService.instance;
  }

  public async releaseCapital(dto: ReleaseCapitalDTO): Promise<{
    releasedReservation?: FundReservation;
    releasedAllocation?: FundAllocation;
    updatedFund: FundAccount;
  }> {
    // 1. Release Reservation
    if (dto.reservationId) {
      const reservation = await this.repository.getReservationById(dto.reservationId);
      if (!reservation) {
        throw new Error(`RELEASE_ERROR: Reservation '${dto.reservationId}' not found.`);
      }

      if (reservation.status !== "RESERVED") {
        throw new Error(`RELEASE_ERROR: Reservation '${dto.reservationId}' is already ${reservation.status}.`);
      }

      const fund = await this.repository.getAccountById(reservation.fundId);
      if (!fund) {
        throw new Error(`RELEASE_ERROR: Fund '${reservation.fundId}' not found.`);
      }

      const releaseAmt = dto.amount !== undefined ? Math.min(dto.amount, reservation.amount) : reservation.amount;

      reservation.status = "RELEASED";
      reservation.releasedAt = new Date();

      fund.reservedCapital = Math.max(0, fund.reservedCapital - releaseAmt);
      fund.availableCapital += releaseAmt;
      fund.releasedCapital += releaseAmt;

      await this.repository.saveReservation(reservation);
      const updatedFund = await this.repository.saveAccount(fund);

      const tx: FundTransaction = {
        transactionId: `TX-REL-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        fundId: fund.fundId,
        operation: "RELEASE",
        amount: releaseAmt,
        status: "SUCCESS",
        actorId: dto.actorId || "SYSTEM",
        metadata: { reservationId: dto.reservationId, reason: dto.reason },
      };
      await this.repository.saveTransaction(tx);

      logger.info(
        { reservationId: dto.reservationId, fundId: fund.fundId, amount: releaseAmt },
        "Reserved Capital Released Successfully"
      );

      return { releasedReservation: reservation, updatedFund };
    }

    // 2. Recall / Release Allocation
    if (dto.allocationId) {
      const allocation = await this.repository.getAllocationById(dto.allocationId);
      if (!allocation) {
        throw new Error(`RELEASE_ERROR: Allocation '${dto.allocationId}' not found.`);
      }

      if (allocation.status !== "ACTIVE") {
        throw new Error(`RELEASE_ERROR: Allocation '${dto.allocationId}' is already ${allocation.status}.`);
      }

      const sourceFund = await this.repository.getAccountById(allocation.sourceFundId);
      const targetFund = await this.repository.getAccountById(allocation.targetFundId);

      if (!sourceFund || !targetFund) {
        throw new Error("RELEASE_ERROR: Source or Target fund for allocation not found.");
      }

      const recallAmt = dto.amount !== undefined ? Math.min(dto.amount, allocation.amount) : allocation.amount;

      allocation.status = "RELEASED";

      sourceFund.allocatedCapital = Math.max(0, sourceFund.allocatedCapital - recallAmt);
      sourceFund.availableCapital += recallAmt;

      targetFund.totalCapital = Math.max(0, targetFund.totalCapital - recallAmt);
      targetFund.availableCapital = Math.max(0, targetFund.availableCapital - recallAmt);

      await this.repository.saveAllocation(allocation);
      const updatedFund = await this.repository.saveAccount(sourceFund);
      await this.repository.saveAccount(targetFund);

      const tx: FundTransaction = {
        transactionId: `TX-RECALL-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        fundId: sourceFund.fundId,
        operation: "RELEASE",
        amount: recallAmt,
        sourceFundId: sourceFund.fundId,
        targetFundId: targetFund.fundId,
        status: "SUCCESS",
        actorId: dto.actorId || "SYSTEM",
        metadata: { allocationId: dto.allocationId, reason: dto.reason },
      };
      await this.repository.saveTransaction(tx);

      logger.info(
        { allocationId: dto.allocationId, sourceFundId: sourceFund.fundId, targetFundId: targetFund.fundId, amount: recallAmt },
        "Allocated Capital Recalled Successfully"
      );

      return { releasedAllocation: allocation, updatedFund };
    }

    // 3. Direct Fund Release / Unreserve
    if (dto.fundId && dto.amount && dto.amount > 0) {
      const fund = await this.repository.getAccountById(dto.fundId);
      if (!fund) {
        throw new Error(`RELEASE_ERROR: Fund '${dto.fundId}' not found.`);
      }

      const releaseAmt = Math.min(dto.amount, fund.reservedCapital);
      fund.reservedCapital = Math.max(0, fund.reservedCapital - releaseAmt);
      fund.availableCapital += releaseAmt;
      fund.releasedCapital += releaseAmt;

      const updatedFund = await this.repository.saveAccount(fund);

      const tx: FundTransaction = {
        transactionId: `TX-REL-DIRECT-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        fundId: fund.fundId,
        operation: "RELEASE",
        amount: releaseAmt,
        status: "SUCCESS",
        actorId: dto.actorId || "SYSTEM",
        metadata: { reason: dto.reason },
      };
      await this.repository.saveTransaction(tx);

      return { updatedFund };
    }

    throw new Error("RELEASE_ERROR: Reservation ID, Allocation ID, or Fund ID with amount must be provided.");
  }
}
