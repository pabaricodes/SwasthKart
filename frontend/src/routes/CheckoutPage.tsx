import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "../api/client";
import { checkout } from "../api/orders";
import { useCart } from "../hooks/useCart";
import { formatPrice } from "../lib/utils";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useUiStore } from "../store/uiStore";

interface Address {
  id: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { cart } = useCart();
  const addToast = useUiStore((s) => s.addToast);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: "", line1: "", line2: "", city: "", state: "", pincode: "",
  });

  const addressesQuery = useQuery({
    queryKey: ["addresses"],
    queryFn: () => api.get<Address[]>("/ui/addresses"),
  });

  useEffect(() => {
    if (addressesQuery.data?.length) {
      const defaultAddr = addressesQuery.data.find((a) => a.is_default);
      setSelectedAddressId(defaultAddr?.id || addressesQuery.data[0].id);
    }
  }, [addressesQuery.data]);

  const addAddressMutation = useMutation({
    mutationFn: (data: typeof newAddress) => api.post<Address>("/ui/addresses", data),
    onSuccess: (addr) => {
      addressesQuery.refetch();
      setSelectedAddressId(addr.id);
      setShowAddForm(false);
      setNewAddress({ label: "", line1: "", line2: "", city: "", state: "", pincode: "" });
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: () => {
      if (!cart) throw new Error("No cart");
      return checkout(cart.id, selectedAddressId, cart.total_paise);
    },
    onSuccess: (data) => {
      // Redirect to mock payment page
      window.location.href = data.redirect_url;
    },
    onError: () => addToast("Checkout failed. Please try again.", "error"),
  });

  if (!cart?.items?.length) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      {/* Address Selection */}
      <section className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <h2 className="font-bold text-gray-900 mb-3">Delivery Address</h2>

        {addressesQuery.data?.map((addr) => (
          <label
            key={addr.id}
            className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer border mb-2 ${
              selectedAddressId === addr.id ? "border-primary-500 bg-primary-50" : "border-gray-200"
            }`}
          >
            <input
              type="radio"
              name="address"
              checked={selectedAddressId === addr.id}
              onChange={() => setSelectedAddressId(addr.id)}
              className="mt-1"
            />
            <div>
              <p className="font-medium text-sm">{addr.label}</p>
              <p className="text-sm text-gray-600">
                {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.state} - {addr.pincode}
              </p>
            </div>
          </label>
        ))}

        {!showAddForm ? (
          <Button variant="outline" size="sm" onClick={() => setShowAddForm(true)}>
            + Add New Address
          </Button>
        ) : (
          <div className="space-y-3 mt-3 p-3 border border-gray-200 rounded-lg">
            <Input label="Label" placeholder="Home, Office..." value={newAddress.label}
              onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })} />
            <Input label="Address Line 1" value={newAddress.line1}
              onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })} />
            <Input label="Address Line 2" value={newAddress.line2}
              onChange={(e) => setNewAddress({ ...newAddress, line2: e.target.value })} />
            <div className="grid grid-cols-3 gap-3">
              <Input label="City" value={newAddress.city}
                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} />
              <Input label="State" value={newAddress.state}
                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} />
              <Input label="Pincode" value={newAddress.pincode} maxLength={6}
                onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <Button size="sm" loading={addAddressMutation.isPending}
                onClick={() => addAddressMutation.mutate(newAddress)}>
                Save Address
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </section>

      {/* Order Summary */}
      <section className="bg-white rounded-lg border border-gray-200 p-4">
        <h2 className="font-bold text-gray-900 mb-3">Order Summary</h2>
        {cart.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm py-1">
            <span className="text-gray-600">{item.product_name} x{item.quantity}</span>
            <span>{formatPrice(item.unit_price_paise * item.quantity)}</span>
          </div>
        ))}
        <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between font-bold">
          <span>Total</span>
          <span>{formatPrice(cart.total_paise)}</span>
        </div>
        <Button
          size="lg"
          className="w-full mt-4"
          disabled={!selectedAddressId}
          loading={checkoutMutation.isPending}
          onClick={() => checkoutMutation.mutate()}
        >
          Pay {formatPrice(cart.total_paise)}
        </Button>
      </section>
    </div>
  );
}
