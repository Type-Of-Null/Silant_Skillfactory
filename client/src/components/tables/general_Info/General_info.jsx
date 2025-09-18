import React, { useState, useEffect, useMemo, useCallback } from "react";
import DataTable from "react-data-table-component";
import { apiClient } from "../../../utils/fetchWithTimeout";
import { useApi } from "../../../hooks/useApi";
import { useAuth } from "../../../contexts/AuthContext";
import { generalColumns, customStyles, generalFilterRows } from "./config";
import { saveModel } from "../../../utils/saveModel";
import ModelDetailsModal from "../../modals/ModelDetailsModal";
import NoData from "../../tables/NoDataForTables";

const General_info = ({ activeTab, filters = {} }) => {
  const [rows, setRows] = useState([]);
  const { loading, error, get, clearError } = useApi();
  const { hasRole } = useAuth();
  const canEdit = hasRole("manager");

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

  // Добавление новой записи "машина"
  const emptyNewRow = {
    vin: "",
    vehicle_model_id: null,
    engine_model_id: null,
    engine_number: "",
    transmission_model_id: null,
    transmission_number: "",
    drive_axle_model_id: null,
    drive_axle_number: "",
    steering_axle_model_id: null,
    steering_axle_number: "",
    delivery_agreement: "",
    shipment_date: "",
    recipient: "",
    delivery_address: "",
    equipment: "",
    client_id: null,
    service_company_id: null,
  };
  const [isAdding, setIsAdding] = useState(false);
  const [newRow, setNewRow] = useState(emptyNewRow);
  const [saving, setSaving] = useState(false);

  // Конфигурация модального окна
  const MODAL_CFG = useMemo(
    () => ({
      vehicle: {
        title: "Модель техники",
        getUrl: (id) => `http://localhost:8000/api/models/vehicle/${id}`,
        putUrl: (id) => `http://localhost:8000/api/models/vehicle/${id}`,
      },
      engine: {
        title: "Модель двигателя",
        getUrl: (id) => `http://localhost:8000/api/models/engine/${id}`,
        putUrl: (id) => `http://localhost:8000/api/models/engine/${id}`,
      },
      transmission: {
        title: "Модель трансмиссии",
        getUrl: (id) => `http://localhost:8000/api/models/transmission/${id}`,
        putUrl: (id) => `http://localhost:8000/api/models/transmission/${id}`,
      },
      drive_axle: {
        title: "Модель ведущего моста",
        getUrl: (id) => `http://localhost:8000/api/models/drive-axle/${id}`,
        putUrl: (id) => `http://localhost:8000/api/models/drive-axle/${id}`,
      },
      steering_axle: {
        title: "Модель управляемого моста",
        getUrl: (id) => `http://localhost:8000/api/models/steering-axle/${id}`,
        putUrl: (id) => `http://localhost:8000/api/models/steering-axle/${id}`,
      },
			service_company: {
        title: "Модель сервисной компании",
        getUrl: (id) => `http://localhost:8000/api/models/service-company/${id}`,
        putUrl: (id) => `http://localhost:8000/api/models/service-company/${id}`,
      },
    }),
    [],
  );

  // Ключи для обновления значений моделей при редактировании
  const MODEL_KEYS = {
    vehicle: { idKey: "vehicle_model_id", labelKey: "vehicle_model" },
    engine: { idKey: "engine_model_id", labelKey: "engine_model" },
    transmission: {
      idKey: "transmission_model_id",
      labelKey: "transmission_model",
    },
    drive_axle: { idKey: "drive_axle_model_id", labelKey: "drive_axle_model" },
    steering_axle: {
      idKey: "steering_axle_model_id",
      labelKey: "steering_axle_model",
    },
		service_company: { idKey: "service_company_model_id", labelKey: "service_company_model" },
  };

  // Опции для селектов моделей
  const [vehicleOpts, setVehicleOpts] = useState([]);
  const [engineOpts, setEngineOpts] = useState([]);
  const [transmissionOpts, setTransmissionOpts] = useState([]);
  const [driveAxleOpts, setDriveAxleOpts] = useState([]);
  const [steeringAxleOpts, setSteeringAxleOpts] = useState([]);
  const [clientOpts, setClientOpts] = useState([]);
  const [serviceCompanyOpts, setServiceCompanyOpts] = useState([]);

  // Cписки для селектов при монтировании вкладки
  useEffect(() => {
    if (activeTab !== "general") return;
    let cancelled = false;
    const loadLists = async () => {
      try {
        const [veh, eng, trn, drv, str, clients, servs] = await Promise.all([
          apiClient.get("http://localhost:8000/api/models/vehicle", 10000),
          apiClient.get("http://localhost:8000/api/models/engine", 10000),
          apiClient.get("http://localhost:8000/api/models/transmission", 10000),
          apiClient.get("http://localhost:8000/api/models/drive-axle", 10000),
          apiClient.get(
            "http://localhost:8000/api/models/steering-axle",
            10000,
          ),
          apiClient.get("http://localhost:8000/api/models/clients", 10000),
          apiClient.get(
            "http://localhost:8000/api/models/service-company",
            10000,
          ),
					        ]);
        if (!cancelled) {
          setVehicleOpts(Array.isArray(veh) ? veh : []);
          setEngineOpts(Array.isArray(eng) ? eng : []);
          setTransmissionOpts(Array.isArray(trn) ? trn : []);
          setDriveAxleOpts(Array.isArray(drv) ? drv : []);
          setSteeringAxleOpts(Array.isArray(str) ? str : []);
          setClientOpts(Array.isArray(clients) ? clients : []);
          setServiceCompanyOpts(Array.isArray(servs) ? servs : []);
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
      if (!id) return;
      const cfg = MODAL_CFG[type];
      if (!cfg) return;

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
    () =>
      generalColumns({
        baseIndex,
        openModel,
      }),
    [baseIndex, openModel],
  );

  const filteredRows = useMemo(
    () => generalFilterRows(rows, filters),
    [rows, filters],
  );

  // Загрузка данных при монтировании вкладки
  useEffect(() => {
    let cancelled = false;
    if (activeTab !== "general") return;
    const load = async () => {
      try {
        const res = await get("http://localhost:8000/api/cars", 10000);
        if (!cancelled) {
          if (res.success) {
            const data = res.data;
            setRows(Array.isArray(data) ? data : []);
          } else {
            setRows([]);
          }
        }
      } catch (e) {
        console.log(e);
        if (!cancelled) setRows([]);
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
      {activeTab === "general" && (
        <>
          {error && (
            <div className="mb-3 border-l-4 border-red-500 bg-red-50 p-3 text-red-700">
              {error}
            </div>
          )}
          <div className="relative">
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
                      <input
                        className={` border px-2 py-1 text-sm ${newRow.vin && newRow.vin.length !== 17 ? "border-red-500" : ""}`}
                        placeholder="VIN (17 символов)"
                        value={newRow.vin}
                        maxLength={17}
                        minLength={17}
                        pattern="^[A-HJ-NPR-Z0-9]{17}$"
                        title="VIN: 17 символов, без I, O, Q"
                        onChange={(e) => {
                          const v = e.target.value
                            .toUpperCase()
                            .replace(/\s+/g, "");
                          setNewRow((r) => ({ ...r, vin: v }));
                        }}
                      />
                      <select
                        className="h-[30px]  border px-2 py-1 text-sm"
                        value={newRow.vehicle_model_id ?? ""}
                        onChange={(e) =>
                          setNewRow((r) => ({
                            ...r,
                            vehicle_model_id: e.target.value
                              ? Number(e.target.value)
                              : null,
                          }))
                        }
                      >
                        <option value="">Модель техники</option>
                        {vehicleOpts.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.name}
                          </option>
                        ))}
                      </select>
                      <select
                        className="h-[30px]  border px-2 py-1 text-sm"
                        value={newRow.engine_model_id ?? ""}
                        onChange={(e) =>
                          setNewRow((r) => ({
                            ...r,
                            engine_model_id: e.target.value
                              ? Number(e.target.value)
                              : null,
                          }))
                        }
                      >
                        <option value="">Модель двигателя</option>
                        {engineOpts.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.name}
                          </option>
                        ))}
                      </select>
                      <input
                        className=" border px-2 py-1 text-sm"
                        placeholder="Зав. № двигателя"
                        value={newRow.engine_number}
                        onChange={(e) =>
                          setNewRow((r) => ({
                            ...r,
                            engine_number: e.target.value,
                          }))
                        }
                      />
                      <select
                        className="h-[30px]  border px-2 py-1 text-sm"
                        value={newRow.transmission_model_id ?? ""}
                        onChange={(e) =>
                          setNewRow((r) => ({
                            ...r,
                            transmission_model_id: e.target.value
                              ? Number(e.target.value)
                              : null,
                          }))
                        }
                      >
                        <option value="">Модель трансмиссии</option>
                        {transmissionOpts.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.name}
                          </option>
                        ))}
                      </select>
                      <input
                        className=" border px-2 py-1 text-sm"
                        placeholder="Зав. № трансмиссии"
                        value={newRow.transmission_number}
                        onChange={(e) =>
                          setNewRow((r) => ({
                            ...r,
                            transmission_number: e.target.value,
                          }))
                        }
                      />
                      <select
                        className="h-[30px]  border px-2 py-1 text-sm"
                        value={newRow.drive_axle_model_id ?? ""}
                        onChange={(e) =>
                          setNewRow((r) => ({
                            ...r,
                            drive_axle_model_id: e.target.value
                              ? Number(e.target.value)
                              : null,
                          }))
                        }
                      >
                        <option value="">Ведущий мост</option>
                        {driveAxleOpts.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.name}
                          </option>
                        ))}
                      </select>
                      <input
                        className=" border px-2 py-1 text-sm"
                        placeholder="Зав. № ведущего моста"
                        value={newRow.drive_axle_number}
                        onChange={(e) =>
                          setNewRow((r) => ({
                            ...r,
                            drive_axle_number: e.target.value,
                          }))
                        }
                      />
                      <select
                        className="h-[30px]  border px-2 py-1 text-sm"
                        value={newRow.steering_axle_model_id ?? ""}
                        onChange={(e) =>
                          setNewRow((r) => ({
                            ...r,
                            steering_axle_model_id: e.target.value
                              ? Number(e.target.value)
                              : null,
                          }))
                        }
                      >
                        <option value="">Управляемый мост</option>
                        {steeringAxleOpts.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.name}
                          </option>
                        ))}
                      </select>
                      <input
                        className=" border px-2 py-1 text-sm"
                        placeholder="Зав. № управляемого моста"
                        value={newRow.steering_axle_number}
                        onChange={(e) =>
                          setNewRow((r) => ({
                            ...r,
                            steering_axle_number: e.target.value,
                          }))
                        }
                      />
                      <input
                        className=" border px-2 py-1 text-sm"
                        placeholder="Договор поставки"
                        value={newRow.delivery_agreement}
                        onChange={(e) =>
                          setNewRow((r) => ({
                            ...r,
                            delivery_agreement: e.target.value,
                          }))
                        }
                      />
                      <input
                        type="date"
                        className=" border px-2 py-1 text-sm"
                        value={newRow.shipment_date || ""}
                        onChange={(e) =>
                          setNewRow((r) => ({
                            ...r,
                            shipment_date: e.target.value,
                          }))
                        }
                      />
                      <input
                        className=" border px-2 py-1 text-sm"
                        placeholder="Грузополучатель"
                        value={newRow.recipient}
                        onChange={(e) =>
                          setNewRow((r) => ({
                            ...r,
                            recipient: e.target.value,
                          }))
                        }
                      />
                      <input
                        className=" border px-2 py-1 text-sm"
                        placeholder="Адрес поставки"
                        value={newRow.delivery_address}
                        onChange={(e) =>
                          setNewRow((r) => ({
                            ...r,
                            delivery_address: e.target.value,
                          }))
                        }
                      />
                      <input
                        className=" border px-2 py-1 text-sm"
                        placeholder="Комплектация"
                        value={newRow.equipment}
                        onChange={(e) =>
                          setNewRow((r) => ({
                            ...r,
                            equipment: e.target.value,
                          }))
                        }
                      />
                      <select
                        className={`h-[30px]  border px-2 py-1 text-sm ${!newRow.client_id ? "border-red-500" : ""}`}
                        value={newRow.client_id ?? ""}
                        onChange={(e) =>
                          setNewRow((r) => ({
                            ...r,
                            client_id: e.target.value
                              ? Number(e.target.value)
                              : null,
                          }))
                        }
                      >
                        <option value="">Клиент (обязательно)</option>
                        {clientOpts.map((o) => (
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
                        <option value="">
                          Сервисная компания (обязательно)
                        </option>
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
                          !newRow.vin ||
                          !newRow.vehicle_model_id ||
                          !newRow.engine_model_id ||
                          !newRow.engine_number ||
                          !newRow.transmission_model_id ||
                          !newRow.transmission_number ||
                          !newRow.drive_axle_model_id ||
                          !newRow.drive_axle_number ||
                          !newRow.steering_axle_model_id ||
                          !newRow.steering_axle_number ||
                          !newRow.shipment_date ||
                          !newRow.client_id ||
                          !newRow.service_company_id
                        }
                        className=" bg-green-600 px-3 py-1 text-sm font-semibold text-white disabled:opacity-50"
                        onClick={async () => {
                          if (!newRow.vin) return;
                          setSaving(true);
                          try {
                            const created = await saveModel({
                              url: "http://localhost:8000/api/cars",
                              method: "POST",
                              data: newRow,
                              timeout: 12000,
                            });
                            setRows((prev) => [created, ...prev]);
                            setNewRow(emptyNewRow);
                            setIsAdding(false);
                          } catch (e) {
                            alert(e.message || "Ошибка создания записи");
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
              defaultSortFieldId="shipment_date"
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
                  setRows((prev) => {
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
        </>
      )}
    </div>
  );
};

export default General_info;
