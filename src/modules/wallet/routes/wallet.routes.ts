import { Router } from "express";
import { WalletController } from "../controllers/wallet.controller.ts";

export const walletRouter = Router();
const controller = new WalletController();

// Static & Query routes FIRST before parameterized /:id
walletRouter.get("/health", controller.getHealth);
walletRouter.get("/balance", controller.getBalance);
walletRouter.get("/ledger", controller.getLedger);
walletRouter.get("/transactions", controller.getTransactions);

walletRouter.post("/create", controller.createWallet);
walletRouter.post("/deposit", controller.deposit);
walletRouter.post("/withdraw", controller.withdraw);
walletRouter.post("/transfer", controller.transfer);
walletRouter.post("/lock", controller.lock);
walletRouter.post("/unlock", controller.unlock);

walletRouter.get("/", controller.getAllWallets);
walletRouter.get("/:id", controller.getWalletById);
