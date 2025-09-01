import { matchSorter } from "match-sorter";
import { onActionClick } from "./hooks/useActionClick";
import ReactDOMServer from "react-dom/server";

export const devMode = () => import.meta.env.MODE == "development";

export const onScreenSize = (size = "lg") => {
	if (size == "lg") return window.innerWidth >= 1024;
};

export const randomId = (prefix = "id") =>
	prefix + Math.random().toString(36).slice(2);

export const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);

export const random = (array) => shuffle(shuffle(array))[0];

export const someTime = (t = 200) => new Promise((res) => setTimeout(res, t));

export const yearInSeconds = () => 60 * 3600 * 24 * 365;

export const onDesktop = () => localStorage.__onDesktop;

export const onFloatingWindow = () => window.__isFloatingWindow;

export const onDesktopInitialize = async () => {
	const event = "initialize-app";
	const page = await new Promise((resolve) => {
		const handler = async (e) => {
			window.removeEventListener(event, handler);
			resolve(e.detail);
		};

		window.addEventListener(event, handler);
	});
	const isFloatingWindow = page.pageId != "root";
	return {
		...page,
		isFloatingWindow,
	};
};

export const dispatch = (event, payload) => {
	window.dispatchEvent(
		new CustomEvent(event, {
			detail: payload,
		})
	);
};

export const camelCaseToSentenceCase = (text) => {
	if (!text || !text.length) return "";
	const result = text.replace(/([A-Z]{1,})/g, " $1");
	return result.charAt(0).toUpperCase() + result.slice(1);
};

export const toggleApp = async (status) =>
	window.socketEmit("toggle-app-window", status);

export const showApp = async () => toggleApp(true);

export const hideApp = async () => toggleApp(false);

export const closeFloatingWindow = async (windowId) => {
	window.socketEmit("close-floating-window", windowId);
};

export const openRemotePageController = async (pageId) => {
	dispatch("socket-broadcast", {
		event: "open-remote-page-controller",
		payload: pageId,
	});
};

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

export const getToken = async (key, { prompt, invalidate, expiresIn } = {}) => {
	let { value: token, expiresAt } =
		(await getPreference(`token-${key}`)) ?? {};

	if (typeof expiresAt == "undefined" || invalidate)
		expiresAt = Date.now() - 60 * 1000;

	const now = Date.now();
	if (expiresAt && now && expiresAt - now <= 0) token = null;

	if (!token && prompt) {
		const newToken = await window.openAlertForm({
			inset: false,
			// noHeading: false,
			title: `Enter ${camelCaseToSentenceCase(key)}`,
			field: {
				placeholder: `Enter ${camelCaseToSentenceCase(key)}`,
				// placeholder: "Enter token here...",
				hideLabel: true,
				meta: {
					flat: true,
					bold: true,
				},
			},
		});

		if (newToken)
			token = (
				await saveToken(
					key,
					newToken,
					Date.now() + (expiresIn ?? yearInSeconds()) * 1000
				)
			)?.value;
	}

	try {
		token = JSON.parse(token);
	} catch (error) {
		//
	}

	return token;
};

export const saveToken = async (key, value, expiresIn) =>
	savePreference(`token-${key}`, {
		value: typeof value == "string" ? value : JSON.stringify(value),
		expiresAt: Date.now() + (expiresIn ?? yearInSeconds()) * 1000,
	});

export const removeToken = async (key) =>
	savePreference(`token-${key}`, undefined);

export const withCache = async (
	name,
	promise,
	{ invalidate, cacheDuration, onChange = () => {} } = {}
) => {
	let value = await getFromCache(name, { invalidate });
	const cacheAndReturn = () =>
		promise().then((res) => {
			if (res) {
				cache(name, res, { duration: cacheDuration });
				onChange(res);
			}
			return res;
		});

	if (!value) value = await cacheAndReturn();

	await someTime(20);
	return value;
};

export const getFromCache = async (key, { invalidate } = {}) => {
	try {
		const expiresAt = await window.readFile({
			name: `__cache_expirations/${key}`,
		});
		const contents = await window.readFile({ name: `__cache/${key}` });
		const now = Date.now();
		if (expiresAt && now && expiresAt - now <= 0) invalidate = true;

		if (invalidate) return null;

		return contents;
	} catch (error) {
		//
	}
};

export const cache = async (key, value, { duration = 60 } = {}) => {
	try {
		if (!value) return value;
		await saveFile({ name: `__cache/${key}` }, value);
		await saveFile(
			{ name: `__cache_expirations/${key}` },
			(Date.now() + duration * 1000).toString()
		);
		return value;
	} catch (error) {
		//
	}
};

export const fetchImage = async (url) => {
	const blob = await fetch(url).then((response) => response.blob());
	return new Promise((resolve) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result);
		reader.readAsDataURL(blob);
	});
};

export const shareImage = async (url) =>
	window.share({
		files: [await fetchImage(encodeURI(url))],
	});

export const getUserPreferences = async (fromSave) => {
	try {
		let res = await window.readFile({ name: "__crotchetPreferences.json" });

		if (!res) {
			res = {};
			if (!fromSave)
				await saveFile({ name: "__crotchetPreferences.json" }, {});
		}

		return res;
	} catch (error) {
		//
	}
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

export const loadExternalAsset = async (url, { name, type, defer } = {}) => {
	if (!url?.length) return null;

	type = type || url.split(".").at(-1);

	name = name || url.split("/").at(-1);

	const isCss = type == "css" || type == "style";

	if (!document.querySelector(`[data-external-asset="${name}"]`)) {
		try {
			const contents = await withCache(
				name,
				() =>
					new Promise((resolve, reject) =>
						fetch(url)
							.then((res) => res.text())
							.then(resolve)
							.catch(reject)
					)
			);

			const asset = document.createElement(isCss ? "style" : "script");
			asset.innerHTML = contents;
			asset.setAttribute("data-external-asset", name);
			document.querySelector("head").appendChild(asset);
		} catch (error) {
			return await new Promise((resolve) => {
				const asset = document.createElement(
					isCss ? "style" : "script"
				);

				if (isCss) {
					asset.setAttribute("href", url);
					asset.setAttribute("type", "text/css");
				} else {
					asset.setAttribute("type", "text/javascript");
					asset.setAttribute("src", url);
					if (defer) asset.setAttribute("defer", "defer");
				}

				asset.setAttribute("data-external-asset", name);
				document.querySelector("head").appendChild(asset);

				asset.onload = setTimeout(() => {
					resolve();
				}, 300);
			});
		}
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

export const exportContent = async function (
	content,
	fileName = "download",
	type = "txt"
) {
	// if (onDesktop())
	// 	return saveFile(`${fileName}.${type}`, content, {
	// 		folder: "downloads",
	// 		open: true,
	// 	});

	return clickToDownload(
		// encodeURI(`data:text/${type};charset=utf-8,${content}`),
		content,
		`${fileName}.${type}`
	);
};

export const clickToDownload = async function (url, fileName = "download") {
	let newUrl;

	try {
		newUrl = await fetch(url)
			.then((response) => response.blob())
			.then((blob) => URL.createObjectURL(blob));
	} catch (error) {
		console.log("Failed to blob: ", error);
		newUrl = url;
	}

	var link = document.createElement("a");
	link.setAttribute("download", fileName);
	link.setAttribute("href", newUrl);
	link.setAttribute("target", "_blank");
	link.click();
	link.remove();
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
			__searchKey: choice.__searchKey ?? randomId(),
			tempId: label,
			label,
			value,
			...(typeof choice == "object" ? choice : {}),
		};
	});

export const objectField = (object, field) =>
	typeof object == "object" ? object?.[field] : object;

export const objectToQueryParams = (obj = {}) => {
	const url = new URL("https://crotchet.app/");

	Object.keys(obj).forEach((key) => {
		let value = obj[key];

		if (_.isObject(value) && !_.isArray(value))
			value = JSON.stringify(value);

		if (_.isArray(value)) value = value.map(encodeURIComponent).join("<!>");

		if (!_.isArray(value)) value = encodeURIComponent(value);

		url.searchParams.set(key, value);
	});

	return url.searchParams.toString();
};

export const urlQueryParamsAsObject = (path) => {
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

	if (query?.length) {
		formattedChoices = formattedChoices.map((choice) => {
			return {
				...choice,
				pinned: false,
				section: "Results",
			};
		});
	}

	formattedChoices = _.orderBy(
		_.orderBy(formattedChoices, "pinned", "desc"),
		["isFallbackResult", "isCustomSearchResult"],
		["desc", "asc"]
	);

	formattedChoices = _.uniqBy(formattedChoices, "__searchKey");

	formattedChoices = Object.entries(
		_.groupBy(formattedChoices, "section")
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
	try {
		new URL(urlString);
		return true;
	} catch (error) {
		//
	}
	return false;
	// const urlPattern = new RegExp(
	// 	"^(https?:\\/\\/)?" + // validate protocol
	// 		"((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // validate domain name
	// 		"((\\d{1,3}\\.){3}\\d{1,3}))" + // validate OR ip (v4) address
	// 		"(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // validate port and path
	// 		"(\\?[;&a-z\\d%_.~+=-]*)?" + // validate query string
	// 		"(\\#[-a-z\\d_]*)?$",
	// 	"i"
	// ); // validate fragment locator

	// return !!urlPattern.test(urlString);
};

export const createPreviewImage = (props, returnType = "dataUrl") => {
	const {
		width = 800,
		// height = 600,
		height = 400,
		background = "#0d1a4d",
		color = "#ffffff",
		text,
		icon,
	} = props ?? {};
	return new Promise((resolve) => {
		const canvas = document.createElement("canvas");
		canvas.width = width;
		canvas.height = height;
		const ctx = canvas.getContext("2d");

		// Draw background
		ctx.fillStyle = background;
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		if (icon) {
			const { path, viewBox = 24 } =
				typeof icon == "object"
					? icon
					: {
							path: icon,
					  };
			// Draw globe icon directly using path
			ctx.save();
			const iconSize = 100;
			ctx.translate(
				canvas.width / 2 - iconSize / 2,
				canvas.height / 2 - iconSize / 2
			);
			ctx.scale(iconSize / viewBox, iconSize / viewBox);
			ctx.fillStyle = color;
			const pathEl = new Path2D(path);
			ctx.fill(pathEl);
			ctx.restore();
		} else if (text) {
			// Add centered text for non-URL formats
			ctx.fillStyle = color;
			ctx.font = "bold 98px Courier";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText(text, canvas.width / 2, canvas.height / 2);
		}

		if (returnType == "blob") return canvas.toBlob(resolve, "image/png");
		resolve(canvas.toDataURL());
	});
};

// Old: https://us-central1-letterplace-c103c.cloudfunctions.net/api;
export const getBackendBaseUrl = () => import.meta.env.VITE_BACKEND_BASE_URL;

export const kv = async (key, value) => {
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
		loadingMessage = "Loading...",
		successMessage = "Success!",
		errorMessage = "Unknown Error!",
		onChange = () => {},
	} = typeof props == "string" ? { successMessage: props } : props || {};
	const handleChange = async (status, payload) => {
		let message = {
			success: successMessage,
			error: errorMessage,
			loading: loadingMessage,
		}[status];

		if (typeof message == "function") message = message(payload);
		else if (status == "error" && typeof payload == "string")
			message = payload;

		const isMessageStatus = !["idle", "loading"].includes(status);

		if (onDesktop()) {
			if (isMessageStatus) {
				await someTime(20);
				if (!document.body.getAttribute("data-visible"))
					window.backgroundToast?.(message);
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

export const getShareUrl = (content, type = "text") => {
	if (!content) return "";

	if (type != "object" && !_.isObject(content)) {
		if (!content?.length) return "";

		if (type == "text") return `crotchet://share-url/${content}`;

		return `crotchet://share-${type}/${content}`;
	}

	if (content.sheet) {
		return `crotchet://action-sheet/${content.sheet}/?${objectToQueryParams(
			{
				...content,
				previewImage: content.preview || content.video,
				preview: {
					video: content.video,
					image: content.preview,
					title: content.title,
					description: content.subtitle || content.url,
				},
			}
		)}`;
	}

	return `crotchet://share-object/${encodeURIComponent(
		JSON.stringify(content)
	)}`;
};

export const getPreviewUrl = (content) => {
	if (!content) return "";

	if (!_.isObject(content)) return "";

	const url = `crotchet://preview/?${objectToQueryParams({
		preview: _.pick(content, [
			"image",
			"video",
			"title",
			"subtitle",
			"aspectRatio",
		]),
		actions: content.actions ?? [
			"Summer",
			{
				label: "Breeze",
			},
		],
	})}`;

	return url;
};

export const getShareActions = (
	content = {},
	actions,
	mainActionNames = []
) => {
	const {
		type,
		image,
		file,
		url,
		text,
		download,
		incoming,
		fromClipboard,
		scheme,
		sheet,
		state = {},
	} = content;

	return Object.entries((actions || window.actions) ?? {}).reduce(
		(agg, [name, action]) => {
			if (
				name == "share" ||
				action.context != "share" ||
				action.mobileOnly
			)
				return agg;

			if (
				scheme?.length &&
				![action.scheme, action.sheet].includes(scheme)
			)
				return agg;

			let matches =
				!objectIsEmpty({ image, url, file, text }) ||
				(scheme?.length && !objectIsEmpty(state));

			const match = action.match;

			if (_.isFunction(match)) {
				matches = match({
					type,
					image,
					file,
					url,
					text,
					download,
					scheme,
					sheet,
					state,
					fromClipboard,
				});
			} else if (
				["image", "file", "url", "text", "download"].includes(match)
			) {
				matches = {
					image,
					file,
					url,
					text,
					download,
				}[match]?.length;
			}

			if (!matches) return agg;

			const isMain = mainActionNames.includes(name);

			if (isMain && incoming) return agg;

			return [
				...agg,
				{
					name,
					...action,
					main: isMain,
				},
			];
		},
		[]
	);
};

export const extractHtmlFromComponent = (component, options = {}) => {
	const { pretty = false, staticMarkup = false } = options;

	// Choose rendering method based on options
	const htmlString = staticMarkup
		? ReactDOMServer.renderToStaticMarkup(component)
		: ReactDOMServer.renderToString(component);

	if (!pretty) {
		return htmlString;
	}

	// Pretty print HTML if requested
	const beautifyHtml = (html) => {
		let formatted = "";
		let indent = "";
		const indentSize = 2;

		// Split by < to get array of tags and content
		const tokens = html.split("<");

		for (let i = 0; i < tokens.length; i++) {
			if (!tokens[i]) continue;

			// Handle closing tags
			if (tokens[i].startsWith("/")) {
				indent = indent.slice(indentSize);
				formatted += indent + "<" + tokens[i] + "\n";
			}
			// Handle self-closing tags
			else if (tokens[i].endsWith("/>")) {
				formatted += indent + "<" + tokens[i] + "\n";
			}
			// Handle opening tags
			else {
				formatted += indent + "<" + tokens[i];
				if (!tokens[i].endsWith(">")) {
					formatted += "\n";
				}
				if (!tokens[i].includes("/>") && !tokens[i].startsWith("!--")) {
					indent += " ".repeat(indentSize);
				}
			}
		}

		return formatted.trim();
	};

	return beautifyHtml(htmlString);
};

export const scanNetwork = async () => {
	return await new Promise((resolve) => {
		const key = `scan-network-${Date.now()}`;
		window.addEventListener(
			key,
			(e) => {
				resolve(e.detail);
			},
			{ once: true }
		);
		window.dispatchEvent(
			new CustomEvent("scan-network", { detail: [key] })
		);
	});
};
