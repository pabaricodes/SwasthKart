import { prisma } from "../db/prisma";
import { Prisma } from "@prisma/client";
import { publishOrderPlaced } from "../kafka/producer";
import { env } from "../config/env";
import { NotFoundError } from "../utils/errors";
import { logger } from "../utils/logger";
import { randomUUID } from "crypto";
import axios from "axios";

interface PaymentSucceededEvent {
  event_id: string;
  payment_id: string;
  user_id: string;
  cart_id: string;
  address_id: string;
  amount_paise: number;
  currency: string;
  provider_ref: string;
  occurred_at: string;
}

export async function createOrderFromPayment(event: PaymentSucceededEvent): Promise<void> {
  // Idempotency: check if order already exists for this payment
  const existing = await prisma.order.findUnique({
    where: { paymentId: event.payment_id },
  });
  if (existing) {
    logger.info({ payment_id: event.payment_id, order_id: existing.id }, "Order already exists, skipping");
    return;
  }

  // Fetch cart items from cart-service
  // Cart service returns: { cart: { id, items: [...], ... }, totals: {...} }
  const cartRes = await axios.get(`${env.CART_SERVICE_URL}/v1/carts/${event.cart_id}`, {
    headers: { "x-user-id": event.user_id },
  });
  const cartData = cartRes.data;
  const cartItems = cartData.cart?.items ?? cartData.items ?? [];

  if (!cartItems.length) {
    logger.error({ cart_id: event.cart_id }, "Cart has no items, cannot create order");
    return;
  }

  // Fetch address from identity-service
  let shippingAddress: Record<string, unknown> = { address_id: event.address_id };
  try {
    const addrRes = await axios.get(
      `${env.IDENTITY_SERVICE_URL}/v1/users/me/addresses/${event.address_id}`,
      { headers: { "x-user-id": event.user_id } },
    );
    shippingAddress = addrRes.data;
  } catch {
    // If we can't fetch address, store the ID — delivery service will resolve
    logger.warn({ address_id: event.address_id }, "Could not fetch address, storing ID only");
  }

  // Confirm inventory reservation (if cart had one)
  try {
    const reservationId = cartData.cart?.reservation_id ?? cartData.reservation_id;
    if (reservationId) {
      await axios.post(`${env.INVENTORY_SERVICE_URL}/v1/reservations/${reservationId}/confirm`);
      logger.info({ reservation_id: reservationId }, "Inventory reservation confirmed");
    }
  } catch (err) {
    logger.error({ err }, "Failed to confirm inventory reservation");
  }

  // Create order with items
  // Cart items come back in camelCase from Prisma: productId, sku, productName, quantity, unitPricePaise
  const order = await prisma.order.create({
    data: {
      userId: event.user_id,
      paymentId: event.payment_id,
      status: "PLACED",
      totalPaise: event.amount_paise,
      shippingAddress: shippingAddress as Prisma.InputJsonValue,
      items: {
        create: cartItems.map((item: any) => ({
          productId: item.productId || item.product_id,
          sku: item.sku || item.productId || item.product_id,
          productName: item.productName || item.product_name || "Unknown",
          quantity: item.quantity,
          unitPricePaise: item.unitPricePaise || item.unit_price_paise || 0,
        })),
      },
      events: {
        create: {
          fromStatus: null,
          toStatus: "PLACED",
          actor: "system",
        },
      },
    },
    include: { items: true },
  });

  logger.info({ order_id: order.id, payment_id: event.payment_id }, "Order created");

  // Publish OrderPlaced event
  await publishOrderPlaced({
    event_id: randomUUID(),
    order_id: order.id,
    user_id: order.userId,
    items: order.items.map((item) => ({
      product_id: item.productId,
      sku: item.sku,
      product_name: item.productName,
      quantity: item.quantity,
      unit_price_paise: item.unitPricePaise,
    })),
    shipping_address: shippingAddress,
    total_paise: order.totalPaise,
    occurred_at: new Date().toISOString(),
  });
}

export async function listOrders(userId: string, page: number, pageSize: number) {
  const [orders, totalCount] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { placedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.count({ where: { userId } }),
  ]);

  return {
    data: orders.map(mapOrderResponse),
    pagination: {
      page,
      page_size: pageSize,
      total_count: totalCount,
      total_pages: Math.ceil(totalCount / pageSize),
    },
  };
}

export async function listAllOrders(
  page: number,
  pageSize: number,
  status?: string,
) {
  const where: Prisma.OrderWhereInput = {};
  if (status) where.status = status as any;

  const [orders, totalCount] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { placedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    data: orders.map(mapOrderResponse),
    pagination: {
      page,
      page_size: pageSize,
      total_count: totalCount,
      total_pages: Math.ceil(totalCount / pageSize),
    },
  };
}

export async function getOrder(orderId: string, userId?: string) {
  const where: { id: string; userId?: string } = { id: orderId };
  if (userId) where.userId = userId;

  const order = await prisma.order.findFirst({
    where,
    include: { items: true, events: { orderBy: { createdAt: "asc" } } },
  });
  if (!order) throw new NotFoundError("Order not found");
  return mapOrderResponse(order);
}

export async function updateOrderStatus(orderId: string, newStatus: string, actor: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new NotFoundError("Order not found");

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.order.update({
      where: { id: orderId },
      data: { status: newStatus as any },
      include: { items: true },
    });

    await tx.orderEvent.create({
      data: {
        orderId,
        fromStatus: order.status,
        toStatus: newStatus,
        actor,
      },
    });

    return result;
  });

  logger.info({ order_id: orderId, from: order.status, to: newStatus }, "Order status updated");
  return mapOrderResponse(updated);
}

function mapOrderResponse(order: any) {
  return {
    order_id: order.id,
    user_id: order.userId,
    payment_id: order.paymentId,
    status: order.status,
    total_paise: order.totalPaise,
    shipping_address: order.shippingAddress,
    placed_at: order.placedAt?.toISOString(),
    updated_at: order.updatedAt?.toISOString(),
    items: order.items?.map((item: any) => ({
      item_id: item.id,
      product_id: item.productId,
      sku: item.sku,
      product_name: item.productName,
      quantity: item.quantity,
      unit_price_paise: item.unitPricePaise,
    })),
    events: order.events?.map((e: any) => ({
      from_status: e.fromStatus,
      to_status: e.toStatus,
      actor: e.actor,
      created_at: e.createdAt?.toISOString(),
    })),
  };
}
