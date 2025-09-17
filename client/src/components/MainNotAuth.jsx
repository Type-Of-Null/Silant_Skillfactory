import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

const Main = () => {
  const [vin, setVin] = useState("");
  const [lastSubmittedVin, setLastSubmittedVin] = useState("");
  const [carData, setCarData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const columns = useMemo(
    () => [
      {
        header: "Параметр",
        accessorKey: "param",
        cell: (info) => (
          <span className="font-semibold">{info.getValue()}</span>
        ),
      },
      {
        header: "Значение",
        accessorKey: "value",
      },
    ],
    [],
  );

  const tableData = useMemo(() => {
    if (!carData) return [];

    return [
      { param: "VIN", value: carData.vin },
      { param: "Модель техники", value: carData.vehicle_model },
      { param: "Модель двигателя", value: carData.engine_model },
      { param: "Заводской номер двигателя", value: carData.engine_number },
      { param: "Модель трансмиссии", value: carData.transmission_model },
      {
        param: "Заводской номер трансмиссии",
        value: carData.transmission_number,
      },
      { param: "Модель ведущего моста", value: carData.drive_axle_model },
      {
        param: "Заводской номер ведущего моста",
        value: carData.drive_axle_number,
      },
      { param: "Модель управляемого моста", value: carData.steering_axle_model },
      {
        param: "Заводской номер управляемого моста",
        value: carData.steering_axle_number,
      },
    ];
  }, [carData]);

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vin.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8000/api/cars/${vin}`);

      // Проверяем тип ответа
      const contentType = response.headers.get("content-type");

      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text();
        console.error("Non-JSON response:", textResponse.substring(0, 200));
        throw new Error(
          "Сервер вернул неожиданный ответ. Пожалуйста, попробуйте позже.",
        );
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || "Машина с указанным VIN не найдена",
        );
      }

      const data = await response.json();
      setCarData(data);
      setLastSubmittedVin(vin);
    } catch (err) {
      setError(err.message);
      setCarData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-8 text-center text-3xl font-bold text-[#163E6C]">
          Проверка комплектации и технических характеристик техники Силант
        </h2>

        <div className="mb-8 bg-[#EBE6D6] p-6 shadow-md">
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="flex flex-col gap-4 sm:flex-row">
              <input
                type="text"
                value={vin}
                onChange={(e) => setVin(e.target.value)}
                placeholder="Введите VIN или заводской номер"
                className="flex-grow p-3 bg-white focus:outline-none"
                required
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !vin.trim() || vin === lastSubmittedVin}
                className="bg-[#D20A11] px-6 py-3 whitespace-nowrap text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Поиск..." : "Найти технику"}
              </button>
            </div>
          </form>

          {error && (
            <div className="mb-6 border-l-4 border-red-500 bg-red-50 p-4 text-red-700">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {carData && (
          <div className="overflow-hidden bg-white shadow-md">
            <div className="border-b border-gray-200 p-6 bg-[#EBE6D6]">
              <h3 className="text-xl font-bold text-[#163E6C]">
                Карточка техники
              </h3>
              <p className="text-gray-600">Детальная информация о технике</p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-6 py-4 text-sm whitespace-nowrap text-gray-900"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Main;
