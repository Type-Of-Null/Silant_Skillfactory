// contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../hooks/useApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { post, loading: apiLoading } = useApi();
  const normalizeRole = (r) =>
    String(r || "")
      .toLowerCase()
      .split(".")
      .pop();

  // Нормализация переменной роли пользователя
  const hasRole = (role) => normalizeRole(user?.role) === normalizeRole(role);
  const isManager = () => hasRole("manager");
  const isService = () => hasRole("service");
  const isClient = () => hasRole("client");

  // Восстановление сессии из localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  // Функция логина
  const login = async (username, password) => {
    const result = await post("http://127.0.0.1:8000/api/login", {
      username,
      password,
    });

    if (result.success) {
      setUser(result.data);
      localStorage.setItem("user", JSON.stringify(result.data));
      navigate("/");
    }

    return result;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/");
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    hasRole,
    isManager,
    isService,
    isClient,
    loading: loading || apiLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
