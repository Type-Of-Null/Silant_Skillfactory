import {Link, useNavigate} from "react-router-dom";
import logo from "../assets/img/Logotype.png"

const Header = () => {
    return (
        <header className="bg-[#EBE6D6] text-[#3D3D3D] p-4">
            <div className="container mx-auto flex justify-between items-center">
                <img className="w-1/8 max-md:w-1/5" src={logo} alt="Service Center Logo"/>
                <div className="w-1/3 text-[16px] max-md:text-[12px] text-center">+7-8352-20-12-09 Telegram</div>
                <button className="bg-[#D20A11] text-white p-2">
                    Авторизация
                </button>
            </div>
            <div className="text-center">Электронная сервисная книжка "Мой Силант"</div>
        </header>
    );
};

export default Header;