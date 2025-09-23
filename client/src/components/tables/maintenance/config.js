import React from "react";
import { imgHeader } from "../../../utils/imgHeader";
import number_logo from "../../../assets/img/header/number.png";
import type_service_logo from "../../../assets/img/header/type_service.png";
import date_logo from "../../../assets/img/header/date.png";
import contract_logo from "../../../assets/img/header/contract.png";
import service_logo from "../../../assets/img/header/service.png";

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
			minHeight: "500px",
			border: "1px solid #163E6C",
		},
	},
	headCells: {
		style: {
			fontWeight: 600,
			fontSize: "14px",
			minHeight: "150px",
			border: "0.5px solid #163E6C",
			backgroundColor: "#EBE6D6",
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'flex-start', 
			alignItems: 'center',
			paddingTop: '10px',
			paddingBottom: '10px',
		},
	},
	rows: {
		style: {
			minHeight: "48px",
			fontSize: "14px",
			textAlign: "center",
			border: "0.5px solid #163E6C",
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
		name: imgHeader(number_logo, "VIN"),
		selector: (r) => r.vin,
		sortable: true,
		grow: 1,
		wrap: true,
		center: "true",
	},
	{
		name: imgHeader(type_service_logo, "Вид ТО"),
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
		name: imgHeader(date_logo, "Дата ТО"),
		selector: (r) => r.maintenance_date,
		sortable: true,
		center: "true",
		id: "maintenance_date",
		grow: 1,
		wrap: true,
	},
	{
		name: imgHeader(contract_logo, "Заказ-наряд №"),
		selector: (r) => r.order_number,
		center: "true",
		sortable: true,
		grow: 1,
		wrap: true,
	},
	{
		name: imgHeader(date_logo, header("Дата", "заказ-наряда")),
		selector: (r) => r.order_date,
		sortable: true,
		center: "true",
		grow: 1,
		wrap: true,
	},
	{
		name: imgHeader(service_logo, header("Сервисная", "компания")),
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
