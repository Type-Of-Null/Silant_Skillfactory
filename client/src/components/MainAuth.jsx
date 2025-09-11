import React, { useEffect, useMemo, useState } from 'react';
import DataTable from 'react-data-table-component';

const MainAuth = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (activeTab !== 'general') return;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('http://localhost:8000/api/cars');
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || 'Ошибка загрузки данных');
        }
        const data = await res.json();
        setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e.message || 'Ошибка загрузки данных');
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [activeTab]);

  const columns = useMemo(() => [
    { name: 'VIN', selector: r => r.vin, sortable: true, width: '180px' },
    { name: 'Модель техники', selector: r => r.vehicle_model, sortable: true },
    { name: 'Модель двигателя', selector: r => r.engine_model, sortable: true },
    { name: 'Зав. № двигателя', selector: r => r.engine_number, sortable: true },
    { name: 'Модель трансмиссии', selector: r => r.transmission_model, sortable: true },
    { name: 'Зав. № трансмиссии', selector: r => r.transmission_number, sortable: true },
    { name: 'Ведущий мост', selector: r => r.drive_axle, sortable: true },
    { name: 'Зав. № ведущего моста', selector: r => r.drive_axle_number, sortable: true },
    { name: 'Управляемый мост', selector: r => r.steering_axle, sortable: true },
    { name: 'Зав. № управляемого моста', selector: r => r.steering_axle_number, sortable: true },
    { name: 'Дог. поставки', selector: r => r.delivery_agreement, sortable: true, wrap: true },
    { name: 'Дата отгрузки', selector: r => r.shipment_date, sortable: true },
    { name: 'Грузополучатель', selector: r => r.recipient, sortable: true, wrap: true },
    { name: 'Адрес поставки', selector: r => r.delivery_address, sortable: true, wrap: true },
    { name: 'Комплектация', selector: r => r.equipment, sortable: true, wrap: true },
    { name: 'Клиент', selector: r => r.client, sortable: true },
    { name: 'Сервисная компания', selector: r => r.service_company, sortable: true },
  ], []);

  const customStyles = {
    headCells: {
      style: {
        backgroundColor: '#163E6C',
        color: 'white',
        fontWeight: 600,
        fontSize: '14px',
      },
    },
    rows: {
      style: {
        minHeight: '48px',
      },
    },
  };

  return (
    <div className="min-h-screen bg-white px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-6 text-center text-3xl font-bold text-[#163E6C]">
          Электронная сервисная книжка
        </h2>

        {/* Tabs */}
        <div className="mb-4 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('general')}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'general'
                  ? 'border-[#D20A11] text-[#D20A11]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Общая информация
            </button>
            <button
              onClick={() => setActiveTab('maintenance')}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'maintenance'
                  ? 'border-[#D20A11] text-[#D20A11]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              ТО
            </button>
            <button
              onClick={() => setActiveTab('claims')}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'claims'
                  ? 'border-[#D20A11] text-[#D20A11]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Рекламации
            </button>
          </nav>
        </div>

        <div className="bg-white shadow-md rounded-lg p-4">
          {activeTab === 'general' && (
            <div>
              {error && (
                <div className="mb-3 border-l-4 border-red-500 bg-red-50 p-3 text-red-700">
                  {error}
                </div>
              )}
              <DataTable
                columns={columns}
                data={rows}
                progressPending={loading}
                progressComponent={<div className="py-4 text-center text-gray-600">Загрузка...</div>}
                noDataComponent={<div className="py-4 text-center text-gray-600">Нет данных</div>}
                customStyles={customStyles}
                pagination
                paginationPerPage={10}
                paginationRowsPerPageOptions={[10, 25, 50, 100]}
                highlightOnHover
                striped
                responsive
              />
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div className="py-8 text-center text-gray-600">Раздел ТО в разработке</div>
          )}

          {activeTab === 'claims' && (
            <div className="py-8 text-center text-gray-600">Раздел Рекламации в разработке</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainAuth;
