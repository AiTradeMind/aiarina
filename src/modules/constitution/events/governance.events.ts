import { GOVERNANCE_EVENT_TYPES } from "../constants/index.ts";

export type GovernanceEventType = typeof GOVERNANCE_EVENT_TYPES[keyof typeof GOVERNANCE_EVENT_TYPES];

export interface GovernanceEventPayload<T = Record<string, any>> {
  eventId: string;
  eventType: GovernanceEventType;
  timestamp: string;
  sourceModule: string;
  versionId: string;
  operator: string;
  data: T;
}

/**
 * Governance Event Construction Utility
 */
export class GovernanceEvents {
  public static createEvent<T = Record<string, any>>(
    eventType: GovernanceEventType,
    sourceModule: string,
    versionId: string,
    operator: string,
    data: T
  ): GovernanceEventPayload<T> {
    return {
      eventId: `EVT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      eventType,
      timestamp: new Date().toISOString(),
      sourceModule,
      versionId,
      operator,
      data,
    };
  }
}
