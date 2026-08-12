import { FundRepository } from "../repositories/fund.repository.ts";
import { FundAccount, FundReservation, FundTransaction } from "../types/index.ts";
import { ReserveCapitalDTO } from "../dtos/fund.dto.ts";
import { FundValidator } from "../validators/fund.validator.ts";
import logger from "../../../lib/logger.ts";

export class ReservationEngineService {
  private static instance: ReservationEngineService;
  private repository: FundRepository;

  private constructor() {
    this.repository = FundRepository.getInstance();
  }

  public static getInstance(): ReservationEngineService {
    if (!ReservationEngineService.instance) {
      ReservationEngineService.instance = new ReservationEngineService();
    }
    return ReservationEngineService.instance;
  }

  public async createReservation(dto: ReserveCapitalDTO): Promise<FundReservation> {
    const fund = await this.repository.getAccountById(dto.fundId);
    if (!fund) {
      throw new Error(`RESERVATION_ERROR: Fund '${dto.fundId}' not found.`);
    }

    FundValidator.validateReserve(dto, fund);

    const reservationId = `RES-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    let expiresAt: Date | null = null;
    if (dto.expirationMinutes && dto.expirationMinutes > 0) {
      expiresAt = new Date(Date.now() + dto.expirationMinutes * 60 * 1000);
    }

    const reservation: FundReservation = {
      reservationId,
      fundId: fund.fundId,
      amount: dto.amount,
      purpose: dto.purpose,
      status: "RESERVED",
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Update fund capital balances
    fund.reservedCapital += dto.amount;
    fund.availableCapital -= dto.amount;

    await this.repository.saveAccount(fund);
    const saved = await this.repository.saveReservation(reservation);

    // Save audit transaction
    const tx: FundTransaction = {
      transactionId: `TX-RES-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      fundId: fund.fundId,
      operation: "RESERVE",
      amount: dto.amount,
      status: "SUCCESS",
      actorId: dto.actorId || "SYSTEM",
      metadata: { reservationId, purpose: dto.purpose },
    };
    await this.repository.saveTransaction(tx);

    logger.info(
      { reservationId, fundId: fund.fundId, amount: dto.amount, purpose: dto.purpose },
      "Capital Reservation Created Successfully"
    );

    return saved;
  }

  public async getReservationsForFund(fundId: string): Promise<FundReservation[]> {
    return this.repository.getReservations(fundId);
  }

  public async getReservationById(reservationId: string): Promise<FundReservation | null> {
    return this.repository.getReservationById(reservationId);
  }
}
