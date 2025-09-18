import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import General_info from "./tables/general_Info/General_info";
import Maintenance from "./tables/maintenance/Maintenance";
import Complaints from "./tables/complaints/Complaints";

const MainAuth = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("general");
  const [showFilters, setShowFilters] = useState(false);

  const [generalFilters, setGeneralFilters] = useState({
    vehicle_model: "",
    engine_model: "",
    transmission_model: "",
    steering_axle_model: "",
    drive_axle_model: "",
  });

  const [maintFilters, setMaintFilters] = useState({
    maintenance_type: "",
    vin: "",
    service_company: "",
  });

	const [complaintsFilters, setComplaintsFilters] = useState({
		node_failure: "",
		recovery_method: "",
    service_company: "",
	})

  const clearActiveFilters = () => {
    if (activeTab === "general") {
      setGeneralFilters({
        vehicle_model: "",
        engine_model: "",
        transmission_model: "",
        steering_axle_model: "",
        drive_axle_model: "",
      });
    } else if (activeTab === "maintenance") {
      setMaintFilters({ maintenance_type: "", vin: "", service_company: "" });
    } else if (activeTab === "complaints") {
      setComplaintsFilters({ node_failure: "", recovery_method: "", service_company: "" });
    }
  };

  return (
    <div className="min-h-screen bg-[#EBE6D6] px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-2 text-center text-3xl font-bold text-[#163E6C]">
          {activeTab === "general" &&
            "Информация о комплектации и технических характеристиках вашей техники"}
          {activeTab === "maintenance" &&
            "Информация о проведенных ТО вашей техники"}
          {activeTab === "complaints" && "Рекламации"}
        </h2>
        <h3 className="mb-6 text-center text-2xl font-bold text-[#163E6C]">
          Вы авторизованы как: <span className="text-[#D20A11]">{user.name || user.username}</span>
        </h3>

        {/* Заголовки вкладок */}
        <div className="mb-4 border-b border-gray-200">
          <nav className="-mb-px flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-8">
            <button
              onClick={() => setActiveTab("general")}
              className={`self-center border-b-2 px-1 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === "general"
                  ? "border-[#D20A11] text-[#D20A11]"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              Общая информация
            </button>
            <button
              onClick={() => setActiveTab("maintenance")}
              className={`self-center border-b-2 px-1 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === "maintenance"
                  ? "border-[#D20A11] text-[#D20A11]"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              Техническое обслуживание
            </button>
            <button
              onClick={() => setActiveTab("complaints")}
              className={`self-center border-b-2 px-1 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === "complaints"
                  ? "border-[#D20A11] text-[#D20A11]"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              Рекламации
            </button>
          </nav>
        </div>

        <div className="table-scroll relative bg-white p-4 shadow-md">
          <div className="flex gap-4">
            <div
              className="min-w-0 flex-1 overflow-x-auto"
              style={{ maxWidth: showFilters ? "calc(100% - 20rem)" : "100%" }}
            >
              <General_info activeTab={activeTab} filters={generalFilters} />
              <Maintenance activeTab={activeTab} filters={maintFilters} />
							<Complaints activeTab={activeTab} filters={complaintsFilters} />
            </div>
            {showFilters && (
              <div className="w-80 border-l border-gray-200 bg-white shadow-inner">
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <h4 className="text-base font-semibold text-[#163E6C]">
                    Фильтрация{" "}
                    {activeTab === "general"
                      ? "(Общая)"
                      : activeTab === "maintenance"
                        ? "(ТО)"
                        : ""}
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={clearActiveFilters}
                      className=" bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200"
                    >
                      Очистить
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowFilters(false)}
                      className=" bg-[#163E6C] px-2 py-1 text-xs font-semibold text-white hover:bg-[#1c4f8a]"
                    >
                      Закрыть
                    </button>
                  </div>
                </div>
                <div className="space-y-3 p-4">
                  {activeTab === "general" && (
                    <>
                      <div>
                        <label className="mb-1 block text-xs text-gray-600">
                          Модель техники
                        </label>
                        <input
                          type="text"
                          value={generalFilters.vehicle_model}
                          onChange={(e) =>
                            setGeneralFilters((f) => ({
                              ...f,
                              vehicle_model: e.target.value,
                            }))
                          }
                          className="w-full  border border-gray-300 px-2 py-1 text-sm"
                          placeholder="например: ПД3500"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-gray-600">
                          Модель двигателя
                        </label>
                        <input
                          type="text"
                          value={generalFilters.engine_model}
                          onChange={(e) =>
                            setGeneralFilters((f) => ({
                              ...f,
                              engine_model: e.target.value,
                            }))
                          }
                          className="w-full  border border-gray-300 px-2 py-1 text-sm"
                          placeholder="например: Г300"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-gray-600">
                          Модель трансмиссии
                        </label>
                        <input
                          type="text"
                          value={generalFilters.transmission_model}
                          onChange={(e) =>
                            setGeneralFilters((f) => ({
                              ...f,
                              transmission_model: e.target.value,
                            }))
                          }
                          className="w-full  border border-gray-300 px-2 py-1 text-sm"
                          placeholder="например: АКПП8"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-gray-600">
                          Модель управляемого моста
                        </label>
                        <input
                          type="text"
                          value={generalFilters.steering_axle_model}
                          onChange={(e) =>
                            setGeneralFilters((f) => ({
                              ...f,
                              steering_axle_model: e.target.value,
                            }))
                          }
                          className="w-full  border border-gray-300 px-2 py-1 text-sm"
                          placeholder="например: Carraro"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-gray-600">
                          Модель ведущего моста
                        </label>
                        <input
                          type="text"
                          value={generalFilters.drive_axle_model}
                          onChange={(e) =>
                            setGeneralFilters((f) => ({
                              ...f,
                              drive_axle_model: e.target.value,
                            }))
                          }
                          className="w-full  border border-gray-300 px-2 py-1 text-sm"
                          placeholder="например: ZF"
                        />
                      </div>
                    </>
                  )}
                  {activeTab === "maintenance" && (
                    <>
                      <div>
                        <label className="mb-1 block text-xs text-gray-600">
                          Вид ТО
                        </label>
                        <input
                          type="text"
                          value={maintFilters.maintenance_type}
                          onChange={(e) =>
                            setMaintFilters((f) => ({
                              ...f,
                              maintenance_type: e.target.value,
                            }))
                          }
                          className="w-full  border border-gray-300 px-2 py-1 text-sm"
                          placeholder="например: ТО-1"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-gray-600">
                          Зав. номер машины
                        </label>
                        <input
                          type="text"
                          value={maintFilters.vin}
                          onChange={(e) =>
                            setMaintFilters((f) => ({
                              ...f,
                              vin: e.target.value,
                            }))
                          }
                          className="w-full  border border-gray-300 px-2 py-1 text-sm"
                          placeholder="VIN/зав. номер"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-gray-600">
                          Сервисная компания
                        </label>
                        <input
                          type="text"
                          value={maintFilters.service_company}
                          onChange={(e) =>
                            setMaintFilters((f) => ({
                              ...f,
                              service_company: e.target.value,
                            }))
                          }
                          className="w-full  border border-gray-300 px-2 py-1 text-sm"
                          placeholder="например: ООО «СИЙМО ТРЕЙД»"
                        />
                      </div>
                    </>
                  )}
									{activeTab === "complaints" && (
										<>
											<div>
                        <label className="mb-1 block text-xs text-gray-600">
                          Узел отказа
                        </label>
                        <input
                          type="text"
                          value={complaintsFilters.node_failure}
                          onChange={(e) =>
                            setComplaintsFilters((f) => ({
                              ...f,
                              node_failure: e.target.value,
                            }))
                          }
                          className="w-full  border border-gray-300 px-2 py-1 text-sm"
                          placeholder="например: Ходовая часть"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-gray-600">
                          Способ восстановления
                        </label>
                        <input
                          type="text"
                          value={complaintsFilters.recovery_method}
                          onChange={(e) =>
                            setComplaintsFilters((f) => ({
                              ...f,
                              recovery_method: e.target.value,
                            }))
                          }
                          className="w-full  border border-gray-300 px-2 py-1 text-sm"
                          placeholder="например: Замена"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-gray-600">
                          Сервисная компания
                        </label>
                        <input
                          type="text"
                          value={complaintsFilters.service_company}
                          onChange={(e) =>
                            setComplaintsFilters((f) => ({
                              ...f,
                              service_company: e.target.value,
                            }))
                          }
                          className="w-full  border border-gray-300 px-2 py-1 text-sm"
                          placeholder="например: ООО «СИЙМО ТРЕЙД»"
                        />
                      </div>
										</>
									)}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowFilters((s) => !s)}
            className="ml-auto block bg-[#163E6C] px-3 py-1 text-sm font-semibold text-white shadow-md hover:bg-[#1c4f8a]"
            aria-label="Панель фильтров"
            title="Панель фильтров"
          >
            {showFilters ? "✕ Скрыть фильтрацию" : "◀ Фильтрация"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainAuth;
