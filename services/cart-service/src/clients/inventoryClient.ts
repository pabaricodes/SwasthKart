import { makeHttpClient } from "./httpClient";
import { env } from "../config/env";
import { DownstreamError } from "../utils/errors";

const http = makeHttpClient(env.INVENTORY_SERVICE_URL);

export type InventoryAvailability = {
  productId: string;
  available: boolean;
  availableQty: number;
};

export async function getAvailability(productId: string): Promise<InventoryAvailability> {
  try {
    // Inventory service: GET /v1/stock/:productId
    const res = await http.get(`/v1/stock/${encodeURIComponent(productId)}`);
    const data = res.data as any;
    return {
      productId: data.product_id || data.productId || productId,
      available: (data.available_qty ?? data.availableQty ?? 0) > 0,
      availableQty: data.available_qty ?? data.availableQty ?? 0,
    };
  } catch (e: any) {
    const status = e?.response?.status;
    if (status === 404) {
      // Product not in inventory — treat as unavailable
      return { productId, available: false, availableQty: 0 };
    }
    throw new DownstreamError("Inventory service error", { productId, status });
  }
}
