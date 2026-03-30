import { prisma } from "../db/prisma";
import { Cart, CartItem, CartStatus } from "@prisma/client";

export type CartWithItems = Cart & { items: CartItem[] };

export async function createCart(params: {
  userId?: string | null;
}): Promise<CartWithItems> {
  return prisma.cart.create({
    data: {
      userId: params.userId ?? "",
    },
    include: { items: true }
  });
}

export async function getCart(cartId: string): Promise<CartWithItems | null> {
  return prisma.cart.findUnique({
    where: { id: cartId },
    include: { items: true }
  });
}

export async function setCartStatus(cartId: string, status: CartStatus): Promise<CartWithItems> {
  return prisma.cart.update({
    where: { id: cartId },
    data: { status },
    include: { items: true }
  });
}

export async function upsertItem(params: {
  cartId: string;
  productId: string;
  sku: string;
  quantity: number;
  productName?: string | null;
  unitPricePaise?: number | null;
  imageUrl?: string | null;
}): Promise<CartWithItems> {
  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: params.cartId, productId: params.productId } },
    update: {
      quantity: params.quantity,
      sku: params.sku,
      productName: params.productName ?? undefined,
      unitPricePaise: params.unitPricePaise ?? undefined,
      imageUrl: params.imageUrl ?? undefined,
      snapshottedAt: new Date()
    },
    create: {
      cartId: params.cartId,
      productId: params.productId,
      sku: params.sku,
      quantity: params.quantity,
      productName: params.productName ?? "",
      unitPricePaise: params.unitPricePaise ?? 0,
      imageUrl: params.imageUrl ?? null,
      snapshottedAt: new Date()
    }
  });

  return prisma.cart.findUniqueOrThrow({
    where: { id: params.cartId },
    include: { items: true }
  });
}

export async function updateQuantity(params: {
  cartId: string;
  productId: string;
  quantity: number;
}): Promise<CartWithItems> {
  await prisma.cartItem.update({
    where: { cartId_productId: { cartId: params.cartId, productId: params.productId } },
    data: { quantity: params.quantity }
  });

  return prisma.cart.findUniqueOrThrow({
    where: { id: params.cartId },
    include: { items: true }
  });
}

export async function removeItem(cartId: string, productId: string): Promise<CartWithItems> {
  await prisma.cartItem.delete({
    where: { cartId_productId: { cartId, productId } }
  });

  return prisma.cart.findUniqueOrThrow({
    where: { id: cartId },
    include: { items: true }
  });
}

export async function clearCart(cartId: string): Promise<CartWithItems> {
  await prisma.cartItem.deleteMany({ where: { cartId } });

  return prisma.cart.findUniqueOrThrow({
    where: { id: cartId },
    include: { items: true }
  });
}

export async function countItems(cartId: string): Promise<number> {
  return prisma.cartItem.count({ where: { cartId } });
}

/**
 * Find the user's active cart, or create one if none exists.
 * Uses a "find-then-create" approach with a unique constraint retry
 * to handle race conditions safely.
 */
export async function getOrCreateActiveCart(userId: string): Promise<CartWithItems> {
  const existing = await prisma.cart.findFirst({
    where: { userId, status: CartStatus.ACTIVE },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  if (existing) return existing;

  try {
    return await prisma.cart.create({
      data: { userId },
      include: { items: true },
    });
  } catch (err: any) {
    // Race condition: another request may have just created one.
    // Re-query; if found, return it – otherwise rethrow.
    const retry = await prisma.cart.findFirst({
      where: { userId, status: CartStatus.ACTIVE },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });
    if (retry) return retry;
    throw err;
  }
}
