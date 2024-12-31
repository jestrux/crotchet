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
		tags = [],
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
		name,
		label: camelCaseToSentenceCase(
			label || name.replace("-", " ").replace("_", " ")
		),
		tags,
		global,
		context,
		match,
		shortcut,
		mobileOnly,
		desktopOnly,
		actions,
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
