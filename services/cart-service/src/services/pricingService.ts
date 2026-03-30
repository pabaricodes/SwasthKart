import { CartItem } from "@prisma/client";

export type CartTotals = {
  currency: string;
  subtotal: number;
  itemCount: number;
};

export function computeTotals(currency: string, items: CartItem[]): CartTotals {
  let subtotal = 0;
  let itemCount = 0;

  for (const it of items) {
    itemCount += it.quantity;
    if (typeof it.unitPricePaise === "number") subtotal += it.unitPricePaise * it.quantity;
  }

  return { currency, subtotal, itemCount };
}
