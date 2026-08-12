import crypto from "crypto";
import { idempotencyRepository } from "../repositories/IdempotencyRepository.ts";
import { IOrderIdempotency } from "../types/index.ts";

export class IdempotencyService {
  public generateHash(payload: any): string {
    return crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
  }

  public async getExistingRequest(idempotencyKey: string, organizationId: string): Promise<IOrderIdempotency | null> {
    return await idempotencyRepository.getByIdempotencyKey(idempotencyKey, organizationId);
  }

  public async saveResponse(
    idempotencyKey: string,
    organizationId: string,
    payload: any,
    responseStatus: number,
    responseBody: any
  ): Promise<void> {
    const requestHash = this.generateHash(payload);
    await idempotencyRepository.saveIdempotency({
      idempotencyKey,
      organizationId,
      requestHash,
      responseStatus,
      responseBody,
      createdAt: new Date(),
    });
  }

  public validateHash(existingRecord: IOrderIdempotency, payload: any): void {
    const currentHash = this.generateHash(payload);
    if (existingRecord.requestHash !== currentHash) {
      throw new Error("Idempotency Error: Payload mismatch for existing idempotency key");
    }
  }
}

export const idempotencyService = new IdempotencyService();
