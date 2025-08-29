import { cleanObject, getBackendBaseUrl, withCache } from "@/crotchet/utils";

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

export const getWebsiteInfo = async (url, name) => {
	if (window.onDesktop()) return await processWebsite(url, name);

	const getInfo = async () => {
		const formatResponse = async (res) => {
			const meta = res?.meta;

			if (meta) {
				res.meta = cleanObject(meta);
				res.meta.subtitle = res.meta.description;
			}

			return res;
		};

		let baseUrl = getBackendBaseUrl();
		if (!window.onDesktop()) {
			const res = await window.remoteSocketAction("crawl", url);
			if (res) return formatResponse(res);
		}

		let res;
		const crawlUrl = `${baseUrl}/crawl/${encodeURIComponent(url)}`;
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

	return await withCache(name || url.substring(0, 50), getInfo);
};

export const crawlUrl = async (url, matcher) => {
	let res = await getWebsiteInfo(url);

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
