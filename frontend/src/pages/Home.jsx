import { useEffect, useState } from "react";
import useGlobalStore from "../store/globalStore";
import Navbar from "../components/Navbar";

export default function Home() {
  const { getItems, items, addToCart, cart, cartLoading } = useGlobalStore();
  const [addingIds, setAddingIds] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        await getItems();
      } catch (err) {
        console.error(err);
      }
    };
    fetchItems();
  }, [getItems]);

  const itemList = Array.isArray(items) ? items : items ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <main>
          {/* <h1 className="text-3xl font-semibold text-gray-900 mb-6">
            Available Items
          </h1> */}

          {itemList.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-gray-600">No items available.</p>
            </div>
          ) : (
            <ul className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {itemList.map((item, idx) => {
                const keyId = item.ID ?? item.id ?? `item-${idx}`;
                const name = item.name ?? "Item";
                const price = Number(item.price ?? 0).toFixed(2);

                return (
                  <li
                    key={keyId}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden transform hover:shadow-md hover:-translate-y-0.5 transition"
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {name}
                          </h3>
                          <p className="mt-2 text-sm text-gray-600 h-12 overflow-hidden">
                            {item.description ?? "No description available."}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold">
                            ${price}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        {(() => {
                          const itemId =
                            item.ID ??
                            item.id ??
                            item.product_id ??
                            item.productId ??
                            null;
                          const numericId =
                            itemId != null ? Number(itemId) : null;
                          const inCart = Array.isArray(cart)
                            ? cart.some(
                                (ci) =>
                                  Number(
                                    ci.product_id ??
                                      ci.ProductID ??
                                      ci.productId ??
                                      ci.productId ??
                                      ci.id
                                  ) === numericId
                              )
                            : false;
                          const isAdding = addingIds.includes(numericId);

                          const handleAdd = async () => {
                            if (!addToCart || isAdding || inCart) return;
                            try {
                              setAddingIds((s) => [...s, numericId]);
                              await addToCart(item, 1);
                            } catch (err) {
                              console.error("Add to cart failed:", err);
                            } finally {
                              setAddingIds((s) =>
                                s.filter((id) => id !== numericId)
                              );
                            }
                          };

                          return (
                            <button
                              onClick={handleAdd}
                              disabled={inCart || isAdding || cartLoading}
                              className={`w-full inline-flex items-center justify-center gap-2 py-2 rounded-md transition text-sm ${
                                inCart
                                  ? "bg-gray-200 text-gray-700 cursor-not-allowed"
                                  : "bg-amber-600 text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                              }`}
                              aria-label={
                                inCart
                                  ? `${name} already in cart`
                                  : `Add ${name} to cart`
                              }
                            >
                              {isAdding
                                ? "Adding..."
                                : inCart
                                ? "In cart"
                                : "Add to cart"}
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </main>
      </div>
    </div>
  );
}
