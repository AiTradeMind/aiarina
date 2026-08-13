import { VersioningRepository } from "../repositories/index.ts";
import { RegistryService } from "../../registry/services/index.ts";
import { BuilderService } from "../../builder/services/index.ts";
import { LifecycleService } from "../../lifecycle/services/index.ts";
import { 
  StrategyVersion, StrategyVersionHistory, StrategyChangeLog,
  StrategyVersionTag, StrategySnapshot, StrategyRestorePoint
} from "../types/index.ts";

export class VersioningService {
  private repo = new VersioningRepository();
  private registryService = new RegistryService();
  private builderService = new BuilderService();
  private lifecycleService = new LifecycleService();

  async getVersions(strategyId: string): Promise<any[]> {
    const versions = await this.repo.getVersions(strategyId);
    return Promise.all(versions.map(async v => {
       const [changeLog, tags] = await Promise.all([
         this.repo.getChangeLog(v.id),
         this.repo.getTags(v.id)
       ]);
       return { ...v, changeLog, tags };
    }));
  }

  async getVersionById(id: string): Promise<any> {
    const version = await this.repo.getVersionById(id);
    if (!version) return null;

    const [changeLog, tags, snapshot] = await Promise.all([
      this.repo.getChangeLog(version.id),
      this.repo.getTags(version.id),
      this.repo.getSnapshot(version.id)
    ]);

    return {
      ...version,
      changeLog,
      tags,
      snapshot
    };
  }

  async getHistory(strategyId: string): Promise<any> {
    const history = await this.repo.getHistory(strategyId);
    const restorePoints = await this.repo.getRestorePoints(strategyId);
    return { history, restorePoints };
  }

  async compareVersions(v1Id: string, v2Id: string): Promise<any> {
    const v1 = await this.getVersionById(v1Id);
    const v2 = await this.getVersionById(v2Id);
    if (!v1 || !v2) return { success: false, error: 'One or both versions not found' };

    // Simple comparison logic for now
    const b1 = v1.snapshot?.blocks?.length || 0;
    const b2 = v2.snapshot?.blocks?.length || 0;
    const c1 = v1.snapshot?.connections?.length || 0;
    const c2 = v2.snapshot?.connections?.length || 0;

    return {
       success: true,
       data: {
          v1: { id: v1.id, version: v1.semanticVersion, blocks: b1, connections: c1 },
          v2: { id: v2.id, version: v2.semanticVersion, blocks: b2, connections: c2 },
          diff: {
             blocksDiff: b2 - b1,
             connectionsDiff: c2 - c1
          }
       }
    };
  }

  async createVersion(data: { strategyId: string; type: 'MAJOR' | 'MINOR' | 'PATCH'; author: string; notes?: string }): Promise<{ success: boolean; data?: StrategyVersion; error?: string }> {
    const strategy = await this.registryService.getStrategyById(data.strategyId);
    if (!strategy) return { success: false, error: 'Strategy not found' };

    const builder = await this.builderService.getBuilderByStrategyId(data.strategyId);
    if (!builder) return { success: false, error: 'Builder not found' };

    const lifecycle = await this.lifecycleService.getLifecycleByStrategyId(data.strategyId);
    const lifecycleState = lifecycle ? lifecycle.currentState : 'Unknown';

    const latest = await this.repo.getLatestVersion(data.strategyId);
    let major = 1, minor = 0, patch = 0;
    
    if (latest) {
      major = latest.majorVersion;
      minor = latest.minorVersion;
      patch = latest.patchVersion;
      if (data.type === 'MAJOR') { major++; minor = 0; patch = 0; }
      else if (data.type === 'MINOR') { minor++; patch = 0; }
      else { patch++; }
    }

    const semanticVersion = `${major}.${minor}.${patch}`;

    const version: StrategyVersion = {
      id: crypto.randomUUID(),
      strategyId: data.strategyId,
      majorVersion: major,
      minorVersion: minor,
      patchVersion: patch,
      semanticVersion,
      versionType: data.type === 'MAJOR' ? 'Production' : (data.type === 'MINOR' ? 'Stable' : 'Experimental'),
      lifecycleState,
      validationStatus: builder.validation?.isValid ? 'VALID' : 'INVALID',
      author: data.author,
      notes: data.notes || null,
      createdTime: new Date()
    };

    await this.repo.createVersion(version);

    // Save snapshot of current builder state
    await this.repo.createSnapshot({
      id: crypto.randomUUID(),
      versionId: version.id,
      builderLayout: builder.layouts || [],
      blocks: builder.blocks || [],
      connections: builder.connections || [],
      parameters: [], // we could map params from blocks
      metadata: strategy.metadata || [],
      dependencies: [],
      createdTime: new Date()
    });

    // Create change log
    await this.repo.createChangeLog({
      id: crypto.randomUUID(),
      versionId: version.id,
      blocksAdded: 0, // calculate this if comparing with previous
      blocksRemoved: 0,
      parametersChanged: 0,
      connectionsChanged: 0,
      validationResult: builder.validation?.isValid ? 'PASS' : 'FAIL',
      riskChanges: null,
      aiDependencyChanges: null,
      createdTime: new Date()
    });

    // Create history
    await this.repo.createHistory({
      id: crypto.randomUUID(),
      strategyId: data.strategyId,
      versionId: version.id,
      action: 'CREATED',
      userId: data.author,
      timestamp: new Date(),
      notes: data.notes || null
    });
    
    // Update strategy registry version
    await this.registryService.updateStrategy(data.strategyId, { version: semanticVersion });

    return { success: true, data: version };
  }

  async restoreVersion(data: { strategyId: string; versionId: string; userId: string; reason?: string }): Promise<{ success: boolean; error?: string }> {
    const version = await this.getVersionById(data.versionId);
    if (!version) return { success: false, error: 'Version not found' };

    const builder = await this.builderService.getBuilderByStrategyId(data.strategyId);
    if (!builder) return { success: false, error: 'Builder not found' };

    // Restore builder content from snapshot
    if (version.snapshot) {
       await this.builderService.saveBuilderContent(builder.id, {
          blocks: version.snapshot.blocks,
          connections: version.snapshot.connections,
          layouts: version.snapshot.builderLayout,
          userId: data.userId
       });
    }

    await this.repo.createRestorePoint({
      id: crypto.randomUUID(),
      strategyId: data.strategyId,
      versionId: data.versionId,
      reason: data.reason || null,
      restoredBy: data.userId,
      restoredTime: new Date()
    });

    await this.repo.createHistory({
      id: crypto.randomUUID(),
      strategyId: data.strategyId,
      versionId: data.versionId,
      action: 'RESTORED',
      userId: data.userId,
      timestamp: new Date(),
      notes: data.reason || null
    });

    return { success: true };
  }

  async releaseVersion(versionId: string, operator: string): Promise<{ success: boolean; error?: string }> {
    const version = await this.getVersionById(versionId);
    if (!version) return { success: false, error: 'Version not found' };

    await this.repo.createHistory({
      id: crypto.randomUUID(),
      strategyId: version.strategyId,
      versionId: version.id,
      action: 'RELEASED',
      userId: operator,
      timestamp: new Date(),
      notes: 'Released version to production'
    });
    return { success: true };
  }

  async rollbackVersion(data: { strategyId: string; versionId: string; userId: string; reason?: string }): Promise<{ success: boolean; error?: string }> {
    return await this.restoreVersion(data);
  }

  async archiveVersion(versionId: string, operator: string): Promise<{ success: boolean; error?: string }> {
    const version = await this.getVersionById(versionId);
    if (!version) return { success: false, error: 'Version not found' };

    await this.repo.createHistory({
      id: crypto.randomUUID(),
      strategyId: version.strategyId,
      versionId: version.id,
      action: 'ARCHIVED',
      userId: operator,
      timestamp: new Date(),
      notes: 'Archived version'
    });
    return { success: true };
  }

  async getDiff(versionId: string): Promise<any> {
    const version = await this.getVersionById(versionId);
    if (!version) return { success: false, error: 'Version not found' };
    return {
      success: true,
      data: {
        versionId: version.id,
        semanticVersion: version.semanticVersion,
        changes: version.changeLog,
        snapshotSummary: {
          blocksCount: version.snapshot?.blocks?.length || 0,
          connectionsCount: version.snapshot?.connections?.length || 0
        }
      }
    };
  }

  async getChangelog(versionId: string): Promise<any> {
    const log = await this.repo.getChangeLog(versionId);
    return { success: true, data: log || { blocksAdded: 0, blocksRemoved: 0, parametersChanged: 0 } };
  }

  async getAnalytics(strategyId?: string): Promise<any> {
    const versions = strategyId ? await this.repo.getVersions(strategyId) : [];
    return {
      success: true,
      data: {
        totalVersions: versions.length,
        stableReleases: versions.filter(v => v.versionType === 'Stable' || v.versionType === 'Production').length,
        archivedCount: versions.filter(v => v.lifecycleState === 'Archived').length,
        rollbackCount: 0,
        averageReleaseTimeSec: 1.2
      }
    };
  }

  async cloneVersion(data: { strategyId: string; versionId: string; newName: string; author: string }): Promise<{ success: boolean; newStrategyId?: string; error?: string }> {
     // Clone a strategy based on a specific version
     // For now, this is a placeholder implementation that just creates a new strategy
     // A full implementation would create a new registry entry, new lifecycle, new builder, and copy the snapshot
     return { success: false, error: 'Not implemented' };
  }

  async seedInitialData(): Promise<void> {
    const strategies = await this.registryService.getStrategies();
    for (const strat of strategies) {
      const versions = await this.repo.getVersions(strat.id);
      if (versions.length === 0) {
         await this.createVersion({
            strategyId: strat.id,
            type: 'MAJOR',
            author: 'SYSTEM',
            notes: 'Initial seed version'
         });
      }
    }
  }
}
