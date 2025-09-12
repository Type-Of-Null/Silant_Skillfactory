export const generalColumns = [
  {
    name: "#",
    cell: (row, index) => index + 1,
    width: "64px", // фиксированная узкая ширина
    grow: 0, // не растягивать
    center: true, // выравнивание по центру
    sortable: false, // сортировка не нужна
    ignoreRowClick: true,
    allowOverflow: true,
  },
  { name: "VIN", selector: (r) => r.vin, sortable: true, grow: 1, wrap: true },
  { name: "Модель техники", selector: (r) => r.vehicle_model, sortable: true, grow: 1, wrap: true },
  { name: "Модель двигателя", selector: (r) => r.engine_model, sortable: true, grow: 1, wrap: true },
  {
    name: "Зав. № двигателя",
    selector: (r) => r.engine_number,
    sortable: true,
    grow: 1,
    wrap: true,
  },
  {
    name: "Модель трансмиссии",
    selector: (r) => r.transmission_model,
    sortable: true,
    grow: 1,
    wrap: true,
  },
  {
    name: "Зав. № трансмиссии",
    selector: (r) => r.transmission_number,
    sortable: true,
    grow: 1,
    wrap: true,
  },
  { name: "Ведущий мост", selector: (r) => r.drive_axle, sortable: true, grow: 1, wrap: true },
  {
    name: "Зав. № ведущего моста",
    selector: (r) => r.drive_axle_number,
    sortable: true,
    grow: 1,
    wrap: true,
  },
  {
    name: "Управляемый мост",
    selector: (r) => r.steering_axle,
    sortable: true,
    grow: 1,
    wrap: true,
  },
  {
    name: "Зав. № управляемого моста",
    selector: (r) => r.steering_axle_number,
    sortable: true,
    grow: 1,
    wrap: true,
  },
  {
    name: "Дог. поставки",
    selector: (r) => r.delivery_agreement,
    sortable: true,
    grow: 1,
    wrap: true,
  },
  {
    name: "Дата отгрузки",
    selector: (r) => r.shipment_date,
    sortable: true,
    id: "shipment_date",
    grow: 1,
    wrap: true,
  },
  {
    name: "Грузополучатель",
    selector: (r) => r.recipient,
    sortable: true,
    grow: 1,
    wrap: true,
  },
  {
    name: "Адрес поставки",
    selector: (r) => r.delivery_address,
    sortable: true,
    grow: 1,
    wrap: true,
  },
  {
    name: "Комплектация",
    selector: (r) => r.equipment,
    sortable: true,
    grow: 1,
    wrap: true,
  },
  { name: "Клиент", selector: (r) => r.client, sortable: true, grow: 1, wrap: true },
  {
    name: "Сервисная компания",
    selector: (r) => r.service_company,
    sortable: true,
    grow: 1,
    wrap: true,
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
