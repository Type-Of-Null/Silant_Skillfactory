import React, { useState, useEffect, useMemo, useCallback } from "react";
import DataTable from "react-data-table-component";
import { apiClient } from "../../../utils/fetchWithTimeout";
import { useApi } from "../../../hooks/useApi";
import { useAuth } from "../../../contexts/AuthContext";
import { complaintsColumns, customStyles, complaintsfilteredRows } from "./config";
import { saveModel } from "../../../utils/saveModel";
import ModelDetailsModal from "../../modals/ModelDetailsModal";
import NoData from "../../tables/NoDataForTables";

const Complaints = ({ activeTab, filters = {} }) => {
  const [complaintsRows, setComplaintsRows] = useState([]);
  const { loading, error, get, clearError } = useApi();
  const { hasRole } = useAuth();
  const canEdit = hasRole("manager") || hasRole("service");

  // Параметры модального окна
  const [modal, setModal] = useState({
    open: false,
    type: null,
    loading: false,
    error: "",
    edit: false,
    data: { id: null, name: "", description: "" },
  });

  // Параметры пагинации
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const baseIndex = (page - 1) * perPage;

  // Добавление новой записи рекламации
  const emptyNewRow = {
    car_id: null,
    node_failure_id: null,
    recovery_method_id: null,
    failure_date: "",
    operating_hours: null,
    service_company_id: null,
  };

  // Состояние добавления новой записи
  const [isAdding, setIsAdding] = useState(false);
  const [newRow, setNewRow] = useState(emptyNewRow);
  const [saving, setSaving] = useState(false);

  // Конфигурация модального окна
  const MODAL_CFG = useMemo(
    () => ({
      failure_node: {
        title: "Узел отказа",
        getUrl: (id) => `http://localhost:8000/api/models/failure-node/${id}`,
        putUrl: (id) => `http://localhost:8000/api/models/failure-node/${id}`,
      },
      recovery_method: {
        title: "Способ восстановления",
        getUrl: (id) => `http://localhost:8000/api/models/recovery-method/${id}`,
        putUrl: (id) => `http://localhost:8000/api/models/recovery-method/${id}`,
      },
      service_company: {
        title: "Сервисная компания",
        getUrl: (id) => `http://localhost:8000/api/models/service-company/${id}`,
        putUrl: (id) => `http://localhost:8000/api/models/service-company/${id}`,
      },
    }),
    [],
  );

  // Ключи для обновления значений моделей при редактировании
  const MODEL_KEYS = {
    failure_node: { idKey: "node_failure_id", labelKey: "node_failure" },
    recovery_method: { idKey: "recovery_method_id", labelKey: "recovery_method" },
    service_company: { idKey: "service_company_id", labelKey: "service_company" },
  };

  // Опции для селектов
  const [carOpts, setCarOpts] = useState([]);
  const [failureNodeOpts, setFailureNodeOpts] = useState([]);
  const [recoveryMethodOpts, setRecoveryMethodOpts] = useState([]);
  const [serviceCompanyOpts, setServiceCompanyOpts] = useState([]);

  // Cписки для селектов при монтировании вкладки
  useEffect(() => {
    if (activeTab !== "complaints") return;
    let cancelled = false;
    const loadLists = async () => {
      try {
        const [cars, failureNodes, recoveryMethods, serviceCompanies] = await Promise.all([
          apiClient.get("http://localhost:8000/api/cars", 10000),
          apiClient.get("http://localhost:8000/api/models/failure-node", 10000),
          apiClient.get("http://localhost:8000/api/models/recovery-method", 10000),
          apiClient.get("http://localhost:8000/api/models/service-company", 10000),
        ]);
        if (!cancelled) {
          setCarOpts(
            Array.isArray(cars)
              ? cars.map((c) => ({ id: c.id, name: c.vin }))
              : [],
          );
          setFailureNodeOpts(Array.isArray(failureNodes) ? failureNodes : []);
          setRecoveryMethodOpts(Array.isArray(recoveryMethods) ? recoveryMethods : []);
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

  // Универсальный обработчик для открытия модального окна
  const openModel = useCallback(
    async (type, id, displayName) => {
      if (!id) {
        console.log("No id provided");
        return;
      }
      const cfg = MODAL_CFG[type];
      if (!cfg) {
        console.log("No config found for type:", type, "Available configs:", Object.keys(MODAL_CFG));
        return;
      }

      setModal((m) => ({
        ...m,
        open: true,
        type,
        edit: false,
        error: "",
        loading: true,
      }));
      try {
        const data = await apiClient.get(cfg.getUrl(id), 10000);
        setModal((m) => ({
          ...m,
          loading: false,
          data: {
            id: data.id,
            name: data.name,
            description: data.description || "",
          },
        }));
      } catch (e) {
        console.error("Error loading modal data:", e);
        setModal((m) => ({
          ...m,
          loading: false,
          error:
            e.message || `Не удалось загрузить данные (${displayName || type})`,
        }));
      }
    },
    [MODAL_CFG],
  );
  const currentCfg = modal.type ? MODAL_CFG[modal.type] : null;

  // Кэшируем столбцы и отфильтрованные строки
  const columns = useMemo(
    () => {
      return complaintsColumns({ baseIndex, openModel });
    },
    [baseIndex, openModel],
  );
  const filteredRows = useMemo(
    () => {
      const filtered = complaintsfilteredRows(complaintsRows, filters);
      return filtered;
    },
    [complaintsRows, filters],
  );

  // Загрузка данных при монтировании вкладки
  useEffect(() => {
    let cancelled = false;
    if (activeTab !== "complaints") return;
    const load = async () => {
      try {
        const res = await get("http://localhost:8000/api/complaints", 10000);
        if (!cancelled) {
          if (res.success) {
            const data = res.data;
						console.log(data);
            setComplaintsRows(Array.isArray(data) ? data : []);
          } else {
            console.log("No maintenance data or failed response");
            setComplaintsRows([]);
          }
        }
      } catch (e) {
        console.log(e);
        if (!cancelled) setComplaintsRows([]);
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
      {activeTab === "complaints" && (
        <div className="table-scroll overflow-x-auto overflow-y-hidden">
          {error && (
            <div className="mb-3 border-l-4 border-red-500 bg-red-50 p-3 text-red-700">
              {error}
            </div>
          )}
          <DataTable
            columns={columns}
            data={filteredRows}
            persistTableHead
            subHeader={canEdit}
            subHeaderComponent={
              <div className="flex w-full flex-wrap items-end gap-2">
                {!isAdding ? (
                  <button
                    type="button"
                    className=" bg-[#163E6C] px-3 py-1 text-sm font-semibold text-white shadow-md hover:bg-[#1c4f8a]"
                    onClick={() => setIsAdding(true)}
                  >
                      + Добавить запись
                  </button>
                ) : (
                  <>
                    <select
                      className={`h-[30px]  border px-2 py-1 text-sm ${!newRow.car_id ? "border-red-500" : ""}`}
                      value={newRow.car_id ?? ""}
                      onChange={(e) =>
                        setNewRow((r) => ({
                          ...r,
                          car_id: e.target.value
                            ? Number(e.target.value)
                            : null,
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
                      className={`h-[30px]  border px-2 py-1 text-sm ${!newRow.service_company_id ? "border-red-500" : ""}`}
                      value={newRow.service_company_id ?? ""}
                      onChange={(e) =>
                        setNewRow((r) => ({
                          ...r,
                          service_company_id: e.target.value
                            ? Number(e.target.value)
                            : null,
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
                    <select
                      className="h-[30px] border px-2 py-1 text-sm"
                      value={newRow.node_failure_id ?? ""}
                      onChange={(e) =>
                        setNewRow((r) => ({
                          ...r,
                          node_failure_id: e.target.value
                            ? Number(e.target.value)
                            : null,
                        }))
                      }
                    >
                      <option value="">Узел отказа</option>
                      {failureNodeOpts.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.name}
                        </option>
                      ))}
                    </select>
                    <select
                      className="h-[30px] border px-2 py-1 text-sm"
                      value={newRow.recovery_method_id ?? ""}
                      onChange={(e) =>
                        setNewRow((r) => ({
                          ...r,
                          recovery_method_id: e.target.value
                            ? Number(e.target.value)
                            : null,
                        }))
                      }
                    >
                      <option value="">Способ восстановления</option>
                      {recoveryMethodOpts.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="date"
                      className={`border px-2 py-1 text-sm ${!newRow.failure_date ? "border-red-500" : ""}`}
                      value={newRow.failure_date || ""}
                      onChange={(e) =>
                        setNewRow((r) => ({
                          ...r,
                          failure_date: e.target.value,
                        }))
                      }
                    />
                    <input
                      type="number"
                      className="border px-2 py-1 text-sm"
                      placeholder="Наработка, м/час"
                      value={newRow.operating_hours || ""}
                      onChange={(e) =>
                        setNewRow((r) => ({
                          ...r,
                          operating_hours: e.target.value ? Number(e.target.value) : null,
                        }))
                      }
                    />
                    <button
                      type="button"
                      disabled={
                        saving ||
                        !newRow.car_id ||
                        !newRow.node_failure_id ||
                        !newRow.recovery_method_id ||
                        !newRow.failure_date ||
                        !newRow.service_company_id
                      }
                      className=" bg-green-600 px-3 py-1 text-sm font-semibold text-white disabled:opacity-50"
                      onClick={async () => {
                        setSaving(true);
                        try {
                          const created = await saveModel({
                            url: "http://localhost:8000/api/complaints",
                            method: "POST",
                            data: newRow,
                            timeout: 12000,
                          });
                          setComplaintsRows((prev) => [created, ...prev]);
                          setNewRow(emptyNewRow);
                          setIsAdding(false);
                        } catch (e) {
                          alert(e.message || "Ошибка создания записи о рекламации");
                        } finally {
                          setSaving(false);
                        }
                      }}
                    >
                      Сохранить
                    </button>
                    <button
                      type="button"
                      className=" bg-gray-200 px-3 py-1 text-sm"
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
						noDataComponent={null}
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
					{(loading || filteredRows.length === 0) && (
              <NoData loading={loading} />
            )}
          {/* Универсальное модальное окно */}
          <ModelDetailsModal
            title={currentCfg?.title ?? "Модель"}
            open={modal.open}
            loading={modal.loading}
            error={modal.error}
            data={modal.data}
            editMode={modal.edit}
            canEdit={canEdit}
            onClose={() => setModal((m) => ({ ...m, open: false }))}
            onStartEdit={() => setModal((m) => ({ ...m, edit: true }))}
            onCancelEdit={() => setModal((m) => ({ ...m, edit: false }))}
            onChangeName={(v) =>
              setModal((m) => ({ ...m, data: { ...m.data, name: v } }))
            }
            onChangeDescription={(v) =>
              setModal((m) => ({ ...m, data: { ...m.data, description: v } }))
            }
            // Сохранение изменений
            onSave={async () => {
              if (!modal.data.id || !modal.type) return;
              const cfg = MODAL_CFG[modal.type];
              setModal((m) => ({ ...m, loading: true, error: "" }));
              try {
                const saved = await saveModel({
                  url: cfg.putUrl(modal.data.id),
                  data: {
                    name: modal.data.name,
                    description: modal.data.description,
                  },
                  method: "PUT",
                  timeout: 10000,
                });
                setComplaintsRows((prev) => {
                  const keys = MODEL_KEYS[modal.type];
                  if (!keys) return prev;
                  const { idKey, labelKey } = keys;
                  return prev.map((r) =>
                    r[idKey] === modal.data.id
                      ? { ...r, [labelKey]: saved.name }
                      : r,
                  );
                });
                setModal((m) => ({ ...m, open: false }));
              } catch (e) {
                setModal((m) => ({
                  ...m,
                  loading: false,
                  error: e.message || "Ошибка сохранения",
                }));
              }
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Complaints;
