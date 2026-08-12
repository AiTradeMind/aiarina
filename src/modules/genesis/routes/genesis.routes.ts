import { Router } from "express";
import { genesisController } from "../controllers/genesis.controller.ts";

const router = Router();

router.post("/genesis/start", genesisController.startGenesis);
router.post("/genesis/reset", genesisController.resetGenesis);
router.get("/genesis/status", genesisController.getGenesisStatus);
router.get("/state", genesisController.getSystemState);
router.get("/boot", genesisController.getSystemBoot);

export { router as genesisRouter };
