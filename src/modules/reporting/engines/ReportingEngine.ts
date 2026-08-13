import { reportingRepository } from "../repositories/ReportingRepository";
import { v4 as uuidv4 } from "uuid";

export class ReportingEngine {
  async generateReport(type: string, data: any): Promise<any> {
    await reportingRepository.ensureTables();
    return { id: uuidv4(), type, data, createdAt: new Date() };
  }
}

export const reportingEngine = new ReportingEngine();
