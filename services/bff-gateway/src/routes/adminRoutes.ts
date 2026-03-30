import { Router, Request, Response } from "express";
import { env } from "../config/env";
import { serviceCall } from "../utils/httpClient";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware";

const router = Router();

router.use(requireAuth, requireAdmin);

// ── Catalog Admin ────────────────────────────────────────────────

router.post("/categories", asyncHandler(async (req: Request, res: Response) => {
  const result = await serviceCall<any>("post", `${env.CATALOG_SERVICE_URL}/v1/admin/categories`, { data: req.body });
  res.status(201).json(result);
}));

router.put("/categories/:id", asyncHandler(async (req: Request, res: Response) => {
  const result = await serviceCall<any>("put", `${env.CATALOG_SERVICE_URL}/v1/admin/categories/${req.params.id}`, { data: req.body });
  res.json(result);
}));

router.delete("/categories/:id", asyncHandler(async (req: Request, res: Response) => {
  await serviceCall<any>("delete", `${env.CATALOG_SERVICE_URL}/v1/admin/categories/${req.params.id}`);
  res.status(204).end();
}));

router.post("/products", asyncHandler(async (req: Request, res: Response) => {
  const result = await serviceCall<any>("post", `${env.CATALOG_SERVICE_URL}/v1/admin/products`, { data: req.body });
  res.status(201).json(result);
}));

router.put("/products/:id", asyncHandler(async (req: Request, res: Response) => {
  const result = await serviceCall<any>("put", `${env.CATALOG_SERVICE_URL}/v1/admin/products/${req.params.id}`, { data: req.body });
  res.json(result);
}));

router.delete("/products/:id", asyncHandler(async (req: Request, res: Response) => {
  await serviceCall<any>("delete", `${env.CATALOG_SERVICE_URL}/v1/admin/products/${req.params.id}`);
  res.status(204).end();
}));

// ── Order Admin ──────────────────────────────────────────────────

router.get("/orders", asyncHandler(async (req: Request, res: Response) => {
  const result = await serviceCall<any>("get", `${env.ORDER_SERVICE_URL}/v1/admin/orders`, {
    params: req.query as Record<string, unknown>,
  });
  res.json(result);
}));

router.get("/orders/:orderId", asyncHandler(async (req: Request, res: Response) => {
  const result = await serviceCall<any>("get", `${env.ORDER_SERVICE_URL}/v1/admin/orders/${req.params.orderId}`);
  res.json(result);
}));

router.patch("/orders/:orderId/status", asyncHandler(async (req: Request, res: Response) => {
  const result = await serviceCall<any>("patch", `${env.ORDER_SERVICE_URL}/v1/admin/orders/${req.params.orderId}/status`, {
    data: req.body,
    headers: { "x-user-id": req.user!.user_id },
  });
  res.json(result);
}));

// ── Delivery Admin ───────────────────────────────────────────────

router.get("/deliveries", asyncHandler(async (req: Request, res: Response) => {
  const result = await serviceCall<any>("get", `${env.DELIVERY_SERVICE_URL}/v1/admin/deliveries`, {
    params: req.query as Record<string, unknown>,
  });
  res.json(result);
}));

router.get("/deliveries/:deliveryId", asyncHandler(async (req: Request, res: Response) => {
  const result = await serviceCall<any>("get", `${env.DELIVERY_SERVICE_URL}/v1/admin/deliveries/${req.params.deliveryId}`);
  res.json(result);
}));

router.patch("/deliveries/:deliveryId/status", asyncHandler(async (req: Request, res: Response) => {
  const result = await serviceCall<any>("patch", `${env.DELIVERY_SERVICE_URL}/v1/admin/deliveries/${req.params.deliveryId}/status`, {
    data: req.body,
  });
  res.json(result);
}));

// ── Inventory Admin ──────────────────────────────────────────────

router.get("/inventory", asyncHandler(async (req: Request, res: Response) => {
  const result = await serviceCall<any>("get", `${env.INVENTORY_SERVICE_URL}/v1/admin/inventory`, {
    params: req.query as Record<string, unknown>,
  });
  res.json(result);
}));

router.put("/inventory/:sku", asyncHandler(async (req: Request, res: Response) => {
  const result = await serviceCall<any>("put", `${env.INVENTORY_SERVICE_URL}/v1/admin/inventory/${req.params.sku}`, {
    data: req.body,
  });
  res.json(result);
}));

router.post("/inventory", asyncHandler(async (req: Request, res: Response) => {
  const result = await serviceCall<any>("post", `${env.INVENTORY_SERVICE_URL}/v1/admin/inventory`, {
    data: req.body,
  });
  res.status(201).json(result);
}));

router.get("/inventory/:productId", asyncHandler(async (req: Request, res: Response) => {
  const result = await serviceCall<any>("get", `${env.INVENTORY_SERVICE_URL}/v1/stock/${req.params.productId}`);
  res.json(result);
}));

// ── Dashboard ───────────────────────────────────────────────────

router.get("/dashboard", asyncHandler(async (_req: Request, res: Response) => {
  const result = await serviceCall<any>("get", `${env.ADMIN_SERVICE_URL}/admin/dashboard`);
  res.json(result);
}));

export { router as adminRoutes };
