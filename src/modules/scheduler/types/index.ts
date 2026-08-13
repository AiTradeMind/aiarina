export interface Schedule {
  id: string;
  name: string;
  cronExpression?: string;
  type: 'CRON' | 'RECURRING' | 'ONE_TIME';
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED';
  createdAt: Date;
}

export interface ScheduleRun {
  id: string;
  scheduleId: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  startedAt: Date;
  completedAt?: Date;
}
