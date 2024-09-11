/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				canvas: "rgb(var(--canvas-color) / <alpha-value>)",
				card: "rgb(var(--card-color) / <alpha-value>)",
				content: "rgb(var(--content-color) / <alpha-value>)",
				inverted: "rgb(var(--content-inverted-color) / <alpha-value>)",
				"on-content":
					"rgb(var(--content-inverted-color) / <alpha-value>)",
				primary: "rgb(var(--primary-color) / <alpha-value>)",
				"on-primary": "rgb(var(--on-primary-color) / <alpha-value>)",
				"on-primary-inverted":
					"rgb(var(--on-primary-inverted-color) / <alpha-value>)",
				"primary-dark":
					"rgb(var(--primary-dark-color) / <alpha-value>)",
				stroke: "rgb(var(--stroke-color) / <alpha-value>)",
			},
		},
	},
	plugins: [
		require("@tailwindcss/container-queries"),
		require("@tailwindcss/typography"),
	],
};
