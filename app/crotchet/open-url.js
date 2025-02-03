import { dispatch, onDesktop, showApp } from "./utils";

const urlQueryParamsAsObject = (path) => {
	const url = new URL(
		"https://crotchet.app/" + path.replace("crotchet://", "")
	);

	const mapper = (value) => {
		if (isNaN(value)) {
			try {
				value = decodeURIComponent(value);
			} catch (error) {
				//
			}

			try {
				value = JSON.parse(value);
			} catch (error) {
				//
			}
		} else {
			value = Number(value);
		}

		return value;
	};

	const params = Array.from(url.searchParams.entries()).map(
		([key, value]) => {
			value = mapper(value);

			try {
				if (value.indexOf("<!>") != -1)
					value = value.split("<!>").map(mapper);
			} catch (error) {
				//
			}

			return [key, value];
		}
	);

	return Object.fromEntries(params);
};

const processSchemeUrl = (schemeName, path) => {
	const url = new URL(
		path.replace(`crotchet://${schemeName}/`, "https://crotchet.app/")
	);
	const [scheme, slug = "get"] = [
		...url.pathname.substring(1).split("/"),
		null,
		null,
	];
	const params = urlQueryParamsAsObject(path);
	const paramValues = Object.values(params);
	let args;

	if (paramValues.length) {
		if (paramValues.length == 1 && (params.param || params.arg))
			args = paramValues[0];
		else args = params;
	}

	return { scheme, slug, args };
};

export default async function openUrl(path) {
	if (onDesktop()) showApp();

	if (path.startsWith("crotchet://copy"))
		return window.copyToClipboard(path.replace("crotchet://copy/", ""));

	if (path.startsWith("crotchet://share/")) {
		const { args } = processSchemeUrl("share", path);
		return window.share(args);
	}

	if (path.startsWith("crotchet://data-source/")) {
		const { scheme: name, slug = "get" } = processSchemeUrl(
			"data-source",
			path
		);
		const actualSource = window.dataSources[name];

		if (typeof actualSource?.[slug] != "function")
			return window.showToast(`Data source ${name} not found!`);

		return actualSource?.[slug]();
	}

	if (path.startsWith("crotchet://search")) {
		const { scheme } = processSchemeUrl("socket", path);
		return window.openPage({ type: "search", source: scheme });
	}

	if (path.startsWith("crotchet://action/")) {
		const { scheme, args } = processSchemeUrl("action", path);
		const action = window.actions[scheme];
		if (action?.handler) return await action.handler(args);

		return window.showToast(`Action ${scheme} not found`);
	}

	if (path.startsWith("crotchet://socket/")) {
		const { scheme, args } = processSchemeUrl("socket", path);
		return window.socketEmit(scheme, args);
	}

	if (onDesktop()) return dispatch("open-url", new URL(path).href);

	window.open(path, "_blank");
}
