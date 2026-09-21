import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/api.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("murakaza_user");
    return saved ? JSON.parse(saved) : null;
  });

  const refreshUser = async () => {
    const token = localStorage.getItem("murakaza_token");
    if (!token) return null;
    try {
      const { data } = await api.get("/users/me");
      if (data) {
        localStorage.setItem("murakaza_user", JSON.stringify(data));
        setUser(data);
        return data;
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
      }
    }
    return null;
  };

  useEffect(() => {
    if (localStorage.getItem("murakaza_token")) {
      refreshUser();
    }
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("murakaza_token", data.token);
    localStorage.setItem("murakaza_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (formData) => {
    const { data } = await api.post("/auth/register", formData);
    localStorage.setItem("murakaza_token", data.token);
    localStorage.setItem("murakaza_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("murakaza_token");
    localStorage.removeItem("murakaza_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);