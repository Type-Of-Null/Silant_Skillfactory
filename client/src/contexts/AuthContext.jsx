import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user data', e);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      console.log('[AuthContext] login called', { username });
      // Add timeout to avoid hanging UI if network stalls
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s

      const response = await fetch('http://127.0.0.1:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));
      console.log('[AuthContext] fetch returned', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.warn('[AuthContext] login failed', errorData);
        throw new Error(errorData.detail || 'Неверное имя пользователя или пароль');
      }

      const userData = await response.json();
      console.log('[AuthContext] login success', userData);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      // Navigate to dashboard after successful login
      navigate('/');
      return { success: true };
    } catch (error) {
      const message = error.name === 'AbortError'
        ? 'Превышено время ожидания ответа от сервера'
        : (error.message || 'Ошибка сети');
      console.error('[AuthContext] Login error:', error);
      return { success: false, message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
