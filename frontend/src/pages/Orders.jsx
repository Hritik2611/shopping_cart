import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import useGlobalStore from "../store/globalStore";

export default function Orders() {
  const { items, getItems } = useGlobalStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!Array.isArray(items) || items.length === 0) await getItems();

        const apiUrl = import.meta.env.VITE_API_URL;
        const devProxy = import.meta.env.DEV === true;
        const base = devProxy ? "" : apiUrl || "";

        const res = await fetch(`${base}/orders`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) throw new Error(`Failed to fetch orders (${res.status})`);
        const data = await res.json();
        let list = data?.orders ?? data ?? [];
        if (!Array.isArray(list)) list = [list];


        const enriched = list.map((o) => {
          let parsedItems = [];
          try {
            parsedItems =
              typeof o.items === "string" ? JSON.parse(o.items) : o.items ?? [];
          } catch {
            parsedItems = [];
          }

          const mapped = (
            Array.isArray(parsedItems) ? parsedItems : [parsedItems]
          ).map((it) => {
            const pid = Number(
              it.product_id ?? it.ProductID ?? it.productId ?? it.id
            );
            const prod = (Array.isArray(items) ? items : []).find(
              (p) => Number(p.ID ?? p.id) === pid
            );
            return {
              ...it,
              name: prod?.name ?? `Product #${pid}`,
            };
          });

          return { ...o, parsedItems: mapped };
        });

        enriched.sort((a, b) => {
          const ta =
            Date.parse(a.CreatedAt ?? a.createdAt ?? a.created_at ?? 0) || 0;
          const tb =
            Date.parse(b.CreatedAt ?? b.createdAt ?? b.created_at ?? 0) || 0;
          return tb - ta;
        });

        setOrders(enriched);
      } catch (err) {
        setError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [getItems, items]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4 text-center">
          Orders
        </h2>

        {loading && <div className="text-gray-600">Loading orders...</div>}

        {error && (
          <div className="text-red-600">Error loading orders: {error}</div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="min-h-[50vh] flex items-center justify-center">
            <p className="text-gray-600 text-center">You have no orders yet.</p>
          </div>
        )}

        <div className="space-y-4">
          {orders.map((o) => (
            <div
              key={o.ID}
              className="bg-white border border-gray-100 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Order #{o.ID}</div>
                  <div className="text-xs text-gray-400">
                    {new Date(o.CreatedAt).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    ${Number(o.total ?? 0).toFixed(2)}
                  </div>
                  <div className="mt-1 text-xs capitalize text-amber-600">
                    {o.status ?? "created"}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <ul className="divide-y divide-gray-100">
                  {Array.isArray(o.parsedItems) &&
                    o.parsedItems.map((it, i) => (
                      <li
                        key={i}
                        className="py-3 flex items-center justify-between"
                      >
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {it.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            Product ID:{" "}
                            {it.product_id ??
                              it.ProductID ??
                              it.productId ??
                              ""}
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-700">
                          <div>Qty: {it.quantity ?? it.Quantity ?? 1}</div>
                          <div className="">
                            ${Number(it.price ?? 0).toFixed(2)}
                          </div>
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
