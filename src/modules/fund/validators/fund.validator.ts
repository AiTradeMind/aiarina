import { FundAccount, FundAllocation, FundReservation } from "../types/index.ts";
import { CreateFundDTO, AllocateFundDTO, ReserveCapitalDTO } from "../dtos/fund.dto.ts";
import logger from "../../../lib/logger.ts";

export class FundValidator {
  public static validateCreateFund(dto: CreateFundDTO): void {
    if (!dto.name || dto.name.trim().length === 0) {
      throw new Error("VALIDATION_ERROR: Fund name is required.");
    }
    if (!dto.fundType) {
      throw new Error("VALIDATION_ERROR: Fund type is required.");
    }
    if (dto.initialCapital !== undefined && dto.initialCapital < 0) {
      throw new Error("VALIDATION_ERROR: Initial capital cannot be negative.");
    }
  }

  public static validateAllocate(dto: AllocateFundDTO, sourceFund: FundAccount): void {
    if (sourceFund.status !== "ACTIVE") {
      throw new Error(`VALIDATION_ERROR: Source fund '${sourceFund.fundId}' is not ACTIVE (Status: ${sourceFund.status}).`);
    }

    if (dto.amount !== undefined) {
      if (dto.amount <= 0) {
        throw new Error("VALIDATION_ERROR: Allocation amount must be greater than zero.");
      }
      if (sourceFund.availableCapital < dto.amount) {
        throw new Error(
          `VALIDATION_ERROR: Insufficient available capital in fund '${sourceFund.fundId}'. Required: ₹${dto.amount}, Available: ₹${sourceFund.availableCapital}`
        );
      }
    }
  }

  public static validateReserve(dto: ReserveCapitalDTO, fund: FundAccount): void {
    if (fund.status !== "ACTIVE") {
      throw new Error(`VALIDATION_ERROR: Fund '${fund.fundId}' is not ACTIVE (Status: ${fund.status}).`);
    }
    if (!dto.amount || dto.amount <= 0) {
      throw new Error("VALIDATION_ERROR: Reservation amount must be greater than zero.");
    }
    if (!dto.purpose || dto.purpose.trim().length === 0) {
      throw new Error("VALIDATION_ERROR: Reservation purpose is required.");
    }
    if (fund.availableCapital < dto.amount) {
      throw new Error(
        `VALIDATION_ERROR: Insufficient available capital in fund '${fund.fundId}'. Requested reservation: ₹${dto.amount}, Available: ₹${fund.availableCapital}`
      );
    }
  }

  public static validateProhibitionCall(methodName: string): void {
    const prohibitedKeywords = ["trade", "order", "broker", "position", "market"];
    const lower = methodName.toLowerCase();
    if (prohibitedKeywords.some((kw) => lower.includes(kw))) {
      logger.error({ methodName }, "PROHIBITION_ERROR: Fund Manager attempted prohibited execution operation");
      throw new Error(`PROHIBITION_ERROR: Fund Manager Foundation is strictly prohibited from executing trades, creating broker orders, or updating market positions (Attempted: ${methodName}).`);
    }
  }
}
