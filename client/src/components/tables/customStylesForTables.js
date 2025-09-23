export const customStyles = (width) => ({
	table: {
		style: {
			minWidth: width,
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
});

