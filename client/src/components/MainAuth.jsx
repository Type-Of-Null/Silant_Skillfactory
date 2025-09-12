import React, { useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import General_info from "./tables/general_Info/General_info";

const MainAuth = () => {
  const [activeTab, setActiveTab] = useState("general");
  // const [rows, setRows] = useState([]);
  // const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // State for maintenance tab
  const [maintRows, setMaintRows] = useState([]);
  const [maintLoading, setMaintLoading] = useState(false);
  const [maintError, setMaintError] = useState("");

  useEffect(() => {
    if (activeTab !== "general") return;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("http://localhost:8000/api/cars");
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || "Ошибка загрузки данных");
        }
        const data = await res.json();
        setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e.message || "Ошибка загрузки данных");
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [activeTab]);

  // Columns for maintenance table
  const maintColumns = useMemo(
    () => [
      { name: "VIN", selector: (r) => r.vin, sortable: true, width: "180px" },
      { name: "Вид ТО", selector: (r) => r.maintenance_type, sortable: true },
      {
        name: "Дата ТО",
        selector: (r) => r.maintenance_date,
        sortable: true,
        id: "maintenance_date",
        width: "140px",
      },
      {
        name: "Заказ-наряд №",
        selector: (r) => r.order_number,
        sortable: true,
        width: "160px",
      },
      {
        name: "Дата заказа-наряда",
        selector: (r) => r.order_date,
        sortable: true,
        width: "180px",
      },
      {
        name: "Сервисная компания",
        selector: (r) => r.service_company,
        sortable: true,
        wrap: true,
      },
    ],
    [],
  );

  // Load maintenance data when maintenance tab is active
  useEffect(() => {
    if (activeTab !== "maintenance") return;
    const load = async () => {
      setMaintLoading(true);
      setMaintError("");
      try {
        const res = await fetch("http://localhost:8000/api/maintenance");
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || "Ошибка загрузки данных ТО");
        }
        const data = await res.json();
        setMaintRows(Array.isArray(data) ? data : []);
      } catch (e) {
        setMaintError(e.message || "Ошибка загрузки данных ТО");
        setMaintRows([]);
      } finally {
        setMaintLoading(false);
      }
    };
    load();
  }, [activeTab]);

  const customStyles = {
    headCells: {
      style: {
        backgroundColor: "#163E6C",
        color: "white",
        fontWeight: 600,
        fontSize: "14px",
      },
    },
    rows: {
      style: {
        minHeight: "48px",
				fontSize: "14px",
      },
    },
  };

  return (
    <div className="min-h-screen bg-white px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-6 text-center text-3xl font-bold text-[#163E6C]">
          Электронная сервисная книжка
        </h2>

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
              ТО
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

        <div className="rounded-lg bg-white p-4 shadow-md">
					<General_info activeTab={activeTab} />
          {activeTab === "maintenance" && (
            <div className="table-scroll overflow-x-auto overflow-y-hidden">
              {maintError && (
                <div className="mb-3 border-l-4 border-red-500 bg-red-50 p-3 text-red-700">
                  {maintError}
                </div>
              )}
              <DataTable
                columns={maintColumns}
                data={maintRows}
                progressPending={maintLoading}
                progressComponent={
                  <div className="py-4 text-center text-gray-600">
                    Загрузка...
                  </div>
                }
                noDataComponent={
                  <div className="py-4 text-center text-gray-600">
                    Нет данных
                  </div>
                }
                customStyles={customStyles}
                pagination
                paginationPerPage={10}
                paginationRowsPerPageOptions={[10, 25, 50, 100]}
                highlightOnHover
                striped
                responsive
                defaultSortFieldId="maintenance_date"
                defaultSortAsc={false}
              />
            </div>
          )}

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
