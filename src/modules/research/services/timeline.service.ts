import { ResearchTimelineEvent } from "../types/index.ts";

export class ResearchTimelineService {
  private static timelineStore: Map<string, ResearchTimelineEvent[]> = new Map();

  public addEvent(
    researchId: string,
    eventType: ResearchTimelineEvent["eventType"],
    description: string,
    author: string = "SYSTEM",
    metadata?: Record<string, any>
  ): ResearchTimelineEvent {
    const eventId = `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const event: ResearchTimelineEvent = {
      eventId,
      researchId,
      eventType,
      description,
      author,
      timestamp: new Date(),
      metadata,
    };

    const list = ResearchTimelineService.timelineStore.get(researchId) || [];
    list.push(event);
    ResearchTimelineService.timelineStore.set(researchId, list);

    return event;
  }

  public getTimeline(researchId: string): ResearchTimelineEvent[] {
    const events = ResearchTimelineService.timelineStore.get(researchId) || [];
    return [...events].reverse();
  }
}
