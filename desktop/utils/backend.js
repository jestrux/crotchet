const getBackendBaseUrl = () => "https://backend.wakyj07.workers.dev";

const kv = async (key, value) => {
	const getting = typeof value == "undefined";
	return await fetch(`${getBackendBaseUrl()}/kv/${key}`, {
		headers: {
			Accept: "application/json",
		},
		method: getting ? "GET" : "POST",
		body: getting
			? null
			: JSON.stringify({
					value,
			  }),
	}).then(async (res) => (await res.json())?.value);
};

module.exports = {
	getBackendBaseUrl,
	kv,
};
