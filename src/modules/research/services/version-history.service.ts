import { ResearchVersionRecord } from "../types/index.ts";

export class VersionHistoryService {
  private static versionStore: Map<string, ResearchVersionRecord[]> = new Map();

  public createVersion(
    researchId: string,
    content: string,
    author: string,
    summary?: string,
    rollbackMetadata?: Record<string, any>
  ): ResearchVersionRecord {
    const existing = VersionHistoryService.versionStore.get(researchId) || [];
    const versionNumber = existing.length + 1;
    const previousVersionId = existing.length > 0 ? existing[existing.length - 1].versionId : undefined;
    const versionId = `VER-${researchId}-v${versionNumber}`;

    const version: ResearchVersionRecord = {
      versionId,
      researchId,
      versionNumber,
      previousVersionId,
      content,
      summary,
      author,
      rollbackMetadata,
      createdAt: new Date(),
    };

    existing.push(version);
    VersionHistoryService.versionStore.set(researchId, existing);

    return version;
  }

  public getVersions(researchId: string): ResearchVersionRecord[] {
    const versions = VersionHistoryService.versionStore.get(researchId) || [];
    return [...versions].sort((a, b) => b.versionNumber - a.versionNumber);
  }

  public getVersionById(researchId: string, versionId: string): ResearchVersionRecord | null {
    const versions = VersionHistoryService.versionStore.get(researchId) || [];
    return versions.find((v) => v.versionId === versionId) || null;
  }
}
