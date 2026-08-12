import { Router } from "express";
import { treasuryController } from "../controllers/treasury.controller.ts";

const router = Router();

router.get("/status", (req, res) => treasuryController.getStatus(req, res));
router.get("/health", (req, res) => treasuryController.getHealth(req, res));

router.post("/mint", (req, res) => treasuryController.mint(req, res));
router.post("/allocate", (req, res) => treasuryController.allocate(req, res));
router.post("/reserve", (req, res) => treasuryController.reserve(req, res));
router.post("/release", (req, res) => treasuryController.release(req, res));
router.post("/wallet/fund", (req, res) => treasuryController.fundWallet(req, res));

// EP02.1 routes
router.get("/lifecycle", (req, res) => treasuryController.getLifecycle(req, res));
router.post("/lifecycle/transition", (req, res) => treasuryController.transitionLifecycle(req, res));

router.get("/state-machine", (req, res) => treasuryController.getStateMachine(req, res));
router.post("/state-machine/transition", (req, res) => treasuryController.transitionState(req, res));

router.get("/funding-policy", (req, res) => treasuryController.getAiFundingPolicy(req, res));
router.post("/funding-policy/evaluate", (req, res) => treasuryController.evaluateAiFunding(req, res));
router.post("/funding-policy/update", (req, res) => treasuryController.updateAiFundingPolicy(req, res));

router.get("/isolation", (req, res) => treasuryController.getPaperLiveIsolation(req, res));

router.get("/certificates", (req, res) => treasuryController.getCertificates(req, res));
router.post("/certificates/verify", (req, res) => treasuryController.verifyCertificate(req, res));

router.get("/flow-inspector", (req, res) => treasuryController.getCapitalFlow(req, res));
router.post("/flow-inspector/trace", (req, res) => treasuryController.traceCapitalFlow(req, res));

router.get("/health-engine", (req, res) => treasuryController.getHealthEngineReport(req, res));

router.post("/emergency", (req, res) => treasuryController.triggerEmergency(req, res));

router.get("/reconciliation", (req, res) => treasuryController.runReconciliation(req, res));
router.post("/reconciliation/run", (req, res) => treasuryController.runReconciliation(req, res));

router.get("/indian-market-policy", (req, res) => treasuryController.getIndianMarketPolicy(req, res));
router.post("/indian-market-policy/validate", (req, res) => treasuryController.validateIndianMarketOrder(req, res));

router.get("/qa", (req, res) => treasuryController.runTreasuryQa(req, res));

// EP17 routes
router.get("/settlements", (req, res) => treasuryController.getSettlements(req, res));
router.get("/settlement-batches", (req, res) => treasuryController.getSettlementBatches(req, res));
router.get("/wallets", (req, res) => treasuryController.getWallets(req, res));
router.post("/settlement/process", (req, res) => treasuryController.processSettlement(req, res));
router.post("/settlement/batch-process", (req, res) => treasuryController.processBatch(req, res));

export const treasuryRouter = router;
