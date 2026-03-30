import { useParams } from "react-router-dom";
import { useOrder } from "../hooks/useOrders";
import { formatPrice } from "../lib/utils";
import { Skeleton } from "../components/ui/Skeleton";

const statusSteps = ["PLACED", "CONFIRMED", "DISPATCHED", "DELIVERED"];
const deliverySteps = ["PENDING", "ASSIGNED", "PICKED_UP", "IN_TRANSIT", "DELIVERED"];

export function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useOrder(id!);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!order) return <div className="p-8 text-center">Order not found</div>;

  const currentStep = statusSteps.indexOf(order.status);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Details</h1>
      <p className="text-sm text-gray-500 mb-6">
        Placed on {new Date(order.placed_at).toLocaleDateString("en-IN", {
          day: "numeric", month: "long", year: "numeric",
        })}
      </p>

      {/* Status Timeline */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <h2 className="font-bold text-gray-900 mb-4">Order Status</h2>
        <div className="flex items-center justify-between">
          {statusSteps.map((step, i) => (
            <div key={step} className="flex flex-col items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                i <= currentStep ? "bg-primary-600 text-white" : "bg-gray-200 text-gray-500"
              }`}>
                {i <= currentStep ? "✓" : i + 1}
              </div>
              <span className="text-xs mt-1 text-gray-600">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Tracking */}
      {order.delivery && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <h2 className="font-bold text-gray-900 mb-3">Delivery Tracking</h2>
          <p className="text-sm text-gray-600 mb-2">
            Status: <span className="font-medium">{order.delivery.status}</span>
          </p>
          {order.delivery.assigned_to && (
            <p className="text-sm text-gray-600">Assigned to: {order.delivery.assigned_to}</p>
          )}
          {order.delivery.events && order.delivery.events.length > 0 && (
            <div className="mt-3 space-y-2">
              {order.delivery.events.map((event, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <span className="text-gray-400 w-32 flex-shrink-0">
                    {new Date(event.created_at).toLocaleString("en-IN")}
                  </span>
                  <span className="text-gray-700">
                    {event.to_status}{event.notes ? ` — ${event.notes}` : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Items */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h2 className="font-bold text-gray-900 mb-3">Items</h2>
        {order.items.map((item) => (
          <div key={item.item_id} className="flex justify-between py-2 text-sm border-b border-gray-100 last:border-0">
            <span className="text-gray-700">{item.product_name} x{item.quantity}</span>
            <span className="font-medium">{formatPrice(item.unit_price_paise * item.quantity)}</span>
          </div>
        ))}
        <div className="flex justify-between pt-3 font-bold">
          <span>Total</span>
          <span>{formatPrice(order.total_paise)}</span>
        </div>
      </div>
    </div>
  );
}
