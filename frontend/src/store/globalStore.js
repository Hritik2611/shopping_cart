import { create } from "zustand";
const apiUrl = import.meta.env.VITE_API_URL;
const devProxy = import.meta.env.DEV === true;
const useGlobalStore = create((set) => ({
  cart: [],
  cartLoading: false,
  cartError: null,
  items: [],
  orders: [],

  fetchCart: async () => {
    set({ cartLoading: true, cartError: null });
    try {
      const base = devProxy ? "" : apiUrl || "";
      const res = await fetch(`${base}/carts`, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) {
        set({ cart: [] });
        return [];
      }
      const data = await res.json();
      let c = data?.cart ?? data;
      if (!c) c = [];
      if (!Array.isArray(c)) c = [c];
      set({ cart: c });
      return c;
    } catch (err) {
      set({ cartError: err.message || String(err) });
      throw err;
    } finally {
      set({ cartLoading: false });
    }
  },
  getItems: async () => {
    try {
      const base = devProxy ? "" : apiUrl || "";
      const url = `${base}/items`;
      const res = await fetch(url);
      const data = await res.json();

      const items = data.items ?? data;
      set({ items });
      return data;
    } catch (error) {
      throw new Error(error.message || String(error));
    }
  },
  addToCart: async (item, quantity = 1) => {
    const productId =
      (item && (item.ID || item.id || item.product_id || item.productId)) ||
      item;

    if (!productId) {
      throw new Error("missing product id for addToCart");
    }

    set({ cartLoading: true, cartError: null });
    try {
      const base = devProxy ? "" : apiUrl || "";
      const res = await fetch(`${base}/carts`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: Number(productId),
          quantity: Number(quantity),
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        const msg =
          errBody?.error ||
          errBody?.message ||
          `Add to cart failed (${res.status})`;
        set({ cartError: msg });
        throw new Error(msg);
      }

      const data = await res.json().catch(() => null);

      if (typeof useGlobalStore.getState === "function") {
        try {
          await useGlobalStore.getState().fetchCart();
        } catch (e) {
          set({ cartError: e.message || String(e) });
        }
      }

      return data;
    } catch (err) {
      set({ cartError: err.message || String(err) });
      throw err;
    } finally {
      set({ cartLoading: false });
    }
  },

  createOrder: async () => {
    set({ cartLoading: true, cartError: null });
    try {
      const base = devProxy ? "" : apiUrl || "";
      const res = await fetch(`${base}/orders`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        const msg =
          errBody?.error ||
          errBody?.message ||
          `Create order failed (${res.status})`;
        set({ cartError: msg });
        throw new Error(msg);
      }

      const data = await res.json().catch(() => null);

      if (typeof useGlobalStore.getState === "function") {
        try {
          await useGlobalStore.getState().fetchCart();
        } catch {
          // ignore
        }
      }

      return data;
    } catch (err) {
      set({ cartError: err.message || String(err) });
      throw err;
    } finally {
      set({ cartLoading: false });
    }
  },
}));

export default useGlobalStore;
