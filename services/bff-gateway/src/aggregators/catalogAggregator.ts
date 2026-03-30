import { env } from "../config/env";
import { serviceCall } from "../utils/httpClient";

export async function getHomeData() {
  const [categories, featuredProducts] = await Promise.all([
    serviceCall<any>("get", `${env.CATALOG_SERVICE_URL}/v1/categories`),
    serviceCall<any>("get", `${env.CATALOG_SERVICE_URL}/v1/products`, {
      params: { page_size: 12, sort_by: "created_at", sort_order: "desc" },
    }),
  ]);

  // Enrich with stock data
  const productIds = featuredProducts.data?.map((p: any) => p.id) || [];
  let stockMap: Record<string, any> = {};
  if (productIds.length > 0) {
    try {
      const stockData = await serviceCall<any[]>("post", `${env.INVENTORY_SERVICE_URL}/v1/stock/batch`, {
        data: { product_ids: productIds },
      });
      for (const s of stockData) {
        stockMap[s.product_id] = s;
      }
    } catch {
      // Stock service down — proceed without stock info
    }
  }

  return {
    categories,
    featured_products: featuredProducts.data?.map((p: any) => ({
      ...p,
      stock: stockMap[p.id] || null,
    })),
  };
}

export async function getCategoryPage(slug: string, page: number, pageSize: number) {
  // Get category info
  const category = await serviceCall<any>("get", `${env.CATALOG_SERVICE_URL}/v1/categories/${slug}`);

  // Get products in category
  const products = await serviceCall<any>("get", `${env.CATALOG_SERVICE_URL}/v1/products`, {
    params: { category_id: category.id, page, page_size: pageSize },
  });

  // Batch stock check
  const productIds = products.data?.map((p: any) => p.id) || [];
  let stockMap: Record<string, any> = {};
  if (productIds.length > 0) {
    try {
      const stockData = await serviceCall<any[]>("post", `${env.INVENTORY_SERVICE_URL}/v1/stock/batch`, {
        data: { product_ids: productIds },
      });
      for (const s of stockData) {
        stockMap[s.product_id] = s;
      }
    } catch {
      // proceed without stock
    }
  }

  return {
    category,
    products: {
      ...products,
      data: products.data?.map((p: any) => ({
        ...p,
        stock: stockMap[p.id] || null,
      })),
    },
  };
}

export async function getProductDetail(productId: string) {
  const [product, stock] = await Promise.all([
    serviceCall<any>("get", `${env.CATALOG_SERVICE_URL}/v1/products/${productId}`),
    serviceCall<any>("get", `${env.INVENTORY_SERVICE_URL}/v1/stock/${productId}`).catch(() => null),
  ]);

  return {
    ...product,
    stock,
  };
}
