import React, { useState, useEffect, useMemo, useCallback } from "react";
import DataTable from "react-data-table-component";
import { apiClient } from "../../../utils/fetchWithTimeout";
import { useApi } from "../../../hooks/useApi";
import { useAuth } from "../../../contexts/AuthContext";
import { generalColumns, customStyles, generalFilterRows } from "./config";
import ModelDetailsModal from "../../modals/ModelDetailsModal";

const General_info = ({ activeTab, filters = {} }) => {
  const [rows, setRows] = useState([]);
  const { loading, error, get, clearError } = useApi();
  const { hasRole } = useAuth();
  const canEdit = hasRole("manager");

  // Параметры модального окна: Техника
  const [modelModalOpen, setModelModalOpen] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [modelError, setModelError] = useState("");
  const [modelData, setModelData] = useState({
    id: null,
    name: "",
    description: "",
  });
  const [editMode, setEditMode] = useState(false);

  // Параметры модального окна: Двигатель
  const [engineModalOpen, setEngineModalOpen] = useState(false);
  const [engineLoading, setEngineLoading] = useState(false);
  const [engineError, setEngineError] = useState("");
  const [engineData, setEngineData] = useState({
    id: null,
    name: "",
    description: "",
  });
  const [engineEditMode, setEngineEditMode] = useState(false);

  // Параметры пагинации
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const baseIndex = (page - 1) * perPage;

  // Обработчики для разных типов моделей
  const handlersByEndpoint = useMemo(
    () => ({
      vehicle: {
        setOpen: setModelModalOpen,
        setEditMode,
        setError: setModelError,
        setLoading: setModelLoading,
        setData: setModelData,
        fetchPath: (id) => `http://localhost:8000/api/models/vehicle/${id}`,
      },
      engine: {
        setOpen: setEngineModalOpen,
        setEditMode: setEngineEditMode,
        setError: setEngineError,
        setLoading: setEngineLoading,
        setData: setEngineData,
        fetchPath: (id) => `http://localhost:8000/api/models/engine/${id}`,
      },
      // transmission, drive-axle, steering-axle добавите по аналогии
    }),
    [],
  );

  const openModel = useCallback(
    async (endpoint, id, displayName) => {
      if (!id) return;
      const h = handlersByEndpoint[endpoint];
      if (!h) return;

      h.setOpen(true);
      h.setEditMode(false);
      h.setError("");
      h.setLoading(true);
      try {
        const data = await apiClient.get(h.fetchPath(id), 10000);
        h.setData({
          id: data.id,
          name: data.name,
          description: data.description || "",
        });
      } catch (e) {
        h.setError(
          e.message ||
            `Не удалось загрузить данные (${displayName || endpoint})`,
        );
      } finally {
        h.setLoading(false);
      }
    },
    [handlersByEndpoint],
  );

  // Кэшируем столбцы и отфильтрованные строки
  const columns = useMemo(
    () =>
      generalColumns({
        baseIndex,
        openModel, // единый обработчик
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

          <ModelDetailsModal
            title="Модель техники"
            open={modelModalOpen}
            loading={modelLoading}
            error={modelError}
            data={modelData}
            editMode={editMode}
            canEdit={canEdit}
            onClose={() => setModelModalOpen(false)}
            onStartEdit={() => setEditMode(true)}
            onCancelEdit={() => setEditMode(false)}
            onChangeName={(v) => setModelData((m) => ({ ...m, name: v }))}
            onChangeDescription={(v) =>
              setModelData((m) => ({ ...m, description: v }))
            }
            onSave={async () => {
              if (!modelData.id) return;
              setModelLoading(true);
              setModelError("");
              try {
                const resp = await fetch(
                  `http://localhost:8000/api/models/vehicle/${modelData.id}`,
                  {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      name: modelData.name,
                      description: modelData.description,
                    }),
                  },
                );
                if (!resp.ok) {
                  const err = await resp.json().catch(() => ({}));
                  throw new Error(err.detail || "Ошибка сохранения");
                }
                const saved = await resp.json();
                setModelData({
                  id: saved.id,
                  name: saved.name,
                  description: saved.description || "",
                });
                setEditMode(false);
              } catch (e) {
                setModelError(e.message || "Ошибка сохранения");
              } finally {
                setModelLoading(false);
              }
            }}
          />
					
          <ModelDetailsModal
            title="Модель двигателя"
            open={engineModalOpen}
            loading={engineLoading}
            error={engineError}
            data={engineData}
            editMode={engineEditMode}
            canEdit={canEdit}
            onClose={() => setEngineModalOpen(false)}
            onStartEdit={() => setEngineEditMode(true)}
            onCancelEdit={() => setEngineEditMode(false)}
            onChangeName={(v) => setEngineData((m) => ({ ...m, name: v }))}
            onChangeDescription={(v) =>
              setEngineData((m) => ({ ...m, description: v }))
            }
            onSave={async () => {
              if (!engineData.id) return;
              setEngineLoading(true);
              setEngineError("");
              try {
                const resp = await fetch(
                  `http://localhost:8000/api/models/engine/${engineData.id}`,
                  {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      name: engineData.name,
                      description: engineData.description,
                    }),
                  },
                );
                if (!resp.ok) {
                  const err = await resp.json().catch(() => ({}));
                  throw new Error(err.detail || "Ошибка сохранения");
                }
                const saved = await resp.json();
                setEngineData({
                  id: saved.id,
                  name: saved.name,
                  description: saved.description || "",
                });
                setEngineEditMode(false);
              } catch (e) {
                setEngineError(e.message || "Ошибка сохранения");
              } finally {
                setEngineLoading(false);
              }
            }}
          />
        </>
      )}
    </div>
  );
};

export default General_info;
