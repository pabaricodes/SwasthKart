import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api/client";
import { Product, PaginatedResponse } from "../../api/products";
import { formatPrice } from "../../lib/utils";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useUiStore } from "../../store/uiStore";

export function AdminProductsPage() {
  const queryClient = useQueryClient();
  const addToast = useUiStore((s) => s.addToast);
  const [page] = useState(1);

  // Fetch via BFF which proxies to catalog
  const productsQuery = useQuery({
    queryKey: ["admin-products", page],
    queryFn: () => api.get<PaginatedResponse<Product>>(`/ui/category/all`, { page }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      addToast("Product deleted", "success");
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Product</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Brand</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Price</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {productsQuery.data?.data?.map((product) => (
              <tr key={product.id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-medium">{product.name}</td>
                <td className="px-4 py-3 text-gray-600">{product.brand}</td>
                <td className="px-4 py-3 text-right">{formatPrice(product.selling_price_paise)}</td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="danger"
                    size="sm"
                    loading={deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate(product.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
