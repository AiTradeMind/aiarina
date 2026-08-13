export class DashboardCacheManager {
  async cacheData(cacheKey: string, cacheData: any): Promise<void> {
    // Repository call to save cache
  }
}
export const dashboardCacheManager = new DashboardCacheManager();
