import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { user, login } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
   await login(email, password);
  };

  useEffect(() => {
    if (user != null) navigate("/");
  }, [user]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white/80 backdrop-blur p-8 rounded-lg shadow-md"
      >
        <h2 className="text-2xl font-semibold mb-6">Login</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 transition"
        >
          Login
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link to="/signup" className="text-amber-500 hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
