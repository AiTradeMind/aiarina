import { Router } from "express";
import { authenticateToken } from "../../../middleware/auth.ts";
import { orderController } from "../controllers/OrderController.ts";

const router = Router();

router.use(authenticateToken as any);

router.post("/", orderController.createOrder as any);
router.get("/", orderController.getOrders as any);
router.get("/metrics", orderController.getMetrics as any);
router.get("/statistics", orderController.getStatistics as any);
router.get("/dashboard", orderController.getDashboard as any);
router.get("/health", orderController.getHealth as any);
router.get("/reports", orderController.getReports as any);
router.get("/idempotency/:key", orderController.getOrderIdempotency as any);
router.get("/:id", orderController.getOrderById as any);
router.delete("/:id", orderController.cancelOrder as any);
router.patch("/:id", orderController.updateOrder as any);
router.get("/:id/versions", orderController.getOrderVersions as any);
router.get("/:id/history", orderController.getOrderHistory as any);

export default router;
