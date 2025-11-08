import { env } from "cloudflare:workers";

/**
 * Generate an interactive embeddable map with markers
 *
 * @param {Array<[number, number]>} coordinates - Array of [longitude, latitude] coordinates
 * @param {Object} options - Configuration options
 * @param {string} [options.theme="Basic"] - Map theme (Basic, Satellite, Light, Dark, Spring, Decimal, Sky, Blueprint, Galaxy, Old West)
 * @param {number} [options.width="100%"] - Map width (pixels or percentage)
 * @param {number} [options.height="600px"] - Map height (pixels or percentage)
 * @param {number} [options.zoomLevel] - Zoom level (auto-fit if not specified)
 * @param {string} [options.markerColor] - Single color for all markers (hex). Falls back to hash-based if not provided.
 * @param {Array<string>} [options.markerColors] - Array of colors (hex) for each marker. Uses modulus if length doesn't match coordinates.
 * @param {string} [options.markerStyle="pin"] - Marker style: "pin" (default) or "circle"
 * @param {boolean} [options.autoFit=true] - Auto-fit map to show all markers
 *
 * @returns {string} HTML document with interactive map
 */
export default function generateInteractiveMap(
	coordinates: Array<[number, number]>,
	options: {
		theme?: string;
		width?: string;
		height?: string;
		zoomLevel?: number;
		markerColor?: string;
		markerColors?: string[];
		markerStyle?: string;
		autoFit?: boolean;
	} = {}
): string {
	// Validate inputs
	if (!Array.isArray(coordinates) || coordinates.length === 0) {
		throw new Error("coordinates must be a non-empty array");
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
		width = "100%",
		height = "600px",
		zoomLevel,
		markerColor,
		markerColors,
		markerStyle = "pin",
		autoFit = true,
	} = options;

	// Hash function to generate color from coordinates
	function hashCoordinateToColor(lng: number, lat: number): string {
		const str = `${lng.toFixed(6)},${lat.toFixed(6)}`;
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			hash = str.charCodeAt(i) + ((hash << 5) - hash);
			hash = hash & hash;
		}

		const hue = Math.abs(hash % 360);
		const saturation = 70 + (Math.abs(hash >> 8) % 30);
		const lightness = 45 + (Math.abs(hash >> 16) % 15);

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
			return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
		};

		return hslToRgb(hue, saturation, lightness);
	}

	// Default themes mapping (Mapbox style URLs)
	const defaultThemes: { [key: string]: string } = {
		Basic: "mapbox://styles/mapbox/streets-v11",
		Satellite: "mapbox://styles/mapbox/satellite-streets-v11",
		Light: "mapbox://styles/mapbox/light-v10",
		Dark: "mapbox://styles/mapbox/dark-v10",
		Spring: "mapbox://styles/fancymaps/ckpyx643v15nq17k4464kex8f",
		Decimal: "mapbox://styles/fancymaps/ckpyx036g2hye17lmnyr9k6tp",
		Sky: "mapbox://styles/fancymaps/ckpyxb8wiw2cme17qq1qk11ycc",
		Blueprint: "mapbox://styles/fancymaps/ckpyxcung2drw17oarchfirw0",
		Galaxy: "mapbox://styles/fancymaps/ckpyxb8ob15sz17k4k2lmkq4r",
		"Old West": "mapbox://styles/fancymaps/ckpyxigkt2dx917oawz7jn89m",
	};

	const apiKey = env.MAPBOX_API_KEY;
	if (!apiKey) {
		throw new Error("MAPBOX_API_KEY environment variable is not set");
	}

	// Resolve the style URL: use predefined theme, custom mapbox:// URL, or fallback to Basic
	let styleUrl: string;
	if (defaultThemes[theme]) {
		styleUrl = defaultThemes[theme];
	} else if (theme.startsWith("mapbox://styles/")) {
		styleUrl = theme;
	} else {
		// Invalid theme name, fallback to Basic
		styleUrl = defaultThemes["Basic"];
	}

	// Calculate center and bounds
	let centerLng = 0;
	let centerLat = 0;
	let minLng = Infinity;
	let maxLng = -Infinity;
	let minLat = Infinity;
	let maxLat = -Infinity;

	coordinates.forEach(([lng, lat]) => {
		centerLng += lng;
		centerLat += lat;
		minLng = Math.min(minLng, lng);
		maxLng = Math.max(maxLng, lng);
		minLat = Math.min(minLat, lat);
		maxLat = Math.max(maxLat, lat);
	});

	centerLng /= coordinates.length;
	centerLat /= coordinates.length;

	// Generate markers with colors
	const markers = coordinates.map((coords, index) => {
		let color: string;
		if (markerColors && markerColors.length > 0) {
			color = markerColors[index % markerColors.length];
		} else if (markerColor) {
			color = markerColor;
		} else {
			color = hashCoordinateToColor(coords[0], coords[1]);
		}

		return {
			lng: coords[0],
			lat: coords[1],
			color: color,
		};
	});

	const markersJSON = JSON.stringify(markers);

	// Generate HTML
	const html = `<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Interactive Map</title>
	<script src="https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.js"></script>
	<link href="https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css" rel="stylesheet">
	<style>
		html, body {
			margin: 0;
			padding: 0;
			height: 100%;
			width: 100%;
		}
		#map {
			width: ${width};
			height: ${height};
		}
	</style>
</head>
<body>
	<div id="map"></div>
	<script>
		mapboxgl.accessToken = '${apiKey}';

		const map = new mapboxgl.Map({
			container: 'map',
			style: '${styleUrl}',
			center: [${centerLng}, ${centerLat}],
			zoom: ${zoomLevel || 9}
		});

		const markers = ${markersJSON};
		const markerStyle = "${markerStyle}";

		// Add markers
		markers.forEach(marker => {
			if (markerStyle === "circle") {
				// Custom circle marker
				const el = document.createElement('div');
				el.style.width = '20px';
				el.style.height = '20px';
				el.style.borderRadius = '50%';
				el.style.backgroundColor = marker.color;
				el.style.border = '2px solid white';
				el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
				el.style.cursor = 'pointer';

				new mapboxgl.Marker(el)
					.setLngLat([marker.lng, marker.lat])
					.addTo(map);
			} else {
				// Default pin marker
				new mapboxgl.Marker({ color: marker.color })
					.setLngLat([marker.lng, marker.lat])
					.addTo(map);
			}
		});

		${
			autoFit && !zoomLevel
				? `
		// Fit bounds to show all markers
		map.on('load', () => {
			const bounds = new mapboxgl.LngLatBounds();
			markers.forEach(marker => {
				bounds.extend([marker.lng, marker.lat]);
			});
			map.fitBounds(bounds, { padding: 50 });
		});`
				: ""
		}

		// Listen for postMessage commands from parent window
		window.addEventListener('message', (event) => {
			// Security: In production, validate event.origin
			const { command, data } = event.data;

			switch (command) {
				case 'flyTo':
					// Fly to specific coordinates with optional zoom
					// data: { lng, lat, zoom?, duration? }
					if (data && typeof data.lng === 'number' && typeof data.lat === 'number') {
						map.flyTo({
							center: [data.lng, data.lat],
							zoom: data.zoom !== undefined ? data.zoom : map.getZoom(),
							duration: data.duration !== undefined ? data.duration : 2000,
							essential: true
						});
					}
					break;

				case 'setZoom':
					// Set zoom level
					// data: { zoom, duration? }
					if (data && typeof data.zoom === 'number') {
						map.flyTo({
							zoom: data.zoom,
							duration: data.duration !== undefined ? data.duration : 1000
						});
					}
					break;

				case 'setCenter':
					// Pan to specific coordinates
					// data: { lng, lat, duration? }
					if (data && typeof data.lng === 'number' && typeof data.lat === 'number') {
						map.flyTo({
							center: [data.lng, data.lat],
							duration: data.duration !== undefined ? data.duration : 1000
						});
					}
					break;

				case 'fitBounds':
					// Fit to show all markers or custom bounds
					// data: { bounds?, padding? } - bounds: [[minLng, minLat], [maxLng, maxLat]]
					if (data && data.bounds) {
						map.fitBounds(data.bounds, {
							padding: data.padding || 50,
							duration: data.duration !== undefined ? data.duration : 1000
						});
					} else {
						// Fit to all current markers
						const bounds = new mapboxgl.LngLatBounds();
						markers.forEach(marker => {
							bounds.extend([marker.lng, marker.lat]);
						});
						map.fitBounds(bounds, {
							padding: data?.padding || 50,
							duration: data?.duration !== undefined ? data.duration : 1000
						});
					}
					break;

				case 'getCenter':
					// Return current center coordinates
					const center = map.getCenter();
					event.source.postMessage({
						command: 'centerResponse',
						data: { lng: center.lng, lat: center.lat }
					}, event.origin);
					break;

				case 'getZoom':
					// Return current zoom level
					const zoom = map.getZoom();
					event.source.postMessage({
						command: 'zoomResponse',
						data: { zoom }
					}, event.origin);
					break;
			}
		});

		// Notify parent window that map is ready
		map.on('load', () => {
			if (window.parent !== window) {
				window.parent.postMessage({ command: 'mapReady' }, '*');
			}
		});
	</script>
</body>
</html>`;

	return html;
}