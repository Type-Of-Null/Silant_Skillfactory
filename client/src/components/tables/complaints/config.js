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

export const complaintsColumns = (opts = {}) => [
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
    name: "Дата отказа",
    selector: (r) => r.date_of_failure,
    sortable: true,
    grow: 1,
    wrap: true,
    center: "true",
  },
  {
    name: "Наработка м/час",
    selector: (r) => r.operating_time,
    sortable: true,
    center: "true",
    id: "operating_time",
    grow: 1,
    wrap: true,
  },
  {
    name: "Узел отказа",
    selector: (r) => r.node_failure_id,
    center: "true",
    sortable: true,
    grow: 1,
    wrap: true,
		cell: (r) =>
      React.createElement(
        "button",
        {
          type: "button",
          className: styleClickableRows,
          onClick: (e) => {
            e.stopPropagation();
            opts.openModel?.(
              "node_failure",
              r.node_failure_id,
              r.node_failure,
            );
          },
          disabled: !r.node_failure_id,
          title: r.node_failure_id
            ? "Нажмите для подробного описания"
            : "ID модели отсутствует",
        },
        r.node_failure,
      ),
  },
  {
    name: header("Описание", "отказа"),
    selector: (r) => r.description_failure,
    sortable: true,
    center: "true",
    grow: 1,
    wrap: true,
  },
  {
    name: header("Способ", "восстановления"),
    selector: (r) => r.recovery_method_id,
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
              "recovery_method",
              r.recovery_method_id,
              r.recovery_method,
            );
          },
          disabled: !r.recovery_method_id,
          title: r.recovery_method_id
            ? "Нажмите для подробного описания"
            : "ID модели отсутствует",
        },
        r.recovery_method,
      ),
  },
	{
		name: header("Используемые", "запасные части"),
		selector: (r) => r.used_spare_parts,
		sortable: true,
		center: "true",
		grow: 1,
		wrap: true,
	},
	{
		name: header("Дата", "восстановления"),
		selector: (r) => r.date_recovery,
		sortable: true,
		center: "true",
		grow: 1,
		wrap: true,
	},
	{
		name: header("Время", "простоя техники"),
		selector: (r) => r.equipment_downtime,
		sortable: true,
		center: "true",
		grow: 1,
		wrap: true,
	},
	{
		name: header("Сервисная", "компания"),
		selector: (r) => r.service_company,
		sortable: true,
		center: "true",
		grow: 1,
		wrap: true,
	},
	{
		name: header("Модель", "машины"),
		selector: (r) => r.vehicle_model,
		sortable: true,
		center: "true",
		grow: 1,
		wrap: true,
	},
];

export const complaintsfilteredRows = (rows, filters) => {
  const f = {
    node_failure: (filters?.node_failure || "").trim().toLowerCase(),
    recovery_method: (filters?.recovery_method || "").trim().toLowerCase(),
    service_company: (filters?.service_company || "").trim().toLowerCase(),
  };
  return rows.filter((r) => {
    const nf = String(r.node_failure || "").toLowerCase();
    const rm = String(r.recovery_method || "").toLowerCase();
    const sc = String(r.service_company || "").toLowerCase();
    return (
      (!f.node_failure || nf.includes(f.node_failure)) &&
      (!f.recovery_method || rm.includes(f.recovery_method)) &&
      (!f.service_company || sc.includes(f.service_company))
    );
  });
};
