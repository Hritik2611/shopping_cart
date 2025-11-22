import { Link, NavLink } from "react-router-dom";
import useGlobalStore from "../store/globalStore";

export default function Navbar() {
  const { cart } = useGlobalStore();
  const cartCount = Array.isArray(cart)
    ? cart.reduce((sum, c) => sum + (c.quantity ?? c.Quantity ?? 1), 0)
    : 0;

  return (
    <header className="w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link to={"/"} className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-amber-600 flex items-center justify-center text-white font-bold">
            S
          </div>
          <h1 className="text-lg font-semibold text-gray-900">Shopping App</h1>
        </Link>

        <nav>
          <ul className="flex items-center gap-6 text-sm">
            <li>
              <NavLink
                to="/cart"
                className={({ isActive }) =>
                  isActive
                    ? "text-amber-600 font-semibold"
                    : "text-gray-700 hover:text-amber-600"
                }
              >
                Cart
                {cartCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
                    {cartCount}
                  </span>
                )}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/orders"
                className={({ isActive }) =>
                  isActive
                    ? "text-amber-600 font-semibold"
                    : "text-gray-700 hover:text-amber-600"
                }
              >
                Orders
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
