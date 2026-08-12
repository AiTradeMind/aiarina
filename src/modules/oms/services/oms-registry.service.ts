import { OMSOrder, OrderStatus } from "../types/index.ts";

export interface OMSRegisteredComponent {
  componentName: string;
  version: string;
  status: "ONLINE" | "OFFLINE" | "DEGRADED";
  lastCheck: string;
}

export class OMSRegistryService {
  private static instance: OMSRegistryService;
  private registeredComponents: Map<string, OMSRegisteredComponent> = new Map();

  constructor() {
    this.registerComponent("OrderValidator", "2.10.0", "ONLINE");
    this.registerComponent("ExecutionValidator", "2.10.0", "ONLINE");
    this.registerComponent("OrderStateMachine", "2.10.0", "ONLINE");
    this.registerComponent("OrderLifecycleManager", "2.10.0", "ONLINE");
    this.registerComponent("OMSPipeline", "2.10.0", "ONLINE");
  }

  static getInstance(): OMSRegistryService {
    if (!OMSRegistryService.instance) {
      OMSRegistryService.instance = new OMSRegistryService();
    }
    return OMSRegistryService.instance;
  }

  registerComponent(name: string, version: string, status: "ONLINE" | "OFFLINE" | "DEGRADED" = "ONLINE") {
    this.registeredComponents.set(name, {
      componentName: name,
      version,
      status,
      lastCheck: new Date().toISOString(),
    });
  }

  getComponents(): OMSRegisteredComponent[] {
    return Array.from(this.registeredComponents.values());
  }

  isSystemReady(): boolean {
    const components = this.getComponents();
    return components.every((c) => c.status === "ONLINE");
  }
}
