import { securityEngine } from "../engines/SecurityEngine";

export class SecurityService {
  async getStatus(): Promise<any> {
    return await securityEngine.getStatus();
  }

  async getEvents(): Promise<any> {
    return await securityEngine.getEvents();
  }

  async getThreats(): Promise<any> {
    return await securityEngine.getThreats();
  }

  async getAlerts(): Promise<any> {
    return await securityEngine.getAlerts();
  }

  async getSessions(): Promise<any> {
    return await securityEngine.getSessions();
  }

  async getDevices(): Promise<any> {
    return await securityEngine.getDevices();
  }

  async getMetrics(): Promise<any> {
    return await securityEngine.getMetrics();
  }

  async getPolicies(): Promise<any> {
    return await securityEngine.getPolicies();
  }

  async verifyAccess(data: any): Promise<any> {
    return await securityEngine.verifyAccess(data);
  }
}

export const securityService = new SecurityService();
