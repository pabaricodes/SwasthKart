import { Router, Request, Response } from "express";
import { catalogClient } from "../services/proxyService";

const router = Router();

router.get("/live", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

router.get("/ready", async (_req: Request, res: Response) => {
  try {
    // Admin-service is a proxy, so readiness = at least one downstream reachable
    await catalogClient.get("/health/live");
    res.json({ status: "ready" });
  } catch {
    res.status(503).json({ status: "not_ready", checks: { downstream: "fail" } });
  }
});

export { router as healthRoutes };
