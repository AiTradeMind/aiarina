import { TournamentRepository } from "../repositories/index.ts";
import { 
  TournamentSeason, AiTournament, TournamentRound, TournamentMatch, TournamentResult, TournamentScoreboard 
} from "../types/index.ts";
import { randomUUID } from "crypto";

export class TournamentService {
  private repo = new TournamentRepository();

  async getSeasons(): Promise<TournamentSeason[]> {
    return await this.repo.getSeasons();
  }

  async getTournaments(): Promise<AiTournament[]> {
    return await this.repo.getTournaments();
  }

  async getMatches(): Promise<TournamentMatch[]> {
    return await this.repo.getMatches();
  }

  async getResults(): Promise<TournamentResult[]> {
    return await this.repo.getResults();
  }

  async getScoreboards(): Promise<TournamentScoreboard[]> {
    return await this.repo.getScoreboards();
  }

  async createTournament(name: string, type: string, seasonId: string): Promise<AiTournament> {
    const tournament: AiTournament = {
      id: randomUUID(),
      seasonId,
      name,
      type,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await this.repo.createTournament(tournament);
    return tournament;
  }

  async startTournament(tournamentId: string): Promise<{ success: boolean; message: string }> {
    console.log(`Starting tournament ${tournamentId}`);
    return { success: true, message: 'Tournament started' };
  }

  async simulateTournament(tournamentId: string): Promise<{ success: boolean; message: string }> {
    console.log(`Simulating tournament ${tournamentId}`);
    return { success: true, message: 'Simulation complete' };
  }

  async finishTournament(tournamentId: string): Promise<{ success: boolean; message: string }> {
    console.log(`Finishing tournament ${tournamentId}`);
    return { success: true, message: 'Tournament finished' };
  }

  async seedInitialData(): Promise<void> {
    const seasons = await this.repo.getSeasons();
    if (seasons.length > 0) return;

    const seasonId = randomUUID();
    const tournamentId = randomUUID();

    await this.repo.createSeason({
      id: seasonId,
      name: "Alpha Test Season",
      status: "ACTIVE",
      startDate: new Date(Date.now() - 86400000 * 7),
      endDate: new Date(Date.now() + 86400000 * 7),
      championId: null,
      runnerUpId: null,
      mvpId: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await this.repo.createTournament({
      id: tournamentId,
      seasonId,
      name: "Global Logic Benchmark",
      type: "BENCHMARK_CHALLENGE",
      status: "ONGOING",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await this.repo.createScoreboard({
      id: randomUUID(),
      seasonId,
      participantId: "gpt-4o",
      wins: 12,
      losses: 2,
      draws: 1,
      winRate: 0.8,
      points: 37,
      ranking: 1,
      currentStreak: 4,
      bestStreak: 7,
      updatedAt: new Date()
    });

    await this.repo.createScoreboard({
      id: randomUUID(),
      seasonId,
      participantId: "claude-3-5-sonnet",
      wins: 10,
      losses: 4,
      draws: 1,
      winRate: 0.66,
      points: 31,
      ranking: 2,
      currentStreak: 2,
      bestStreak: 5,
      updatedAt: new Date()
    });

    await this.repo.createMatch({
      id: randomUUID(),
      roundId: randomUUID(),
      participantA: "gpt-4o",
      participantB: "claude-3-5-sonnet",
      status: "COMPLETED",
      winnerId: "gpt-4o",
      loserId: "claude-3-5-sonnet",
      isDraw: false,
      matchData: { strategy: 'aggressive' },
      createdAt: new Date(),
      completedAt: new Date()
    });
  }
}
