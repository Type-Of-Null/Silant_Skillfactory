import React, { useState, useEffect, useMemo, useCallback } from "react";
import DataTable from "react-data-table-component";
import { generalColumns, customStyles, generalFilterRows } from "./config";
import { useApi } from "../../../hooks/useApi";
import { useAuth } from "../../../contexts/AuthContext";

const General_info = ({ activeTab, filters = {} }) => {
  const [rows, setRows] = useState([]);
  const { loading, error, get, clearError } = useApi();
  const { user } = useAuth();

  const [modelModalOpen, setModelModalOpen] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [modelError, setModelError] = useState("");
  const [modelData, setModelData] = useState({ id: null, name: "", description: "" });
  const [editMode, setEditMode] = useState(false);


  const handleVehicleModelClick = useCallback(async ({ id }) => {
    if (!id) return;
    setModelModalOpen(true);
    setEditMode(false);
    setModelError("");
    setModelLoading(true);
    try {
      const res = await get(`http://localhost:8000/api/models/vehicle/${id}`, 10000);
      if (res.success) {
        setModelData({ id: res.data.id, name: res.data.name, description: res.data.description || "" });
      } else {
        setModelError(res.message || "Не удалось загрузить данные модели");
      }
    } catch (e) {
      setModelError(e.message || "Не удалось загрузить данные модели");
    } finally {
      setModelLoading(false);
    }
  }, [get]);
	
  // Кэшируем столбцы и отфильтрованные строки
  const columns = useMemo(() => generalColumns({ onVehicleModelClick: handleVehicleModelClick }), [handleVehicleModelClick]);
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
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 25, 50, 100]}
            highlightOnHover
            striped
            responsive
            defaultSortFieldId="shipment_date"
            defaultSortAsc={false}
          />

          {/* Модальное окно (*вынести в отдельный компонент) */}
          {modelModalOpen && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-lg rounded-md bg-white shadow-xl">
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <h3 className="text-lg font-semibold text-[#163E6C]">Модель техники</h3>
                  <button
                    type="button"
                    className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
                    onClick={() => setModelModalOpen(false)}
                  >
                    ✕
                  </button>
                </div>
                <div className="px-4 py-3">
                  {modelLoading ? (
                    <div className="py-6 text-center text-gray-600">Загрузка...</div>
                  ) : (
                    <>
                      {modelError && (
                        <div className="mb-3 border-l-4 border-red-500 bg-red-50 p-2 text-sm text-red-700">{modelError}</div>
                      )}

                      {!editMode ? (
                        <div className="space-y-2">
                          <div>
                            <div className="text-xs text-gray-500">Название</div>
                            <div className="text-base font-medium">{modelData.name}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Описание</div>
                            <div className="whitespace-pre-wrap text-sm">{modelData.description || "—"}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <label className="mb-1 block text-xs text-gray-600">Название</label>
                            <input
                              type="text"
                              value={modelData.name}
                              onChange={(e) => setModelData((m) => ({ ...m, name: e.target.value }))}
                              className="w-full rounded border border-gray-300 px-2 py-1"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs text-gray-600">Описание</label>
                            <textarea
                              rows={4}
                              value={modelData.description}
                              onChange={(e) => setModelData((m) => ({ ...m, description: e.target.value }))}
                              className="w-full rounded border border-gray-300 px-2 py-1"
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 border-t px-4 py-3">
                  <div className="text-xs text-gray-500">ID: {modelData.id ?? "—"}</div>
                  <div className="flex items-center gap-2">
                    {!editMode && (
                      <button
                        type="button"
                        className="rounded bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200"
                        onClick={() => setModelModalOpen(false)}
                      >
                        Закрыть
                      </button>
                    )}
                    {user?.role === "manager" && !editMode && (
                      <>
                        <button
                          type="button"
                          className="rounded bg-[#163E6C] px-3 py-1 text-sm font-semibold text-white hover:bg-[#1c4f8a]"
                          onClick={() => setEditMode(true)}
                        >
                          Редактировать
                        </button>
                      </>
                    )}
                    {user?.role === "manager" && editMode && (
                      <>
                        <button
                          type="button"
                          className="rounded bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200"
                          onClick={() => setEditMode(false)}
                        >
                          Отмена
                        </button>
                        <button
                          type="button"
                          className="rounded bg-green-600 px-3 py-1 text-sm font-semibold text-white hover:bg-green-700"
                          onClick={async () => {
                            if (!modelData.id) return;
                            setModelLoading(true);
                            setModelError("");
                            try {
                              // Reuse apiClient via useApi.callApi (we have only get here), so use fetch directly fallback
                              const resp = await fetch(`http://localhost:8000/api/models/vehicle/${modelData.id}`, {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ name: modelData.name, description: modelData.description }),
                              });
                              if (!resp.ok) {
                                const err = await resp.json().catch(() => ({}));
                                throw new Error(err.detail || "Ошибка сохранения");
                              }
                              const saved = await resp.json();
                              setModelData({ id: saved.id, name: saved.name, description: saved.description || "" });
                              setEditMode(false);
                            } catch (e) {
                              setModelError(e.message || "Ошибка сохранения");
                            } finally {
                              setModelLoading(false);
                            }
                          }}
                        >
                          Сохранить
                        </button>
                        <button
                          type="button"
                          className="rounded bg-red-600 px-3 py-1 text-sm font-semibold text-white hover:bg-red-700"
                          onClick={async () => {
                            if (!modelData.id) return;
                            if (!confirm("Удалить эту модель?")) return;
                            setModelLoading(true);
                            setModelError("");
                            try {
                              const respDel = await fetch(`http://localhost:8000/api/models/vehicle/${modelData.id}`, {
                                method: "DELETE",
                              });
                              if (!respDel.ok) {
                                const err = await respDel.json().catch(() => ({}));
                                throw new Error(err.detail || "Ошибка удаления");
                              }
                              setModelModalOpen(false);
                            } catch (e) {
                              setModelError(e.message || "Ошибка удаления");
                            } finally {
                              setModelLoading(false);
                            }
                          }}
                        >
                          Удалить
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default General_info;
