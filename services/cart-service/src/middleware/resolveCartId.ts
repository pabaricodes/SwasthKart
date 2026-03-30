import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../utils/errors";
import * as cartRepo from "../repositories/cartRepository";

/**
 * Middleware that intercepts requests where `:cartId` is the literal
 * string "me".  It resolves "me" to the caller's active cart UUID
 * (creating one if none exists) using the `x-user-id` request header.
 *
 * After resolution `req.params.cartId` contains a real UUID so
 * downstream handlers / validation work unchanged.
 */
export async function resolveCartId(req: Request, _res: Response, next: NextFunction) {
  try {
    if (req.params.cartId !== "me") return next();

    const userId = req.header("x-user-id")?.trim();
    if (!userId) {
      return next(new BadRequestError("x-user-id header is required when using 'me' as cartId"));
    }

    const cart = await cartRepo.getOrCreateActiveCart(userId);
    req.params.cartId = cart.id;
    next();
  } catch (err) {
    next(err);
  }
}
