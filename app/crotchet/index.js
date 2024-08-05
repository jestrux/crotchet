import openUrl from "./open-url";

export { openUrl };

import {
	camelCaseToSentenceCase,
	dispatch,
	hideApp,
	onDesktop,
	randomId,
} from "./utils";

export * as utils from "./utils";

export const registerAction = (name, action) => {
	const {
		label,
		handler,
		hideApp: actionHidesApp,
		actions,
		tags = [],
		icon,
		global = true,
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

		if (typeof handler == "function")
			return handler(payload ?? {}, window.getActionPayload());

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
	} = widget;

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
	};

	dispatch("widgets-updated");
};
