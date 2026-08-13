export class ExplanationVersionManager {
  async trackVersion(decisionId: string, versionData: any): Promise<void> {
    // Repository call to save version
  }
}
export const explanationVersionManager = new ExplanationVersionManager();
