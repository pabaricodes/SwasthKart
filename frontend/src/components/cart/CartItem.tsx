import { CartItem as CartItemType } from "../../api/cart";
import { formatPrice } from "../../lib/utils";
import { Button } from "../ui/Button";

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
}

export function CartItemRow({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  return (
    <div className="flex gap-4 py-4 border-b border-gray-100">
      <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0">
        {item.image_url && (
          <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover rounded" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 truncate">{item.product_name}</h4>
        <p className="text-sm text-gray-600 mt-1">{formatPrice(item.unit_price_paise)}</p>
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
            className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center text-sm disabled:opacity-50"
          >
            -
          </button>
          <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center text-sm"
          >
            +
          </button>
        </div>
      </div>
      <div className="flex flex-col items-end justify-between">
        <span className="text-sm font-bold">
          {formatPrice(item.unit_price_paise * item.quantity)}
        </span>
        <Button variant="ghost" size="sm" onClick={() => onRemove(item.id)}>
          Remove
        </Button>
      </div>
    </div>
  );
}
