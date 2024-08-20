import { matchSorter } from "match-sorter";
import { onActionClick } from "./hooks/useActionClick";

export const randomId = () => "id" + Math.random().toString(36).slice(2);

export const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);

export const someTime = (t = 200) => new Promise((res) => setTimeout(res, t));

export const onDesktop = () => document.body.classList.contains("on-electron");

export const dispatch = (event, payload) => {
	window.dispatchEvent(
		new CustomEvent(event, {
			detail: payload,
		})
	);
};

export const socketEmit = (event, payload) =>
	dispatch("socket-emit", {
		event,
		payload,
	});

export const camelCaseToSentenceCase = (text) => {
	if (!text || !text.length) return "";
	const result = text.replace(/([A-Z]{1,})/g, " $1");
	return result.charAt(0).toUpperCase() + result.slice(1);
};

export const showApp = async () => dispatch("toggle-app", true);

export const hideApp = async () => dispatch("toggle-app", false);

export const getWriteableFile = async (path) => {
	const res = path
		? await window
				.readFile({ path })
				.then((contents) => (contents ? { path, contents } : { path }))
		: await window.getFile({ properties: ["openFile"], read: true });

	if (!res?.path) return;

	const { path: _path, contents } = res;

	return {
		path: _path,
		contents,
		save: (contents, { open = false } = {}) =>
			saveFile({ path: _path }, contents, { open }),
	};
};

export const saveFile = async (props = {}, contents, { folder, open } = {}) => {
	contents =
		typeof contents == "object"
			? JSON.stringify(contents, null, 4)
			: contents;

	return window.writeFile({ name: props.name, path: props.path }, contents, {
		folder,
		open,
	});
};

export const getToken = async (key, { prompt } = {}) => {
	let token = (await getPreference(`token-${key}`))?.value;

	if (!token && prompt) {
		const newToken = await window.openAlertForm({
			title: "Enter Token",
			field: {
				label: key,
			},
		});

		if (newToken) token = (await saveToken(key, newToken))?.value;
	}

	return token;
};

export const saveToken = async (key, value, expiresAt) =>
	savePreference(`token-${key}`, { value, expiresAt });

export const removeToken = async (key) =>
	savePreference(`token-${key}`, undefined);

export const withCache = async (
	name,
	promise,
	{ invalidate, onChange = () => {} } = {}
) => {
	let value = await getFromCache(name);
	const cacheAndReturn = () =>
		promise.then((res) => {
			if (res) {
				cache(name, res);
				onChange(res);
			}
			return res;
		});

	if (!value) value = await cacheAndReturn();
	else if (invalidate) cacheAndReturn();

	await someTime();
	return value;
};

export const getFromCache = async (key) => {
	return await window.readFile({ name: `__cache/${key}` });
};

export const cache = async (key, value) => {
	try {
		if (!value) return value;
		await saveFile({ name: `__cache/${key}` }, value);
		return value;
	} catch (error) {
		//
	}
};

export const getUserPreferences = async (fromSave) => {
	let res = await window.readFile({ name: "__crotchetPreferences.json" });

	if (!res) {
		res = {};
		if (!fromSave)
			await saveFile({ name: "__crotchetPreferences.json" }, {});
	}

	return res;
};

export const getPreference = async (key, defaultValue = null) => {
	let res = await getUserPreferences();

	if (key) res = res?.[key] ?? defaultValue;

	return res;
};

export const savePreference = async (key, value) => {
	const prefs = await getUserPreferences(true);

	if (key) {
		const noValue = value == undefined;
		if (noValue) delete prefs[key];
		else prefs[key] = value;
	}

	await saveFile({ name: "__crotchetPreferences.json" }, prefs);

	return key ? value : prefs;
};

export const loadExternalAsset = async (url, { name, type } = {}) => {
	if (!url?.length) return null;

	type = type || url.split(".").at(-1);

	name = name || url.split("/").at(-1);

	if (!document.querySelector(`[data-external-asset="${name}"]`)) {
		const contents = await withCache(
			name,
			new Promise((resolve) =>
				fetch(url)
					.then((res) => res.text())
					.then(resolve)
			)
		);

		const asset = document.createElement(
			type == "css" ? "style" : "script"
		);
		asset.innerHTML = contents;
		asset.setAttribute("data-external-asset", name);
		document.querySelector("head").appendChild(asset);
	}

	return;
};

export const networkRequest = async (
	url,
	{
		bearerToken,
		secretToken,
		responseType = "json",
		responseField,
		searchParam = "q",
		q,
		filters = {},
		headers = {},
		params = {},
	} = {}
) => {
	const fetchHeaders = {
		Accept: "application/json",
		"Content-Type": "application/json",
		Authorization: `Bearer ${bearerToken}`,
		...headers,
	};

	const handler = async () => {
		if (secretToken) {
			const token = await getToken(secretToken, { prompt: true });

			if (!token?.value?.length) return null;

			fetchHeaders[secretToken] = token.value;
		}

		let fullUrl = new URL(url);

		Object.entries({ ...params, [searchParam]: q, ...filters }).forEach(
			([key, value]) => {
				if (value != undefined) fullUrl.searchParams.append(key, value);
			}
		);

		return fetch(fullUrl.href, {
			headers: fetchHeaders,
		})
			.then((response) => response[responseType]())
			.then((res) => res?.[responseField] || res);
	};

	return withLoader(handler, { quiet: true });
};

export const cleanObject = (obj = {}) => {
	const isValid = (value) =>
		(value ?? "").toString().length &&
		!["undefined", "false", "0", "null"].includes((value ?? "").toString());

	return Object.fromEntries(
		Object.entries(obj || {}).filter(
			([key, value]) => isValid(key) && isValid(value)
		)
	);
};

export const objectIsEmpty = (obj = {}) => {
	return !Object.keys(cleanObject(obj ?? {})).length;
};

export const objectFieldChoices = (choices) =>
	choices?.map((choice) => {
		let label =
			objectField(choice, "label") ||
			objectField(choice, "title") ||
			objectField(choice, "subtitle");
		let value = objectField(choice, "value");

		if (_.isUndefined(value) && label) value = label;
		else if (_.isUndefined(label) && value) label = value;

		return {
			__id: randomId(),
			tempId: label,
			label,
			value,
			...(typeof choice == "object" ? choice : {}),
		};
	});

export const objectField = (object, field) =>
	typeof object == "object" ? object?.[field] : object;

export const sectionedChoices = (choices = [], query, { valuesOnly } = {}) => {
	if (!choices?.length) return [];

	let formattedChoices = objectFieldChoices(choices).map((choice) => {
		if (choice.section)
			choice.sectionTag = `${choice.section} ${choice.value}`;
		return choice;
	});

	formattedChoices = !query?.length
		? formattedChoices
		: matchSorter(formattedChoices, query, {
				keys: ["label", "sectionTag"],
		  });

	formattedChoices = Object.entries(
		_.groupBy(_.orderBy(formattedChoices, "pinned", "desc"), "section")
	).filter(([, choices]) => choices.length);

	return valuesOnly
		? formattedChoices.map(([, values]) => values).flat()
		: formattedChoices;
};

export const dateFromString = (date) => {
	const parsed = Date.parse(date);
	if (!isNaN(parsed)) {
		return parsed;
	}

	return Date.parse(date.replace(/-/g, "/").replace(/[a-z]+/gi, " "));
};

export const formatDate = (
	value,
	formatting = { month: "short", day: "numeric", year: "numeric" }
) => {
	if (!value) return value;

	try {
		var date =
			typeof value == "string"
				? new Date(dateFromString(value))
				: value?.seconds
				? value.seconds * 1000
				: "";

		value = new Intl.DateTimeFormat("en-US", formatting).format(date);
	} catch (error) {
		console.log("Date error: ", error, value, typeof value);
		value = "";
	}

	return value;
};

export const isReactComponent = (child) => {
	return !!child?.$$typeof;
};

export const isValidUrl = (urlString) => {
	const urlPattern = new RegExp(
		"^(https?:\\/\\/)?" + // validate protocol
			"((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // validate domain name
			"((\\d{1,3}\\.){3}\\d{1,3}))" + // validate OR ip (v4) address
			"(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // validate port and path
			"(\\?[;&a-z\\d%_.~+=-]*)?" + // validate query string
			"(\\#[-a-z\\d_]*)?$",
		"i"
	); // validate fragment locator

	return !!urlPattern.test(urlString);
};

export const isValidEmail = (email) =>
	email && email.length < 256 && /^[^@]+@[^@]{2,}\.[^@]{2,}$/.test(email);

export const isValidAction = (action) => {
	if (!action) return false;

	if (action.handler instanceof Promise) return true;
	if (typeof action.handler == "function") return true;
	else if (typeof action.onClick == "function") return true;
	else if (action.url) return true;
	else if (typeof action == "function") return true;

	return false;
};

export const toHms = (number) => {
	const sec_num = parseInt(number, 10); // don't forget the second param
	let hrs = Math.floor(sec_num / 3600);
	let mins = Math.floor((sec_num - hrs * 3600) / 60);
	let secs = sec_num - hrs * 3600 - mins * 60;

	return [
		...(hrs > 0 ? [hrs.toString().padStart(2, "0")] : []),
		mins.toString().padStart(2, "0"),
		secs.toString().padStart(2, "0"),
	].join(":");
};

export const withLoader = async (action, props) => {
	const {
		successMessage = "Success!",
		errorMessage = "Unknown Error!",
		onChange = () => {},
	} = typeof props == "string" ? { successMessage: props } : props || {};
	const handleChange = async (status, payload) => {
		let message = { success: successMessage, error: errorMessage }[status];

		if (typeof message == "function") message = message(payload);
		else if (status == "error" && typeof payload == "string")
			message = payload;

		const isMessageStatus = !["idle", "loading"].includes(status);

		if (onDesktop()) {
			if (isMessageStatus) {
				await window.__crotchet.someTime(20);
				if (!document.body.getAttribute("data-visible"))
					window.__crotchet.backgroundToast(message);
			}

			dispatch("with-loader-status-change", {
				status,
				message,
			});

			onChange(status, payload);
		} else if (isMessageStatus && (!props.quiet || !message?.length))
			window.showToast(message);
	};

	let resolve, reject;
	const promise = new Promise((res, rej) => {
		resolve = res;
		reject = rej;
	});

	let response;

	try {
		handleChange("loading");
		response = await onActionClick(action)();
		handleChange("success", response);
		resolve(response);
	} catch (error) {
		response = error?.message || error;
		handleChange("error", response);
		reject(response);
	}

	return promise;
};

export const getLinksFromText = (text, first) => {
	if (!text) return null;

	const links = text.split(/\s+/).filter(isValidUrl);

	if (!links.length) return null;

	if (first) return links?.[0];

	return links;
};

export const processShareData = (value, type = "text", meta = {}) => {
	if (!value?.trim()?.length) return null;

	let payload = {
		...meta,
		text: value,
	};

	let preview = {
		image: null,
		title: null,
		subtitle: value,
	};

	if (type.includes("image")) {
		preview.title = value.split("/").at(-1).split(".").at(0);
		preview.subtitle = type;
		preview.type = type;

		payload.image = value;
	}

	if (isValidUrl(value)) payload.url = value;
	else payload.url = getLinksFromText(value, true);

	return {
		payload,
		preview: !objectIsEmpty(preview) ? preview : null,
	};
};
