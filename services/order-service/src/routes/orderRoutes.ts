import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as orderController from "../controllers/orderController";

const router = Router();

// User endpoints
router.get("/orders", asyncHandler(orderController.listOrders));
router.get("/orders/:orderId", asyncHandler(orderController.getOrder));

// Admin endpoints
router.get("/admin/orders", asyncHandler(orderController.listAllOrders));
router.get("/admin/orders/:orderId", asyncHandler(orderController.adminGetOrder));
router.patch("/admin/orders/:orderId/status", asyncHandler(orderController.updateStatus));

export { router as orderRoutes };
