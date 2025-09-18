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
  table: {
    style: {
      minWidth: "2500px",
			minHeight: "500px",
    },
  },
  headCells: {
    style: {
      backgroundColor: "#163E6C",
      color: "white",
      fontWeight: 600,
      fontSize: "14px",
      minHeight: "80px",
      whiteSpace: "normal",
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

export const generalColumns = (opts = {}) => [
  {
    name: header("#"),
    cell: (row, index) => (opts.baseIndex ?? 0) + index + 1,
    width: "64px",
    grow: 1,
    sortable: false,
    ignoreRowClick: true,
    center: "true",
  },
  {
    name: "VIN",
    selector: (r) => r.vin,
    sortable: true,
    grow: 3,
    wrap: true,
    center: "true",
  },
  {
    name: header("Модель", "техники"),
    selector: (r) => r.vehicle_model,
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
            opts.openModel?.("vehicle", r.vehicle_model_id, r.vehicle_model);
          },
          disabled: !r.vehicle_model_id,
          title: r.vehicle_model_id
            ? "Нажмите для подробного описания"
            : "ID модели отсутствует",
        },
        r.vehicle_model,
      ),
  },
  {
    name: header("Модель", "двигателя"),
    selector: (r) => r.engine_model,
    sortable: true,
    grow: 1.5,
    wrap: true,
    ignoreRowClick: true,
    center: "true",
    cell: (r) =>
      React.createElement(
        "button",
        {
          type: "button",
          className: styleClickableRows,
          onClick: (e) => {
            e.stopPropagation();
            opts.openModel?.("engine", r.engine_model_id, r.engine_model);
          },
          disabled: !r.engine_model_id,
          title: r.engine_model_id
            ? "Нажмите для подробного описания"
            : "ID модели отсутствует",
        },
        r.engine_model,
      ),
  },
  {
    name: header("Зав. №", "двигателя"),
    selector: (r) => r.engine_number,
    sortable: true,
    grow: 1.5,
    wrap: true,
    center: "true",
  },
  {
    name: header("Модель", "трансмиссии"),
    selector: (r) => r.transmission_model,
    sortable: true,
    grow: 1.8,
    wrap: true,
    ignoreRowClick: true,
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
              "transmission",
              r.transmission_model_id,
              r.transmission_model,
            );
          },
          disabled: !r.transmission_model_id,
          title: r.transmission_model_id
            ? "Нажмите для подробного описания"
            : "ID модели отсутствует",
        },
        r.transmission_model,
      ),
  },
  {
    name: header("Зав. №", "трансмиссии"),
    selector: (r) => r.transmission_number,
    sortable: true,
    grow: 2,
    wrap: true,
    center: "true",
  },
  {
    name: header("Ведущий", "мост"),
    selector: (r) => r.drive_axle_model,
    sortable: true,
    grow: 1.4,
    wrap: true,
    ignoreRowClick: true,
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
              "drive_axle",
              r.drive_axle_model_id,
              r.drive_axle_model,
            );
          },
          disabled: !r.drive_axle_model_id,
          title: r.drive_axle_model_id
            ? "Нажмите для подробного описания"
            : "ID модели отсутствует",
        },
        r.drive_axle_model,
      ),
  },
  {
    name: header("Зав. №", "ведущего моста"),
    selector: (r) => r.drive_axle_number,
    sortable: true,
    grow: 1.4,
    wrap: true,
    center: "true",
  },
  {
    name: header("Управляемый", "мост"),
    selector: (r) => r.steering_axle_model,
    sortable: true,
    grow: 2,
    wrap: true,
    ignoreRowClick: true,
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
              "steering_axle",
              r.steering_axle_model_id,
              r.steering_axle_model,
            );
          },
          disabled: !r.steering_axle_model_id,
          title: r.steering_axle_model_id
            ? "Нажмите для подробного описания"
            : "ID модели отсутствует",
        },
        r.steering_axle_model,
      ),
  },
  {
    name: header("Зав. №", "управляемого моста"),
    selector: (r) => r.steering_axle_number,
    sortable: true,
    grow: 2,
    wrap: true,
    center: "true",
  },
  {
    name: header("Договор", "поставки"),
    selector: (r) => r.delivery_agreement,
    sortable: true,
    grow: 2,
    wrap: true,
    center: "true",
  },
  {
    name: header("Дата", "отгрузки"),
    selector: (r) => r.shipment_date,
    sortable: true,
    id: "shipment_date",
    grow: 1.8,
    wrap: true,
    center: "true",
  },
  {
    name: header("Грузо", "получатель"),
    selector: (r) => r.recipient,
    sortable: true,
    grow: 2,
    wrap: true,
    center: "true",
  },
  {
    name: header("Адрес", "поставки"),
    selector: (r) => r.delivery_address,
    sortable: true,
    grow: 1.8,
    wrap: true,
    center: "true",
  },
  {
    name: header("Комплектация"),
    selector: (r) => r.equipment,
    sortable: true,
    grow: 2.5,
    wrap: true,
    center: "true",
  },
  {
    name: header("Клиент"),
    selector: (r) => r.client,
    sortable: true,
    grow: 2,
    wrap: true,
    center: "true",
  },
  {
    name: header("Сервисная", "компания"),
    selector: (r) => r.service_company,
    sortable: true,
    grow: 2.5,
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

export const generalFilterRows = (rows, filters) => {
  const f = {
    vehicle_model: (filters?.vehicle_model || "").trim().toLowerCase(),
    engine_model: (filters?.engine_model || "").trim().toLowerCase(),
    transmission_model: (filters?.transmission_model || "")
      .trim()
      .toLowerCase(),
    steering_axle_model: (filters?.steering_axle_model || "")
      .trim()
      .toLowerCase(),
    drive_axle_model: (filters?.drive_axle_model || "").trim().toLowerCase(),
  };

  return rows.filter((r) => {
    const vm = String(r.vehicle_model || "").toLowerCase();
    const em = String(r.engine_model || "").toLowerCase();
    const tm = String(r.transmission_model || "").toLowerCase();
    const sa = String(r.steering_axle_model || "").toLowerCase();
    const da = String(r.drive_axle_model || "").toLowerCase();

    return (
      (!f.vehicle_model || vm.includes(f.vehicle_model)) &&
      (!f.engine_model || em.includes(f.engine_model)) &&
      (!f.transmission_model || tm.includes(f.transmission_model)) &&
      (!f.steering_axle_model || sa.includes(f.steering_axle_model)) &&
      (!f.drive_axle_model || da.includes(f.drive_axle_model))
    );
  });
};
