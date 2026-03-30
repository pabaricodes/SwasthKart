import { Link } from "react-router-dom";
import { Product } from "../../api/products";
import { formatPrice } from "../../lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const discount = product.mrp_paise > product.selling_price_paise
    ? Math.round(((product.mrp_paise - product.selling_price_paise) / product.mrp_paise) * 100)
    : 0;

  const outOfStock = product.stock?.in_stock === false;

  return (
    <Link
      to={`/product/${product.id}`}
      className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="aspect-square bg-gray-100 relative">
        {product.image_urls?.[0] ? (
          <img
            src={product.image_urls[0]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No image
          </div>
        )}
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            {discount}% OFF
          </span>
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">Out of Stock</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs text-gray-500">{product.brand}</p>
        <h3 className="text-sm font-medium text-gray-900 mt-1 line-clamp-2 group-hover:text-primary-600">
          {product.name}
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          {product.unit_value} {product.unit}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm font-bold text-gray-900">
            {formatPrice(product.selling_price_paise)}
          </span>
          {discount > 0 && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(product.mrp_paise)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
