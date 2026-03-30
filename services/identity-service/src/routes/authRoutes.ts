import { Router } from "express";
import * as authController from "../controllers/authController";

const router = Router();

router.post("/otp/send", authController.sendOtp);
router.post("/otp/verify", authController.verifyOtp);

export default router;
