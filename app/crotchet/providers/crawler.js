import {
	cleanObject,
	getBackendBaseUrl,
	withCache,
	yearInSeconds,
} from "@/crotchet/utils";

async function processWebsite(url, name) {
	const baseUrl = document.body.getAttribute("base-url");
	return withCache(
		name || url.substring(0, 50),
		async () =>
			await fetch(`${baseUrl}/crawl/${encodeURIComponent(url)}`).then(
				(res) => res.json()
			)
	);
}

export const getWebsiteInfo = async (
	url,
	{ cacheKey, cacheDuration, invalidateCache } = {}
) => {
	// if (window.onDesktop()) return await processWebsite(url, name);

	const getInfo = async () => {
		const formatResponse = async (res) => {
			const meta = res?.meta;

			if (meta) {
				res.meta = cleanObject(meta);
				res.meta.subtitle = res.meta.description;
			}

			return res;
		};

		// if (!window.onDesktop()) {
		// 	const res = await window.remoteSocketAction("crawl", url);
		// 	if (res) return formatResponse(res);
		// }

		let res;
		const crawlUrl = `${getBackendBaseUrl()}/crawl/${encodeURIComponent(
			url
		)}`;
		try {
			// await window.copyToClipboard(crawlUrl);
			res = await fetch(crawlUrl).then((res) => res.json());
			try {
				res = JSON.parse(res);
			} catch (error) {
				//
			}
			res = formatResponse(res);
		} catch (error) {
			//
		}

		return res;
	};

	cacheKey = cacheKey ?? url.substring(0, 50);
	cacheDuration = cacheDuration ?? yearInSeconds();

	return await withCache(cacheKey, getInfo, {
		cacheDuration,
		invalidate: invalidateCache,
	});
};

async function crawlContent(html, query) {
	const div = document.createElement("div");
	div.innerHTML = html;

	if (!query) return { error: "Query is required" };

	try {
		if (query.includes("=>")) {
			const [parent, childrenMatchers] = query.split("=>");
			const results = Array.from(div.querySelectorAll(parent.trim())).map(
				(node) => {
					const row = {};
					const children = childrenMatchers.split("|");

					children.forEach((child) => {
						const [key, matcher, attribute = "innerText"] =
							child.split("::");
						const childNode =
							matcher.trim() === "$this"
								? node
								: node.querySelector(matcher.trim());

						if (childNode) {
							row[key.trim()] =
								childNode[attribute] ||
								childNode.getAttribute(attribute) ||
								getComputedStyle(childNode)[attribute];
						}
					});

					return row;
				}
			);

			return { results, type: "json" };
		} else {
			// Simple selector query
			const [selector, attribute = "innerText"] = query.split("::");
			const elements = Array.from(div.querySelectorAll(selector.trim()));

			const results = elements.map((el) => {
				return (
					el[attribute] ||
					el.getAttribute(attribute) ||
					getComputedStyle(el)[attribute]
				);
			});

			return { results, type: "list" };
		}
	} catch (error) {
		return {
			error:
				error instanceof Error ? error.message : "Invalid query syntax",
		};
	}
}

export const crawlUrl = async (
	url,
	{ matcher, cacheKey, cacheDuration, invalidateCache } = {}
) => {
	let res = await getWebsiteInfo(url, {
		cacheKey,
		cacheDuration,
		invalidateCache,
	});

	if (!matcher) return res;

	return (await crawlContent(res.data, matcher))?.results || [];
};
