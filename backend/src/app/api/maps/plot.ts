import { env } from "cloudflare:workers";

/**
 * Generate a map with multiple location markers (no paths)
 *
 * @param {Array<[number, number]>} coordinates - Array of [longitude, latitude] coordinates
 * @param {Object} options - Configuration options
 * @param {string} [options.theme="Basic"] - Map theme (Basic, Satellite, Light, Dark, Spring, Decimal, Sky, Blueprint, Galaxy, Old West)
 * @param {number} [options.width=800] - Map width in pixels (max 1280)
 * @param {number} [options.height=800] - Map height in pixels (max 1280)
 * @param {number} [options.zoomLevel] - Zoom level (auto-fit if not specified)
 * @param {Array<string>} [options.markerColors] - Array of colors (hex with # prefix) for each marker. Uses modulus if length doesn't match coordinates. Falls back to hash-based if not provided.
 * @param {string} [options.markerIcon="circle"] - Marker icon
 * @param {boolean} [options.autoFit=true] - Auto-fit map to show all markers
 *
 * @returns {Promise<ArrayBuffer>} Image binary data
 */
export default async function generatePlotImage(
	coordinates: Array<[number, number]>,
	options: {
		theme?: string;
		width?: number;
		height?: number;
		zoomLevel?: number;
		markerColors?: string[];
		markerIcon?: string;
		autoFit?: boolean;
	} = {}
): Promise<ArrayBuffer> {
	// Validate inputs
	if (!Array.isArray(coordinates) || coordinates.length === 0) {
		throw new Error("markers must contain at least 1 coordinate pair");
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
		zoomLevel,
		markerColors,
		markerIcon = "circle",
		autoFit = true,
	} = options;

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

	const apiKey = env.MAPBOX_API_KEY;
	if (!apiKey) {
		throw new Error("MAPBOX_API_KEY environment variable is not set");
	}

	// Adjust dimensions if needed
	let finalWidth = width < 500 ? width * 1.5 : width;
	let finalHeight = height < 500 ? height * 1.5 : height;

	if (finalWidth > 1280 || finalHeight > 1280) {
		const aspectRatio = finalWidth / finalHeight;
		finalWidth = 1280;
		finalHeight = 1280 / aspectRatio;
	}

	// Create GeoJSON for markers with two-tier color fallback
	const icon = markerIcon || "circle";

	const geojson = {
		type: "FeatureCollection",
		features: coordinates.map((coords, index) => {
			// Two-tier color fallback:
			// 1. markerColors array (with modulus)
			// 2. hash-based color
			let color: string;
			if (markerColors && markerColors.length > 0) {
				// Use modulus to cycle through colors if array is shorter than coordinates
				color = markerColors[index % markerColors.length].replace("#", "");
			} else {
				color = hashCoordinateToColor(coords[0], coords[1]);
			}

			return {
				type: "Feature",
				geometry: {
					type: "Point",
					coordinates: coords.map((c) => Number(Number(c).toFixed(6))),
				},
				properties: {
					"marker-color": color,
					"marker-size": "large",
					"marker-symbol": icon,
				},
			};
		}),
	};

	const geojsonString = encodeURIComponent(JSON.stringify(geojson));
	const markerOverlay = `/geojson(${geojsonString})`;

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

	let url: string;
	if (autoFit || !zoomLevel) {
		// Auto-fit to show all markers
		url = `https://api.mapbox.com/${styleUrl}/static${markerOverlay}/auto/${parseInt(
			String(finalWidth)
		)}x${parseInt(
			String(finalHeight)
		)}?before_layer=country-label&access_token=${apiKey}`;
	} else {
		// Use specific zoom level and center on first coordinate
		const centerCoord = coordinates[0];
		url = `https://api.mapbox.com/${styleUrl}/static${markerOverlay}/${
			centerCoord[0]
		},${centerCoord[1]},${zoomLevel}/${parseInt(String(finalWidth))}x${parseInt(
			String(finalHeight)
		)}?before_layer=country-label&access_token=${apiKey}`;
	}

	// Fetch the image
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to generate map image: ${response.statusText}`);
	}

	return await response.arrayBuffer();
}
