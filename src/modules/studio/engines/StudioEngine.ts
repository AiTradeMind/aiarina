import { studioRepository } from "../repositories/StudioRepository";
import { v4 as uuidv4 } from "uuid";

export class StudioEngine {
  async getSnapshot(type: string): Promise<any> {
    await studioRepository.ensureTables();
    return { id: uuidv4(), type, data: { message: "Studio snapshot data" }, createdAt: new Date() };
  }
}

export const studioEngine = new StudioEngine();
