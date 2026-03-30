import { useQuery } from "@tanstack/react-query";
import * as productsApi from "../api/products";

export function useHome() {
  return useQuery({
    queryKey: ["home"],
    queryFn: productsApi.getHome,
  });
}

export function useCategoryPage(slug: string, page = 1) {
  return useQuery({
    queryKey: ["category", slug, page],
    queryFn: () => productsApi.getCategoryPage(slug, page),
  });
}

export function useProductDetail(productId: string) {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: () => productsApi.getProductDetail(productId),
    enabled: !!productId,
  });
}
