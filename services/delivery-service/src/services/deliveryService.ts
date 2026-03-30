import { prisma } from "../db/prisma";
import { publishOrderHandedOff } from "../kafka/producer";
import { NotFoundError, AppError } from "../utils/errors";
import { logger } from "../utils/logger";
import { randomUUID } from "crypto";

interface OrderPlacedEvent {
  event_id: string;
  order_id: string;
  user_id: string;
  items: Array<{
    product_id: string;
    sku: string;
    product_name: string;
    quantity: number;
    unit_price_paise: number;
  }>;
  shipping_address: Record<string, unknown>;
  total_paise: number;
  occurred_at: string;
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["ASSIGNED"],
  ASSIGNED: ["PICKED_UP"],
  PICKED_UP: ["IN_TRANSIT"],
  IN_TRANSIT: ["DELIVERED", "FAILED"],
};

export async function createDeliveryFromOrder(event: OrderPlacedEvent): Promise<void> {
  // Idempotency
  const existing = await prisma.delivery.findUnique({
    where: { orderId: event.order_id },
  });
  if (existing) {
    logger.info({ order_id: event.order_id, delivery_id: existing.id }, "Delivery already exists, skipping");
    return;
  }

  const delivery = await prisma.delivery.create({
    data: {
      orderId: event.order_id,
      status: "PENDING",
      events: {
        create: {
          fromStatus: null,
          toStatus: "PENDING",
          notes: "Delivery created from order",
        },
      },
    },
  });

  logger.info({ delivery_id: delivery.id, order_id: event.order_id }, "Delivery created");
}

export async function getDeliveryByOrderId(orderId: string) {
  const delivery = await prisma.delivery.findUnique({
    where: { orderId },
    include: { events: { orderBy: { createdAt: "asc" } } },
  });
  if (!delivery) throw new NotFoundError("Delivery not found");
  return mapDeliveryResponse(delivery);
}

export async function getDelivery(deliveryId: string) {
  const delivery = await prisma.delivery.findUnique({
    where: { id: deliveryId },
    include: { events: { orderBy: { createdAt: "asc" } } },
  });
  if (!delivery) throw new NotFoundError("Delivery not found");
  return mapDeliveryResponse(delivery);
}

export async function updateDeliveryStatus(deliveryId: string, newStatus: string, notes?: string) {
  const delivery = await prisma.delivery.findUnique({ where: { id: deliveryId } });
  if (!delivery) throw new NotFoundError("Delivery not found");

  const allowed = VALID_TRANSITIONS[delivery.status];
  if (!allowed || !allowed.includes(newStatus)) {
    throw new AppError(422, "INVALID_TRANSITION", `Cannot transition from ${delivery.status} to ${newStatus}`);
  }

  const updateData: Record<string, unknown> = { status: newStatus as any };
  if (newStatus === "DELIVERED") {
    updateData.actualDeliveryAt = new Date();
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.delivery.update({
      where: { id: deliveryId },
      data: updateData,
      include: { events: { orderBy: { createdAt: "asc" } } },
    });

    await tx.deliveryEvent.create({
      data: {
        deliveryId,
        fromStatus: delivery.status,
        toStatus: newStatus,
        notes: notes || null,
      },
    });

    return result;
  });

  logger.info({ delivery_id: deliveryId, from: delivery.status, to: newStatus }, "Delivery status updated");

  // Publish OrderHandedOff when delivered
  if (newStatus === "DELIVERED") {
    await publishOrderHandedOff({
      event_id: randomUUID(),
      order_id: delivery.orderId,
      delivery_id: delivery.id,
      delivered_at: new Date().toISOString(),
      occurred_at: new Date().toISOString(),
    });
  }

  return mapDeliveryResponse(updated);
}

export async function listDeliveries(page: number, pageSize: number, status?: string) {
  const where: Record<string, unknown> = {};
  if (status) {
    where.status = status;
  }

  const [deliveries, totalCount] = await Promise.all([
    prisma.delivery.findMany({
      where,
      include: { events: { orderBy: { createdAt: "asc" } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.delivery.count({ where }),
  ]);

  return {
    data: deliveries.map(mapDeliveryResponse),
    pagination: {
      page,
      page_size: pageSize,
      total_count: totalCount,
      total_pages: Math.ceil(totalCount / pageSize),
    },
  };
}

function mapDeliveryResponse(delivery: any) {
  return {
    delivery_id: delivery.id,
    order_id: delivery.orderId,
    status: delivery.status,
    assigned_to: delivery.assignedTo,
    estimated_delivery_at: delivery.estimatedDeliveryAt?.toISOString() || null,
    actual_delivery_at: delivery.actualDeliveryAt?.toISOString() || null,
    created_at: delivery.createdAt.toISOString(),
    updated_at: delivery.updatedAt.toISOString(),
    events: delivery.events?.map((e: any) => ({
      from_status: e.fromStatus,
      to_status: e.toStatus,
      notes: e.notes,
      created_at: e.createdAt.toISOString(),
    })),
  };
}
