import { useQuery } from "@tanstack/react-query";
import * as ordersApi from "../api/orders";

export function useOrders(page = 1) {
  return useQuery({
    queryKey: ["orders", page],
    queryFn: () => ordersApi.getOrders(page),
  });
}

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: () => ordersApi.getOrder(orderId),
    enabled: !!orderId,
  });
}
