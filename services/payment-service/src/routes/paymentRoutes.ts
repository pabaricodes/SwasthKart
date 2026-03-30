import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as paymentController from "../controllers/paymentController";

const router = Router();

router.post("/payments/initiate", asyncHandler(paymentController.initiatePayment));
router.get("/payments/:paymentId", asyncHandler(paymentController.getPaymentStatus));
router.post("/payments/webhook", asyncHandler(paymentController.handleWebhook));

export { router as paymentRoutes };
