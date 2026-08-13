export class LearningValidator {
  public validateOrganizationId(organizationId?: string): void {
    if (!organizationId) {
      throw new Error("Organization ID is required for learning module operations.");
    }
  }
}

export const learningValidator = new LearningValidator();
