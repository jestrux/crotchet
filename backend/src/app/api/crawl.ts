import { parse } from "node-html-parser";

async function processWebsite(url: string, content: string) {
	const div = parse(content);

	const ogImage = div
		.querySelector(`[property="og:image"]`)
		?.getAttribute("content");

	let shortCutIcon = div
		.querySelector(`[rel="shortcut icon"]`)
		?.getAttribute("href");

	if (shortCutIcon && shortCutIcon.toString().charAt(0) == "/") {
		let baseUrl = new URL(url).href;
		if (baseUrl.endsWith("/")) {
			baseUrl = baseUrl.substring(0, baseUrl.length - 1);
		}
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

	let res = {
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

	if (!res.image || !res.description || !res.title) {
		const response: typeof res & { error: string } = await fetch(
			`https://api.linkpreview.net/?q=${url}`,
			{
				headers: {
					"X-Linkpreview-Api-Key": "b7fc8791125983bdf0b831273964f8b1",
				},
			}
		).then((res) => res.json());

		if (!response.error) res = response as typeof res;
	}

	return res;
}

const getYoutubeId = (url: string) => {
	if (!url?.length) return null;

	return url.match(
		// eslint-disable-next-line no-useless-escape
		/^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/
	)?.[1];
};

export default async function crawlUrl(url: string) {
	try {
		url = decodeURIComponent(url);
	} catch (e) {
		//
	}

	if (!url.startsWith("http")) url = `https://${url}`;
	const response = await fetch(url);
	const data = await response.text();
	const meta = await processWebsite(url, data);

	const youtubeId = getYoutubeId(url);
	if (youtubeId)
		(
			meta as typeof meta & { video: string }
		).video = `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;

	return {
		url,
		data,
		meta,
	};
}
