import { Link, useSearchParams } from "react-router-dom";
import { useOrders } from "../hooks/useOrders";
import { formatPrice } from "../lib/utils";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";

const statusColors: Record<string, string> = {
  PLACED: "bg-blue-100 text-blue-800",
  CONFIRMED: "bg-indigo-100 text-indigo-800",
  DISPATCHED: "bg-yellow-100 text-yellow-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export function OrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");
  const { data, isLoading } = useOrders(page);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  if (!data?.data?.length) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h2>
        <Link to="/"><Button>Start Shopping</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

      <div className="space-y-4">
        {data.data.map((order) => (
          <Link
            key={order.order_id}
            to={`/orders/${order.order_id}`}
            className="block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">
                  {new Date(order.placed_at).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </p>
                <p className="text-sm font-medium mt-1">
                  {order.items.length} item{order.items.length > 1 ? "s" : ""}
                </p>
              </div>
              <div className="text-right">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[order.status] || "bg-gray-100"}`}>
                  {order.status}
                </span>
                <p className="text-sm font-bold mt-2">{formatPrice(order.total_paise)}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {data.pagination.total_pages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button variant="outline" size="sm" disabled={page <= 1}
            onClick={() => setSearchParams({ page: String(page - 1) })}>
            Previous
          </Button>
          <span className="flex items-center text-sm text-gray-600">
            Page {page} of {data.pagination.total_pages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= data.pagination.total_pages}
            onClick={() => setSearchParams({ page: String(page + 1) })}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
