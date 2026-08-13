import { Router } from "express";
import { ResearchController, ResearchCenterController, researchEP06Controller, researchEP03Controller } from "../controllers/index.ts";
import { requireRole } from "../../../middleware/auth.ts";

export const researchRouter = Router();
const researchCtrl = new ResearchController();
const researchCenterCtrl = new ResearchCenterController();

// Phase 2.2: Research Center Foundation Routes
researchRouter.get("/research/categories", (req, res, next) => researchCenterCtrl.getCategories(req, res, next));
researchRouter.get("/research/status", (req, res, next) => researchCenterCtrl.getStatuses(req, res, next));

researchRouter.get("/research", (req, res, next) => researchCenterCtrl.getResearchItems(req, res, next));
researchRouter.post("/research", (req, res, next) => researchCenterCtrl.createResearch(req, res, next));

// Legacy research reports & generation routes
researchRouter.get("/research/legacy/reports", requireRole(["analyst", "admin"]), (req, res, next) => researchCtrl.getReports(req, res, next));
researchRouter.get("/research/history", requireRole(["analyst", "admin"]), (req, res, next) => researchCtrl.getHistory(req, res, next));
researchRouter.post("/research/generate", requireRole(["analyst", "admin"]), (req, res, next) => researchCtrl.generate(req, res, next));

// EP06 Enterprise Research Workspace routes (Module 17)
researchRouter.post("/research/project", (req, res, next) => researchEP06Controller.createProject(req, res, next));
researchRouter.post("/research/projects", (req, res, next) => researchEP06Controller.createProject(req, res, next));
researchRouter.get("/research/projects", (req, res, next) => researchEP06Controller.getProjects(req, res, next));

researchRouter.post("/research/job", (req, res, next) => researchEP06Controller.createJob(req, res, next));
researchRouter.post("/research/jobs", (req, res, next) => researchEP06Controller.createJob(req, res, next));
researchRouter.get("/research/jobs", (req, res, next) => researchEP06Controller.getJobs(req, res, next));
researchRouter.post("/research/job/toggle", (req, res, next) => researchEP06Controller.toggleJob(req, res, next));
researchRouter.post("/research/job/run", (req, res, next) => researchEP06Controller.triggerJob(req, res, next));

researchRouter.get("/research/watchlists", (req, res, next) => researchEP06Controller.getWatchlists(req, res, next));
researchRouter.post("/research/watchlist", (req, res, next) => researchEP06Controller.createWatchlist(req, res, next));
researchRouter.post("/research/watchlists", (req, res, next) => researchEP06Controller.createWatchlist(req, res, next));
researchRouter.post("/research/watchlist/symbols", (req, res, next) => researchEP06Controller.updateWatchlistSymbols(req, res, next));

researchRouter.get("/research/scanner", (req, res, next) => researchEP06Controller.getScanner(req, res, next));

researchRouter.get("/research/datasets", (req, res, next) => researchEP06Controller.getDatasets(req, res, next));
researchRouter.post("/research/dataset", (req, res, next) => researchEP06Controller.createDataset(req, res, next));
researchRouter.post("/research/datasets", (req, res, next) => researchEP06Controller.createDataset(req, res, next));

researchRouter.get("/research/evidence", (req, res, next) => researchEP06Controller.getEvidence(req, res, next));
researchRouter.post("/research/evidence", (req, res, next) => researchEP06Controller.createEvidence(req, res, next));

researchRouter.get("/research/notes", (req, res, next) => researchEP06Controller.getNotes(req, res, next));
researchRouter.post("/research/note", (req, res, next) => researchEP06Controller.createNote(req, res, next));
researchRouter.post("/research/notes", (req, res, next) => researchEP06Controller.createNote(req, res, next));

researchRouter.get("/research/timeline", (req, res, next) => researchEP06Controller.getTimeline(req, res, next));
researchRouter.get("/research/runtime", (req, res, next) => researchEP06Controller.getRuntimeTasks(req, res, next));
researchRouter.get("/research/events", (req, res, next) => researchEP06Controller.getEvents(req, res, next));
researchRouter.post("/research/reset", (req, res, next) => researchEP06Controller.resetTestData(req, res, next));
researchRouter.get("/research/engine-state", (req, res, next) => researchEP06Controller.getEngineState(req, res, next));
researchRouter.post("/research/engine-state", (req, res, next) => researchEP06Controller.setEngineState(req, res, next));

// Module 4: Simulation & Impact Routes
import { ResearchSimulationController } from "../controllers/simulation.controller.ts";
const simulationCtrl = new ResearchSimulationController();

researchRouter.get("/research/simulation/impact", (req, res, next) => simulationCtrl.getImpactMatrix(req, res));
researchRouter.post("/research/simulation/impact/run", (req, res, next) => simulationCtrl.runImpactSimulation(req, res));

researchRouter.get("/research/simulation/correlations", (req, res, next) => simulationCtrl.getCorrelations(req, res));
researchRouter.post("/research/simulation/correlations/run", (req, res, next) => simulationCtrl.runCorrelationSimulation(req, res));

researchRouter.get("/research/simulation/duplicates", (req, res, next) => simulationCtrl.getDuplicates(req, res));
researchRouter.post("/research/simulation/duplicates/run", (req, res, next) => simulationCtrl.runDuplicateDetection(req, res));

researchRouter.get("/research/simulation/consensus", (req, res, next) => simulationCtrl.getConsensus(req, res));
researchRouter.post("/research/simulation/consensus/run", (req, res, next) => simulationCtrl.runConsensus(req, res));

// Parameterized Research Item routes (must come AFTER specific static endpoints)
researchRouter.get("/research/:id", (req, res, next) => researchCenterCtrl.getResearchById(req, res, next));
researchRouter.put("/research/:id", (req, res, next) => researchCenterCtrl.updateResearch(req, res, next));
researchRouter.delete("/research/:id", (req, res, next) => researchCenterCtrl.deleteResearch(req, res, next));

// EP-03 Phase 3 Enterprise Scanner & Alerts Routes
researchRouter.get("/scanner/templates", (req, res, next) => researchEP03Controller.getTemplates(req, res, next));
researchRouter.post("/scanner/templates", (req, res, next) => researchEP03Controller.createTemplate(req, res, next));
researchRouter.put("/scanner/templates/:id", (req, res, next) => researchEP03Controller.updateTemplate(req, res, next));
researchRouter.post("/scanner/templates/clone", (req, res, next) => researchEP03Controller.cloneTemplate(req, res, next));
researchRouter.post("/scanner/templates/export", (req, res, next) => researchEP03Controller.exportTemplate(req, res, next));
researchRouter.post("/scanner/templates/import", (req, res, next) => researchEP03Controller.importTemplate(req, res, next));
researchRouter.post("/scanner/templates/version", (req, res, next) => researchEP03Controller.createTemplateVersion(req, res, next));

researchRouter.post("/scanner/run", (req, res, next) => researchEP03Controller.runScan(req, res, next));
researchRouter.get("/scanner/history", (req, res, next) => researchEP03Controller.getHistory(req, res, next));

researchRouter.get("/watchlists/groups", (req, res, next) => researchEP03Controller.getWatchlistsGroups(req, res, next));
researchRouter.post("/watchlists/groups", (req, res, next) => researchEP03Controller.createWatchlistGroup(req, res, next));

researchRouter.get("/alerts/rules", (req, res, next) => researchEP03Controller.getAlertRules(req, res, next));
researchRouter.post("/alerts/rules", (req, res, next) => researchEP03Controller.createAlertRule(req, res, next));
researchRouter.get("/alerts/history", (req, res, next) => researchEP03Controller.getAlertHistory(req, res, next));
researchRouter.post("/alerts/acknowledge", (req, res, next) => researchEP03Controller.acknowledgeAlert(req, res, next));
researchRouter.post("/alerts/snooze", (req, res, next) => researchEP03Controller.snoozeAlert(req, res, next));
researchRouter.get("/alerts/metrics", (req, res, next) => researchEP03Controller.getAlertMetrics(req, res, next));
researchRouter.post("/alerts/simulate-triggers", (req, res, next) => researchEP03Controller.simulateTriggers(req, res, next));

