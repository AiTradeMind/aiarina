import { Router } from "express";
import { walletHardeningEngine } from "../services/wallet-hardening.service.ts";

export const walletHardeningRouter = Router();

walletHardeningRouter.post("/idempotency/check", async (req, res, next) => {
  try {
    const { key, payload } = req.body;
    const result = await walletHardeningEngine.checkIdempotency(key, payload);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

walletHardeningRouter.post("/settlements", async (req, res, next) => {
  try {
    const { transactionId, walletId, amount } = req.body;
    const settlement = await walletHardeningEngine.createSettlement(transactionId, walletId, amount);
    res.json({ success: true, data: settlement });
  } catch (error) {
    next(error);
  }
});

walletHardeningRouter.put("/settlements/:id/status", async (req, res, next) => {
  try {
    const { status } = req.body;
    const updated = await walletHardeningEngine.updateSettlementStatus(req.params.id, status);
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

walletHardeningRouter.post("/reservations", async (req, res, next) => {
  try {
    const { walletId, amount, purpose, ttlMinutes } = req.body;
    const reservation = await walletHardeningEngine.createReservation(walletId, amount, purpose, ttlMinutes);
    res.json({ success: true, data: reservation });
  } catch (error) {
    next(error);
  }
});

walletHardeningRouter.post("/reservations/:id/release", async (req, res, next) => {
  try {
    const released = await walletHardeningEngine.releaseReservation(req.params.id);
    res.json({ success: true, data: released });
  } catch (error) {
    next(error);
  }
});

walletHardeningRouter.post("/integrity/verify", async (req, res, next) => {
  try {
    const { opening, credits, debits, closing } = req.body;
    const verification = walletHardeningEngine.verifyLedgerIntegrity(opening, credits, debits, closing);
    res.json({ success: true, data: verification });
  } catch (error) {
    next(error);
  }
});

walletHardeningRouter.get("/health", async (req, res, next) => {
  try {
    const health = await walletHardeningEngine.getWalletHealth();
    res.json({ success: true, data: health });
  } catch (error) {
    next(error);
  }
});
