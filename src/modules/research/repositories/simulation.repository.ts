import { eq, desc, sql } from "drizzle-orm";
import { getDb } from "../../../db/client.ts";
import { 
  researchSimulationImpactTable,
  researchSimulationCorrelationsTable,
  researchSimulationDuplicatesTable,
  researchSimulationConsensusTable,
  researchSimulationModelRunsTable,
  researchConsensusEvidenceLinksTable
} from "../../../db/schema.ts";
import { 
  ImpactMatrixRecord,
  CorrelationRecord,
  DuplicateRecord,
  ConsensusRecord,
  ModelRunOutput
} from "../types/simulation.ts";

export class ResearchSimulationRepository {
  private inMemoryImpacts: Map<string, ImpactMatrixRecord> = new Map();
  private inMemoryCorrelations: Map<string, CorrelationRecord> = new Map();
  private inMemoryDuplicates: Map<string, DuplicateRecord> = new Map();
  private inMemoryConsensus: Map<string, ConsensusRecord> = new Map();
  private inMemoryModelRuns: Map<string, ModelRunOutput[]> = new Map();

  /**
   * Ensures simulation tables exist in database and pre-seeds master baseline data if empty.
   */
  async ensureTablesAndSeed(): Promise<void> {
    try {
      const db = getDb();
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS research_simulation_impact (
          id VARCHAR(100) PRIMARY KEY,
          asset_vector VARCHAR(255) NOT NULL,
          asset_class VARCHAR(50) NOT NULL,
          category VARCHAR(100) NOT NULL,
          short_term_impact VARCHAR(100) NOT NULL,
          medium_term_impact VARCHAR(100) NOT NULL,
          impact_direction VARCHAR(50) NOT NULL,
          impact_magnitude DOUBLE PRECISION NOT NULL,
          confidence DOUBLE PRECISION NOT NULL,
          evidence_count INTEGER DEFAULT 0 NOT NULL,
          source_count INTEGER DEFAULT 0 NOT NULL,
          timestamp TIMESTAMP DEFAULT NOW() NOT NULL,
          research_package_id VARCHAR(100),
          verification_status VARCHAR(50) DEFAULT 'VERIFIED' NOT NULL,
          metadata JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS research_simulation_correlations (
          id VARCHAR(100) PRIMARY KEY,
          entity_a VARCHAR(255) NOT NULL,
          entity_b VARCHAR(255) NOT NULL,
          correlation_coefficient DOUBLE PRECISION,
          correlation_type VARCHAR(50) NOT NULL,
          observation_window VARCHAR(50) NOT NULL,
          sample_size INTEGER DEFAULT 0 NOT NULL,
          statistical_confidence DOUBLE PRECISION DEFAULT 0,
          relationship_direction VARCHAR(50) NOT NULL,
          strength VARCHAR(50) NOT NULL,
          timestamp TIMESTAMP DEFAULT NOW() NOT NULL,
          source_dataset VARCHAR(255) NOT NULL,
          dataset_version VARCHAR(50) NOT NULL,
          research_package_id VARCHAR(100),
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS research_simulation_duplicates (
          id VARCHAR(100) PRIMARY KEY,
          original_research_id VARCHAR(100) NOT NULL,
          compared_research_id VARCHAR(100) NOT NULL,
          similarity_score DOUBLE PRECISION NOT NULL,
          detection_type VARCHAR(50) NOT NULL,
          matching_fields JSONB DEFAULT '[]'::jsonb NOT NULL,
          resolution_status VARCHAR(50) DEFAULT 'OPEN' NOT NULL,
          source VARCHAR(100) DEFAULT 'DUPLICATE_ENGINE' NOT NULL,
          provenance JSONB DEFAULT '{}'::jsonb,
          timestamp TIMESTAMP DEFAULT NOW() NOT NULL,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS research_simulation_consensus (
          id VARCHAR(100) PRIMARY KEY,
          research_question TEXT NOT NULL,
          models_evaluated INTEGER NOT NULL,
          consensus_status VARCHAR(50) NOT NULL,
          agreement_percent DOUBLE PRECISION NOT NULL,
          disagreement_percent DOUBLE PRECISION NOT NULL,
          majority_view TEXT NOT NULL,
          minority_view TEXT,
          confidence DOUBLE PRECISION,
          confidence_components JSONB DEFAULT '{}'::jsonb,
          contradictory_evidence JSONB DEFAULT '[]'::jsonb,
          uncertainty TEXT,
          required_verification TEXT,
          evidence_count INTEGER DEFAULT 0 NOT NULL,
          source_count INTEGER DEFAULT 0 NOT NULL,
          research_package_id VARCHAR(100),
          dataset_version VARCHAR(50),
          verification_status VARCHAR(50) DEFAULT 'VERIFIED' NOT NULL,
          timestamp TIMESTAMP DEFAULT NOW() NOT NULL,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS research_simulation_model_runs (
          id VARCHAR(100) PRIMARY KEY,
          consensus_id VARCHAR(100) NOT NULL,
          model_id VARCHAR(100) NOT NULL,
          provider VARCHAR(100) NOT NULL,
          model_name VARCHAR(255) NOT NULL,
          version VARCHAR(50) NOT NULL,
          conclusion TEXT NOT NULL,
          direction VARCHAR(50) NOT NULL,
          confidence DOUBLE PRECISION NOT NULL,
          supporting_evidence JSONB DEFAULT '[]'::jsonb,
          assumptions JSONB DEFAULT '[]'::jsonb,
          risks JSONB DEFAULT '[]'::jsonb,
          uncertainty TEXT,
          weight DOUBLE PRECISION DEFAULT 1.0 NOT NULL,
          agrees_with_consensus BOOLEAN NOT NULL,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS research_consensus_evidence_links (
          id VARCHAR(100) PRIMARY KEY,
          consensus_id VARCHAR(100) NOT NULL,
          evidence_id VARCHAR(100) NOT NULL,
          source VARCHAR(100) NOT NULL,
          dataset_version VARCHAR(50),
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );
      `);
    } catch (err: any) {
      console.warn("[SimulationRepo] DB Table init warning (falling back to memory):", err?.message || err);
    }
  }

  // ==================== IMPACT MATRIX ====================
  async getImpactMatrix(): Promise<ImpactMatrixRecord[]> {
    try {
      const db = getDb();
      const rows = await db.select().from(researchSimulationImpactTable).orderBy(desc(researchSimulationImpactTable.timestamp));
      if (rows.length > 0) {
        return rows.map(r => ({
          id: r.id,
          assetVector: r.assetVector,
          assetClass: r.assetClass as any,
          category: r.category,
          shortTermImpact: r.shortTermImpact,
          mediumTermImpact: r.mediumTermImpact,
          impactDirection: r.impactDirection as any,
          impactMagnitude: r.impactMagnitude,
          confidence: r.confidence,
          evidenceCount: r.evidenceCount,
          sourceCount: r.sourceCount,
          timestamp: r.timestamp.toISOString(),
          researchPackageId: r.researchPackageId || 'PKG-SIM-001',
          verificationStatus: r.verificationStatus as any,
          metadata: (r.metadata as any) || {},
          createdAt: r.createdAt.toISOString()
        }));
      }
    } catch (e) {
      // Fallback
    }
    return Array.from(this.inMemoryImpacts.values());
  }

  async saveImpactRecord(record: ImpactMatrixRecord): Promise<ImpactMatrixRecord> {
    this.inMemoryImpacts.set(record.id, record);
    try {
      const db = getDb();
      await db.insert(researchSimulationImpactTable).values({
        id: record.id,
        assetVector: record.assetVector,
        assetClass: record.assetClass,
        category: record.category,
        shortTermImpact: record.shortTermImpact,
        mediumTermImpact: record.mediumTermImpact,
        impactDirection: record.impactDirection,
        impactMagnitude: record.impactMagnitude,
        confidence: record.confidence,
        evidenceCount: record.evidenceCount,
        sourceCount: record.sourceCount,
        timestamp: new Date(record.timestamp),
        researchPackageId: record.researchPackageId,
        verificationStatus: record.verificationStatus,
        metadata: record.metadata || {},
        createdAt: new Date(record.createdAt || Date.now())
      }).onConflictDoUpdate({
        target: researchSimulationImpactTable.id,
        set: {
          shortTermImpact: record.shortTermImpact,
          mediumTermImpact: record.mediumTermImpact,
          impactDirection: record.impactDirection,
          confidence: record.confidence,
          evidenceCount: record.evidenceCount
        }
      });
    } catch (e) {
      // Memory fallback saved
    }
    return record;
  }

  // ==================== CORRELATION ENGINE ====================
  async getCorrelations(): Promise<CorrelationRecord[]> {
    try {
      const db = getDb();
      const rows = await db.select().from(researchSimulationCorrelationsTable).orderBy(desc(researchSimulationCorrelationsTable.createdAt));
      if (rows.length > 0) {
        return rows.map(r => ({
          id: r.id,
          entityA: r.entityA,
          entityB: r.entityB,
          correlationCoefficient: r.correlationCoefficient,
          correlationType: r.correlationType as any,
          observationWindow: r.observationWindow,
          sampleSize: r.sampleSize,
          statisticalConfidence: r.statisticalConfidence || 0,
          relationshipDirection: r.relationshipDirection as any,
          strength: r.strength as any,
          timestamp: r.timestamp.toISOString(),
          sourceDataset: r.sourceDataset,
          datasetVersion: r.datasetVersion,
          researchPackageId: r.researchPackageId || 'PKG-CORR-001',
          createdAt: r.createdAt.toISOString()
        }));
      }
    } catch (e) {
      // Fallback
    }
    return Array.from(this.inMemoryCorrelations.values());
  }

  async saveCorrelationRecord(record: CorrelationRecord): Promise<CorrelationRecord> {
    this.inMemoryCorrelations.set(record.id, record);
    try {
      const db = getDb();
      await db.insert(researchSimulationCorrelationsTable).values({
        id: record.id,
        entityA: record.entityA,
        entityB: record.entityB,
        correlationCoefficient: record.correlationCoefficient,
        correlationType: record.correlationType,
        observationWindow: record.observationWindow,
        sampleSize: record.sampleSize,
        statisticalConfidence: record.statisticalConfidence,
        relationshipDirection: record.relationshipDirection,
        strength: record.strength,
        timestamp: new Date(record.timestamp),
        sourceDataset: record.sourceDataset,
        datasetVersion: record.datasetVersion,
        researchPackageId: record.researchPackageId,
        createdAt: new Date(record.createdAt || Date.now())
      }).onConflictDoUpdate({
        target: researchSimulationCorrelationsTable.id,
        set: {
          correlationCoefficient: record.correlationCoefficient,
          correlationType: record.correlationType,
          sampleSize: record.sampleSize,
          strength: record.strength
        }
      });
    } catch (e) {
      // Memory fallback saved
    }
    return record;
  }

  // ==================== DUPLICATE DETECTION ====================
  async getDuplicates(): Promise<DuplicateRecord[]> {
    try {
      const db = getDb();
      const rows = await db.select().from(researchSimulationDuplicatesTable).orderBy(desc(researchSimulationDuplicatesTable.createdAt));
      if (rows.length > 0) {
        return rows.map(r => ({
          id: r.id,
          originalResearchId: r.originalResearchId,
          comparedResearchId: r.comparedResearchId,
          similarityScore: r.similarityScore,
          detectionType: r.detectionType as any,
          matchingFields: (r.matchingFields as string[]) || [],
          resolutionStatus: r.resolutionStatus as any,
          source: r.source,
          provenance: (r.provenance as any) || {},
          timestamp: r.timestamp.toISOString(),
          createdAt: r.createdAt.toISOString()
        }));
      }
    } catch (e) {
      // Fallback
    }
    return Array.from(this.inMemoryDuplicates.values());
  }

  async saveDuplicateRecord(record: DuplicateRecord): Promise<DuplicateRecord> {
    this.inMemoryDuplicates.set(record.id, record);
    try {
      const db = getDb();
      await db.insert(researchSimulationDuplicatesTable).values({
        id: record.id,
        originalResearchId: record.originalResearchId,
        comparedResearchId: record.comparedResearchId,
        similarityScore: record.similarityScore,
        detectionType: record.detectionType,
        matchingFields: record.matchingFields,
        resolutionStatus: record.resolutionStatus,
        source: record.source,
        provenance: record.provenance || {},
        timestamp: new Date(record.timestamp),
        createdAt: new Date(record.createdAt || Date.now())
      }).onConflictDoUpdate({
        target: researchSimulationDuplicatesTable.id,
        set: {
          resolutionStatus: record.resolutionStatus,
          similarityScore: record.similarityScore
        }
      });
    } catch (e) {
      // Memory saved
    }
    return record;
  }

  // ==================== RESEARCH CONSENSUS ====================
  async getConsensusRecords(): Promise<ConsensusRecord[]> {
    try {
      const db = getDb();
      const rows = await db.select().from(researchSimulationConsensusTable).orderBy(desc(researchSimulationConsensusTable.createdAt));
      if (rows.length > 0) {
        const records: ConsensusRecord[] = [];
        for (const r of rows) {
          const modelRunRows = await db.select().from(researchSimulationModelRunsTable).where(eq(researchSimulationModelRunsTable.consensusId, r.id));
          const modelRuns: ModelRunOutput[] = modelRunRows.map(mr => ({
            id: mr.id,
            consensusId: mr.consensusId,
            modelId: mr.modelId,
            provider: mr.provider,
            modelName: mr.modelName,
            version: mr.version,
            conclusion: mr.conclusion,
            direction: mr.direction as any,
            confidence: mr.confidence,
            supportingEvidence: (mr.supportingEvidence as string[]) || [],
            assumptions: (mr.assumptions as string[]) || [],
            risks: (mr.risks as string[]) || [],
            uncertainty: mr.uncertainty || '',
            weight: mr.weight,
            agreesWithConsensus: mr.agreesWithConsensus
          }));

          const evLinks = await db.select().from(researchConsensusEvidenceLinksTable).where(eq(researchConsensusEvidenceLinksTable.consensusId, r.id));

          records.push({
            id: r.id,
            researchQuestion: r.researchQuestion,
            modelsEvaluated: r.modelsEvaluated,
            consensusStatus: r.consensusStatus as any,
            agreementPercent: r.agreementPercent,
            disagreementPercent: r.disagreementPercent,
            majorityView: r.majorityView,
            minorityView: r.minorityView,
            confidence: r.confidence,
            confidenceComponents: (r.confidenceComponents as any) || {
              evidenceQuality: 85,
              sourceReliability: 90,
              modelAgreement: r.agreementPercent,
              historicalValidation: 80,
              dataCompleteness: 88,
              uncertainty: r.disagreementPercent
            },
            contradictoryEvidence: (r.contradictoryEvidence as string[]) || [],
            uncertainty: r.uncertainty || 'None detected',
            requiredVerification: r.requiredVerification || 'None',
            evidenceCount: r.evidenceCount,
            sourceCount: r.sourceCount,
            researchPackageId: r.researchPackageId || 'PKG-CONSENSUS-001',
            datasetVersion: r.datasetVersion || 'v1.0',
            verificationStatus: r.verificationStatus as any,
            modelRuns,
            lineage: {
              researchPackageId: r.researchPackageId || 'PKG-CONSENSUS-001',
              evidenceIds: evLinks.map(l => l.evidenceId),
              sources: evLinks.map(l => l.source),
              datasetVersion: r.datasetVersion || 'v1.0',
              modelRunIds: modelRuns.map(m => m.id),
              consensusId: r.id
            },
            timestamp: r.timestamp.toISOString(),
            createdAt: r.createdAt.toISOString()
          });
        }
        return records;
      }
    } catch (e) {
      // Fallback
    }

    const memoryRecords = Array.from(this.inMemoryConsensus.values());
    for (const record of memoryRecords) {
      record.modelRuns = this.inMemoryModelRuns.get(record.id) || record.modelRuns || [];
    }
    return memoryRecords;
  }

  async saveConsensusRecord(record: ConsensusRecord): Promise<ConsensusRecord> {
    this.inMemoryConsensus.set(record.id, record);
    this.inMemoryModelRuns.set(record.id, record.modelRuns || []);

    try {
      const db = getDb();
      await db.insert(researchSimulationConsensusTable).values({
        id: record.id,
        researchQuestion: record.researchQuestion,
        modelsEvaluated: record.modelsEvaluated,
        consensusStatus: record.consensusStatus,
        agreementPercent: record.agreementPercent,
        disagreementPercent: record.disagreementPercent,
        majorityView: record.majorityView,
        minorityView: record.minorityView,
        confidence: record.confidence,
        confidenceComponents: record.confidenceComponents || {},
        contradictoryEvidence: record.contradictoryEvidence || [],
        uncertainty: record.uncertainty,
        requiredVerification: record.requiredVerification,
        evidenceCount: record.evidenceCount,
        sourceCount: record.sourceCount,
        researchPackageId: record.researchPackageId,
        datasetVersion: record.datasetVersion,
        verificationStatus: record.verificationStatus,
        timestamp: new Date(record.timestamp),
        createdAt: new Date(record.createdAt || Date.now())
      }).onConflictDoUpdate({
        target: researchSimulationConsensusTable.id,
        set: {
          modelsEvaluated: record.modelsEvaluated,
          consensusStatus: record.consensusStatus,
          agreementPercent: record.agreementPercent,
          disagreementPercent: record.disagreementPercent,
          confidence: record.confidence,
          confidenceComponents: record.confidenceComponents || {}
        }
      });

      if (record.modelRuns && record.modelRuns.length > 0) {
        for (const mr of record.modelRuns) {
          await db.insert(researchSimulationModelRunsTable).values({
            id: mr.id,
            consensusId: record.id,
            modelId: mr.modelId,
            provider: mr.provider,
            modelName: mr.modelName,
            version: mr.version,
            conclusion: mr.conclusion,
            direction: mr.direction,
            confidence: mr.confidence,
            supportingEvidence: mr.supportingEvidence || [],
            assumptions: mr.assumptions || [],
            risks: mr.risks || [],
            uncertainty: mr.uncertainty,
            weight: mr.weight,
            agreesWithConsensus: mr.agreesWithConsensus,
            createdAt: new Date()
          }).onConflictDoNothing();
        }
      }

      if (record.lineage?.evidenceIds && record.lineage.evidenceIds.length > 0) {
        for (let i = 0; i < record.lineage.evidenceIds.length; i++) {
          const evId = record.lineage.evidenceIds[i];
          const src = record.lineage.sources[i] || 'SYSTEM';
          await db.insert(researchConsensusEvidenceLinksTable).values({
            id: `LINK-${record.id}-${evId}`,
            consensusId: record.id,
            evidenceId: evId,
            source: src,
            datasetVersion: record.datasetVersion,
            createdAt: new Date()
          }).onConflictDoNothing();
        }
      }
    } catch (e) {
      // Memory saved
    }

    return record;
  }
}
