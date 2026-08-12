import { operationsEngine } from "../engines/OperationsEngine";

export class OperationsService {
  async getDashboard(): Promise<any> {
    return await operationsEngine.getDashboard();
  }

  async getStatus(): Promise<any> {
    return await operationsEngine.getStatus();
  }

  async updateLayout(config: any): Promise<any> {
    return await operationsEngine.updateLayout(config);
  }
}

export const operationsService = new OperationsService();
