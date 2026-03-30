import { useParams, useSearchParams } from "react-router-dom";
import { useCategoryPage } from "../hooks/useProducts";
import { ProductGrid } from "../components/product/ProductGrid";
import { Button } from "../components/ui/Button";

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");

  const { data, isLoading } = useCategoryPage(slug!, page);

  const setPage = (p: number) => {
    setSearchParams({ page: String(p) });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {data?.category?.name || "Category"}
      </h1>

      <ProductGrid products={data?.products?.data} loading={isLoading} />

      {data?.products?.pagination && data.products.pagination.total_pages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span className="flex items-center text-sm text-gray-600">
            Page {page} of {data.products.pagination.total_pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= data.products.pagination.total_pages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
