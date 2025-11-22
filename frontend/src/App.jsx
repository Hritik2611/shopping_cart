import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Orders from "./pages/Orders";
import useAuthStore from "./store/authStore";
import { useEffect } from "react";
import CartPage from "./pages/CartPage";

export default function App() {
  const { user, me, initialized } = useAuthStore();

  useEffect(() => {
    me();
  }, [me]);

  if (!initialized) return null;

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path={"/"}
          element={user ? <Home /> : <Navigate to={"/login"} />}
        />
        <Route path={"/signup"} element={<Signup />} />
        <Route path={"/login"} element={<Login />} />
        <Route path={"/orders"} element={<Orders />} />
        <Route path={"/cart"} element={<CartPage />} />
      </Routes>
    </BrowserRouter>
  );
}
