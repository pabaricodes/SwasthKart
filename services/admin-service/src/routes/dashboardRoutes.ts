import { Router, Request, Response, NextFunction } from "express";
import { fetchDashboardStats } from "../services/proxyService";

const router = Router();

router.get("/dashboard", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await fetchDashboardStats();
    res.json({ data: stats });
  } catch (err) {
    next(err);
  }
});

export { router as dashboardRoutes };
