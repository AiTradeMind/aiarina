import { Request, Response } from "express";
import { TournamentService } from "../services/index.ts";
import { runSafeStartupSeed } from "../../../../db/client";

const tournamentService = new TournamentService();

// Seed mock data safely behind connection verification
runSafeStartupSeed(() => tournamentService.seedInitialData());

export class TournamentController {
  async getTournaments(req: Request, res: Response) {
    try {
      const tournaments = await tournamentService.getTournaments();
      res.json(tournaments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getSeasons(req: Request, res: Response) {
    try {
      const seasons = await tournamentService.getSeasons();
      res.json(seasons);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getMatches(req: Request, res: Response) {
    try {
      const matches = await tournamentService.getMatches();
      res.json(matches);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getResults(req: Request, res: Response) {
    try {
      const results = await tournamentService.getResults();
      res.json(results);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getScoreboards(req: Request, res: Response) {
    try {
      const scoreboards = await tournamentService.getScoreboards();
      res.json(scoreboards);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async createTournament(req: Request, res: Response) {
    try {
      const { name, type, seasonId } = req.body;
      const tournament = await tournamentService.createTournament(name, type, seasonId);
      res.json({ success: true, tournament });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async startTournament(req: Request, res: Response) {
    try {
      const { id } = req.body;
      const result = await tournamentService.startTournament(id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async simulateTournament(req: Request, res: Response) {
    try {
      const { id } = req.body;
      const result = await tournamentService.simulateTournament(id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async finishTournament(req: Request, res: Response) {
    try {
      const { id } = req.body;
      const result = await tournamentService.finishTournament(id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
