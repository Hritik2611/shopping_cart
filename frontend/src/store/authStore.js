import { create } from "zustand";
const apiUrl = import.meta.env.VITE_API_URL;
const devProxy = import.meta.env.DEV === true;
const useAuthStore = create((set) => ({
  user: null,
  initialized: false,
  login: async (email, password) => {
    set({ loading: true, error: null });

    try {
      const base = devProxy ? "" : apiUrl || "";
      const url = `${base}/users/login`;
      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error("Invalid credentials");

      const data = await res.json();

      set({
        user: data.user,
        initialized: true,
      });
      return data;
    } catch (err) {
      set({
        loading: false,
        error: err.message || "Login failed",
      });
    }
  },
  signup: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const base = devProxy ? "" : apiUrl || "";
      const url = `${base}/users`;
      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || body?.message || "Signup failed");
      }

      const data = await res.json().catch(() => null);
      if (data && data.user) {
        set({ user: data.user, initialized: true });
        return data;
      }
      set({ initialized: true });
      return data;
    } catch (err) {
      set({ loading: false, error: err.message || "Signup failed" });
      throw err;
    }
  },

  me: async () => {
    try {
      const base = devProxy ? "" : apiUrl || "";
      const url = `${base}/users/me`;
      const res = await fetch(url, { method: "GET", credentials: "include" });
      if (!res.ok) {
        set({ initialized: true });
        return null;
      }
      const data = await res.json();
      if (data && data.user) {
        set({ user: data.user, initialized: true });
        return data.user;
      }
      set({ initialized: true });
      return null;
    } catch {
      set({ initialized: true });
      return null;
    }
  },
}));

export default useAuthStore;
