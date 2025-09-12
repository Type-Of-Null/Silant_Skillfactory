import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { generalColumns, customStyles } from "./config";

const General_info = ({ activeTab }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
            className="table-scroll"
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
