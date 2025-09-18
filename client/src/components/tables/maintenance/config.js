import React from "react";

const header = (namefirst, namelast) =>
  React.createElement(
    "span",
    { className: "text-center" },
    null,
    namefirst,
    React.createElement("br"),
    namelast,
  );

const styleClickableRows =
  "w-full inline-flex justify-center text-[#163E6C] underline decoration-dotted hover:text-[#1c4f8a]";

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
      textAlign: "center",
    },
  },
};

export const maintColumns = (opts = {}) => [
  {
    name: "#",
    cell: (row, index) => (opts.baseIndex ?? 0) + index + 1,
    width: "64px",
    grow: 0,
    center: "true",
    sortable: false,
    ignoreRowClick: true,
  },
  {
    name: "VIN",
    selector: (r) => r.vin,
    sortable: true,
    grow: 1,
    wrap: true,
    center: "true",
  },
  {
    name: "Вид ТО",
    selector: (r) => r.maintenance_type,
    sortable: true,
    grow: 1,
    wrap: true,
    center: "true",
    cell: (r) =>
      React.createElement(
        "button",
        {
          type: "button",
          className: styleClickableRows,
          onClick: (e) => {
            e.stopPropagation();
            opts.openModel?.(
              "maintenance",
              r.maintenance_type_id,
              r.maintenance_type,
            );
          },
          disabled: !r.maintenance_type_id,
          title: r.maintenance_type_id
            ? "Нажмите для подробного описания"
            : "ID вида ТО отсутствует",
        },
        r.maintenance_type,
      ),
  },
  {
    name: "Дата ТО",
    selector: (r) => r.maintenance_date,
    sortable: true,
    center: "true",
    id: "maintenance_date",
    grow: 1,
    wrap: true,
  },
  {
    name: "Заказ-наряд №",
    selector: (r) => r.order_number,
    center: "true",
    sortable: true,
    grow: 1,
    wrap: true,
  },
  {
    name: header("Дата", "заказа-наряда"),
    selector: (r) => r.order_date,
    sortable: true,
    center: "true",
    grow: 1,
    wrap: true,
  },
  {
    name: header("Сервисная", "компания"),
    selector: (r) => r.service_company,
    sortable: true,
    grow: 1,
    wrap: true,
    center: "true",
    cell: (r) =>
      React.createElement(
        "button",
        {
          type: "button",
          className: styleClickableRows,
          onClick: (e) => {
            e.stopPropagation();
            opts.openModel?.(
              "service_company",
              r.service_company_id,
              r.service_company,
            );
          },
          disabled: !r.service_company_id,
          title: r.service_company_id
            ? "Нажмите для подробного описания"
            : "ID модели отсутствует",
        },
        r.service_company,
      ),
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
