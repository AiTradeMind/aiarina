import { describe, it, expect, beforeEach } from "vitest";
import { ResearchSimulationService } from "../services/simulation.service.ts";
import { ResearchSimulationRepository } from "../repositories/simulation.repository.ts";

describe("Module 4: Research Simulation & Impact Engine", () => {
  let repository: ResearchSimulationRepository;
  let service: ResearchSimulationService;

  beforeEach(() => {
    repository = new ResearchSimulationRepository();
    service = new ResearchSimulationService(repository);
  });

  describe("1. Impact Matrix Engine", () => {
    it("should generate asset vector impact analysis across multiple asset classes", async () => {
      const impacts = await service.runImpactSimulation({});
      expect(impacts.length).toBeGreaterThan(0);

      const commodityImpact = impacts.find(i => i.assetClass === "COMMODITY");
      expect(commodityImpact).toBeDefined();
      expect(commodityImpact?.metadata?.noTradingAction).toBe("RESEARCH_ONLY_NO_ORDER_GENERATION");

      const indexImpact = impacts.find(i => i.assetClass === "INDEX");
      expect(indexImpact).toBeDefined();
      expect(indexImpact?.impactDirection).toBeDefined();
    });

    it("should dynamically resolve commodity exchanges and NOT assume a single hardcoded exchange", async () => {
      const impacts = await service.runImpactSimulation({});
      const commodities = impacts.filter(i => i.assetClass === "COMMODITY");

      expect(commodities.length).toBeGreaterThan(0);
      for (const comm of commodities) {
        expect(comm.metadata?.brokerResolution).toBe("DYNAMIC_BROKER_RESOLVED");
        expect(Array.isArray(comm.metadata?.supportedExchanges)).toBe(true);
      }
    });

    it("should filter impact matrix by asset class", async () => {
      await service.runImpactSimulation({});
      const commodities = await service.getImpactMatrix("COMMODITY");
      expect(commodities.every(c => c.assetClass === "COMMODITY")).toBe(true);
    });
  });

  describe("2. Correlation Engine", () => {
    it("should calculate correlations for canonical asset pairs", async () => {
      const correlations = await service.runCorrelationSimulation({});
      expect(correlations.length).toBeGreaterThan(0);

      const validCorr = correlations.find(c => c.correlationType !== "INSUFFICIENT_DATA");
      expect(validCorr).toBeDefined();
      expect(validCorr?.correlationCoefficient).not.toBeNull();
      expect(validCorr?.sampleSize).toBeGreaterThanOrEqual(10);
    });

    it("should explicitly mark status as INSUFFICIENT_DATA and coefficient as null when observations are below threshold", async () => {
      const correlations = await service.runCorrelationSimulation({
        entityPairs: [["NOVEL_AI_STARTUP_INDEX", "EXOTIC_CRYPTO_TOKEN_XYZ"]]
      });

      const exoticPair = correlations.find(c => c.entityA === "NOVEL_AI_STARTUP_INDEX");
      expect(exoticPair).toBeDefined();
      expect(exoticPair?.correlationType).toBe("INSUFFICIENT_DATA");
      expect(exoticPair?.strength).toBe("INSUFFICIENT_DATA");
      expect(exoticPair?.correlationCoefficient).toBeNull();
      expect(exoticPair?.sampleSize).toBeLessThan(10);
    });
  });

  describe("3. Duplicate Detection Engine", () => {
    it("should detect exact, semantic, related, and contradictory research relationships", async () => {
      const duplicates = await service.runDuplicateDetection({});
      expect(duplicates.length).toBeGreaterThan(0);

      const exact = duplicates.find(d => d.detectionType === "EXACT_DUPLICATE");
      expect(exact).toBeDefined();
      expect(exact?.similarityScore).toBe(0.98);

      const semantic = duplicates.find(d => d.detectionType === "SEMANTIC_DUPLICATE");
      expect(semantic).toBeDefined();

      const contradictory = duplicates.find(d => d.detectionType === "CONTRADICTORY");
      expect(contradictory).toBeDefined();
      expect(contradictory?.provenance?.conflictingEvidence).toBeDefined();
    });

    it("should preserve provenance and not delete conflicting research records", async () => {
      const duplicates = await service.runDuplicateDetection({});
      for (const dup of duplicates) {
        expect(dup.originalResearchId).toBeDefined();
        expect(dup.comparedResearchId).toBeDefined();
        expect(dup.resolutionStatus).toBe("OPEN");
      }
    });
  });

  describe("4. Research Consensus Engine", () => {
    it("should dynamically load models from AI model registry and evaluate consensus", async () => {
      const record = await service.runResearchConsensus({
        question: "Is inflation easing conducive to policy rate cuts?"
      });

      expect(record).toBeDefined();
      expect(record.modelsEvaluated).toBeGreaterThan(0);
      expect(record.modelRuns.length).toBe(record.modelsEvaluated);
      expect(record.lineage).toBeDefined();
      expect(record.lineage.researchPackageId).toBeDefined();
    });

    it("should compute explainable confidence components and handle dissenting views", async () => {
      const record = await service.runResearchConsensus({});

      expect(record.confidenceComponents).toBeDefined();
      expect(record.confidenceComponents.evidenceQuality).toBeGreaterThan(0);
      expect(record.confidenceComponents.sourceReliability).toBeGreaterThan(0);
      expect(record.confidenceComponents.modelAgreement).toBe(record.agreementPercent);

      if (record.disagreementPercent > 0) {
        expect(record.minorityView).not.toBeNull();
        expect(record.consensusStatus).not.toBe("UNANIMOUS");
      } else {
        expect(record.consensusStatus).toBe("UNANIMOUS");
      }
    });

    it("should trace complete evidence lineage from package to consensus result", async () => {
      const record = await service.runResearchConsensus({});
      const lineage = record.lineage;

      expect(lineage.consensusId).toBe(record.id);
      expect(lineage.modelRunIds.length).toBe(record.modelRuns.length);
      expect(lineage.evidenceIds.length).toBeGreaterThan(0);
      expect(lineage.datasetVersion).toBeDefined();
    });
  });
});
