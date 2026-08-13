export interface TournamentSeason {
  id: string;
  name: string;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
  championId: string | null;
  runnerUpId: string | null;
  mvpId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AiTournament {
  id: string;
  seasonId: string;
  name: string;
  type: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TournamentRound {
  id: string;
  tournamentId: string;
  name: string;
  sequence: number;
  status: string;
  createdAt: Date;
}

export interface TournamentMatch {
  id: string;
  roundId: string;
  participantA: string;
  participantB: string;
  status: string;
  winnerId: string | null;
  loserId: string | null;
  isDraw: boolean;
  matchData: any;
  createdAt: Date;
  completedAt: Date | null;
}

export interface TournamentResult {
  id: string;
  matchId: string;
  participantId: string;
  score: number;
  confidence: number;
  roi: number;
  sharpe: number;
  drawdown: number;
  accuracy: number;
  riskScore: number;
  executionTimeMs: number;
  tokenUsage: number;
  timestamp: Date;
}

export interface TournamentScoreboard {
  id: string;
  seasonId: string;
  participantId: string;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  points: number;
  ranking: number;
  currentStreak: number;
  bestStreak: number;
  updatedAt: Date;
}
