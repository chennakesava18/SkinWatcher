import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("skinwatcher_user") || "null"));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("skinwatcher_token");
    if (!token) return;
    api.get("/auth/me").then(({ data }) => setUser(data.user)).catch(() => logout());
  }, []);

  const saveSession = (data) => {
    localStorage.setItem("skinwatcher_token", data.token);
    localStorage.setItem("skinwatcher_user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const login = async (payload, portal = "user") => {
    setLoading(true);
    try {
      const { data } = await api.post(portal === "admin" ? "/auth/admin-login" : "/auth/login", payload);
      saveSession(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/signup", payload);
      saveSession(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("skinwatcher_token");
    localStorage.removeItem("skinwatcher_user");
    setUser(null);
  };

  const value = useMemo(() => ({ user, setUser, login, signup, logout, loading, isAuthenticated: Boolean(user) }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
