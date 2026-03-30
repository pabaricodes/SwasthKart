import { Router, Request, Response } from "express";
import { env } from "../config/env";
import { serviceCall } from "../utils/httpClient";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth, requireAdmin, optionalAuth } from "../middleware/authMiddleware";
import * as catalogAggregator from "../aggregators/catalogAggregator";
import * as orderAggregator from "../aggregators/orderAggregator";

const router = Router();

// ── Public (optional auth) ───────────────────────────────────────

// GET /api/v1/ui/home
router.get("/home", optionalAuth, asyncHandler(async (_req: Request, res: Response) => {
  const result = await catalogAggregator.getHomeData();
  res.json(result);
}));

// GET /api/v1/ui/category/:slug
router.get("/category/:slug", optionalAuth, asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.page_size as string) || 20;
  const result = await catalogAggregator.getCategoryPage(req.params.slug, page, pageSize);
  res.json(result);
}));

// GET /api/v1/ui/pdp/:productId
router.get("/pdp/:productId", optionalAuth, asyncHandler(async (req: Request, res: Response) => {
  const result = await catalogAggregator.getProductDetail(req.params.productId);
  res.json(result);
}));

// ── Auth required ────────────────────────────────────────────────

// Cart
router.get("/cart", requireAuth, asyncHandler(async (req: Request, res: Response) => {
  const result = await serviceCall<any>("get", `${env.CART_SERVICE_URL}/v1/carts/me`, {
    headers: { "x-user-id": req.user!.user_id },
  });
  res.json(result);
}));

router.post("/cart/items", requireAuth, asyncHandler(async (req: Request, res: Response) => {
  const headers: Record<string, string> = { "x-user-id": req.user!.user_id };
  if (req.headers["idempotency-key"]) {
    headers["idempotency-key"] = req.headers["idempotency-key"] as string;
  }
  const result = await serviceCall<any>("post", `${env.CART_SERVICE_URL}/v1/carts/me/items`, {
    data: req.body,
    headers,
  });
  res.status(201).json(result);
}));

router.put("/cart/items/:itemId", requireAuth, asyncHandler(async (req: Request, res: Response) => {
  const result = await serviceCall<any>("put", `${env.CART_SERVICE_URL}/v1/carts/me/items/${req.params.itemId}`, {
    data: req.body,
    headers: { "x-user-id": req.user!.user_id },
  });
  res.json(result);
}));

router.delete("/cart/items/:itemId", requireAuth, asyncHandler(async (req: Request, res: Response) => {
  await serviceCall<any>("delete", `${env.CART_SERVICE_URL}/v1/carts/me/items/${req.params.itemId}`, {
    headers: { "x-user-id": req.user!.user_id },
  });
  res.status(204).end();
}));

// Checkout → fetch cart totals → initiate payment
router.post("/checkout", requireAuth, asyncHandler(async (req: Request, res: Response) => {
  const { address_id } = req.body;
  if (!address_id) {
    return res.status(400).json({ error: { code: "BAD_REQUEST", message: "address_id is required", details: {} } });
  }

  // 1. Get user's cart with totals
  const cartData = await serviceCall<any>("get", `${env.CART_SERVICE_URL}/v1/carts/me`, {
    headers: { "x-user-id": req.user!.user_id },
  });

  if (!cartData.cart || cartData.cart.items.length === 0) {
    return res.status(422).json({ error: { code: "CART_EMPTY", message: "Cart is empty", details: {} } });
  }

  // 2. Initiate payment with aggregated data
  const result = await serviceCall<any>("post", `${env.PAYMENT_SERVICE_URL}/v1/payments/initiate`, {
    data: {
      cart_id: cartData.cart.id,
      address_id,
      amount_paise: cartData.totals.subtotal,
    },
    headers: { "x-user-id": req.user!.user_id },
  });

  res.status(201).json(result);
}));

// Orders
router.get("/orders", requireAuth, asyncHandler(async (req: Request, res: Response) => {
  const result = await serviceCall<any>("get", `${env.ORDER_SERVICE_URL}/v1/orders`, {
    headers: { "x-user-id": req.user!.user_id },
    params: req.query as Record<string, unknown>,
  });
  res.json(result);
}));

router.get("/orders/:orderId", requireAuth, asyncHandler(async (req: Request, res: Response) => {
  const result = await orderAggregator.getOrderDetail(req.params.orderId, req.user!.user_id);
  res.json(result);
}));

// Profile
router.get("/profile", requireAuth, asyncHandler(async (req: Request, res: Response) => {
  const result = await serviceCall<any>("get", `${env.IDENTITY_SERVICE_URL}/v1/users/me`, {
    headers: { "x-user-id": req.user!.user_id },
  });
  res.json(result);
}));

router.put("/profile", requireAuth, asyncHandler(async (req: Request, res: Response) => {
  const result = await serviceCall<any>("put", `${env.IDENTITY_SERVICE_URL}/v1/users/me`, {
    data: req.body,
    headers: { "x-user-id": req.user!.user_id },
  });
  res.json(result);
}));

// Addresses
router.get("/addresses", requireAuth, asyncHandler(async (req: Request, res: Response) => {
  const result = await serviceCall<any>("get", `${env.IDENTITY_SERVICE_URL}/v1/users/me/addresses`, {
    headers: { "x-user-id": req.user!.user_id },
  });
  res.json(result);
}));

router.post("/addresses", requireAuth, asyncHandler(async (req: Request, res: Response) => {
  const result = await serviceCall<any>("post", `${env.IDENTITY_SERVICE_URL}/v1/users/me/addresses`, {
    data: req.body,
    headers: { "x-user-id": req.user!.user_id },
  });
  res.status(201).json(result);
}));

router.put("/addresses/:addressId", requireAuth, asyncHandler(async (req: Request, res: Response) => {
  const result = await serviceCall<any>("put", `${env.IDENTITY_SERVICE_URL}/v1/users/me/addresses/${req.params.addressId}`, {
    data: req.body,
    headers: { "x-user-id": req.user!.user_id },
  });
  res.json(result);
}));

router.delete("/addresses/:addressId", requireAuth, asyncHandler(async (req: Request, res: Response) => {
  await serviceCall<any>("delete", `${env.IDENTITY_SERVICE_URL}/v1/users/me/addresses/${req.params.addressId}`, {
    headers: { "x-user-id": req.user!.user_id },
  });
  res.status(204).end();
}));

router.put("/addresses/:addressId/default", requireAuth, asyncHandler(async (req: Request, res: Response) => {
  const result = await serviceCall<any>("put", `${env.IDENTITY_SERVICE_URL}/v1/users/me/addresses/${req.params.addressId}/default`, {
    headers: { "x-user-id": req.user!.user_id },
  });
  res.json(result);
}));

export { router as uiRoutes };
