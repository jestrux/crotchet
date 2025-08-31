import { getBackendBaseUrl, withCache } from "../utils";

export const promptAI = async (
	prompt,
	{ systemPrompt, cacheKey, cacheDuration } = {}
) => {
	let res;
	try {
		res = await withCache(
			cacheKey ?? prompt,
			async () =>
				await fetch(`${getBackendBaseUrl()}/prompt`, {
					method: "POST",
					body: JSON.stringify({
						prompt,
						systemPrompt,
					}),
				}).then((res) => res.json()),
			{ cacheDuration: cacheDuration ?? 60 }
		);
	} catch (error) {
		//
	}

	return res?.message;
};
