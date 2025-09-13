export const customStyles = {
  headCells: {
    style: {
      backgroundColor: "#163E6C",
      color: "white",
      fontWeight: 600,
      fontSize: "14px",
      minHeight: "80px",
    },
  },
  rows: {
    style: {
      minHeight: "48px",
      fontSize: "14px",
    },
  },
};

export const generalColumns = () => ([
  {
    name: "#",
    cell: (row, index) => index + 1,
    width: "64px",
    grow: 0,
    center: true,
    sortable: false,
    ignoreRowClick: true,
    allowOverflow: true,
  },
  { name: "VIN", selector: (r) => r.vin, sortable: true, grow: 1, wrap: true },
  {
    name: "Модель техники",
    selector: (r) => r.vehicle_model,
    sortable: true,
    grow: 1,
    wrap: true,
  },
  {
    name: "Модель двигателя",
    selector: (r) => r.engine_model,
    sortable: true,
    grow: 1,
    wrap: true,
  },
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
  {
    name: "Ведущий мост",
    selector: (r) => r.drive_axle,
    sortable: true,
    grow: 1,
    wrap: true,
  },
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
  {
    name: "Клиент",
    selector: (r) => r.client,
    sortable: true,
    grow: 1,
    wrap: true,
  },
  {
    name: "Сервисная компания",
    selector: (r) => r.service_company,
    sortable: true,
    grow: 1,
    wrap: true,
  },
]);

export const generalFilterRows = (rows, filters) => {
  const f = {
    vehicle_model: (filters?.vehicle_model || "").trim().toLowerCase(),
    engine_model: (filters?.engine_model || "").trim().toLowerCase(),
    transmission_model: (filters?.transmission_model || "")
      .trim()
      .toLowerCase(),
    steering_axle: (filters?.steering_axle || "").trim().toLowerCase(),
    drive_axle: (filters?.drive_axle || "").trim().toLowerCase(),
  };

  return rows.filter((r) => {
    const vm = String(r.vehicle_model || "").toLowerCase();
    const em = String(r.engine_model || "").toLowerCase();
    const tm = String(r.transmission_model || "").toLowerCase();
    const sa = String(r.steering_axle || "").toLowerCase();
    const da = String(r.drive_axle || "").toLowerCase();

    return (
      (!f.vehicle_model || vm.includes(f.vehicle_model)) &&
      (!f.engine_model || em.includes(f.engine_model)) &&
      (!f.transmission_model || tm.includes(f.transmission_model)) &&
      (!f.steering_axle || sa.includes(f.steering_axle)) &&
      (!f.drive_axle || da.includes(f.drive_axle))
    );
  });
};
