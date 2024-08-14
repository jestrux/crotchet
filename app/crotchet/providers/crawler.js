import { cleanObject, withCache } from "@/crotchet/utils";

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
	const res = await getWebsiteInfo(url);

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
