/** @type {import('tailwindcss').Config} */
export const content = [
	"./index.html",
	"./src/**/*.{js,ts,jsx,tsx}",
];
export const theme = {
	extend: {
		colors: {
			'color_header': '#163E6C', // Color for headers
			'color_button': '#D20A11', // Color for buttons
			'color_bg': '#EBE6D6', // Background color
		},
	},
};
export const plugins = [];
