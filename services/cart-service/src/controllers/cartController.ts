import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as cartService from "../services/cartService";
import * as idemRepo from "../repositories/idempotencyRepository";

function idemKeyFrom(req: Request): string | null {
  const k = req.header("idempotency-key")?.trim();
  return k && k.length > 0 ? k : null;
}

export const createCart = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = (req as any).validated.body;
  const result = await cartService.createCart({ userId });
  res.status(201).json(result);
});

export const getCart = asyncHandler(async (req: Request, res: Response) => {
  const { cartId } = (req as any).validated.params;
  const result = await cartService.getCart(cartId);
  res.json(result);
});

export const addItem = asyncHandler(async (req: Request, res: Response) => {
  const { cartId } = (req as any).validated.params;
  const { product_id, quantity } = (req as any).validated.body;

  const key = idemKeyFrom(req);
  if (key) {
    const existing = await idemRepo.getIdempotencyRecord({ key });
    if (existing) {
      return res.json(existing.response);
    }
  }

  const result = await cartService.addItem({ cartId, product_id, quantity });

  if (key) {
    try {
      await idemRepo.saveIdempotencyRecord({
        key,
        response: result
      });
    } catch (e: any) {
      // Handle race: if another request saved the key, return that stored response
      const existing = await idemRepo.getIdempotencyRecord({ key });
      if (existing) {
        return res.json(existing.response);
      }
      throw e;
    }
  }

  res.json(result);
});

export const updateItem = asyncHandler(async (req: Request, res: Response) => {
  const { cartId, productId } = (req as any).validated.params;
  const { quantity } = (req as any).validated.body;

  const key = idemKeyFrom(req);
  if (key) {
    const existing = await idemRepo.getIdempotencyRecord({ key });
    if (existing) {
      return res.json(existing.response);
    }
  }

  const result = await cartService.updateItemQuantity({ cartId, productId, quantity });

  if (key) {
    try {
      await idemRepo.saveIdempotencyRecord({
        key,
        response: result
      });
    } catch (e: any) {
      const existing = await idemRepo.getIdempotencyRecord({ key });
      if (existing) {
        return res.json(existing.response);
      }
      throw e;
    }
  }

  res.json(result);
});

export const removeItem = asyncHandler(async (req: Request, res: Response) => {
  const { cartId, productId } = (req as any).validated.params;
  const result = await cartService.removeItem({ cartId, productId });
  res.json(result);
});

export const clearCart = asyncHandler(async (req: Request, res: Response) => {
  const { cartId } = (req as any).validated.params;
  const result = await cartService.clearCart(cartId);
  res.json(result);
});

export const checkout = asyncHandler(async (req: Request, res: Response) => {
  const { cartId } = (req as any).validated.params;
  const result = await cartService.checkout(cartId);
  res.json(result);
});
