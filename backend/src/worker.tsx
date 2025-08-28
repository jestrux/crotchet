import { env } from "cloudflare:workers";
import { defineApp } from "rwsdk/worker";
import { render, route } from "rwsdk/router";

import { Document } from "@/app/Document";
import { Home } from "@/app/pages/Home";
import { setCommonHeaders } from "@/app/headers";
import crawlUrl from "./app/api/crawl";

// @ts-ignore
const kv = env.KV;

export type AppContext = {};

export default defineApp([
	setCommonHeaders(),
	({ ctx }) => {
		// setup ctx here
		ctx;
	},
	route("/socket", async function handler() {
		const url = await kv.get("__desktopBaseUrl");
		return Response.json({
			url,
		});
	}),
	route("/crawl/:url", async function handler({ params }) {
		return Response.json(await crawlUrl(params.url));
	}),
	route("/kv/:key", async function handler({ request, params }) {
		const key = params.key;

		if (request.method == "DELETE") await kv.delete(key);

		if (request.method == "POST") {
			await kv.put(
				key,
				((await request.json()) as { value?: string | object })?.value,
				{ expirationTtl: 60 * 3600 * 24 * 365 }
			);
		}

		return Response.json({ value: await kv.get(key) });
	}),
	render(Document, [route("/", Home)]),
]);
