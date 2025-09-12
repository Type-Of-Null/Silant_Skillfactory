import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import General_info from "./tables/general_Info/General_info";
import Maintenance from "./tables/maintenance/Maintenance";

const MainAuth = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="min-h-screen bg-[#EBE6D6] px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-2 text-center text-3xl font-bold text-[#163E6C]">
          {activeTab === "general" &&
            "Информация о комплектации и технических характеристиках вашей техники"}
          {activeTab === "maintenance" &&
            "Информация о проведенных ТО вашей техники"}
          {activeTab === "claims" && "Рекламации"}
        </h2>
        <h3 className="mb-6 text-center text-2xl font-bold text-[#163E6C]">
          {"Вы авторизованы как: " + user.username}
        </h3>

        {/* Tabs */}
        <div className="mb-4 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("general")}
              className={`border-b-2 px-1 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === "general"
                  ? "border-[#D20A11] text-[#D20A11]"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              Общая информация
            </button>
            <button
              onClick={() => setActiveTab("maintenance")}
              className={`border-b-2 px-1 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === "maintenance"
                  ? "border-[#D20A11] text-[#D20A11]"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              Техническое обслуживание
            </button>
            <button
              onClick={() => setActiveTab("claims")}
              className={`border-b-2 px-1 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === "claims"
                  ? "border-[#D20A11] text-[#D20A11]"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              Рекламации
            </button>
          </nav>
        </div>

        <div className="rounded-lg bg-white p-4 shadow-md table-scroll">
          <General_info activeTab={activeTab} />
          <Maintenance activeTab={activeTab} />
          {activeTab === "claims" && (
            <div className="py-8 text-center text-gray-600">
              Раздел Рекламации в разработке
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainAuth;
