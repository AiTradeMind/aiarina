export class SimulationEngine {
  runSimulation(data: any[], config: any): any {
    // Execute virtual orders, calculate PnL, etc.
    return { roi: 0, netPnl: 0 };
  }
}

export const simulationEngine = new SimulationEngine();
