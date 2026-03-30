import { makeHttpClient } from "./httpClient";
import { env } from "../config/env";
import { DownstreamError } from "../utils/errors";

const http = makeHttpClient(env.CATALOG_SERVICE_URL);

export type CatalogItem = {
  productId: string;
  name: string;
  currency: string;
  unitPrice: number; // minor units (paise)
};

export async function getCatalogItem(productId: string): Promise<CatalogItem> {
  try {
    // Catalog service: GET /v1/products/:id
    const res = await http.get(`/v1/products/${encodeURIComponent(productId)}`);
    const data = res.data as any;
    return {
      productId: data.id,
      name: data.name,
      currency: "INR",
      unitPrice: data.selling_price_paise,
    };
  } catch (e: any) {
    const status = e?.response?.status;
    if (status === 404) {
      throw new DownstreamError("Product not found", { productId });
    }
    throw new DownstreamError("Catalog service error", { productId, status });
  }
}
