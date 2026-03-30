import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as deliveryController from "../controllers/deliveryController";

const router = Router();

// User endpoint — get delivery by order
router.get("/deliveries/order/:orderId", asyncHandler(deliveryController.getByOrderId));

// Admin endpoints
router.get("/admin/deliveries", asyncHandler(deliveryController.listAllDeliveries));
router.get("/admin/deliveries/:deliveryId", asyncHandler(deliveryController.getDelivery));
router.patch("/admin/deliveries/:deliveryId/status", asyncHandler(deliveryController.updateStatus));

export { router as deliveryRoutes };
