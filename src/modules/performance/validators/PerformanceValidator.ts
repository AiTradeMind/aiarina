export class PerformanceValidator {
  public validateQuery(organizationId?: string, entityType?: string) {
    if (!organizationId) {
       throw new Error("Organization ID is required.");
    }
    if (entityType && !['AI_MODEL', 'STRATEGY', 'PORTFOLIO', 'MARKET', 'ORGANIZATION'].includes(entityType)) {
       throw new Error("Invalid entity type.");
    }
  }
}

export const performanceValidator = new PerformanceValidator();
