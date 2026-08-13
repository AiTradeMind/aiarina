export type MarketStatusType = 'PRE_OPEN' | 'OPEN' | 'AUCTION' | 'CLOSED' | 'AFTER_MARKET';

export interface ExchangeHoliday {
  date: string; // YYYY-MM-DD
  name: string;
}

export interface TradingSessionMetadata {
  id: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  isSimulation: boolean;
}

export interface SessionClockState {
  currentVirtualTime: string; // ISO string
  speed: number; // e.g. 1, 5, 10, 60, 3600
  isPaused: boolean;
  marketStatus: MarketStatusType;
}

export interface SimulationSession {
  id: string;
  organizationId: string;
  name: string;
  status: 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'FAILED';
  startVirtualTime: string;
  endVirtualTime: string;
  currentVirtualTime: string;
  speedMultiplier: number;
  createdAt: string;
}
