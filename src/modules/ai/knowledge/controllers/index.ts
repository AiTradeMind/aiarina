import { Request, Response } from "express";
import { KnowledgeService } from "../services/index.ts";

const knowledgeService = new KnowledgeService();

export class KnowledgeController {
  async getNodes(req: Request, res: Response) {
    try {
      const nodes = await knowledgeService.getNodes();
      res.json(nodes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getEdges(req: Request, res: Response) {
    try {
      const edges = await knowledgeService.getEdges();
      res.json(edges);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async searchNodes(req: Request, res: Response) {
    try {
      const q = req.query.q as string || '';
      const nodes = await knowledgeService.searchNodes(q);
      res.json(nodes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getRelationships(req: Request, res: Response) {
    try {
      const rels = await knowledgeService.getRelationships();
      res.json(rels);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getSnapshots(req: Request, res: Response) {
    try {
      const snapshots = await knowledgeService.getSnapshots();
      res.json(snapshots);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async createNode(req: Request, res: Response) {
    try {
      const result = await knowledgeService.createNode(req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async createEdge(req: Request, res: Response) {
    try {
      const result = await knowledgeService.createEdge(req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async analyze(req: Request, res: Response) {
    try {
      const { modelId } = req.body;
      const result = await knowledgeService.analyze(modelId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
