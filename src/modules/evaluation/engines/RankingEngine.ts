export class RankingEngine {
  async generateRankings(type: string): Promise<any> {
    return { ranked: true };
  }
}
export const rankingEngine = new RankingEngine();
