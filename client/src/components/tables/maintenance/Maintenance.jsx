import React, { useState, useEffect, useMemo } from "react";
import DataTable from "react-data-table-component";
import { maintColumns, customStyles, maintenancefilteredRows, TABLE_MIN_HEIGHT } from "./config";
import { useApi } from "../../../hooks/useApi";
import { useAuth } from "../../../contexts/AuthContext";
import { saveModel } from "../../../utils/saveModel";
import { apiClient } from "../../../utils/fetchWithTimeout";

const Maintenance = ({ activeTab, filters = {} }) => {
  const [maintRows, setMaintRows] = useState([]);
  const { loading, error, get, clearError } = useApi();
  const { hasRole } = useAuth();
  const canEdit = hasRole("manager") || hasRole("service") || hasRole("client");

  // Состояние пагинации
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const baseIndex = (page - 1) * perPage;

  // Добавление новой записи ТО
  const emptyNewRow = {
    car_id: null,
    maintenance_type_id: null,
    maintenance_date: "",
    order_number: "",
    order_date: "",
    service_company_id: null,
  };
  const [isAdding, setIsAdding] = useState(false);
  const [newRow, setNewRow] = useState(emptyNewRow);
  const [saving, setSaving] = useState(false);

  // Опции для селектов
  const [carOpts, setCarOpts] = useState([]);
  const [maintenanceTypeOpts, setMaintenanceTypeOpts] = useState([]);
  const [serviceCompanyOpts, setServiceCompanyOpts] = useState([]);
	// Генерация столбцов с учетом пагинации
  const columns = useMemo(() => maintColumns({baseIndex}), [baseIndex]);
  const filteredRows = useMemo(
    () => maintenancefilteredRows(maintRows, filters),
    [maintRows, filters],
  );

  useEffect(() => {
    // грузим списки для селектов при монтировании вкладки
    if (activeTab !== "maintenance") return;
    let cancelled = false;
    const loadLists = async () => {
      try {
        const [cars, maintenanceTypes, serviceCompanies] = await Promise.all([
          apiClient.get("http://localhost:8000/api/cars", 10000),
          apiClient.get("http://localhost:8000/api/models/maintenance-types", 10000),
          apiClient.get("http://localhost:8000/api/models/service-company", 10000),
        ]);
        if (!cancelled) {
          setCarOpts(Array.isArray(cars) ? cars.map(c => ({id: c.id, name: c.vin})) : []);
          setMaintenanceTypeOpts(Array.isArray(maintenanceTypes) ? maintenanceTypes : []);
          setServiceCompanyOpts(Array.isArray(serviceCompanies) ? serviceCompanies : []);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadLists();
    return () => {
      cancelled = true;
    };
  }, [activeTab]);
  useEffect(() => {
    let cancelled = false;
    if (activeTab !== "maintenance") return;
    const load = async () => {
      try {
        const res = await get("http://localhost:8000/api/maintenance", 10000);
        if (!cancelled) {
          if (res.success) {
            const data = res.data;
            setMaintRows(Array.isArray(data) ? data : []);
          } else {
            setMaintRows([]);
          }
        }
      } catch (e) {
        console.log(e);
        if (!cancelled) setMaintRows([]);
      }
    };
    load();
    return () => {
      cancelled = true;
      clearError();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  return (
    <div>
      {activeTab === "maintenance" && (
        <div className="table-scroll overflow-x-auto overflow-y-hidden">
          {error && (
            <div className="mb-3 border-l-4 border-red-500 bg-red-50 p-3 text-red-700">
              {error}
            </div>
          )}
          <DataTable
            columns={columns}
            data={filteredRows}
            progressPending={loading}
            persistTableHead
            subHeader={canEdit}
            subHeaderComponent={
              <div className="flex w-full flex-wrap items-end gap-2">
                {!isAdding ? (
                  <button
                    type="button"
                    className="rounded bg-[#163E6C] px-3 py-1 text-sm font-semibold text-white shadow-md hover:bg-[#1c4f8a]"
                    onClick={() => setIsAdding(true)}
                  >
                    + Добавить ТО
                  </button>
                ) : (
                  <>
                    <select
                      className={`h-[30px] rounded border px-2 py-1 text-sm ${!newRow.car_id ? "border-red-500" : ""}`}
                      value={newRow.car_id ?? ""}
                      onChange={(e) =>
                        setNewRow((r) => ({
                          ...r,
                          car_id: e.target.value ? Number(e.target.value) : null,
                        }))
                      }
                    >
                      <option value="">Машина (обязательно)</option>
                      {carOpts.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.name}
                        </option>
                      ))}
                    </select>
                    <select
                      className={`h-[30px] rounded border px-2 py-1 text-sm ${!newRow.maintenance_type_id ? "border-red-500" : ""}`}
                      value={newRow.maintenance_type_id ?? ""}
                      onChange={(e) =>
                        setNewRow((r) => ({
                          ...r,
                          maintenance_type_id: e.target.value ? Number(e.target.value) : null,
                        }))
                      }
                    >
                      <option value="">Тип ТО (обязательно)</option>
                      {maintenanceTypeOpts.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="date"
                      className={`rounded border px-2 py-1 text-sm ${!newRow.maintenance_date ? "border-red-500" : ""}`}
                      value={newRow.maintenance_date || ""}
                      onChange={(e) =>
                        setNewRow((r) => ({
                          ...r,
                          maintenance_date: e.target.value,
                        }))
                      }
                    />
                    <input
                      className="rounded border px-2 py-1 text-sm"
                      placeholder="№ заказ-наряда"
                      value={newRow.order_number}
                      onChange={(e) =>
                        setNewRow((r) => ({
                          ...r,
                          order_number: e.target.value,
                        }))
                      }
                    />
                    <input
                      type="date"
                      className={`rounded border px-2 py-1 text-sm ${!newRow.order_date ? "border-red-500" : ""}`}
                      value={newRow.order_date || ""}
                      onChange={(e) =>
                        setNewRow((r) => ({
                          ...r,
                          order_date: e.target.value,
                        }))
                      }
                    />
                    <select
                      className={`h-[30px] rounded border px-2 py-1 text-sm ${!newRow.service_company_id ? "border-red-500" : ""}`}
                      value={newRow.service_company_id ?? ""}
                      onChange={(e) =>
                        setNewRow((r) => ({
                          ...r,
                          service_company_id: e.target.value ? Number(e.target.value) : null,
                        }))
                      }
                    >
                      <option value="">Сервисная компания (обязательно)</option>
                      {serviceCompanyOpts.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={
                        saving ||
                        !newRow.car_id ||
                        !newRow.maintenance_type_id ||
                        !newRow.maintenance_date ||
                        !newRow.order_date ||
                        !newRow.service_company_id
                      }
                      className="rounded bg-green-600 px-3 py-1 text-sm font-semibold text-white disabled:opacity-50"
                      onClick={async () => {
                        setSaving(true);
                        try {
                          const created = await saveModel({
                            url: "http://localhost:8000/api/maintenance",
                            method: "POST",
                            data: newRow,
                            timeout: 12000,
                          });
                          setMaintRows((prev) => [created, ...prev]);
                          setNewRow(emptyNewRow);
                          setIsAdding(false);
                        } catch (e) {
                          alert(e.message || "Ошибка создания записи ТО");
                        } finally {
                          setSaving(false);
                        }
                      }}
                    >
                      Сохранить
                    </button>
                    <button
                      type="button"
                      className="rounded bg-gray-200 px-3 py-1 text-sm"
                      onClick={() => {
                        setIsAdding(false);
                        setNewRow(emptyNewRow);
                      }}
                    >
                      Отмена
                    </button>
                  </>
                )}
              </div>
            }
            progressComponent={
							<div
								style={{ minHeight: TABLE_MIN_HEIGHT }}
								className="py-4 text-center text-gray-600"
							>
								Загрузка...
							</div>
						}
						noDataComponent={
							<div
								style={{ minHeight: TABLE_MIN_HEIGHT }}
								className="py-4 text-center text-gray-600"
							>
								Нет данных
							</div>
						}
            customStyles={customStyles}
            pagination
            paginationPerPage={perPage}
            onChangePage={(p) => setPage(p)}
            onChangeRowsPerPage={(newPerPage, p) => {
              setPerPage(newPerPage);
              setPage(p);
            }}
            paginationRowsPerPageOptions={[10, 25, 50, 100]}
						paginationComponentOptions={{
							rowsPerPageText: "Строк на странице",
							rangeSeparatorText: "из",
							selectAllRowsItem: true,
							selectAllRowsItemText: "Все",
						}}
            highlightOnHover
            striped
            responsive
            defaultSortFieldId="maintenance_date"
            defaultSortAsc={false}
          />
        </div>
      )}
    </div>
  );
};

export default Maintenance;
