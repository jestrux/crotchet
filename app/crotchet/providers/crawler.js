import { cleanObject, withCache } from "@/crotchet/utils";

async function processWebsite(url, name) {
	const content = await withCache(
		name || url.substring(0, 50),
		window.readNetworkFile(url)
	);
	// const content = await fetch(url).then((res) => res.text());

	const div = document.createElement("div");
	div.innerHTML = content;

	const ogImage = div
		.querySelector(`[property="og:image"]`)
		?.getAttribute("content");

	let shortCutIcon = div
		.querySelector(`[rel="shortcut icon"]`)
		?.getAttribute("href");

	if (shortCutIcon && shortCutIcon.toString().charAt(0) == "/") {
		let baseUrl = new URL(url).href;
		if (baseUrl.endsWith("/"))
			baseUrl = baseUrl.substring(0, baseUrl.length - 1);

		shortCutIcon = baseUrl + "/" + shortCutIcon.substring(1);
	}

	const appleTouchIcon = div
		.querySelector(`[rel="apple-touch-icon"]`)
		?.getAttribute("href");

	const twitterImage = div
		.querySelector(`[name="twitter:image"]`)
		?.getAttribute("content");

	const title = div.querySelector(`title`)?.textContent;
	const ogTitle = div
		.querySelector(`[property="og:title"]`)
		?.getAttribute("content");
	const twitterTitle = div
		.querySelector(`[name="twitter:title"]`)
		?.getAttribute("content");

	const description = div
		.querySelector(`[property="description"]`)
		?.getAttribute("content");

	const ogDescription = div
		.querySelector(`[property="og:description"]`)
		?.getAttribute("content");

	const twitterDescription = div
		.querySelector(`[name="twitter:description"]`)
		?.getAttribute("content");

	let meta = {
		url,
		image:
			[
				...new Set(
					[
						twitterImage,
						ogImage,
						appleTouchIcon,
						shortCutIcon,
					].filter((v) => v)
				),
			]?.[0] ?? null,
		title:
			[
				...new Set([twitterTitle, ogTitle, title].filter((v) => v)),
			]?.[0] ?? null,
		description:
			[
				...new Set(
					[twitterDescription, ogDescription, description].filter(
						(v) => v
					)
				),
			]?.[0] ?? null,
	};

	if (!meta.image || !meta.description || !meta.title) {
		const response = await fetch(`https://api.linkpreview.net/?q=${url}`, {
			headers: {
				"X-Linkpreview-Api-Key": "b7fc8791125983bdf0b831273964f8b1",
			},
		}).then((res) => res.json());

		if (!response.error) meta = response;
	}

	return {
		meta,
		data: content,
	};
}

export const getWebsiteInfo = async (url, name) => {
	var res = await withCache(
		name || url.substring(0, 50),
		fetch(
			`https://us-central1-letterplace-c103c.cloudfunctions.net/api/crawl/${encodeURIComponent(
				url
			)}`
		).then((res) => res.json())
	);

	try {
		res = JSON.parse(res);
	} catch (error) {
		//
	}

	if (res?.meta) {
		res.meta = cleanObject(res.meta);
		res.meta.subtitle = res.meta.description;
	}

	return res;
};

export const crawlUrl = async (url, matcher) => {
	// const res = await getWebsiteInfo(url);
	const res = await processWebsite(url);

	if (!matcher) return res;

	const content = document.createElement("div");
	content.innerHTML = res.data;

	if (matcher.indexOf("=>") == -1) {
		const [matcherQuery, attribute = "innerText"] = matcher.split("::");
		return Array.from(content.querySelectorAll(matcherQuery.trim())).map(
			(node) => {
				return node[attribute] || getComputedStyle(node)[attribute];
			}
		);
	}

	const [parent, childrenMatchers] = matcher.split("=>");
	const results = Array.from(content.querySelectorAll(parent)).reduce(
		(agg, node) => {
			const row = {};
			const children = childrenMatchers.split("|");
			children.forEach((child) => {
				const [key, matcher, attribute = "innerText"] =
					child.split("::");
				const childNode =
					matcher == "$this" ? node : node.querySelector(matcher);
				row[key.trim()] =
					childNode[attribute] ||
					childNode.getAttribute(attribute) ||
					getComputedStyle(childNode)[attribute];
			});

			return [...agg, row];
		},
		[]
	);

	return results;
};
