import React from "react";
import { imgHeader } from "../../../utils/imgHeader";
import number_logo from "../../../assets/img/header/number.png";
import date_failure_logo from "../../../assets/img/header/date_failure.png";
import operating_time_logo from "../../../assets/img/header/operating_time.png";
import node_failure_logo from "../../../assets/img/header/node_failure.png";
import description_failure_logo from "../../../assets/img/header/description_failure.png";
import recovery_method_logo from "../../../assets/img/header/recovery_method.png";
import spare_parts_logo from "../../../assets/img/header/spare_parts.png";
import date_logo from "../../../assets/img/header/date.png";
import equipment_downtime_logo from "../../../assets/img/header/equipment_downtime.png";
import service_logo from "../../../assets/img/header/service.png";
import model_logo from "../../../assets/img/header/model.png";


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
		name: imgHeader(number_logo, "VIN"),
		selector: (r) => r.vin,
		sortable: true,
		grow: 2,
		wrap: true,
		center: "true",
	},
	{
		name: imgHeader(date_failure_logo, header("Дата", "отказа")),
		selector: (r) => r.date_of_failure,
		id: "date_of_failure",
		sortable: true,
		grow: 2,
		wrap: true,
		center: "true",
	},
	{
		name: imgHeader(operating_time_logo, header("Наработка", "м/час")),
		selector: (r) => r.operating_time,
		sortable: true,
		center: "true",
		id: "operating_time",
		grow: 2,
		wrap: true,
	},
	{
		name: imgHeader(node_failure_logo, header("Узел", "отказа")),
		selector: (r) => r.node_failure_id,
		center: "true",
		sortable: true,
		grow: 2,
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
							"failure_node",
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
		name: imgHeader(description_failure_logo, header("Описание", "отказа")),
		selector: (r) => r.description_failure,
		sortable: true,
		center: "true",
		grow: 2,
		wrap: true,
	},
	{
		name: imgHeader(recovery_method_logo, header("Способ", "восстановления")),
		selector: (r) => r.recovery_method_id,
		sortable: true,
		grow: 2,
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
		name: imgHeader(spare_parts_logo, header("Используемые", "запасные части")),
		selector: (r) => r.used_spare_parts,
		sortable: true,
		center: "true",
		grow: 2,
		wrap: true,
	},
	{
		name: imgHeader(date_logo, header("Дата", "восстановления")),
		selector: (r) => r.date_recovery,
		sortable: true,
		center: "true",
		grow: 2,
		wrap: true,
	},
	{
		name: imgHeader(equipment_downtime_logo, header("Время", "простоя техники")),
		selector: (r) => r.equipment_downtime,
		sortable: true,
		center: "true",
		grow: 2,
		wrap: true,
	},
	{
		name: imgHeader(service_logo, header("Сервисная", "компания")),
		selector: (r) => r.service_company,
		sortable: true,
		center: "true",
		grow: 2,
		wrap: true,
	},
	{
		name: imgHeader(model_logo, header("Модель", "машины")),
		selector: (r) => r.vehicle_model,
		sortable: true,
		center: "true",
		grow: 2,
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
