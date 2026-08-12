import { BrainRepository } from "../repositories/brain.repository.ts";
import { MEMORY_TYPES, MemoryTypeValue, BRAIN_ERRORS } from "../constants/index.ts";
import { BrainMemoryRecord, StoreMemoryDTO, QueryMemoryDTO } from "../types/index.ts";
import logger from "../../../lib/logger.ts";

export class MemoryManagerService {
  private repo: BrainRepository;

  constructor(repo?: BrainRepository) {
    this.repo = repo || new BrainRepository();
  }

  /**
   * Store a memory record in Working, Short-Term, Long-Term, Session, Historical, or Cache memory
   */
  public async storeMemory(dto: StoreMemoryDTO): Promise<BrainMemoryRecord> {
    if (!dto.memoryType || !Object.values(MEMORY_TYPES).includes(dto.memoryType as any)) {
      throw new Error(BRAIN_ERRORS.INVALID_MEMORY_TYPE);
    }
    if (!dto.key || dto.value === undefined) {
      throw new Error("Memory key and value are required to store memory.");
    }

    const record = await this.repo.storeMemory(dto);
    logger.info(
      { type: "MEMORY_STORED", memoryId: record.memoryId, memoryType: record.memoryType, key: record.key },
      "Memory record successfully stored in AI Brain Memory Manager"
    );
    return record;
  }

  /**
   * Get memory record by key
   */
  public async getMemoryByKey(key: string): Promise<BrainMemoryRecord | null> {
    const memory = await this.repo.getMemoryByKey(key);
    if (memory) {
      logger.info({ type: "MEMORY_RETRIEVED", memoryId: memory.memoryId, key }, "Memory retrieved from AI Brain Memory Manager");
    }
    return memory;
  }

  /**
   * Query memory records with filters
   */
  public async queryMemory(query: QueryMemoryDTO = {}): Promise<BrainMemoryRecord[]> {
    return await this.repo.queryMemory(query);
  }

  /**
   * Get memory records by session ID
   */
  public async getMemoryBySession(sessionId: string): Promise<BrainMemoryRecord[]> {
    return await this.queryMemory({ sessionId });
  }

  /**
   * Quick cache store helper
   */
  public async cacheKnowledge(key: string, data: any, ttlSeconds: number = 3600): Promise<BrainMemoryRecord> {
    return await this.storeMemory({
      memoryType: MEMORY_TYPES.CACHE,
      key,
      value: data,
      ttl: ttlSeconds,
      metadata: { cachedAt: new Date().toISOString() },
    });
  }

  /**
   * Returns supported Memory Types
   */
  public getMemoryTypes(): string[] {
    return Object.values(MEMORY_TYPES);
  }
}
