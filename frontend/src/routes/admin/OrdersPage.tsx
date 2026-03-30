import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api/client";
import { useOrders } from "../../hooks/useOrders";
import { formatPrice } from "../../lib/utils";
import { Button } from "../../components/ui/Button";
import { useUiStore } from "../../store/uiStore";

export function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const addToast = useUiStore((s) => s.addToast);
  const { data, isLoading } = useOrders(1);

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      api.patch(`/admin/orders/${orderId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      addToast("Order status updated", "success");
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Order Management</h1>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Order ID</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.data?.map((order) => (
              <tr key={order.order_id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-mono text-xs">{order.order_id.slice(0, 8)}...</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100">
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">{formatPrice(order.total_paise)}</td>
                <td className="px-4 py-3 text-right">
                  <select
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        updateStatusMutation.mutate({
                          orderId: order.order_id,
                          status: e.target.value,
                        });
                      }
                    }}
                  >
                    <option value="">Update Status</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="DISPATCHED">DISPATCHED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
