import { Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { CartItemRow } from "../components/cart/CartItem";
import { formatPrice } from "../lib/utils";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";

export function CartPage() {
  const { cart, isLoading, updateItem, removeItem } = useCart();

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 mb-4" />
        ))}
      </div>
    );
  }

  if (!cart?.items?.length) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Browse our products and add items to get started.</p>
        <Link to="/">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Cart</h1>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        {cart.items.map((item) => (
          <CartItemRow
            key={item.id}
            item={item}
            onUpdateQuantity={(itemId, qty) => updateItem.mutate({ itemId, quantity: qty })}
            onRemove={(itemId) => removeItem.mutate(itemId)}
          />
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 mt-4">
        <div className="flex justify-between items-center text-lg font-bold">
          <span>Total</span>
          <span>{formatPrice(cart.total_paise)}</span>
        </div>
        <Link to="/checkout">
          <Button size="lg" className="w-full mt-4">
            Proceed to Checkout
          </Button>
        </Link>
      </div>
    </div>
  );
}
