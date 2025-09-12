import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { generalColumns, customStyles } from "./config";
import { useApi } from "../../../hooks/useApi";

const General_info = ({ activeTab }) => {
  const [rows, setRows] = useState([]);
  const { loading, error, get, clearError } = useApi();

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
            columns={generalColumns}
            data={rows}
            progressPending={loading}
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
        </>
      )}
    </div>
  );
};

export default General_info;
