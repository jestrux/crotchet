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

export const getToken = async (key, { prompt } = {}) => {
	let token = (await getPreference(`token-${key}`))?.value;

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
	try {
		return await window.readFile({ name: `__cache/${key}` });
	} catch (error) {
		//
	}
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

export const oauth = async (url) => {
	const generateRandomString = (length) => {
		const possible =
			"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		const values = crypto.getRandomValues(new Uint8Array(length));
		return values.reduce(
			(acc, x) => acc + possible[x % possible.length],
			""
		);
	};

	const sha256 = async (plain) => {
		const encoder = new TextEncoder();
		const data = encoder.encode(plain);
		return window.crypto.subtle.digest("SHA-256", data);
	};

	const base64encode = (input) => {
		return btoa(String.fromCharCode(...new Uint8Array(input)))
			.replace(/=/g, "")
			.replace(/\+/g, "-")
			.replace(/\//g, "_");
	};

	const codeVerifier = generateRandomString(64);
	const hashed = await sha256(codeVerifier);
	const codeChallenge = base64encode(hashed);

	const clientId = "YOUR_CLIENT_ID";
	const redirectUri = "http://localhost:8080";

	const scope = "user-read-private user-read-email";
	const authUrl = new URL("https://accounts.spotify.com/authorize");

	// generated in the previous step
	window.localStorage.setItem("code_verifier", codeVerifier);

	const params = {
		response_type: "code",
		client_id: clientId,
		scope,
		code_challenge_method: "S256",
		code_challenge: codeChallenge,
		redirect_uri: redirectUri,
	};

	authUrl.search = new URLSearchParams(params).toString();
	window.location.href = authUrl.toString();

	// return new Promise((resolve, reject) => {
	// 	let browser = inAoo.create(this.url, "_blank");

	// 	const openCapacitorSite = async () => {
	// 		await Browser.open({ url: "http://capacitorjs.com/" });
	// 	};

	// 	let listener = browser.on("loadstart").subscribe((event: any) => {
	// 		//Check the redirect uri
	// 		if (event.url.indexOf(this.redirectURI) > -1) {
	// 			listener.unsubscribe();
	// 			browser.close();
	// 			let token = event.url.split("=")[1].split("&")[0];
	// 			this.accessToken = token;
	// 			resolve(event.url);
	// 		} else {
	// 			reject("Could not authenticate");
	// 		}
	// 	});
	// });
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

	const url = `crotchet://preview/${encodeURIComponent(
		JSON.stringify({
			preview: _.pick(content, [
				"image",
				"video",
				"title",
				"subtitle",
				"aspectRatio",
			]),
			actions: content.actions,
		})
	)}`;

	return url;
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
