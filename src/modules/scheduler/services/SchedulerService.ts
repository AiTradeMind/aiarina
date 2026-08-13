import { schedulerEngine } from "../engines/SchedulerEngine";

export class SchedulerService {
  async getStatus(): Promise<any> {
    return { status: "OK", timestamp: new Date() };
  }

  async createSchedule(data: any): Promise<any> {
    return await schedulerEngine.createSchedule(data);
  }

  async runSchedule(scheduleId: string): Promise<any> {
    return await schedulerEngine.runSchedule(scheduleId);
  }

  async pauseSchedule(scheduleId: string): Promise<any> {
    return await schedulerEngine.pauseSchedule(scheduleId);
  }

  async resumeSchedule(scheduleId: string): Promise<any> {
    return await schedulerEngine.resumeSchedule(scheduleId);
  }

  async cancelSchedule(scheduleId: string): Promise<any> {
    return await schedulerEngine.cancelSchedule(scheduleId);
  }
}

export const schedulerService = new SchedulerService();
