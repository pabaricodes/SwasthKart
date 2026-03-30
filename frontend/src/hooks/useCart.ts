import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as cartApi from "../api/cart";
import { useUiStore } from "../store/uiStore";

export function useCart() {
  const queryClient = useQueryClient();
  const addToast = useUiStore((s) => s.addToast);

  const cartQuery = useQuery({
    queryKey: ["cart"],
    queryFn: cartApi.getCart,
    retry: false,
  });

  const addItemMutation = useMutation({
    mutationFn: ({ productId, sku, quantity }: { productId: string; sku: string; quantity: number }) =>
      cartApi.addToCart(productId, sku, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      addToast("Added to cart", "success");
    },
    onError: () => addToast("Failed to add to cart", "error"),
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartApi.updateCartItem(itemId, quantity),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  const removeItemMutation = useMutation({
    mutationFn: (itemId: string) => cartApi.removeCartItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      addToast("Item removed", "info");
    },
  });

  return {
    cart: cartQuery.data,
    isLoading: cartQuery.isLoading,
    addItem: addItemMutation,
    updateItem: updateItemMutation,
    removeItem: removeItemMutation,
  };
}
