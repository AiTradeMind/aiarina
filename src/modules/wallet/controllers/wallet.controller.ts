import { Request, Response } from "express";
import { WalletService } from "../services/wallet.service.ts";

export class WalletController {
  private service: WalletService;

  constructor() {
    this.service = WalletService.getInstance();
  }

  public getAllWallets = async (req: Request, res: Response): Promise<void> => {
    try {
      const wallets = await this.service.getAllWallets();
      res.status(200).json({ success: true, count: wallets.length, data: wallets });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  public getWalletById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const wallet = await this.service.getWalletById(id);
      if (!wallet) {
        res.status(404).json({ success: false, error: `Wallet '${id}' not found.` });
        return;
      }
      res.status(200).json({ success: true, data: wallet });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  public getHealth = async (req: Request, res: Response): Promise<void> => {
    try {
      const health = await this.service.getHealth();
      res.status(200).json({ success: true, data: health });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  public getBalance = async (req: Request, res: Response): Promise<void> => {
    try {
      const walletId = (req.query.walletId as string) || (req.query.id as string);
      if (!walletId) {
        res.status(400).json({ success: false, error: "Query parameter 'walletId' is required." });
        return;
      }
      const balance = await this.service.getBalance(walletId);
      res.status(200).json({ success: true, data: balance });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  public getLedger = async (req: Request, res: Response): Promise<void> => {
    try {
      const walletId = req.query.walletId as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
      const entries = await this.service.getLedgerEntries(walletId, limit);
      res.status(200).json({ success: true, count: entries.length, data: entries });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  public getTransactions = async (req: Request, res: Response): Promise<void> => {
    try {
      const walletId = req.query.walletId as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
      const txs = await this.service.getTransactions(walletId, limit);
      res.status(200).json({ success: true, count: txs.length, data: txs });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  public createWallet = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.createWallet(req.body);
      if (!result.success) {
        res.status(400).json(result);
        return;
      }
      res.status(201).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  public deposit = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.deposit(req.body);
      if (!result.success) {
        res.status(400).json(result);
        return;
      }
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  public withdraw = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.withdraw(req.body);
      if (!result.success) {
        res.status(400).json(result);
        return;
      }
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  public transfer = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.transfer(req.body);
      if (!result.success) {
        res.status(400).json(result);
        return;
      }
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  public lock = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.lockFunds(req.body);
      if (!result.success) {
        res.status(400).json(result);
        return;
      }
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  public unlock = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.unlockFunds(req.body);
      if (!result.success) {
        res.status(400).json(result);
        return;
      }
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };
}
