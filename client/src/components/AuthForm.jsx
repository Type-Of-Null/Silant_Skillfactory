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
    console.log('[AuthForm] submit clicked');
    if (!username.trim() || !password.trim()) {
      setError("Пожалуйста, заполните все поля");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      console.log('[AuthForm] calling login with', { username });
      const result = await login(username, password);
      console.log('[AuthForm] login result', result);
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
          <h2 className="text-xl font-bold">Авторизация</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
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
              className="mb-1 block text-sm font-medium text-gray-700"
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
              className="mb-1 block text-sm font-medium text-gray-700"
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
              className="px-4 py-2 text-gray-700 hover:bg-gray-50"
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
