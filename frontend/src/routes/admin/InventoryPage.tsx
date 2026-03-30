import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/client";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

interface StockInfo {
  product_id: string;
  sku: string;
  available_qty: number;
  in_stock: boolean;
}

export function AdminInventoryPage() {
  const [productId, setProductId] = useState("");
  const [searchId, setSearchId] = useState("");

  const stockQuery = useQuery({
    queryKey: ["admin-stock", searchId],
    queryFn: () => api.get<StockInfo>(`/admin/inventory/${searchId}`),
    enabled: !!searchId,
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Inventory Lookup</h1>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex gap-3">
          <Input
            label="Product ID"
            placeholder="Enter product UUID"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="flex-1"
          />
          <div className="flex items-end">
            <Button onClick={() => setSearchId(productId)}>Check Stock</Button>
          </div>
        </div>

        {stockQuery.data && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm"><strong>SKU:</strong> {stockQuery.data.sku}</p>
            <p className="text-sm"><strong>Available:</strong> {stockQuery.data.available_qty}</p>
            <p className={`text-sm font-medium ${stockQuery.data.in_stock ? "text-green-600" : "text-red-600"}`}>
              {stockQuery.data.in_stock ? "In Stock" : "Out of Stock"}
            </p>
          </div>
        )}

        {stockQuery.isError && (
          <p className="mt-4 text-sm text-red-600">Product not found or stock unavailable.</p>
        )}
      </div>
    </div>
  );
}
