import { Router } from "express";
import { prisma } from "../db/prisma";

export function healthRoutes() {
  const r = Router();

  r.get("/live", (_req, res) => res.status(200).json({ ok: true }));

  r.get("/ready", async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.status(200).json({ ok: true });
    } catch {
      res.status(503).json({ ok: false });
    }
  });

  return r;
}
