import { AICompletionResponse } from "../../types/index.ts";
import { RecommendationAction } from "../types/index.ts";

export class ConsensusEngine {
  /**
   * Aggregates multiple AI responses to find a consensus.
   * For this implementation, we look for majority agreement on the 'action' field in the response JSON.
   */
  async resolve(responses: AICompletionResponse[]): Promise<{
    decision: any;
    confidence: number;
    metadata: any;
  }> {
    const votes: Record<string, number> = {};
    const parsedResponses: any[] = [];

    for (const res of responses) {
      try {
        // Assume the provider returns a JSON string that can be parsed
        // In a real app, the adapter would handle this, but here we simulate
        // finding a specific pattern if it's not pure JSON.
        const cleaned = res.text.includes('{') ? res.text.substring(res.text.indexOf('{'), res.text.lastIndexOf('}') + 1) : null;
        const parsed = cleaned ? JSON.parse(cleaned) : { action: 'NEUTRAL', rationale: res.text };
        
        parsedResponses.push(parsed);
        const action = parsed.action || 'NEUTRAL';
        votes[action] = (votes[action] || 0) + 1;
      } catch (e) {
        votes['NEUTRAL'] = (votes['NEUTRAL'] || 0) + 1;
      }
    }

    // Find majority
    let topAction = 'NEUTRAL';
    let maxVotes = 0;
    for (const [action, count] of Object.entries(votes)) {
      if (count > maxVotes) {
        maxVotes = count;
        topAction = action;
      }
    }

    const confidence = maxVotes / responses.length;
    
    // Aggregated rationale
    const rationales = parsedResponses.map(p => p.rationale).filter(Boolean);

    return {
      decision: {
        action: topAction,
        rationale: rationales.join(' | '),
        votes
      },
      confidence,
      metadata: {
        voterCount: responses.length,
        agreement: votes
      }
    };
  }
}
