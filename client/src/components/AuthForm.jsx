import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const AuthForm = ({ onClose }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Пожалуйста, заполните все поля");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await login(username, password);
      if (result.success) {
        onClose();
      } else {
        setError(result.message || "Ошибка авторизации");
      }
    } catch (err) {
      setError("Произошла ошибка при авторизации");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#EBE6D6] p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <h2 className="text-xl font-bold">Авторизация</h2>
            <div className="group relative">
              <span className="cursor-help px-2">ℹ️</span>
              <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 transform bg-gray-800 px-2 py-1 text-sm text-center text-white opacity-0 transition-opacity group-hover:opacity-100">
              Пользователи: manager service1 client1 client2 Пароли аналогичные
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#3d3d3d] hover:text-[#3d3d3d]"
            disabled={isLoading}
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="mb-1 block text-sm font-medium text-[#3d3d3d]"
            >
              Логин
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white px-3 py-2 focus:border-transparent focus:outline-none"
              disabled={isLoading}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-[#3d3d3d]"
            >
              Пароль
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white px-3 py-2 focus:border-transparent focus:outline-none"
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[#3d3d3d] hover:bg-gray-50"
              disabled={isLoading}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="bg-[#D20A11] px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Вход..." : "Войти"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;
