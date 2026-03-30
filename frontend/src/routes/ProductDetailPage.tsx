import { useParams } from "react-router-dom";
import { useProductDetail } from "../hooks/useProducts";
import { useCart } from "../hooks/useCart";
import { useAuthStore } from "../store/authStore";
import { formatPrice } from "../lib/utils";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading } = useProductDetail(id!);
  const { addItem } = useCart();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return <div className="p-8 text-center">Product not found</div>;

  const discount = product.mrp_paise > product.selling_price_paise
    ? Math.round(((product.mrp_paise - product.selling_price_paise) / product.mrp_paise) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
          {product.image_urls?.[0] ? (
            <img src={product.image_urls[0]} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
          )}
        </div>

        {/* Details */}
        <div>
          <p className="text-sm text-gray-500">{product.brand}</p>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{product.name}</h1>
          <p className="text-sm text-gray-500 mt-1">{product.unit_value} {product.unit}</p>

          <div className="flex items-center gap-3 mt-4">
            <span className="text-2xl font-bold text-gray-900">
              {formatPrice(product.selling_price_paise)}
            </span>
            {discount > 0 && (
              <>
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(product.mrp_paise)}
                </span>
                <span className="text-sm font-medium text-red-600">{discount}% OFF</span>
              </>
            )}
          </div>

          {product.stock && (
            <p className={`text-sm mt-2 ${product.stock.in_stock ? "text-green-600" : "text-red-600"}`}>
              {product.stock.in_stock ? `In Stock (${product.stock.available_qty} available)` : "Out of Stock"}
            </p>
          )}

          <p className="text-gray-600 mt-4">{product.description}</p>

          <Button
            size="lg"
            className="mt-6 w-full md:w-auto"
            disabled={!isAuthenticated || product.stock?.in_stock === false}
            loading={addItem.isPending}
            onClick={() => addItem.mutate({ productId: product.id, sku: product.slug, quantity: 1 })}
          >
            {isAuthenticated ? "Add to Cart" : "Login to Add"}
          </Button>

          {/* Nutrition Info */}
          {product.nutrition_info && (
            <div className="mt-8 border border-gray-200 rounded-lg p-4">
              <h3 className="font-bold text-sm mb-3">Nutrition Facts</h3>
              <p className="text-xs text-gray-500 mb-2">
                Per {product.nutrition_info.serving_size} {product.nutrition_info.serving_unit}
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Calories</span>
                  <span className="font-medium">{product.nutrition_info.calories}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Protein</span>
                  <span className="font-medium">{product.nutrition_info.protein_g}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Carbs</span>
                  <span className="font-medium">{product.nutrition_info.carbs_g}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fat</span>
                  <span className="font-medium">{product.nutrition_info.fat_g}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fiber</span>
                  <span className="font-medium">{product.nutrition_info.fiber_g}g</span>
                </div>
              </div>
              {product.allergens?.length > 0 && (
                <p className="text-xs text-red-600 mt-3">
                  Allergens: {product.allergens.join(", ")}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
