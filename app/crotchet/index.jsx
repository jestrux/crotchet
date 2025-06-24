import {
	camelCaseToSentenceCase,
	dispatch,
	hideApp,
	onDesktop,
	randomId,
	savePreference,
} from "./utils";

import openUrl from "./open-url";

Object.assign(window, {
	__crotchetApp: {
		name: "Crotchet",
		colors: {
			primary: "#84cc16",
			primaryDark: "#a3e635",
		},
	},
	_promiseResolvers: {},
	desktop: {},
	refs: {},
});

export { openUrl };

export { sourceGet } from "./hooks/useSourceGet";

export { default as registerDataSource } from "./registerDataSource";

export const registerAction = (name, action) => {
	if (!window.actions) window.actions = {};

	const {
		label,
		handler,
		hideApp: actionHidesApp,
		actions,
		preview,
		tags = [],
		section,
		color,
		icon,
		global = false,
		context,
		match,
		shortcut,
		desktopOnly = false,
		mobileOnly = false,
	} = typeof action != "function"
		? action
		: {
				handler: action,
				label: name,
		  };

	const _handler = (payload) => {
		if (actionHidesApp) hideApp();

		if (typeof handler == "function") return handler(payload ?? {});

		return openUrl(action?.url);
	};

	window.actions[name] = {
		_id: randomId(),
		icon,
		color,
		name,
		label: camelCaseToSentenceCase(
			label || name.replace("-", " ").replace("_", " ")
		),
		tags,
		section,
		global,
		context,
		match,
		shortcut,
		mobileOnly,
		desktopOnly,
		actions,
		preview,
		handler: _handler,
	};

	dispatch("app-actions-updated");

	window.addEventListener(`menu-item-click:${name}`, _handler);
};

export const registerPage = (
	name,
	{ resolve, title, noPadding, content, action, actions, nav, ...props }
) => {
	if (!window.pages) window.pages = {};

	dispatch("page-registered-" + name);

	window.pages[name] = {
		_id: randomId(),
		resolve,
		title,
		noPadding,
		content,
		nav,
		action,
		actions,
		...props,
	};
};

export const getPage = (page) => {
	let pageName = page?.name || page;
	if (typeof pageName != "string") {
		pageName = randomId();
		registerPage(pageName, page);
	}

	return pageName;
};

export const setCrotchetApp = (newProps = {}) => {
	const newApp = {
		...window.__crotchetApp,
		...newProps,
	};

	savePreference("__crotchetApp", newApp);

	window.__crotchetApp = newApp;

	setTimeout(() => {
		dispatch("crotchet-app-updated");
	}, 400);
};

export const globalActions = ({ share = false, desktopShortcuts } = {}) =>
	Object.entries(window.actions ?? {})
		.filter(([, action]) => {
			const { global, type, mobileOnly, desktopOnly, context } = action;

			if ((share && context != "share") || (!share && context == "share"))
				return false;

			if (!global && !(desktopShortcuts && type == "search"))
				return false;

			if ((mobileOnly && onDesktop()) || (desktopOnly && !onDesktop()))
				return false;

			return true;
		})
		.map(([, value]) => value);

export const registerSection = (name, section) => {
	const { resolve, type, title, listenForUpdates, meta } = section;

	if (!window.sections) window.sections = {};

	window.sections[name] = {
		_id: randomId(),
		resolve,
		name,
		type,
		title,
		meta,
		listenForUpdates,
	};

	dispatch("sections-updated");
};

export const registerWidget = (name, widget) => {
	const {
		resolve,
		supportedSizes = "*",
		background,
		color,
		icon,
		title,
		actions,
		content,
		actionButton,
		listenForUpdates,
		onClick,
		onSwipe,
	} = widget;

	if (!window.widgets) window.widgets = {};

	window.widgets[name] = {
		_id: randomId(),
		resolve,
		supportedSizes,
		background,
		color,
		icon,
		name,
		title,
		actions,
		content,
		actionButton,
		listenForUpdates,
		onClick,
		onSwipe,
	};

	dispatch("widgets-updated");
};

export const __initializeCrotchet = () => {
	registerAction("clipboard", {
		color: "#2498F5",
		icon: (
			<svg fill="currentColor" viewBox="0 0 16 16">
				<path d="M6.5 0A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0zm3 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5z" />
				<path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1A2.5 2.5 0 0 1 9.5 5h-3A2.5 2.5 0 0 1 4 2.5zm6.854 7.354-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 0 1 .708-.708L7.5 10.793l2.646-2.647a.5.5 0 0 1 .708.708" />
			</svg>
		),
		// global: true,
		mobileOnly: true,
		handler: async () => {
			try {
				const { type, value } = await window.readClipboard();
				const { payload, preview } =
					window.processShareData(value, type, {
						fromClipboard: true,
					}) || {};

				if (!payload) return window.showToast("Nothing in clipboard");

				return window.openActionSheet({
					title: "Select an action",
					payload,
					preview,
				});
			} catch (error) {
				window.showToast(error);
				// console.log("Clipboard error: ", error);
			}
		},
	});
};
