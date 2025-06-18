/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./app/**/*.{js,jsx,ts,tsx}",
		"./components/**/*.{js,jsx,ts,tsx}",
		"./hooks/**/*.{js,jsx,ts,tsx}",
	],
	presets: [require("nativewind/preset")],
	theme: {
		extend: {
			colors: {
				background: "rgb(var(--color-background) / <alpha-value>)",
				foreground: "rgb(var(--color-foreground) / <alpha-value>)",
				primary: {
					DEFAULT: "rgb(var(--color-primary) / <alpha-value>)",
					foreground:
						"rgb(var(--color-primary-foreground) / <alpha-value>)",
					muted: "rgb(var(--color-primary-muted) / <alpha-value>)",
				},
				secondary: {
					DEFAULT: "rgb(var(--color-secondary) / <alpha-value>)",
					foreground:
						"rgb(var(--color-secondary-foreground) / <alpha-value>)",
				},
				accent: {
					DEFAULT: "rgb(var(--color-accent) / <alpha-value>)",
					foreground:
						"rgb(var(--color-foreground-inverted) / <alpha-value>)",
				},
				muted: {
					DEFAULT: "rgb(var(--color-muted) / <alpha-value>)",
					foreground:
						"rgb(var(--color-muted-foreground) / <alpha-value>)",
				},
				card: {
					DEFAULT: "rgb(var(--color-card) / <alpha-value>)",
					foreground:
						"rgb(var(--color-card-foreground) / <alpha-value>)",
				},
				popover: {
					DEFAULT: "rgb(var(--color-popover) / <alpha-value>)",
					foreground:
						"rgb(var(--color-popover-foreground) / <alpha-value>)",
				},
				stroke: "rgb(var(--color-border) / <alpha-value>)",
				input: "rgb(var(--color-input) / <alpha-value>)",
				destructive: {
					DEFAULT: "rgb(var(--color-destructive) / <alpha-value>)",
					foreground:
						"rgb(var(--color-destructive-foreground) / <alpha-value>)",
				},
				success: {
					DEFAULT: "rgb(var(--color-success) / <alpha-value>)",
					foreground:
						"rgb(var(--color-success-foreground) / <alpha-value>)",
				},
				warning: {
					DEFAULT: "rgb(var(--color-warning) / <alpha-value>)",
					foreground:
						"rgb(var(--color-warning-foreground) / <alpha-value>)",
				},
				info: {
					DEFAULT: "rgb(var(--color-info) / <alpha-value>)",
					foreground:
						"rgb(var(--color-info-foreground) / <alpha-value>)",
				},
			},
		},
	},
	plugins: [],
	darkMode: "class",
};
