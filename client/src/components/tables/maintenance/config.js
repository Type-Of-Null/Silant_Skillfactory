export const maintColumns = [
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
