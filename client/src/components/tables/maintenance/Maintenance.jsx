import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { maintColumns, customStyles } from "./config";
import { useApi } from "../../../hooks/useApi";

const General_info = ({ activeTab }) => {
	const [maintRows, setMaintRows] = useState([]);
  const { loading, error, get, clearError } = useApi();

  useEffect(() => {
    let cancelled = false;
    if (activeTab !== "general") return;
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
                columns={maintColumns}
                data={maintRows}
                progressPending={loading}
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
    </div>
  );
};

export default General_info;
