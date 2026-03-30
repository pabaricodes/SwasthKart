import { Router } from "express";
import { prisma } from "../db/prisma";

const router = Router();

router.get("/live", (_req, res) => {
  res.json({ status: "ok" });
});

router.get("/ready", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ready", checks: { db: "ok" } });
  } catch {
    res.status(503).json({ status: "not_ready", checks: { db: "fail" } });
  }
});

export default router;
