import { env } from "../config/env";
import { serviceCall } from "../utils/httpClient";

export async function getOrderDetail(orderId: string, userId: string) {
  const headers = { "x-user-id": userId };

  const [order, delivery] = await Promise.all([
    serviceCall<any>("get", `${env.ORDER_SERVICE_URL}/v1/orders/${orderId}`, { headers }),
    serviceCall<any>("get", `${env.DELIVERY_SERVICE_URL}/v1/deliveries/order/${orderId}`).catch(() => null),
  ]);

  return {
    ...order,
    delivery,
  };
}
