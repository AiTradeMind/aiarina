import { describe, it, expect, beforeEach } from "vitest";
import { ResearchSourceRegistry } from "../registry/research-source.registry.ts";
import { EnterpriseResearchPipeline } from "../services/pipeline.service.ts";
import { ResearchEvidenceEngine } from "../services/evidence-engine.ts";
import { QualityScoringService } from "../services/quality-scoring.service.ts";
import { DuplicateDetectorService } from "../services/duplicate-detector.service.ts";
import { EntityExtractorService } from "../services/entity-extractor.service.ts";
import { RelationshipGraphService } from "../services/relationship-graph.service.ts";
import { ResearchTimelineService } from "../services/timeline.service.ts";
import { VersionHistoryService } from "../services/version-history.service.ts";
import { ResearchCenterService } from "../services/research-center.service.ts";
import {
  RESEARCH_SOURCE_TYPES,
  PIPELINE_STAGES,
  CONFIDENCE_LEVELS,
  ENTITY_TYPES,
  RELATIONSHIP_TYPES,
  DUPLICATE_TYPES,
} from "../constants/index.ts";

describe("Phase 2.2A Research Center Enterprise Hardening", () => {
  let sourceRegistry: ResearchSourceRegistry;
  let pipeline: EnterpriseResearchPipeline;
  let evidenceEngine: ResearchEvidenceEngine;
  let qualityScorer: QualityScoringService;
  let duplicateDetector: DuplicateDetectorService;
  let entityExtractor: EntityExtractorService;
  let relationshipGraph: RelationshipGraphService;
  let timelineService: ResearchTimelineService;
  let versionService: VersionHistoryService;
  let researchService: ResearchCenterService;

  beforeEach(() => {
    sourceRegistry = new ResearchSourceRegistry();
    pipeline = new EnterpriseResearchPipeline();
    evidenceEngine = new ResearchEvidenceEngine();
    qualityScorer = new QualityScoringService();
    duplicateDetector = new DuplicateDetectorService();
    entityExtractor = new EntityExtractorService();
    relationshipGraph = new RelationshipGraphService();
    timelineService = new ResearchTimelineService();
    versionService = new VersionHistoryService();
    researchService = new ResearchCenterService();
  });

  it("1. Research Source Registry - should list pre-populated sources and register custom ones", async () => {
    const allSources = await sourceRegistry.getAllSources();
    expect(allSources.length).toBeGreaterThanOrEqual(10);

    const sourceTypes = allSources.map((s) => s.sourceType);
    expect(sourceTypes).toContain(RESEARCH_SOURCE_TYPES.NSE);
    expect(sourceTypes).toContain(RESEARCH_SOURCE_TYPES.BSE);
    expect(sourceTypes).toContain(RESEARCH_SOURCE_TYPES.COMMODITY);
    expect(sourceTypes).toContain(RESEARCH_SOURCE_TYPES.TRADINGVIEW);
    expect(sourceTypes).toContain(RESEARCH_SOURCE_TYPES.ECONOMIC_CALENDAR);
    expect(sourceTypes).toContain(RESEARCH_SOURCE_TYPES.CORPORATE_FILING);

    const custom = await sourceRegistry.registerSource({
      sourceName: "Custom Algorithmic Signal Engine",
      sourceType: RESEARCH_SOURCE_TYPES.CUSTOM,
      priority: 1,
      reliabilityScore: 94.5,
      trustLevel: "HIGH",
      status: "ACTIVE",
      metadata: { strategyId: "ALPHA-01" },
    });

    expect(custom.sourceId).toMatch(/^SRC-/);
    expect(custom.sourceName).toBe("Custom Algorithmic Signal Engine");
    expect(custom.reliabilityScore).toBe(94.5);
  });

  it("2. Enterprise Research Pipeline - should run item through INGEST->READY stages and track history", async () => {
    const researchId = `RES-TEST-${Date.now()}`;
    const run = await pipeline.runFullPipeline(researchId);

    expect(run.researchId).toBe(researchId);
    expect(run.currentStage).toBe(PIPELINE_STAGES.READY);
    expect(run.stageHistory.length).toBe(8);
    expect(run.stageHistory[0].stage).toBe(PIPELINE_STAGES.INGEST);
    expect(run.stageHistory[7].stage).toBe(PIPELINE_STAGES.READY);
    expect(run.executionTimeMs).toBeGreaterThanOrEqual(0);
  });

  it("3. Evidence Engine Upgrade - should record evidence with verification and confidence", () => {
    const researchId = `RES-EVI-${Date.now()}`;
    const evi = evidenceEngine.addEvidence(researchId, {
      evidenceType: "EXCHANGE_FILING",
      evidenceSource: "NSE Annual Report",
      confidence: 95,
      reliability: "VERY_HIGH",
      verification: "VERIFIED",
      metadata: { documentRef: "DOC-2026-99" },
    });

    expect(evi.evidenceId).toMatch(/^EVI-/);
    expect(evi.verification).toBe("VERIFIED");
    expect(evidenceEngine.getEvidenceCount(researchId)).toBe(1);
    expect(evidenceEngine.getEvidenceByResearchId(researchId).length).toBe(1);
  });

  it("4 & 5. Quality Scoring & Confidence - should compute quality score and map confidence levels", () => {
    const item = {
      title: "Reliance Industries Q3 Earnings Surpass Market Expectations",
      content: "Reliance Industries reported a 15% increase in consolidated net profit for Q3 driven by retail and telecom.",
      summary: "Strong Q3 earnings for Reliance.",
      author: "Lead Equity Analyst",
      tags: ["earnings", "reliance", "equity"],
      metadata: { sector: "Oil & Gas" },
    };

    const quality = qualityScorer.calculateQualityScore(item, 2, 95, true);
    expect(quality.completeness).toBe(100);
    expect(quality.metadataCoverage).toBeGreaterThan(0);
    expect(quality.finalQualityScore).toBeGreaterThan(80);

    const confidence = qualityScorer.deriveConfidenceLevel(quality.finalQualityScore, 3);
    expect([CONFIDENCE_LEVELS.HIGH, CONFIDENCE_LEVELS.VERY_HIGH, CONFIDENCE_LEVELS.VERIFIED]).toContain(confidence);

    qualityScorer.recordConfidence("RES-100", confidence, "Passed validation gate");
    const history = qualityScorer.getConfidenceHistory("RES-100");
    expect(history.length).toBe(1);
    expect(history[0].confidence).toBe(confidence);
  });

  it("6. Duplicate Detection - should flag exact and near-duplicate items without deleting", () => {
    const existingItems: any[] = [
      {
        researchId: "RES-EXISTING-01",
        title: "Federal Reserve Rate Decision Impact",
        content: "Federal Reserve maintains benchmark interest rates amidst persistent core inflation pressures.",
        category: "Economic",
        source: "Federal Reserve Wire",
      },
    ];

    const duplicateTitleCheck = duplicateDetector.detectDuplicates(
      {
        title: "Federal Reserve Rate Decision Impact",
        content: "Different body content text...",
      },
      existingItems
    );

    expect(duplicateTitleCheck.isDuplicate).toBe(true);
    expect(duplicateTitleCheck.duplicateOf).toBe("RES-EXISTING-01");
    expect(duplicateTitleCheck.duplicateType).toBe(DUPLICATE_TYPES.EVENT);

    const nonDuplicate = duplicateDetector.detectDuplicates(
      {
        title: "Cryptocurrency Market Regulation Breakdown",
        content: "Global regulators introduce unified framework for digital asset compliance.",
      },
      existingItems
    );

    expect(nonDuplicate.isDuplicate).toBe(false);
  });

  it("7. Entity Extraction - should extract symbols, exchanges, sectors, and commodities", () => {
    const title = "NIFTY and RELIANCE Surge on NSE Amid Banking Sector Rally";
    const content = "Crude Oil prices stabilized while USD/INR held steady at 83.20. Corporate events and earnings announcements boosted IT stocks.";

    const entities = entityExtractor.extractEntities("RES-ENT-01", title, content);
    expect(entities.length).toBeGreaterThan(0);

    const entityTypes = entities.map((e) => e.entityType);
    expect(entityTypes).toContain(ENTITY_TYPES.INDEX);
    expect(entityTypes).toContain(ENTITY_TYPES.STOCK);
    expect(entityTypes).toContain(ENTITY_TYPES.EXCHANGE);
    expect(entityTypes).toContain(ENTITY_TYPES.COMMODITY);
    expect(entityTypes).toContain(ENTITY_TYPES.CURRENCY);
    expect(entityTypes).toContain(ENTITY_TYPES.SECTOR);
  });

  it("8. Relationship Graph - should store bi-directional directed relationships", () => {
    const rel = relationshipGraph.addRelationship("RES-A", "RES-B", RELATIONSHIP_TYPES.SUPPORTS, 0.95, { note: "Corroborates earnings" });
    expect(rel.relationshipId).toMatch(/^REL-/);

    const relsA = relationshipGraph.getRelationships("RES-A");
    const relsB = relationshipGraph.getRelationships("RES-B");

    expect(relsA.length).toBe(1);
    expect(relsB.length).toBe(1);
    expect(relationshipGraph.getConnectedResearchIds("RES-A")).toContain("RES-B");
  });

  it("9. Research Timeline - should track timeline events in reverse chronological order", () => {
    timelineService.addEvent("RES-TL-01", "CREATED", "Research created");
    timelineService.addEvent("RES-TL-01", "EVIDENCE_ADDED", "Evidence added");
    timelineService.addEvent("RES-TL-01", "VALIDATED", "Quality gate passed");

    const events = timelineService.getTimeline("RES-TL-01");
    expect(events.length).toBe(3);
    expect(events[0].eventType).toBe("VALIDATED");
    expect(events[2].eventType).toBe("CREATED");
  });

  it("10. Version History - should maintain sequential version history with rollback metadata", () => {
    v1 = versionService.createVersion("RES-VER-01", "Initial Draft Content", "Analyst A", "Draft 1");
    v2 = versionService.createVersion("RES-VER-01", "Final Revised Content", "Senior Analyst B", "Revised with Q3 numbers");

    expect(v1.versionNumber).toBe(1);
    expect(v2.versionNumber).toBe(2);
    expect(v2.previousVersionId).toBe(v1.versionId);

    const versions = versionService.getVersions("RES-VER-01");
    expect(versions.length).toBe(2);
    expect(versions[0].versionNumber).toBe(2);
  });

  it("11 & 12. Full Service End-to-End Enterprise Hardening Flow", async () => {
    const created = await researchService.createResearch({
      title: "Bank Nifty Options Volatility Analysis",
      content: "Implied volatility for Bank Nifty options escalated significantly prior to RBI monetary policy meeting.",
      category: "Options",
      source: "National Stock Exchange of India (NSE)",
    });

    expect(created.researchId).toBeDefined();
    expect(created.confidenceLevel).toBeDefined();
    expect(created.qualityScore).toBeGreaterThan(0);

    // Add evidence
    const evi = researchService.addEvidence(created.researchId, {
      evidenceType: "VOLATILITY_SURFACE_CHART",
      evidenceSource: "NSE Derivatives Feed",
      confidence: 90,
      verification: "VERIFIED",
    });
    expect(evi.evidenceId).toBeDefined();

    // Fetch research item with enterprise metadata
    const fetched = await researchService.getResearchById(created.researchId);
    expect(fetched.evidenceCount).toBeGreaterThanOrEqual(1);
    expect(fetched.metadata.extractedEntities).toBeDefined();

    // Query with enterprise filters (minQuality, confidence)
    const searchRes = await researchService.searchResearch({
      category: "Options",
      minQuality: 50,
    });
    expect(searchRes.items.length).toBeGreaterThan(0);
  });
});

let v1: any;
let v2: any;
