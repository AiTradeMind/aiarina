import logger from '../../../lib/logger';

export interface MaintenanceWindow {
  id: string;
  title: string;
  description: string;
  scheduledStart: Date;
  scheduledEnd: Date;
  status: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdBy: string;
}

export class MaintenanceModeEngine {
  private static instance: MaintenanceModeEngine;
  private globalMaintenanceActive: boolean = false;
  private readOnlyModeActive: boolean = false;
  private emergencyMaintenanceActive: boolean = false;
  private maintenanceBannerMessage: string = '';
  private maintenanceWindows: MaintenanceWindow[] = [
    {
      id: 'maint_001',
      title: 'Weekly Knowledge Graph Index Rebalance',
      description: 'Scheduled maintenance for AI embedding index optimization and vector store cleanup.',
      scheduledStart: new Date(Date.now() + 3600000 * 12),
      scheduledEnd: new Date(Date.now() + 3600000 * 14),
      status: 'SCHEDULED',
      createdBy: 'sys-admin@arinasys.internal'
    }
  ];

  private constructor() {}

  public static getInstance(): MaintenanceModeEngine {
    if (!MaintenanceModeEngine.instance) {
      MaintenanceModeEngine.instance = new MaintenanceModeEngine();
    }
    return MaintenanceModeEngine.instance;
  }

  public setGlobalMaintenance(active: boolean, message: string = ''): void {
    this.globalMaintenanceActive = active;
    this.maintenanceBannerMessage = message;
    logger.warn({ active, message }, 'Global Maintenance Mode updated');
  }

  public setReadOnlyMode(active: boolean): void {
    this.readOnlyModeActive = active;
    logger.warn({ active }, 'Read Only Mode updated');
  }

  public setEmergencyMaintenance(active: boolean, message: string = ''): void {
    this.emergencyMaintenanceActive = active;
    this.maintenanceBannerMessage = message || 'EMERGENCY MAINTENANCE IN PROGRESS';
    logger.error({ active, message }, 'Emergency Maintenance state updated');
  }

  public getStatus() {
    return {
      globalMaintenanceActive: this.globalMaintenanceActive,
      readOnlyModeActive: this.readOnlyModeActive,
      emergencyMaintenanceActive: this.emergencyMaintenanceActive,
      bannerMessage: this.maintenanceBannerMessage,
      maintenanceWindows: this.maintenanceWindows
    };
  }

  public addMaintenanceWindow(window: Omit<MaintenanceWindow, 'id'>): MaintenanceWindow {
    const id = `maint_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newWindow: MaintenanceWindow = { ...window, id };
    this.maintenanceWindows.push(newWindow);
    logger.info({ windowId: id }, 'Maintenance window scheduled');
    return newWindow;
  }
}
