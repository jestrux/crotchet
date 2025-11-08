import { env } from "cloudflare:workers";
import { defineApp } from "rwsdk/worker";
import { render, route } from "rwsdk/router";

import { Document } from "@/app/Document";
import { Home } from "@/app/pages/Home";
import { MapsDocs } from "@/app/pages/MapsDocs";
import { MapsDocsInteractive } from "@/app/pages/MapsDocsInteractive";
import { setCommonHeaders } from "@/app/headers";
import crawlUrl from "./app/api/crawl";
import { exchangeCodeForAuthToken, generateOauthUrl } from "./app/api/oauth";
import aiPrompt from "./app/api/ai";
import {
	getSheetDetails,
	getSheetDetailsSimple,
} from "./app/api/google-sheets";
import generatePathImage from "./app/api/maps/path";
import generatePlotImage from "./app/api/maps/plot";
import generateInteractiveMap from "./app/api/maps/interactive";

// @ts-ignore
const kv = env.KV;

export type AppContext = {};

// Helper function to recursively sort object keys for deterministic serialization
function sortObjectKeys(obj: any): any {
	if (obj === null || typeof obj !== "object") return obj;

	if (Array.isArray(obj)) return obj.map(sortObjectKeys);

	const sorted: any = {};
	Object.keys(obj)
		.sort()
		.forEach((key) => {
			sorted[key] = sortObjectKeys(obj[key]);
		});
	return sorted;
}

// Helper function to generate cache key from parameters
async function generateCacheKey(prefix: string, params: any): Promise<string> {
	// Sort all keys recursively for deterministic string
	const sortedParams = sortObjectKeys(params);
	const paramsString = JSON.stringify(sortedParams);

	// Generate SHA-256 hash
	const msgBuffer = new TextEncoder().encode(paramsString);
	const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashHex = hashArray
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");

	return `${prefix}:${hashHex}`;
}

export default defineApp([
	setCommonHeaders(),
	({ ctx }) => {
		// setup ctx here
		ctx;
	},
	route("/prompt", async function handler({ request }) {
		const { prompt, systemPrompt } = (await request.json()) as {
			prompt: string;
			systemPrompt?: string;
		};

		return Response.json(await aiPrompt(prompt, { systemPrompt }));
	}),
	route("/socket", async function handler() {
		const url = await kv.get("__desktopBaseUrl");
		return Response.json({
			url,
		});
	}),
	route("/crawl", async function handler({ request }) {
		const url =
			request.method.toLowerCase() == "post"
				? (
						(await request.json()) as {
							url: string;
						}
				  )?.url
				: new URL(request.url).searchParams.get("url");

		if (!url?.length)
			return new Response("No url provided", { status: 400 });

		return Response.json(await crawlUrl(url));
	}),
	route("/crawl/:url", async function handler({ params }) {
		return Response.json(await crawlUrl(params.url));
	}),
	route("/proxy", async function handler({ request }) {
		// Handle preflight OPTIONS request
		if (request.method === "OPTIONS") {
			return new Response(null, {
				status: 204,
				headers: {
					"Access-Control-Allow-Origin": "*",
					"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
					"Access-Control-Allow-Headers":
						"Content-Type, Authorization",
					"Access-Control-Max-Age": "86400",
				},
			});
		}

		const url =
			request.method.toLowerCase() == "post"
				? (
						(await request.json()) as {
							url: string;
						}
				  )?.url
				: new URL(request.url).searchParams.get("url");

		if (!url?.length)
			return new Response("No url provided", { status: 400 });

		try {
			// Decode URL if needed
			let decodedUrl = url;
			try {
				decodedUrl = decodeURIComponent(url);
			} catch (e) {
				// URL already decoded
			}

			// Ensure URL has protocol
			if (!decodedUrl.startsWith("http")) {
				decodedUrl = `https://${decodedUrl}`;
			}

			// Fetch the content
			const response = await fetch(decodedUrl);

			// Get the content
			const content = await response.blob();

			// Return with original content-type and explicit CORS headers
			return new Response(content, {
				status: response.status,
				headers: {
					"Content-Type":
						response.headers.get("Content-Type") ||
						"application/octet-stream",
					"Access-Control-Allow-Origin": "*",
					"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
					"Access-Control-Allow-Headers":
						"Content-Type, Authorization",
				},
			});
		} catch (error) {
			return new Response(
				`Failed to proxy URL: ${
					error instanceof Error ? error.message : String(error)
				}`,
				{ status: 500 }
			);
		}
	}),
	route("/google-sheet", async function handler({ request }) {
		const requestUrl = new URL(request.url);
		const simple = requestUrl.searchParams.get("simple") === "true";

		const url =
			request.method.toLowerCase() == "post"
				? (
						(await request.json()) as {
							url: string;
						}
				  )?.url
				: requestUrl.searchParams.get("url");

		if (!url?.length)
			return new Response("No url provided", { status: 400 });

		return Response.json(await getSheetDetails(url));
		// return Response.json(await getSheetDetails(url, { simple }));
		// const res = await getSheetDetailsSimple(url);
		// return new Response(res?.html || "");
	}),
	route("/maps/path", async function handler({ request }) {
		try {
			const url = new URL(request.url);
			const coordinatesParam = url.searchParams.get("coordinates");

			if (!coordinatesParam) {
				return new Response(
					"coordinates query parameter is required (JSON array of [lng, lat] pairs)",
					{ status: 400 }
				);
			}

			// Parse coordinates from JSON string
			let coordinates: Array<[number, number]>;
			try {
				coordinates = JSON.parse(coordinatesParam);
			} catch (e) {
				return new Response(
					"Invalid coordinates format. Expected JSON array.",
					{
						status: 400,
					}
				);
			}

			if (!Array.isArray(coordinates)) {
				return new Response("coordinates must be an array", {
					status: 400,
				});
			}

			// Parse optional parameters
			const options: {
				theme?: string;
				width?: number;
				height?: number;
				line?: { color?: string; width?: number };
				markers?: boolean;
				markerColor?: string;
				markerIcon?: string;
			} = {};

			const theme = url.searchParams.get("theme");
			if (theme) options.theme = theme;

			const width = url.searchParams.get("width");
			if (width) options.width = parseInt(width);

			const height = url.searchParams.get("height");
			if (height) options.height = parseInt(height);

			const lineColor = url.searchParams.get("lineColor");
			const lineWidth = url.searchParams.get("lineWidth");
			if (lineColor || lineWidth) {
				options.line = {};
				if (lineColor) options.line.color = lineColor;
				if (lineWidth) options.line.width = parseInt(lineWidth);
			}

			if (url.searchParams.get("markers") === "false") {
				options.markers = false;
			}

			// Only set markerColor if explicitly provided (otherwise hash colors are used)
			const markerColor = url.searchParams.get("markerColor");
			if (markerColor) options.markerColor = markerColor;

			const markerIcon = url.searchParams.get("markerIcon");
			if (markerIcon) options.markerIcon = markerIcon;

			// Generate cache key from coordinates and options
			const cacheParams = { coordinates, options };
			const cacheKey = await generateCacheKey("maps:path", cacheParams);

			// Try to get from cache
			const cached = await kv.get(cacheKey, { type: "arrayBuffer" });
			if (cached) {
				return new Response(cached, {
					headers: {
						"Content-Type": "image/png",
						"Access-Control-Allow-Origin": "*",
						"X-Cache": "HIT",
					},
				});
			}

			// Generate image
			const imageBuffer = await generatePathImage(coordinates, options);

			// Store in cache with 7-day TTL
			await kv.put(cacheKey, imageBuffer, {
				expirationTtl: 604800, // 7 days
			});

			return new Response(imageBuffer, {
				headers: {
					"Content-Type": "image/png",
					"Access-Control-Allow-Origin": "*",
					"X-Cache": "MISS",
				},
			});
		} catch (error) {
			return new Response(
				`Failed to generate path image: ${
					error instanceof Error ? error.message : String(error)
				}`,
				{ status: 500 }
			);
		}
	}),
	route("/maps/plot", async function handler({ request }) {
		try {
			const url = new URL(request.url);
			const coordinatesParam = url.searchParams.get("coordinates");

			if (!coordinatesParam) {
				return new Response(
					"coordinates query parameter is required (JSON array of [lng, lat] pairs)",
					{ status: 400 }
				);
			}

			// Parse coordinates from JSON string
			let coordinates: Array<[number, number]>;
			try {
				coordinates = JSON.parse(coordinatesParam);
			} catch (e) {
				return new Response(
					"Invalid coordinates format. Expected JSON array.",
					{
						status: 400,
					}
				);
			}

			if (!Array.isArray(coordinates)) {
				return new Response("coordinates must be an array", {
					status: 400,
				});
			}

			// Parse optional parameters
			const options: {
				theme?: string;
				width?: number;
				height?: number;
				zoomLevel?: number;
				markerColor?: string;
				markerColors?: string[];
				markerIcon?: string;
				autoFit?: boolean;
			} = {};

			const theme = url.searchParams.get("theme");
			if (theme) options.theme = theme;

			const width = url.searchParams.get("width");
			if (width) options.width = parseInt(width);

			const height = url.searchParams.get("height");
			if (height) options.height = parseInt(height);

			const zoomLevel = url.searchParams.get("zoomLevel");
			if (zoomLevel) options.zoomLevel = parseInt(zoomLevel);

			// Parse markerColors array (priority over markerColor)
			const markerColorsParam = url.searchParams.get("markerColors");
			if (markerColorsParam) {
				try {
					const parsed = JSON.parse(markerColorsParam);
					if (Array.isArray(parsed)) {
						options.markerColors = parsed;
					}
				} catch (e) {
					// Invalid JSON, ignore and fall back to other options
				}
			}

			const markerColor = url.searchParams.get("markerColor");
			if (markerColor) options.markerColor = markerColor;

			const markerIcon = url.searchParams.get("markerIcon");
			if (markerIcon) options.markerIcon = markerIcon;

			// Handle autoFit parameter (default is true)
			const autoFitParam = url.searchParams.get("autoFit");
			if (autoFitParam === "false") {
				options.autoFit = false;
			}

			// Generate cache key from coordinates and options
			const cacheParams = { coordinates, options };
			const cacheKey = await generateCacheKey("maps:plot", cacheParams);

			// Try to get from cache
			const cached = await kv.get(cacheKey, { type: "arrayBuffer" });
			if (cached) {
				return new Response(cached, {
					headers: {
						"Content-Type": "image/png",
						"Access-Control-Allow-Origin": "*",
						"X-Cache": "HIT",
					},
				});
			}

			// Generate image
			const imageBuffer = await generatePlotImage(coordinates, options);

			// Store in cache with 7-day TTL
			await kv.put(cacheKey, imageBuffer, {
				expirationTtl: 604800, // 7 days
			});

			return new Response(imageBuffer, {
				headers: {
					"Content-Type": "image/png",
					"Access-Control-Allow-Origin": "*",
					"X-Cache": "MISS",
				},
			});
		} catch (error) {
			return new Response(
				`Failed to generate plot image: ${
					error instanceof Error ? error.message : String(error)
				}`,
				{ status: 500 }
			);
		}
	}),
	route("/maps/interactive", async function handler({ request }) {
		try {
			const url = new URL(request.url);
			const coordinatesParam = url.searchParams.get("coordinates");

			if (!coordinatesParam) {
				return new Response(
					"coordinates query parameter is required (JSON array of [lng, lat] pairs)",
					{ status: 400 }
				);
			}

			// Parse coordinates from JSON string
			let coordinates: Array<[number, number]>;
			try {
				coordinates = JSON.parse(coordinatesParam);
			} catch (e) {
				return new Response("Invalid coordinates format. Expected JSON array.", {
					status: 400,
				});
			}

			if (!Array.isArray(coordinates)) {
				return new Response("coordinates must be an array", { status: 400 });
			}

			// Parse optional parameters
			const options: {
				theme?: string;
				width?: string;
				height?: string;
				zoomLevel?: number;
				markerColor?: string;
				markerColors?: string[];
				markerStyle?: string;
				autoFit?: boolean;
			} = {};

			const theme = url.searchParams.get("theme");
			if (theme) options.theme = theme;

			const width = url.searchParams.get("width");
			if (width) options.width = width;

			const height = url.searchParams.get("height");
			if (height) options.height = height;

			const zoomLevel = url.searchParams.get("zoomLevel");
			if (zoomLevel) options.zoomLevel = parseInt(zoomLevel);

			// Parse markerColors array (priority over markerColor)
			const markerColorsParam = url.searchParams.get("markerColors");
			if (markerColorsParam) {
				try {
					const parsed = JSON.parse(markerColorsParam);
					if (Array.isArray(parsed)) {
						options.markerColors = parsed;
					}
				} catch (e) {
					// Invalid JSON, ignore and fall back to other options
				}
			}

			const markerColor = url.searchParams.get("markerColor");
			if (markerColor) options.markerColor = markerColor;

			const markerStyle = url.searchParams.get("markerStyle");
			if (markerStyle) options.markerStyle = markerStyle;

			// Handle autoFit parameter (default is true)
			const autoFitParam = url.searchParams.get("autoFit");
			if (autoFitParam === "false") {
				options.autoFit = false;
			}

			// CACHING TEMPORARILY DISABLED
			// // Generate cache key from coordinates and options
			// const cacheParams = { coordinates, options };
			// const cacheKey = await generateCacheKey("maps:interactive", cacheParams);

			// // Try to get from cache
			// const cached = await kv.get(cacheKey, { type: "text" });
			// if (cached) {
			// 	return new Response(cached, {
			// 		headers: {
			// 			"Content-Type": "text/html",
			// 			"Access-Control-Allow-Origin": "*",
			// 			"X-Cache": "HIT",
			// 			// Override CSP to allow inline scripts for the interactive map
			// 			"Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' https://api.mapbox.com; style-src 'self' 'unsafe-inline' https://api.mapbox.com; img-src 'self' data: https: blob:; connect-src 'self' https://api.mapbox.com https://events.mapbox.com; frame-ancestors *; worker-src 'self' blob:; child-src 'self' blob:; object-src 'none';",
			// 		},
			// 	});
			// }

			// Generate HTML
			const html = generateInteractiveMap(coordinates, options);

			// // Store in cache with 7-day TTL
			// await kv.put(cacheKey, html, {
			// 	expirationTtl: 604800, // 7 days
			// });

			return new Response(html, {
				headers: {
					"Content-Type": "text/html",
					"Access-Control-Allow-Origin": "*",
					"X-Cache": "DISABLED",
					// Override CSP to allow inline scripts for the interactive map
					"Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' https://api.mapbox.com; style-src 'self' 'unsafe-inline' https://api.mapbox.com; img-src 'self' data: https: blob:; connect-src 'self' https://api.mapbox.com https://events.mapbox.com; frame-ancestors *; worker-src 'self' blob:; child-src 'self' blob:; object-src 'none';",
				},
			});
		} catch (error) {
			return new Response(
				`Failed to generate interactive map: ${
					error instanceof Error ? error.message : String(error)
				}`,
				{ status: 500 }
			);
		}
	}),
	route("/oauth", async function handler({ request }) {
		const { url, redirectUrl } = (await request.json()) as {
			url: string;
			redirectUrl: string;
		};
		return Response.json(
			await generateOauthUrl({
				url,
				redirectUrl,
				request,
			})
		);
	}),
	route("/oauth-callback", async function handler({ request }) {
		try {
			let { state, ...params } = Object.fromEntries(
				new URL(request.url).searchParams.entries()
			);

			const redirectUrl = new URL(
				state ? decodeURIComponent(state) : "http://localhost:5170"
			);

			params = {
				...params,
				...Object.fromEntries(redirectUrl.searchParams.entries()),
			};

			redirectUrl.search = new URLSearchParams(params).toString();

			const tokenDetails = await exchangeCodeForAuthToken(
				redirectUrl.toString()
			);

			if (!tokenDetails || typeof tokenDetails != "object")
				throw "Invalid token. Please check and try again.";

			const returnUrl = new URL(redirectUrl.toString());
			returnUrl.search = new URLSearchParams({
				// ...params,
				from_oauth: "true",
				preferenceKey: params.preferenceKey,
				...(tokenDetails as { [k: string]: string }),
			}).toString();
			return Response.redirect(returnUrl.toString());
		} catch (error) {
			// @ts-ignore
			return new Response("Error: " + (error?.message || error));
		}
	}),
	route("/kv/:key", async function handler({ request, params }) {
		const key = params.key;

		if (request.method == "DELETE") await kv.delete(key);

		if (request.method == "POST") {
			let value = ((await request.json()) as { value?: string | object })
				?.value;

			if (typeof value != "undefined") {
				if (typeof value == "object") value = JSON.stringify(value);
				await kv.put(key, value, {
					expirationTtl: 60 * 3600 * 24 * 365,
				});
			}
		}

		return Response.json({ value: await kv.get(key) });
	}),
	render(Document, [
		route("/", Home),
		route("/maps/docs", MapsDocs),
		route("/maps/docs/interactive", MapsDocsInteractive)
	]),
]);
