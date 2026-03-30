import { api } from "./client";

export interface OrderItem {
  item_id: string;
  product_id: string;
  sku: string;
  product_name: string;
  quantity: number;
  unit_price_paise: number;
}

export interface Order {
  order_id: string;
  status: string;
  total_paise: number;
  shipping_address: Record<string, unknown>;
  placed_at: string;
  items: OrderItem[];
  delivery?: {
    delivery_id: string;
    status: string;
    assigned_to: string | null;
    estimated_delivery_at: string | null;
    actual_delivery_at: string | null;
    events: Array<{
      from_status: string | null;
      to_status: string;
      notes: string | null;
      created_at: string;
    }>;
  } | null;
}

export interface PaginatedOrders {
  data: Order[];
  pagination: {
    page: number;
    page_size: number;
    total_count: number;
    total_pages: number;
  };
}

export function getOrders(page = 1) {
  return api.get<PaginatedOrders>("/ui/orders", { page });
}

export function getOrder(orderId: string) {
  return api.get<Order>(`/ui/orders/${orderId}`);
}

export function checkout(cartId: string, addressId: string, amountPaise: number) {
  return api.post<{ payment_id: string; redirect_url: string }>("/ui/checkout", {
    cart_id: cartId,
    address_id: addressId,
    amount_paise: amountPaise,
  });
}
