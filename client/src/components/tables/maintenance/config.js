export const maintColumns = [
  { name: "VIN", selector: (r) => r.vin, sortable: true, width: "180px" },
  { name: "Вид ТО", selector: (r) => r.maintenance_type, sortable: true },
  {
    name: "Дата ТО",
    selector: (r) => r.maintenance_date,
    sortable: true,
    id: "maintenance_date",
    width: "140px",
  },
  {
    name: "Заказ-наряд №",
    selector: (r) => r.order_number,
    sortable: true,
    width: "160px",
  },
  {
    name: "Дата заказа-наряда",
    selector: (r) => r.order_date,
    sortable: true,
    width: "180px",
  },
  {
    name: "Сервисная компания",
    selector: (r) => r.service_company,
    sortable: true,
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
