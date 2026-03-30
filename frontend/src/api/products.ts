import { api } from "./client";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  image_urls: string[];
  mrp_paise: number;
  selling_price_paise: number;
  unit: string;
  unit_value: number;
  nutrition_info: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g: number;
    serving_size: string;
    serving_unit: string;
  } | null;
  allergens: string[];
  category_id: string;
  stock?: { available_qty: number; in_stock: boolean } | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  sort_order: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    page_size: number;
    total_count: number;
    total_pages: number;
  };
}

export function getHome() {
  return api.get<{ categories: Category[]; featured_products: Product[] }>("/ui/home");
}

export function getCategoryPage(slug: string, page = 1, pageSize = 20) {
  return api.get<{ category: Category; products: PaginatedResponse<Product> }>(
    `/ui/category/${slug}`,
    { page, page_size: pageSize },
  );
}

export function getProductDetail(productId: string) {
  return api.get<Product>(`/ui/pdp/${productId}`);
}
