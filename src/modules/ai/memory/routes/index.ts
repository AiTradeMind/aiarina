import { Router } from "express";
import { MemoryController } from "../controllers/index.ts";
import {  } from "../../../../middleware/auth.ts";

export const aiMemoryRouter = Router();
const memoryCtrl = new MemoryController();

aiMemoryRouter.get("/ai/memory", (req, res, next) => memoryCtrl.getMemory(req, res, next));
aiMemoryRouter.get("/ai/memory/patterns", (req, res, next) => memoryCtrl.getPatterns(req, res, next));
aiMemoryRouter.get("/ai/memory/:id", (req, res, next) => memoryCtrl.getMemoryDetail(req, res, next));
aiMemoryRouter.post("/ai/memory/store", (req, res, next) => memoryCtrl.store(req, res, next));
aiMemoryRouter.post("/ai/memory/search", (req, res, next) => memoryCtrl.search(req, res, next));
