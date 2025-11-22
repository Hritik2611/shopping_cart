import React, { useEffect, useState } from "react";
import useGlobalStore from "../store/globalStore";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

export default function CartPage() {
  const { items, getItems, cart, fetchCart, cartLoading, cartError } =
    useGlobalStore();
  const navigate = useNavigate();
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!Array.isArray(items) || items.length === 0) await getItems();
      await fetchCart();
    };
    init();
  }, [items, getItems, fetchCart]);

  const findProduct = (productId) => {
    if (!Array.isArray(items)) return null;
    return (
      items.find(
        (p) =>
          p.ID === productId ||
          p.id === productId ||
          p.product_id === productId ||
          p.productId === productId
      ) ?? null
    );
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="py-12">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-gray-600">Loading cart...</div>
          </div>
        </div>
      </div>
    );
  }

  if (cartError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="py-12">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-red-600">Error loading cart: {cartError}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="py-12">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-2xl font-semibold text-gray-900">Your cart</h2>
            <p className="mt-6 text-gray-600">No items in cart.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-12">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Your cart
          </h2>

          <ul className="space-y-4">
            {cart.map((ci, idx) => {
              const productId =
                ci.product_id ??
                ci.ProductID ??
                ci.productId ??
                ci.product_id ??
                ci.id;
              const quantity = ci.quantity ?? ci.Quantity ?? 1;
              const product = findProduct(Number(productId));
              const name = product?.name ?? `Product #${productId}`;
              const description = product?.description ?? "";
              const price = Number(product?.price ?? 0).toFixed(2);

              return (
                <li
                  key={ci.ID ?? ci.id ?? `cart-${idx}`}
                  className="bg-white border border-gray-100 rounded-lg p-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 shrink-0 flex items-center justify-center rounded-md bg-gray-100 text-gray-600">
                      {String(name).charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900">
                        {name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {description}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Product ID: {productId}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-gray-700">
                      Qty: <span className="font-medium">{quantity}</span>
                    </div>
                    <div className="text-sm text-gray-900 font-semibold mt-2">
                      ${(Number(price) * Number(quantity)).toFixed(2)}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 border-t pt-4 flex items-center justify-between">
            <div className="text-sm text-gray-700">Total:</div>
            <div className="text-lg font-semibold text-gray-900">
              $
              {(() => {
                try {
                  const total = (cart || []).reduce((sum, ci) => {
                    const pid = Number(
                      ci.product_id ?? ci.ProductID ?? ci.productId ?? ci.id
                    );
                    const prod = (Array.isArray(items) ? items : []).find(
                      (p) => Number(p.ID ?? p.id) === pid
                    );
                    const price = Number(prod?.price ?? ci.price ?? 0);
                    const qty = Number(ci.quantity ?? ci.Quantity ?? 1);
                    return sum + price * qty;
                  }, 0);
                  return total.toFixed(2);
                } catch {
                  return (0).toFixed(2);
                }
              })()}
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={async () => {
                if (checkingOut) return;
                setCheckingOut(true);
                try {
                  await useGlobalStore.getState().createOrder();
                  navigate("/orders");
                } catch (err) {
                  console.error("Checkout failed:", err);
                } finally {
                  setCheckingOut(false);
                }
              }}
              disabled={
                checkingOut ||
                cartLoading ||
                !Array.isArray(cart) ||
                cart.length === 0
              }
              className={`w-full inline-flex items-center justify-center gap-2 py-3 rounded-md cursor-pointer text-sm font-medium ${
                checkingOut ||
                cartLoading ||
                !Array.isArray(cart) ||
                cart.length === 0
                  ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                  : "bg-amber-600 text-white hover:bg-amber-700"
              }`}
            >
              {checkingOut ? "Placing order..." : "Checkout"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
