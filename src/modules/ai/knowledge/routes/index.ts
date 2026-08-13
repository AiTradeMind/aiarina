import { Router } from "express";
import { KnowledgeController } from "../controllers/index.ts";

const router = Router();
const controller = new KnowledgeController();

router.get("/", controller.getNodes.bind(controller));
router.get("/nodes", controller.getNodes.bind(controller));
router.get("/edges", controller.getEdges.bind(controller));
router.get("/search", controller.searchNodes.bind(controller));
router.get("/relationships", controller.getRelationships.bind(controller));
router.get("/snapshots", controller.getSnapshots.bind(controller));

router.post("/node", controller.createNode.bind(controller));
router.post("/edge", controller.createEdge.bind(controller));
router.post("/analyze", controller.analyze.bind(controller));

export { router as knowledgeRouter };
