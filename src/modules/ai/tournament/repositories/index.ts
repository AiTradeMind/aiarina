import { getDb } from "../../../../db/client.ts";
import { 
  tournamentSeasons, aiTournaments, tournamentRounds, tournamentMatches, tournamentResults, tournamentScoreboards 
} from "../../../../db/schema.ts";
import { eq, desc, and } from "drizzle-orm";
import { 
  TournamentSeason, AiTournament, TournamentRound, TournamentMatch, TournamentResult, TournamentScoreboard 
} from "../types/index.ts";

export class TournamentRepository {
  async getSeasons(): Promise<TournamentSeason[]> {
    const db = await getDb();
    return await db.select().from(tournamentSeasons).orderBy(desc(tournamentSeasons.createdAt)) as TournamentSeason[];
  }

  async getTournaments(): Promise<AiTournament[]> {
    const db = await getDb();
    return await db.select().from(aiTournaments).orderBy(desc(aiTournaments.createdAt)) as AiTournament[];
  }

  async getMatches(): Promise<TournamentMatch[]> {
    const db = await getDb();
    return await db.select().from(tournamentMatches).orderBy(desc(tournamentMatches.createdAt)) as TournamentMatch[];
  }

  async getResults(): Promise<TournamentResult[]> {
    const db = await getDb();
    return await db.select().from(tournamentResults).orderBy(desc(tournamentResults.timestamp)) as TournamentResult[];
  }

  async getScoreboards(): Promise<TournamentScoreboard[]> {
    const db = await getDb();
    return await db.select().from(tournamentScoreboards).orderBy(tournamentScoreboards.ranking) as TournamentScoreboard[];
  }

  async createSeason(season: TournamentSeason): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(tournamentSeasons).values(season);
  }

  async createTournament(tournament: AiTournament): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(aiTournaments).values(tournament);
  }

  async createRound(round: TournamentRound): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(tournamentRounds).values(round);
  }

  async createMatch(match: TournamentMatch): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(tournamentMatches).values(match);
  }

  async createResult(result: TournamentResult): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(tournamentResults).values(result);
  }

  async createScoreboard(sb: TournamentScoreboard): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(tournamentScoreboards).values(sb);
  }
}
