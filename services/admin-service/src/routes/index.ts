import { Router } from "express";
import { healthRoutes } from "./healthRoutes";
import { dashboardRoutes } from "./dashboardRoutes";
import { requireAdmin } from "../middleware/authMiddleware";

const router = Router();

// Public endpoints
router.use("/health", healthRoutes);

// Admin-only endpoints
router.use("/admin", requireAdmin, dashboardRoutes);

export { router };
