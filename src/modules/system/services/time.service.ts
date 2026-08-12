export class TimeService {
  getSystemTimes() {
    const now = new Date();
    
    // IST Market Time (Asia/Kolkata)
    const marketTimeIST = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    
    return {
      utc: now.toISOString(),
      serverTime: now.toISOString(),
      businessTime: now.toISOString().split("T")[0],
      marketTime: marketTimeIST.toISOString(),
      auditTime: now.getTime(),
      timezone: "Asia/Kolkata",
    };
  }

  getAuditTimestamp(): number {
    return Date.now();
  }
}

export const timeService = new TimeService();
