import { Link } from "react-router-dom";
import { useHome } from "../hooks/useProducts";
import { ProductGrid } from "../components/product/ProductGrid";
import { Skeleton } from "../components/ui/Skeleton";

export function HomePage() {
  const { data, isLoading } = useHome();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Categories */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Shop by Category</h2>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {data?.categories?.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="group bg-white rounded-lg border border-gray-200 p-4 text-center hover:shadow-md transition-shadow"
              >
                {cat.image_url && (
                  <img src={cat.image_url} alt={cat.name} className="w-16 h-16 mx-auto mb-2 object-contain" />
                )}
                <p className="text-sm font-medium text-gray-900 group-hover:text-primary-600">
                  {cat.name}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured Products */}
      <section className="mt-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Fresh Picks</h2>
        <ProductGrid products={data?.featured_products} loading={isLoading} />
      </section>
    </div>
  );
}
