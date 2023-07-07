/** @type {import('tailwindcss').Config} */

module.exports = {
	content: ["public/index.html", "./src/**/*.{js,jsx,ts,tsx}"],
	theme: {
		extend: {
			screens: {
				desktop: "1400px",
			},
			colors: {
				canvas: "rgb(var(--canvas-color) / <alpha-value>)",
				card: "rgb(var(--card-color) / <alpha-value>)",
				popup: "rgb(var(--popup-color) / <alpha-value>)",
				divider: "rgb(var(--divider-color) / <alpha-value>)",
				content: "rgb(var(--content-color) / <alpha-value>)",
				primary: "rgb(var(--primary-color) / <alpha-value>)",
				"primary-light":
					"rgb(var(--primary-light-color) / <alpha-value>)",
			},
		},
	},
	plugins: [require("@tailwindcss/forms")],
};
