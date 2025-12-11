import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";
import openUrl, { processSchemeUrl } from "./open-url";
import { dispatch } from "./utils";

export const setupDeepLinking = () => {
	// For web
	setTimeout(() => {
		if (Capacitor.isNativePlatform()) return;

		const urltoProcess = new URL(location.href);
		urltoProcess.host = "crotchet://";
		const args = processSchemeUrl(urltoProcess.toString())?.args;

		if (args?.from_oauth) {
			window.handleOauthRedirect(args);
			var url = new URL(location.href);
			url.search = "";
			const updatedUrl = url.search
				? url.href
				: url.href.replace("?", "");
			window.history.replaceState({}, document.title, updatedUrl);
		}
	}, 10);

	CapacitorApp.addListener("appUrlOpen", async (event) => {
		if (window.appUrlOpenHandlerTimeout) {
			clearTimeout(window.appUrlOpenHandlerTimeout);
			window.appUrlOpenHandlerTimeout = null;
		}

		window.appUrlOpenHandlerTimeout = setTimeout(() => {
			const args = processSchemeUrl(event?.url)?.args;
			window.appLaunchArgs = null;

			openUrl(event?.url, () => {
				// return alert(JSON.stringify(event?.url));
				if (!args) return;

				if (args?.from_oauth) return window.handleOauthRedirect(args);

				window.appLaunchArgs = args;

				setTimeout(() => {
					dispatch("app-launched");
				}, 500);
			});
		}, 10);
	});

	return () => {
		CapacitorApp.removeAllListeners();
	};
};
