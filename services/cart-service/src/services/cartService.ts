import { CartStatus } from "@prisma/client";
import { env } from "../config/env";
import { getCatalogItem } from "../clients/catalogClient";
import { getAvailability } from "../clients/inventoryClient";
import * as cartRepo from "../repositories/cartRepository";
import {
  TooManyItemsError,
  UnprocessableEntityError,
  NotFoundError,
  ConflictError
} from "../utils/errors";
import { computeTotals } from "./pricingService";

const CURRENCY = "INR";

export async function createCart(params: { userId?: string }) {
  const cart = await cartRepo.createCart({
    userId: params.userId ?? null,
  });
  const totals = computeTotals(CURRENCY, cart.items);
  return { cart, totals };
}

export async function getCart(cartId: string) {
  const cart = await cartRepo.getCart(cartId);
  if (!cart) throw new NotFoundError("Cart not found");
  const totals = computeTotals(CURRENCY, cart.items);
  return { cart, totals };
}

export async function addItem(params: { cartId: string; product_id: string; quantity: number }) {
  const cart = await cartRepo.getCart(params.cartId);
  if (!cart) throw new NotFoundError("Cart not found");
  if (cart.status !== CartStatus.ACTIVE) throw new ConflictError("Cart is not active");

  if (params.quantity <= 0) throw new UnprocessableEntityError("Quantity must be > 0");

  const currentCount = await cartRepo.countItems(params.cartId);
  const hasThisProduct = cart.items.some((i) => i.productId === params.product_id);
  if (!hasThisProduct && currentCount >= env.MAX_LINE_ITEMS) {
    throw new TooManyItemsError(`Max line items reached (${env.MAX_LINE_ITEMS})`);
  }

  const [catalogItem, availability] = await Promise.all([
    getCatalogItem(params.product_id),
    getAvailability(params.product_id)
  ]);

  if (!availability.available || availability.availableQty < params.quantity) {
    throw new UnprocessableEntityError("Insufficient stock", {
      product_id: params.product_id,
      requestedQty: params.quantity,
      availableQty: availability.availableQty
    });
  }

  const updated = await cartRepo.upsertItem({
    cartId: params.cartId,
    productId: params.product_id,
    sku: params.product_id, // use product_id as sku placeholder
    quantity: params.quantity,
    productName: catalogItem.name,
    unitPricePaise: catalogItem.unitPrice
  });

  const totals = computeTotals(CURRENCY, updated.items);
  return { cart: updated, totals };
}

export async function updateItemQuantity(params: {
  cartId: string;
  productId: string;
  quantity: number;
}) {
  const cart = await cartRepo.getCart(params.cartId);
  if (!cart) throw new NotFoundError("Cart not found");
  if (cart.status !== CartStatus.ACTIVE) throw new ConflictError("Cart is not active");

  const item = cart.items.find((i) => i.productId === params.productId);

  if (params.quantity <= 0) {
    if (!item) throw new NotFoundError("Item not found in cart");
    const updated = await cartRepo.removeItem(params.cartId, item.productId);
    const totals = computeTotals(CURRENCY, updated.items);
    return { cart: updated, totals };
  }

  const availability = await getAvailability(params.productId);
  if (!availability.available || availability.availableQty < params.quantity) {
    throw new UnprocessableEntityError("Insufficient stock", {
      product_id: params.productId,
      requestedQty: params.quantity,
      availableQty: availability.availableQty
    });
  }

  if (!item) throw new NotFoundError("Item not found in cart");
  const updated = await cartRepo.updateQuantity({
    cartId: params.cartId,
    productId: item.productId,
    quantity: params.quantity
  });

  const totals = computeTotals(CURRENCY, updated.items);
  return { cart: updated, totals };
}

export async function removeItem(params: { cartId: string; productId: string }) {
  const cart = await cartRepo.getCart(params.cartId);
  if (!cart) throw new NotFoundError("Cart not found");
  if (cart.status !== CartStatus.ACTIVE) throw new ConflictError("Cart is not active");

  const item = cart.items.find((i) => i.productId === params.productId);
  if (!item) throw new NotFoundError("Item not found in cart");

  const updated = await cartRepo.removeItem(params.cartId, item.productId);

  const totals = computeTotals(CURRENCY, updated.items);
  return { cart: updated, totals };
}

export async function clearCart(cartId: string) {
  const cart = await cartRepo.getCart(cartId);
  if (!cart) throw new NotFoundError("Cart not found");
  if (cart.status !== CartStatus.ACTIVE) throw new ConflictError("Cart is not active");

  const updated = await cartRepo.clearCart(cartId);

  const totals = computeTotals(CURRENCY, updated.items);
  return { cart: updated, totals };
}

export async function checkout(cartId: string) {
  const cart = await cartRepo.getCart(cartId);
  if (!cart) throw new NotFoundError("Cart not found");
  if (cart.status !== CartStatus.ACTIVE) throw new ConflictError("Cart is not active");
  if (cart.items.length === 0) throw new UnprocessableEntityError("Cart is empty");

  const updated = await cartRepo.setCartStatus(cartId, CartStatus.CHECKED_OUT);
  const totals = computeTotals(CURRENCY, updated.items);
  return { cart: updated, totals };
}
