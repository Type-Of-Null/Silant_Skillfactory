import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import logo from "../assets/img/Logotype.png";
import AuthForm from "./AuthForm";

const Header = () => {
  const [showAuthForm, setShowAuthForm] = useState(false);
  const { user, logout } = useAuth();
  
  // Автозакрытие окна авторизации
  useEffect(() => {
    if (user) {
      setShowAuthForm(false);
    }
  }, [user]);

  const handleLoginClick = () => {
    setShowAuthForm(true);
  };

  const handleCloseAuthForm = () => {
    setShowAuthForm(false);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <header className="bg-color_bg p-4 text-[#3d3d3d]">
        <div className="container mx-auto grid grid-cols-3 items-center">
          <div className="flex justify-start">
            <Link to="/" className="flex items-center">
              <img className="w-1/3 max-md:w-2/3" src={logo} alt="Service Center Logo" />
            </Link>
          </div>

          <div className="text-center text-[16px] max-md:text-[12px]">
            +7-8352-20-12-09 Telegram <br />
            Электронная сервисная книжка "Мой Силант"
          </div>

          <div className="flex justify-end">
            {user ? (
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLogout}
                  className="bg-[#D20A11] px-4 py-2 text-white transition-colors hover:bg-gray-300"
                >
                  Выйти
                </button>
              </div>
            ) : (
              <button
                onClick={handleLoginClick}
                className="bg-[#D20A11] px-4 py-2 text-white transition-colors hover:bg-red-700"
              >
                Войти
              </button>
            )}
          </div>
        </div>
      </header>

      {showAuthForm && <AuthForm onClose={handleCloseAuthForm} />}
    </>
  );
};

export default Header;
