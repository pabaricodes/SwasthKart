import axios, { AxiosInstance } from "axios";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import { BadGatewayError } from "../utils/errors";

function makeClient(baseURL: string): AxiosInstance {
  const client = axios.create({
    baseURL,
    timeout: 10_000,
    headers: { "content-type": "application/json" },
  });

  client.interceptors.response.use(
    (res) => res,
    (error) => {
      logger.warn(
        { baseURL, url: error.config?.url, code: error.code, status: error.response?.status },
        "Downstream request failed",
      );
      throw new BadGatewayError(
        `Downstream ${baseURL} failed: ${error.message}`,
      );
    },
  );

  return client;
}

export const catalogClient = makeClient(env.CATALOG_SERVICE_URL);
export const inventoryClient = makeClient(env.INVENTORY_SERVICE_URL);
export const orderClient = makeClient(env.ORDER_SERVICE_URL);
export const deliveryClient = makeClient(env.DELIVERY_SERVICE_URL);

export interface DashboardStats {
  catalog: { productCount: number };
  inventory: { totalItems: number };
  orders: { totalOrders: number };
  delivery: { activeDeliveries: number };
}

/**
 * Aggregates basic stats from downstream services for the admin dashboard.
 * Each call is best-effort; failures return fallback values.
 */
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const fallback = <T>(val: T) => val;

  const [catalog, inventory, orders, delivery] = await Promise.allSettled([
    catalogClient.get("/health/ready").then(() => catalogClient.get("/v1/products?limit=0")),
    inventoryClient.get("/health/ready").then(() => inventoryClient.get("/v1/inventory/stats")),
    orderClient.get("/health/ready").then(() => orderClient.get("/v1/orders/stats")),
    deliveryClient.get("/health/ready").then(() => deliveryClient.get("/v1/deliveries/stats")),
  ]);

  return {
    catalog: {
      productCount:
        catalog.status === "fulfilled"
          ? (catalog.value.data?.total ?? catalog.value.data?.count ?? 0)
          : fallback(0),
    },
    inventory: {
      totalItems:
        inventory.status === "fulfilled"
          ? (inventory.value.data?.totalItems ?? 0)
          : fallback(0),
    },
    orders: {
      totalOrders:
        orders.status === "fulfilled"
          ? (orders.value.data?.totalOrders ?? 0)
          : fallback(0),
    },
    delivery: {
      activeDeliveries:
        delivery.status === "fulfilled"
          ? (delivery.value.data?.activeDeliveries ?? 0)
          : fallback(0),
    },
  };
}
