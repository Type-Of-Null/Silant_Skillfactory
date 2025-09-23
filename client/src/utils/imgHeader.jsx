import React from 'react';

export const imgHeader = (logo, text) =>
	React.createElement(
		"div",
		{ 
			className: "flex items-center justify-center gap-1",
			style: { flexDirection: 'column' }
		},
		// Изображение
		React.createElement("img", {
			src: logo,
			alt: "VIN",
			className: "w-15 h-auto",
			style: { marginBottom: '4px' }
		}),
		// Текст
		React.createElement(
			"span",
			{ className: "text-center" },
			text
		)
	);