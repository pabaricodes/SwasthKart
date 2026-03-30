import { Router } from "express";
import { validate } from "../middleware/validate";
import { resolveCartId } from "../middleware/resolveCartId";
import {
  createCartSchema,
  cartIdParamSchema,
  addItemSchema,
  updateItemSchema,
  removeItemSchema
} from "../schemas/cartSchemas";
import * as controller from "../controllers/cartController";

export function cartRoutes() {
  const r = Router();

  r.post("/", validate(createCartSchema), controller.createCart);

  // resolveCartId runs first: if cartId === "me", it resolves to the
  // user's active cart (creating one if needed) before validation.
  r.get("/:cartId", resolveCartId, validate(cartIdParamSchema), controller.getCart);

  r.post("/:cartId/items", resolveCartId, validate(addItemSchema), controller.addItem);
  r.put("/:cartId/items/:productId", resolveCartId, validate(updateItemSchema), controller.updateItem);
  r.delete("/:cartId/items/:productId", resolveCartId, validate(removeItemSchema), controller.removeItem);

  r.post("/:cartId/clear", resolveCartId, validate(cartIdParamSchema), controller.clearCart);
  r.post("/:cartId/checkout", resolveCartId, validate(cartIdParamSchema), controller.checkout);

  return r;
}
