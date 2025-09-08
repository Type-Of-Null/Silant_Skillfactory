import { useState } from "react";

const Main = () => {
  const [vin, setVin] = useState("");
  const [carData, setCarData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Полный URL к бэкенду
      const response = await fetch(`http://localhost:8000/cars/public/${vin}`);

      // Проверяем тип ответа
      const contentType = response.headers.get("content-type");

      if (!contentType || !contentType.includes("application/json")) {
        // Если ответ не JSON, читаем как текст для диагностики
        const textResponse = await response.text();
        console.error("Non-JSON response:", textResponse.substring(0, 200));
        throw new Error("Сервер вернул не JSON ответ. Проверьте, что бэкенд запущен.");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Машина не найдена");
      }

      const data = await response.json();
      setCarData(data);
    } catch (err) {
      setError(err.message);
      setCarData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 bg-[#EBE6D6]">
      <h2 className="text-2xl font-bold mb-4 text-center">Проверьте комплектацию и технические характеристики техники Силант</h2>

      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex">
            <input
              type="text"
              value={vin}
              onChange={(e) => setVin(e.target.value)}
              placeholder="Заводской номер (VIN)"
              className="flex-grow p-2 border rounded-l text-black"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-[#D20A11] text-white p-2 rounded-r hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "Поиск..." : "Найти"}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Ошибка:</strong> {error}
          </div>
        )}

        {carData && (
          <div className="bg-white shadow-md rounded p-6 text-black">
            <h3 className="text-xl font-bold mb-4">Информация о технике</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">VIN:</p>
                <p>{carData.vin}</p>
              </div>
              <div>
                <p className="font-semibold">Модель техники:</p>
                <p>{carData.vehicle_model}</p>
              </div>
              <div>
                <p className="font-semibold">Модель двигателя:</p>
                <p>{carData.engine_model}</p>
              </div>
              <div>
                <p className="font-semibold">Заводской номер двигателя:</p>
                <p>{carData.engine_number}</p>
              </div>
              <div>
                <p className="font-semibold">Модель трансмиссии:</p>
                <p>{carData.transmission_model}</p>
              </div>
              <div>
                <p className="font-semibold">Заводской номер трансмиссии:</p>
                <p>{carData.transmission_number}</p>
              </div>
              <div>
                <p className="font-semibold">Модель ведущего моста:</p>
                <p>{carData.drive_axle}</p>
              </div>
              <div>
                <p className="font-semibold">Заводской номер ведущего моста:</p>
                <p>{carData.drive_axle_number}</p>
              </div>
              <div>
                <p className="font-semibold">Модель управляемого моста:</p>
                <p>{carData.steering_axle}</p>
              </div>
              <div>
                <p className="font-semibold">Заводской номер управляемого моста:</p>
                <p>{carData.steering_axle_number}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Main;