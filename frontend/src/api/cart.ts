import { api } from "./client";

export interface CartItem {
  id: string;
  product_id: string;
  sku: string;
  product_name: string;
  image_url: string;
  quantity: number;
  unit_price_paise: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  total_paise: number;
  reservation_id?: string;
}

export function getCart() {
  return api.get<Cart>("/ui/cart");
}

export function addToCart(productId: string, sku: string, quantity: number) {
  return api.post<Cart>("/ui/cart/items", { product_id: productId, sku, quantity }, {
    "Idempotency-Key": `${productId}-${Date.now()}`,
  });
}

export function updateCartItem(itemId: string, quantity: number) {
  return api.put<Cart>(`/ui/cart/items/${itemId}`, { quantity });
}

export function removeCartItem(itemId: string) {
  return api.delete(`/ui/cart/items/${itemId}`);
}
