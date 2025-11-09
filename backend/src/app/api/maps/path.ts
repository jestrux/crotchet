import { env } from "cloudflare:workers";

/**
 * Generate a map image with a path through multiple coordinates
 *
 * @param {Array<[number, number]>} coordinates - Array of [longitude, latitude] coordinates
 * @param {Object} options - Configuration options
 * @param {string} [options.theme="Basic"] - Map theme (Basic, Satellite, Light, Dark, Spring, Decimal, Sky, Blueprint, Galaxy, Old West)
 * @param {number} [options.width=800] - Map width in pixels (max 1280)
 * @param {number} [options.height=800] - Map height in pixels (max 1280)
 * @param {Object} [options.line] - Path line styling
 * @param {string} [options.line.color="#55FF33"] - Line color (hex)
 * @param {number} [options.line.width=6] - Line width (4-10)
 * @param {boolean} [options.markers=true] - Show markers at each coordinate
 * @param {string} [options.markerIcon="circle"] - Marker icon
 *
 * @returns {Promise<ArrayBuffer>} Image binary data
 */
export default async function generatePathImage(
	coordinates: Array<[number, number]>,
	options: {
		theme?: string;
		width?: number;
		height?: number;
		line?: {
			color?: string;
			width?: number;
		};
		markers?: boolean;
		markerIcon?: string;
	} = {}
): Promise<ArrayBuffer> {
	// Validate inputs
	if (!Array.isArray(coordinates) || coordinates.length < 2) {
		throw new Error("markers must contain at least 2 coordinate pairs");
	}

	// Validate each coordinate
	for (const coord of coordinates) {
		if (
			!Array.isArray(coord) ||
			coord.length !== 2 ||
			typeof coord[0] !== "number" ||
			typeof coord[1] !== "number"
		) {
			throw new Error(
				"Each coordinate must be an array of [longitude, latitude] numbers"
			);
		}
	}

	// Default options
	const {
		theme = "Basic",
		width = 800,
		height = 800,
		line = { color: "#55FF33", width: 6 },
		markers = true,
		markerIcon = "circle",
	} = options;

	const lineColor = line.color || "#55FF33";
	const lineWidth = line.width || 6;

	// Hash function to generate color from coordinates
	function hashCoordinateToColor(lng: number, lat: number): string {
		// Simple hash function combining longitude and latitude
		const str = `${lng.toFixed(6)},${lat.toFixed(6)}`;
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			hash = str.charCodeAt(i) + ((hash << 5) - hash);
			hash = hash & hash; // Convert to 32-bit integer
		}

		// Generate vibrant colors by using HSL color space
		// Use hash to determine hue (0-360), keep saturation and lightness high for visibility
		const hue = Math.abs(hash % 360);
		const saturation = 70 + (Math.abs(hash >> 8) % 30); // 70-100%
		const lightness = 45 + (Math.abs(hash >> 16) % 15); // 45-60%

		// Convert HSL to RGB
		const hslToRgb = (h: number, s: number, l: number): string => {
			s /= 100;
			l /= 100;
			const k = (n: number) => (n + h / 30) % 12;
			const a = s * Math.min(l, 1 - l);
			const f = (n: number) =>
				l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
			const r = Math.round(255 * f(0));
			const g = Math.round(255 * f(8));
			const b = Math.round(255 * f(4));
			return (
				(r < 16 ? "0" : "") + r.toString(16) +
				(g < 16 ? "0" : "") + g.toString(16) +
				(b < 16 ? "0" : "") + b.toString(16)
			);
		};

		return hslToRgb(hue, saturation, lightness);
	}

	// Default themes mapping
	const defaultThemes: { [key: string]: string } = {
		Basic: "mapbox/streets-v11",
		Satellite: "mapbox/satellite-streets-v11",
		Light: "mapbox/light-v10",
		Dark: "mapbox/dark-v10",
		Spring: "fancymaps/ckpyx643v15nq17k4464kex8f",
		Decimal: "fancymaps/ckpyx036g2hye17lmnyr9k6tp",
		Sky: "fancymaps/ckpyxb8wiw2cme17qq1qk11ycc",
		Blueprint: "fancymaps/ckpyxcung2drw17oarchfirw0",
		Galaxy: "fancymaps/ckpyxb8ob15sz17k4k2lmkq4r",
		"Old West": "fancymaps/ckpyxigkt2dx917oawz7jn89m",
	};

	// Polyline encoding utilities
	function py2_round(e: number): number {
		return Math.floor(Math.abs(e) + 0.5) * (e >= 0 ? 1 : -1);
	}

	function encodeValue(
		e: number,
		o: number,
		n: number
	): string {
		let current = py2_round(e * n);
		let previous = py2_round(o * n);
		let r = current - previous;
		r <<= 1;
		if (current - previous < 0) {
			r = ~r;
		}
		let t = "";
		while (r >= 32) {
			t += String.fromCharCode(63 + (32 | (31 & r)));
			r >>= 5;
		}
		return (t += String.fromCharCode(r + 63));
	}

	function encodePolyline(
		coords: Array<[number, number]>,
		precision?: number
	): string {
		if (!coords.length) return "";
		const n = Math.pow(10, Number.isInteger(precision) ? precision! : 5);
		let result = encodeValue(coords[0][1], 0, n) + encodeValue(coords[0][0], 0, n);
		for (let i = 1; i < coords.length; i++) {
			const current = coords[i];
			const prev = coords[i - 1];
			result += encodeValue(current[1], prev[1], n);
			result += encodeValue(current[0], prev[0], n);
		}
		return result;
	}

	const apiKey = env.MAPBOX_API_KEY;
	if (!apiKey) {
		throw new Error("MAPBOX_API_KEY environment variable is not set");
	}

	// Encode the path
	const encodedPath = encodePolyline(coordinates);
	const pathColor = lineColor.replace("#", "");
	const pathString = `path-${lineWidth}+${pathColor}(${encodedPath})`;

	// Add markers if requested
	let overlayString = pathString;
	if (markers) {
		const markerStrings = coordinates.map(([lng, lat]) => {
			// Generate color from coordinate hash
			const color = hashCoordinateToColor(lng, lat);
			return `pin-s-${markerIcon}+${color}(${lng},${lat})`;
		});
		overlayString = pathString + "," + markerStrings.join(",");
	}

	// Adjust dimensions if needed
	let finalWidth = width < 500 ? width * 1.5 : width;
	let finalHeight = height < 500 ? height * 1.5 : height;

	if (finalWidth > 1280 || finalHeight > 1280) {
		const aspectRatio = finalWidth / finalHeight;
		finalWidth = 1280;
		finalHeight = 1280 / aspectRatio;
	}

	// Build the Mapbox Static API URL
	// Resolve theme: use predefined theme, custom mapbox:// URL, or fallback to Basic
	let resolvedTheme: string;
	if (defaultThemes[theme]) {
		resolvedTheme = defaultThemes[theme];
	} else if (theme.startsWith("mapbox://styles/")) {
		resolvedTheme = theme.replace("mapbox://styles/", "");
	} else {
		// Invalid theme name, fallback to Basic
		resolvedTheme = defaultThemes["Basic"];
	}
	const styleUrl = "styles/v1/" + resolvedTheme;

	const url = `https://api.mapbox.com/${styleUrl}/static/${encodeURIComponent(
		overlayString
	)}/auto/${parseInt(String(finalWidth))}x${parseInt(
		String(finalHeight)
	)}?access_token=${apiKey}`;

	// Fetch the image
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to generate map image: ${response.statusText}`);
	}

	return await response.arrayBuffer();
}