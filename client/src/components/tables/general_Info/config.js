export const generalColumns = [
  { name: "VIN", selector: (r) => r.vin, sortable: true, width: "180px" },
  { name: "Модель техники", selector: (r) => r.vehicle_model, sortable: true },
  { name: "Модель двигателя", selector: (r) => r.engine_model, sortable: true },
  {
    name: "Зав. № двигателя",
    selector: (r) => r.engine_number,
    sortable: true,
  },
  {
    name: "Модель трансмиссии",
    selector: (r) => r.transmission_model,
    sortable: true,
  },
  {
    name: "Зав. № трансмиссии",
    selector: (r) => r.transmission_number,
    sortable: true,
  },
  { name: "Ведущий мост", selector: (r) => r.drive_axle, sortable: true },
  {
    name: "Зав. № ведущего моста",
    selector: (r) => r.drive_axle_number,
    sortable: true,
  },
  {
    name: "Управляемый мост",
    selector: (r) => r.steering_axle,
    sortable: true,
  },
  {
    name: "Зав. № управляемого моста",
    selector: (r) => r.steering_axle_number,
    sortable: true,
  },
  {
    name: "Дог. поставки",
    selector: (r) => r.delivery_agreement,
    sortable: true,
    wrap: true,
  },
  {
    name: "Дата отгрузки",
    selector: (r) => r.shipment_date,
    sortable: true,
    id: "shipment_date",
  },
  {
    name: "Грузополучатель",
    selector: (r) => r.recipient,
    sortable: true,
    wrap: true,
  },
  {
    name: "Адрес поставки",
    selector: (r) => r.delivery_address,
    sortable: true,
    wrap: true,
  },
  {
    name: "Комплектация",
    selector: (r) => r.equipment,
    sortable: true,
    wrap: true,
  },
  { name: "Клиент", selector: (r) => r.client, sortable: true },
  {
    name: "Сервисная компания",
    selector: (r) => r.service_company,
    sortable: true,
  },
];

export const customStyles = {
  headCells: {
    style: {
      backgroundColor: "#163E6C",
      color: "white",
      fontWeight: 600,
      fontSize: "14px",
    },
  },
  rows: {
    style: {
      minHeight: "48px",
			fontSize: "14px",
    },
  },
};
