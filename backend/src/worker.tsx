import { env } from "cloudflare:workers";
import { defineApp } from "rwsdk/worker";
import { render, route } from "rwsdk/router";

import { Document } from "@/app/Document";
import { Home } from "@/app/pages/Home";
import { setCommonHeaders } from "@/app/headers";
import crawlUrl from "./app/api/crawl";
import { exchangeCodeForAuthToken, generateOauthUrl } from "./app/api/oauth";
import aiPrompt from "./app/api/ai";
import {
	getSheetDetails,
	getSheetDetailsSimple,
} from "./app/api/google-sheets";

// @ts-ignore
const kv = env.KV;

export type AppContext = {};

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
	render(Document, [route("/", Home)]),
]);
