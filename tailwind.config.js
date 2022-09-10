/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["public/index.html", "./src/**/*.{js,jsx,ts,tsx}"],
	theme: {
		extend: {},
	},
	plugins: [
		require("tailwindcss-themer")({
			defaultTheme: {
				extend: {
					colors: {
						canvas: "#181818",
						card: "#252525",
						popup: "#383838",
						divider: "#222",
						content: "#fff",
						primary: "#b070f1",
						"primary-light": "#F6AD55",
					},
				},
			},
			themes: [
				{
					name: "light",
					extend: {
						colors: {
							canvas: "#E5E5E5",
							card: "#FFF",
							popup: "#FFF",
							divider: "#d4d4d4",
							content: "#000",
							primary: "rebeccapurple",
							"primary-light": "#F6AD55",
						},
					},
				},
				{
					name: "dark",
					extend: {
						colors: {
							canvas: "#181818",
							card: "#252525",
							popup: "#FFF",
							divider: "#282828",
							content: "#fff",
							primary: "#b070f1",
							"primary-light": "#F6AD55",
						},
					},
				},
			],
		}),
	],
};
