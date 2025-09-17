import React, { useState, useEffect, useMemo } from "react";
import DataTable from "react-data-table-component";
import { maintColumns, customStyles, maintenancefilteredRows, TABLE_MIN_HEIGHT } from "./config";
import { useApi } from "../../../hooks/useApi";

const Maintenance = ({ activeTab, filters = {} }) => {
  const [maintRows, setMaintRows] = useState([]);
  const { loading, error, get, clearError } = useApi();
  // Состояние пагинации
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const baseIndex = (page - 1) * perPage;
	// Генерация столбцов с учетом пагинации
  const columns = useMemo(() => maintColumns({baseIndex}), [baseIndex]);
  const filteredRows = useMemo(
    () => maintenancefilteredRows(maintRows, filters),
    [maintRows, filters],
  );
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
