import { Router, Request, Response } from "express";

const router = Router();

router.get("/live", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

router.get("/ready", (_req: Request, res: Response) => {
  // BFF has no own database — just check process is alive
  res.json({ status: "ready" });
});

export { router as healthRoutes };
