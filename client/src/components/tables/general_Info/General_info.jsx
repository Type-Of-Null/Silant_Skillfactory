import React, { useState, useEffect, useMemo, useCallback } from "react";
import DataTable from "react-data-table-component";
import { apiClient } from "../../../utils/fetchWithTimeout";
import { useApi } from "../../../hooks/useApi";
import { useAuth } from "../../../contexts/AuthContext";
import { generalColumns, customStyles, generalFilterRows } from "./config";
import { saveModel } from "../../../utils/saveModel";
import ModelDetailsModal from "../../modals/ModelDetailsModal";

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

  // Конфигурация модальных окон
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
  };

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

  useEffect(() => {
    let cancelled = false;
    if (activeTab !== "general") return;
    const load = async () => {
      try {
        const res = await get("http://localhost:8000/api/cars", 10000);
        if (!cancelled) {
          if (res.success) {
            const data = res.data;
            console.log(data);
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

          <DataTable
            columns={columns}
            data={filteredRows}
            progressPending={loading}
            persistTableHead
            progressComponent={
              <div className="py-4 text-center text-gray-600">Загрузка...</div>
            }
            noDataComponent={
              <div className="py-4 text-center text-gray-600">Нет данных</div>
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
            defaultSortFieldId="shipment_date"
            defaultSortAsc={false}
          />

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
                setModal((m) => ({
                  ...m,
                  loading: false,
                  edit: false,
                  data: {
                    id: saved.id,
                    name: saved.name,
                    description: saved.description || "",
                  },
                }));
              } catch (e) {
                setModal((m) => ({
                  ...m,
                  loading: false,
                  error: e.message || "Ошибка сохранения",
                }));
              }
            }}
          />
        </>
      )}
    </div>
  );
};

export default General_info;
