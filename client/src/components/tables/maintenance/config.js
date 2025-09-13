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

export const maintColumns = () => [
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
  {
    name: "Вид ТО",
    selector: (r) => r.maintenance_type,
    sortable: true,
    grow: 1,
    wrap: true,
  },
  {
    name: "Дата ТО",
    selector: (r) => r.maintenance_date,
    sortable: true,
    center: true,
    id: "maintenance_date",
    grow: 1,
    wrap: true,
  },
  {
    name: "Заказ-наряд №",
    selector: (r) => r.order_number,
    center: true,
    sortable: true,
    grow: 1,
    wrap: true,
  },
  {
    name: "Дата заказа-наряда",
    selector: (r) => r.order_date,
    sortable: true,
    center: true,
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
];

export const maintenancefilteredRows = (rows, filters) => {
  const f = {
    maintenance_type: (filters?.maintenance_type || "").trim().toLowerCase(),
    vin: (filters?.vin || "").trim().toLowerCase(),
    service_company: (filters?.service_company || "").trim().toLowerCase(),
  };
  return rows.filter((r) => {
    const mt = String(r.maintenance_type || "").toLowerCase();
    const vn = String(r.vin || "").toLowerCase();
    const sc = String(r.service_company || "").toLowerCase();
    return (
      (!f.maintenance_type || mt.includes(f.maintenance_type)) &&
      (!f.vin || vn.includes(f.vin)) &&
      (!f.service_company || sc.includes(f.service_company))
    );
  });
};
